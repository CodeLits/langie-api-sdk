import { watch } from 'vue'
import type { TranslatorOptions, TranslateServiceResponse } from './types'
import { useLangieCore, __resetLangieCoreForTests } from './composables/useLangie-core'
import { TranslationBatching } from './composables/useLangie-batching'
import { devDebug } from './utils/debug'

// Global singleton instance
let globalLangieInstance: ReturnType<typeof createLangieInstance> | null = null

// Track if singleton was ever created to detect resets
let singletonWasCreated = false

// Preserve singleton across hot module reloads
if (typeof window !== 'undefined' && (window as any).__LANGIE_SINGLETON__) {
  globalLangieInstance = (window as any).__LANGIE_SINGLETON__
  singletonWasCreated = true
  if (typeof window !== 'undefined') {
    console.log('[LangieSDK] Restored singleton from hot module reload')
  }
}

// Also check if we have a stored singleton in localStorage as backup
if (!globalLangieInstance && typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('__LANGIE_SINGLETON_URL__')
    if (stored) {
      console.log('[LangieSDK] Found stored singleton URL:', stored)
      // We can't fully restore the singleton, but we know what URL it should use
      // This will help prevent recreation with wrong URL
    }
  } catch (e) {
    // Ignore localStorage errors
  }
}

// Extended type for translation objects that includes context
interface TranslationWithContext extends TranslateServiceResponse {
  context?: string
  translated_text?: string
}

