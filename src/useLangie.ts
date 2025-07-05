import { watch } from 'vue'
import type { TranslatorOptions, TranslateServiceResponse } from './types'
import { useLangieCore, __resetLangieCoreForTests } from './composables/useLangie-core'
import { TranslationBatching } from './composables/useLangie-batching'

// Global singleton instance
let globalLangieInstance: ReturnType<typeof createLangieInstance> | null = null
let globalOptions: string | null = null

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
      console.debug('[useLangie] Processing batch results:', results.length, 'results')
      results.forEach((result, resultIndex) => {
        console.debug('[useLangie] Processing result', resultIndex, ':', result)

        // Check if result is an array (direct translations) or object with translations property
        let translationsArray: TranslationWithContext[] = []

        if (Array.isArray(result)) {
          console.debug('[useLangie] Result is array with', result.length, 'items')
          translationsArray = result
        } else if (result.translations && Array.isArray(result.translations)) {
          console.debug('[useLangie] Found translations array:', result.translations.length, 'items')
          translationsArray = result.translations
        } else {
          console.debug('[useLangie] No translations array in result:', result)
          return
        }

        translationsArray.forEach((translation: TranslationWithContext, translationIndex) => {
          // Handle different possible response formats
          const translatedText =
            translation.translated_text ||
            translation.translated ||
            translation.t ||
            translation.text
          console.debug('[useLangie] Translation', translationIndex, ':', {
            original: translation.text,
            translated: translatedText,
            context: translation.context
          })
          if (translatedText && translatedText !== translation.text) {
            const cacheKey = `${translation.text}|${translation.context || 'ui'}`
            const cache = translation.context === 'ui' ? uiTranslations : translations
            cache[cacheKey] = translatedText
            console.debug('[useLangie] Cached translation:', cacheKey, '->', translatedText)
          } else {
            console.debug('[useLangie] Skipping translation (same text or empty):', {
              original: translation.text,
              translated: translatedText
            })
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
    toLang = currentLanguage.value
  ) => {
    if (items.length === 0) return

    // Skip translation if source and target languages are the same
    if (fromLang === toLang) {
      return
    }

    isLoading.value = true

    try {
      const response = await fetch(`${translatorHost}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          translations: items.map((item) => ({
            text: item.text,
            context: item.context || 'ui'
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
            const cacheKey = `${translation.text}|${translation.context || 'ui'}`
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
  // Check if we need to create a new instance or reuse existing one
  const optionsKey = JSON.stringify(options)

  if (!globalLangieInstance || globalOptions !== optionsKey) {
    globalLangieInstance = createLangieInstance(options)
    globalOptions = optionsKey
  }

  return globalLangieInstance
}

export function __resetLangieSingletonForTests() {
  if (globalLangieInstance) {
    globalLangieInstance.cleanup()
  }
  globalLangieInstance = null
  globalOptions = null
  __resetLangieCoreForTests()
}
