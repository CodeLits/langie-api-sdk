import { watch } from 'vue'
import type { TranslatorOptions, TranslateServiceResponse } from './types'
import { useLangieCore, __resetLangieCoreForTests } from './composables/useLangie-core'
import { TranslationBatching } from './composables/useLangie-batching'

// Global singleton instance
let globalLangieInstance: ReturnType<typeof createLangieInstance> | null = null

// Preserve singleton across hot module reloads
if (
  typeof window !== 'undefined' &&
  (window as unknown as Record<string, unknown>).__LANGIE_SINGLETON__
) {
  globalLangieInstance = (window as unknown as Record<string, unknown>)
    .__LANGIE_SINGLETON__ as ReturnType<typeof createLangieInstance>
}

// Also check if we have a stored singleton in localStorage as backup
if (!globalLangieInstance && typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('__LANGIE_SINGLETON_URL__')
    if (stored) {
      // Use stored URL to prevent recreation with wrong options
      const storedOptions = { translatorHost: stored }
      globalLangieInstance = createLangieInstance(storedOptions)(
        // Store on window for hot module reload preservation
        window as unknown as Record<string, unknown>
      ).__LANGIE_SINGLETON__ = globalLangieInstance
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
      results.forEach((result) => {
        // Check if result is an array (direct translations) or object with translations property
        let translationsArray: TranslationWithContext[] = []

        if (Array.isArray(result)) {
          translationsArray = result
        } else if (result.translations && Array.isArray(result.translations)) {
          translationsArray = result.translations
        } else {
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
  // If singleton exists, always return it regardless of options
  if (globalLangieInstance) {
    return globalLangieInstance
  }

  // Check if we have a stored URL and should use it instead of default options
  if (Object.keys(options).length === 0 && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('__LANGIE_SINGLETON_URL__')
      if (stored) {
        options = { translatorHost: stored }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  // Only create new instance if singleton doesn't exist
  globalLangieInstance = createLangieInstance(options)

  // Store on window for hot module reload preservation
  if (typeof window !== 'undefined') {
    ;(window as unknown as Record<string, unknown>).__LANGIE_SINGLETON__ = globalLangieInstance
  }

  // Store URL in localStorage for backup
  if (typeof window !== 'undefined' && options.translatorHost) {
    try {
      localStorage.setItem('__LANGIE_SINGLETON_URL__', options.translatorHost)
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

  // Clear localStorage backup
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('__LANGIE_SINGLETON_URL__')
      delete (window as unknown as Record<string, unknown>).__LANGIE_SINGLETON__
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  __resetLangieCoreForTests()
}
