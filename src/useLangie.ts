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
      globalLangieInstance = createLangieInstance(storedOptions)
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
    (results, requests) => {
      // Process batch results and update translations
      console.debug('[onBatchComplete] results:', results)
      console.debug('[onBatchComplete] requests:', requests)

      // Clear recently queued cache to make translations immediately available
      requests.forEach((req) => {
        const cacheKey = `${req.text}|${req.context}`
        const languageCacheKey = `${cacheKey}|${req.fromLang}|${req.toLang}`
        recentlyQueued.delete(languageCacheKey)
      })

      results.forEach((result, batchIdx) => {
        // Check if result is an array (direct translations) or object with translations property
        let translationsArray: TranslationWithContext[] = []

        if (Array.isArray(result)) {
          translationsArray = result
        } else if (result.translations && Array.isArray(result.translations)) {
          translationsArray = result.translations
        } else {
          return
        }

        translationsArray.forEach((translation: TranslationWithContext, index: number) => {
          const reqIdx = batchIdx * translationsArray.length + index
          const originalText = requests[reqIdx]?.text
          const context = translation.context || requests[reqIdx]?.context || 'ui'
          if (!originalText) {
            console.warn('[onBatchComplete] No originalText for index', reqIdx, requests)
            return
          }

          // Handle language detection response
          if (translation.from_lang && !translation.translated) {
            console.debug('[onBatchComplete] Skipping detection result', translation)
            return
          }

          const translatedText =
            translation.translated_text || translation.translated || translation.t
          if (translatedText) {
            // Determine the correct context and cache
            const effectiveContext = context || requests[reqIdx]?.context || 'ui'
            const cacheKey = `${originalText}|${effectiveContext}`
            const cache =
              effectiveContext === 'ui' || !effectiveContext ? uiTranslations : translations

            // Cache the translation
            cache[cacheKey] = translatedText

            console.debug(
              '[onBatchComplete] Cached in:',
              effectiveContext === 'ui' || !effectiveContext ? 'uiTranslations' : 'translations'
            )
            console.debug('[onBatchComplete] uiTranslations keys:', Object.keys(uiTranslations))
            console.debug('[onBatchComplete] translations keys:', Object.keys(translations))

            console.debug('[onBatchComplete] Set translation:', {
              cacheKey,
              translatedText,
              context: effectiveContext
            })
          } else {
            console.warn('[onBatchComplete] No translatedText for', translation)
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
      console.debug('[l] Skip translation (same language)', { text, fromLang, toLang })
      return text
    }

    const cacheKey = `${text}|${context || 'ui'}`
    const cache = context === 'ui' || !context ? uiTranslations : translations

    // Return cached translation if available
    if (cache[cacheKey]) {
      console.debug('[l] Found cached translation', { cacheKey, value: cache[cacheKey] })
      return cache[cacheKey]
    }

    // Check if we've recently queued this translation
    const languageCacheKey = `${cacheKey}|${fromLang}|${toLang}`
    if (recentlyQueued.has(languageCacheKey)) {
      console.debug('[l] Recently queued, returning original', { cacheKey })
      return text
    }

    // Queue for translation
    console.debug('[l] Queue translation', { text, context, fromLang, toLang, cacheKey })
    batching.queueTranslation(text, context || 'ui', fromLang, toLang, cacheKey)

    // Mark as recently queued
    recentlyQueued.add(languageCacheKey)

    // Clear the recently queued cache after a short delay
    // Use a shorter delay for tests to allow retries
    const clearDelay = 100 // Always use short delay for faster updates
    setTimeout(() => {
      recentlyQueued.delete(languageCacheKey)
    }, clearDelay)

    // Return original text for now (will be updated when translation arrives)
    console.debug('[l] No cached translation, returning original', { cacheKey })
    return text
  }

  /**
   * Get a reactive translation that automatically updates when the translation becomes available.
   * This function returns a string directly, making it easier to use in templates and computed properties.
   */
  const lr = (text: string, context?: string, originalLang?: string) => {
    // Force reactivity by depending on currentLanguage
    void currentLanguage.value

    const fromLang = originalLang || 'en'
    const toLang = currentLanguage.value

    // Skip translation if source and target languages are the same
    if (fromLang === toLang) {
      console.debug('[lr] Skip translation (same language)', { text, fromLang, toLang })
      return text
    }

    const cacheKey = `${text}|${context || 'ui'}`
    const cache = context === 'ui' || !context ? uiTranslations : translations

    console.debug('[lr] Looking for translation', { cacheKey, cacheKeys: Object.keys(cache) })
    console.debug('[lr] Cache contents:', cache)
    console.debug('[lr] Looking for key:', cacheKey, 'Found:', cache[cacheKey])

    // Return cached translation if available
    if (cache[cacheKey]) {
      console.debug('[lr] Found cached translation', { cacheKey, value: cache[cacheKey] })
      return cache[cacheKey]
    }

    // Check if we've recently queued this translation
    const languageCacheKey = `${cacheKey}|${fromLang}|${toLang}`
    if (recentlyQueued.has(languageCacheKey)) {
      console.debug('[lr] Recently queued, returning original', { cacheKey })
      return text
    }

    // Queue for translation
    console.debug('[lr] Queue translation', { text, context, fromLang, toLang, cacheKey })
    batching.queueTranslation(text, context || 'ui', fromLang, toLang, cacheKey)

    // Mark as recently queued
    recentlyQueued.add(languageCacheKey)

    // Clear the recently queued cache after a short delay
    // Use a shorter delay for tests to allow retries
    const clearDelay = 100 // Always use short delay for faster updates
    setTimeout(() => {
      recentlyQueued.delete(languageCacheKey)
    }, clearDelay)

    // Return original text for now (will be updated when translation arrives)
    console.debug('[lr] No cached translation, returning original', { cacheKey })
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
        result.translations.forEach((translation: TranslationWithContext, index: number) => {
          const originalText = items[index]?.text
          if (!originalText) {
            console.error(
              '[fetchAndCacheBatch] No originalText for index',
              index,
              items,
              result.translations
            )
            return
          }

          // Handle language detection response
          if (translation.from_lang && !translation.translated) {
            // Не кешируем детекцию
            return
          }

          // Handle translation response
          const translatedText = translation.translated || translation.t
          if (translatedText) {
            const cacheKey = `${originalText}|${translation.context || effectiveContext}`
            const cache =
              translation.context === 'ui' || !translation.context ? uiTranslations : translations
            cache[cacheKey] = translatedText

            // Force reactivity by triggering a change
            if (translation.context === 'ui' || !translation.context) {
              uiTranslations[cacheKey] = translatedText
            } else {
              translations[cacheKey] = translatedText
            }
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
    translatorHost,

    // Translation functions
    l,
    lr,
    fetchAndCacheBatch,

    // Utility functions
    cleanup: () => {
      clearTranslations()
      batching.cleanup()
    },
    getBatchingStats: () => batching.getStats()
  }
}

// --- GLOBAL SINGLETON LOGIC ---
// Always use window.__LANGIE_SINGLETON__ as the source of truth
function getGlobalLangieInstance(): any {
  if (typeof window !== 'undefined') {
    return (window as any).__LANGIE_SINGLETON__ || null
  }
  return globalLangieInstance
}
function setGlobalLangieInstance(instance: any, options?: TranslatorOptions) {
  if (typeof window !== 'undefined') {
    ;(window as any).__LANGIE_SINGLETON__ = instance
    if (options && options.translatorHost) {
      localStorage.setItem('__LANGIE_SINGLETON_URL__', options.translatorHost)
    }
  }
  globalLangieInstance = instance
}

export function useLangie(options: TranslatorOptions = {}) {
  const globalInstance = getGlobalLangieInstance()

  // If we have a global instance and no specific options, use it
  if (globalInstance && Object.keys(options).length === 0) {
    return globalInstance
  }

  // If we have a global instance but options are provided, check if they match
  if (globalInstance) {
    const currentHost = globalInstance.translatorHost
    const newHost = options.translatorHost
    if (currentHost === newHost) {
      return globalInstance
    } else {
      // Create new instance
      const instance = createLangieInstance(options)

      // Store as global singleton ONLY if this is the first instance OR if it has a translatorHost
      if (!globalInstance) {
        setGlobalLangieInstance(instance, options)
      } else if (options.translatorHost && !globalInstance.translatorHost) {
        setGlobalLangieInstance(instance, options)
      } else {
        // Remove global instance
        globalLangieInstance = null
      }

      return instance
    }
  }

  // Create new instance
  const instance = createLangieInstance(options)

  // Store as global singleton ONLY if this is the first instance OR if it has a translatorHost
  if (!globalInstance) {
    setGlobalLangieInstance(instance, options)
  } else if (options.translatorHost && !globalInstance.translatorHost) {
    setGlobalLangieInstance(instance, options)
  } else {
    // Remove global instance
    globalLangieInstance = null
  }

  return instance
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