function createLangieInstance(options: TranslatorOptions = {}) {
  const core = useLangieCore(options)
  const {
    availableLanguages,
    translations,
    uiTranslations,
    currentLanguage,
    isLoading,
    setLanguage,
    fetchLanguages,
    translatorHost,
    clearTranslations
  } = core

  // Логируем базовый URL при создании singleton
  if (typeof window !== 'undefined') {
    console.log('[LangieSDK] createLangieInstance: translatorHost =', translatorHost)
  }

  // Create batching instance
  const batching = new TranslationBatching(
    {
      initialBatchDelay: options.initialBatchDelay,
      followupBatchDelay: options.followupBatchDelay,
      maxBatchSize: options.maxBatchSize
    },
    translatorHost,
    () => currentLanguage.value,
    (results) => {
      // Process batch results and update translations
      devDebug('[useLangie] Processing batch results:', results.length, 'results')
      results.forEach((result, resultIndex) => {
        devDebug('[useLangie] Processing result', resultIndex, ':', result)

        // Check if result is an array (direct translations) or object with translations property
        let translationsArray: TranslationWithContext[] = []

        if (Array.isArray(result)) {
          devDebug('[useLangie] Result is array with', result.length, 'items')
          translationsArray = result
        } else if (result.translations && Array.isArray(result.translations)) {
          devDebug('[useLangie] Found translations array:', result.translations.length, 'items')
          translationsArray = result.translations
        } else {
          devDebug('[useLangie] No translations array in result:', result)
          return
        }

        translationsArray.forEach((translation: TranslationWithContext) => {
          // Handle different possible response formats
          const translatedText =
            translation.translated_text ||
            translation.translated ||
            translation.t ||
            translation.text
          if (translatedText && translatedText !== translation.text) {
            const cacheKey = `${translation.text}|${translation.context || 'ui'}`
            const cache = translation.context === 'ui' ? uiTranslations : translations
            cache[cacheKey] = translatedText
          }
        })
      })
    }
  )

  // Simple cache to track recently queued translations
  const recentlyQueued = new Set<string>()

  /**
   * Synchronously get translation for the provided key.
   * If the key is not yet translated, the original key will be returned and
   * an asynchronous request will be triggered to fetch the translation in the
   * background (this avoids Promise objects leaking into the template).
   */
  const l = (text: string, context?: string, originalLang?: string) => {
    const fromLang = originalLang || 'en'
    const toLang = currentLanguage.value

    // Skip translation if source and target languages are the same
    if (fromLang === toLang) {
      return text
    }

    const cacheKey = `${text}|${context || 'ui'}`
    const cache = context === 'ui' ? uiTranslations : translations

    // Return cached translation if available
    if (cache[cacheKey]) {
      return cache[cacheKey]
    }

    // Check if we've recently queued this translation
    const languageCacheKey = `${cacheKey}|${fromLang}|${toLang}`
    if (recentlyQueued.has(languageCacheKey)) {
      return text
    }

    // Queue for translation
    batching.queueTranslation(text, context || 'ui', fromLang, toLang, cacheKey)

    // Mark as recently queued
    recentlyQueued.add(languageCacheKey)

    // Clear the recently queued cache after a short delay
    // Use a shorter delay for tests to allow retries
    const clearDelay = process.env.NODE_ENV === 'test' ? 100 : 1000
    setTimeout(() => {
      recentlyQueued.delete(languageCacheKey)
    }, clearDelay)

    // Return original text for now (will be updated when translation arrives)
    return text
  }

  const fetchAndCacheBatch = async (
    items: { text: string; context?: string }[],
    fromLang = 'en',
    toLang = currentLanguage.value,
    globalContext?: string
  ) => {
    if (items.length === 0) return

    // Skip translation if source and target languages are the same
    if (fromLang === toLang) {
      return
    }

    isLoading.value = true

    try {
      // Use global context if provided, otherwise fall back to individual contexts
      const effectiveContext = globalContext || 'ui'

      const response = await fetch(`${translatorHost}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          translations: items.map((item) => ({
            text: item.text,
            context: item.context || effectiveContext
          })),
          from_lang: fromLang,
          to_lang: toLang
        })
      })

      if (!response.ok) {
        throw new Error(`Translation request failed: ${response.status}`)
      }

      const result = await response.json()

      if (result.translations) {
        result.translations.forEach((translation: TranslationWithContext) => {
          // Handle different possible response formats
          const translatedText =
            translation.translated_text ||
            translation.translated ||
            translation.t ||
            translation.text
          if (translatedText && translatedText !== translation.text) {
            const cacheKey = `${translation.text}|${translation.context || effectiveContext}`
            const cache = translation.context === 'ui' ? uiTranslations : translations
            cache[cacheKey] = translatedText
          }
        })
      }
    } catch (error) {
      console.error('[useLangie] Translation error:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Watch for language changes and clear translations
  watch(currentLanguage, () => {
    clearTranslations()
    batching.cleanup()
  })

  return {
    // Core functionality
    availableLanguages,
    translations,
    uiTranslations,
    currentLanguage,
    isLoading,
    setLanguage,
    fetchLanguages,

    // Translation functions
    l,
    fetchAndCacheBatch,

    // Utility functions
    cleanup: () => {
      clearTranslations()
      batching.cleanup()
    },
    getBatchingStats: () => batching.getStats()
  }
}

export function useLangie(options: TranslatorOptions = {}) {
  if (typeof window !== 'undefined') {
    console.log('[LangieSDK] useLangie called with options:', options)
    console.log('[LangieSDK] globalLangieInstance before check:', globalLangieInstance ? 'EXISTS' : 'NULL')
    console.trace('[LangieSDK] useLangie stack')
  }

  // If singleton exists, always return it regardless of options
  if (globalLangieInstance) {
    if (Object.keys(options).length > 0) {
      // Если пытаются пересоздать singleton с новыми options, выводим warning
      if (typeof window !== 'undefined') {
        console.warn('[LangieSDK] useLangie: singleton already created! New options IGNORED.', {
          current: globalLangieInstance,
          attempted: options,
        })
      }
    }
    return globalLangieInstance
  }

  // Check if singleton was reset (was created before but is now null)
  if (singletonWasCreated && !globalLangieInstance) {
    if (typeof window !== 'undefined') {
      console.warn('[LangieSDK] WARNING: Singleton was reset! This should not happen in production.')
    }
  }

  // Check if we have a stored URL and prevent recreation with wrong options
  if (typeof window !== 'undefined' && Object.keys(options).length === 0) {
    try {
      const storedUrl = localStorage.getItem('__LANGIE_SINGLETON_URL__')
      if (storedUrl && storedUrl !== 'https://api.langie.uk/v1') {
        console.warn('[LangieSDK] WARNING: Attempting to create singleton with default options, but stored URL is:', storedUrl)
        // Force the correct URL
        options.translatorHost = storedUrl
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  // Only create new instance if singleton doesn't exist
  if (typeof window !== 'undefined') {
    console.log('[LangieSDK] Creating new singleton instance with options:', options)
  }
  globalLangieInstance = createLangieInstance(options)
  singletonWasCreated = true

  // Store on window for hot module reload preservation
  if (typeof window !== 'undefined') {
    (window as any).__LANGIE_SINGLETON__ = globalLangieInstance
    // Also store the URL in localStorage as backup
    try {
      localStorage.setItem('__LANGIE_SINGLETON_URL__', options.translatorHost || 'https://api.langie.uk/v1')
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  return globalLangieInstance
}

export function __resetLangieSingletonForTests() {
  if (globalLangieInstance) {
    globalLangieInstance.cleanup()
  }
  globalLangieInstance = null
  singletonWasCreated = false

  // Clear localStorage backup
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('__LANGIE_SINGLETON_URL__')
      delete (window as any).__LANGIE_SINGLETON__
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  __resetLangieCoreForTests()
}
