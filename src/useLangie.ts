import { watch } from 'vue'
import type { TranslatorOptions } from './types'
import { useLangieCore } from './composables/useLangie-core'
import { TranslationBatching } from './composables/useLangie-batching'

export function useLangie(options: TranslatorOptions = {}) {
  const core = useLangieCore(options)
  const {
    availableLanguages,
    translations,
    uiTranslations,
    currentLanguage,
    isLoading,
    setLanguage,
    fetchLanguages,
    getCountryFromLang,
    getTranslation,
    clearTranslations,
    translatorHost
  } = core

  // Create batching instance
  const batching = new TranslationBatching(
    {
      initialBatchDelay: options.initialBatchDelay,
      followupBatchDelay: options.followupBatchDelay
    },
    translatorHost,
    () => currentLanguage.value,
    (results) => {
      // Process batch results and update translations
      console.debug('[useLangie] Processing batch results:', results)
      results.forEach((result) => {
        if (result.translations) {
          result.translations.forEach((translation: any) => {
            console.debug('[useLangie] Processing translation:', translation)
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
              console.debug('[useLangie] Cached translation:', {
                key: cacheKey,
                value: translatedText
              })
            }
          })
        }
      })
    }
  )

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
      console.debug('[useLangie] Skipping translation (same language):', { text, fromLang, toLang })
      return text
    }

    const cacheKey = `${text}|${context || 'ui'}`
    const cache = context === 'ui' ? uiTranslations : translations

    // Return cached translation if available
    if (cache[cacheKey]) {
      console.debug('[useLangie] Returning cached translation:', {
        key: cacheKey,
        value: cache[cacheKey]
      })
      return cache[cacheKey]
    }

    console.debug('[useLangie] Queuing translation:', {
      text,
      context: context || 'ui',
      fromLang,
      toLang,
      cacheKey
    })
    // Queue for translation
    batching.queueTranslation(text, context || 'ui', fromLang, toLang, cacheKey)

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
        console.debug('[useLangie] Processing fetchAndCacheBatch result:', result)
        result.translations.forEach((translation: any) => {
          console.debug('[useLangie] Processing translation in fetchAndCacheBatch:', translation)
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
            console.debug('[useLangie] Cached translation in fetchAndCacheBatch:', {
              key: cacheKey,
              value: translatedText
            })
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
    batching.clearAllPending()
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
    getCountryFromLang,
    getTranslation,
    clearTranslations,

    // Translation functions
    l,
    fetchAndCacheBatch,

    // Expose batching for testing
    _batching: batching
  }
}
