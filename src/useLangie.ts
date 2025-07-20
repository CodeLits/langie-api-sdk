import { watch } from 'vue'
import type { TranslatorOptions, TranslateServiceResponse, TranslatorLanguage } from './types'
import { useLangieCore, __resetLangieCoreForTests } from './composables/useLangie-core'
import { TranslationBatching } from './composables/useLangie-batching'
import {
  API_FIELD_TEXT,
  API_FIELD_FROM,
  API_FIELD_TO,
  API_FIELD_CTX,
  API_FIELD_TRANSLATIONS
} from './constants'
import { setCache, getCache } from './utils/cache'
import { devDebug } from './utils/debug'

// Global singleton instance
type LangieInstance = ReturnType<typeof createLangieInstance> & { translatorHost?: string }
let globalLangieInstance: LangieInstance | null = null

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

// Extended type for translation objects that includes ctx
interface TranslationWithContext extends TranslateServiceResponse {
  [API_FIELD_CTX]?: string
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

  // Global defaults for lt component
  const ltDefaults = {
    ctx: 'ui',
    orig: ''
  }

  // Functions to manage lt component defaults
  const setLtDefaults = (defaults: { ctx?: string; orig?: string }) => {
    Object.assign(ltDefaults, defaults)
  }

  const getLtDefaults = () => ({ ...ltDefaults })

  // localStorage cache management
  const CACHE_KEY = 'langie_translations_cache'
  const UI_CACHE_KEY = 'langie_ui_translations_cache'
  const LANGUAGES_CACHE_KEY = 'langie_languages_cache'

  // Load cached translations from localStorage for current language
  const loadCachedTranslations = () => {
    if (typeof window === 'undefined') return

    const cachedTranslations = getCache<Record<string, Record<string, string>>>(CACHE_KEY)
    const cachedUiTranslations = getCache<Record<string, Record<string, string>>>(UI_CACHE_KEY)

    if (cachedTranslations) {
      // Load translations for current language only
      const currentLang = currentLanguage.value
      const langTranslations = cachedTranslations[currentLang] || {}
      Object.assign(translations, langTranslations)
    }

    if (cachedUiTranslations) {
      // Load UI translations for current language only
      const currentLang = currentLanguage.value
      const langUiTranslations = cachedUiTranslations[currentLang] || {}
      Object.assign(uiTranslations, langUiTranslations)
    }
  }

  // Save translations to localStorage for current language
  const saveCachedTranslations = () => {
    if (typeof window === 'undefined') return

    // Load existing cache
    const existingTranslations = getCache<Record<string, Record<string, string>>>(CACHE_KEY) || {}
    const existingUiTranslations =
      getCache<Record<string, Record<string, string>>>(UI_CACHE_KEY) || {}

    // Save current language translations
    const currentLang = currentLanguage.value
    existingTranslations[currentLang] = { ...translations }
    existingUiTranslations[currentLang] = { ...uiTranslations }

    // Save with TTL (7 days for translations)
    setCache(CACHE_KEY, existingTranslations, 7 * 24 * 60 * 60 * 1000)
    setCache(UI_CACHE_KEY, existingUiTranslations, 7 * 24 * 60 * 60 * 1000)
  }

  // Load cached languages from localStorage
  const loadCachedLanguages = () => {
    if (typeof window === 'undefined') return

    const cachedLanguages = getCache<TranslatorLanguage[]>(LANGUAGES_CACHE_KEY)
    if (cachedLanguages) {
      availableLanguages.value = cachedLanguages
    }
  }

  // Load cached translations and languages on initialization
  loadCachedTranslations()
  loadCachedLanguages()

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
      // Batch complete

      // Clear recently queued cache to make translations immediately available
      requests.forEach((req) => {
        const cacheKey = `${req[API_FIELD_TEXT]}|${req[API_FIELD_CTX]}`
        const languageCacheKey = `${cacheKey}|${req[API_FIELD_FROM]}|${req[API_FIELD_TO]}`
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
          const request = requests[reqIdx]
          const originalText = request?.[API_FIELD_TEXT]

          if (!originalText) {
            return
          }

          // Handle language detection response
          if (translation[API_FIELD_FROM] && !translation[API_FIELD_TEXT]) {
            return
          }

          const translatedText = translation[API_FIELD_TEXT]
          if (translatedText) {
            // Skip caching if translation equals original text
            if (translatedText === originalText) {
              devDebug('[useLangie] Skipping cache for identical translation:', {
                original: originalText,
                translated: translatedText,
                context: request[API_FIELD_CTX] || ltDefaults.ctx || 'ui'
              })
              return
            }

            // Use the context from the original request, not from the response
            const originalCtx = request[API_FIELD_CTX]
            const effectiveCtx = originalCtx !== undefined ? originalCtx : ltDefaults.ctx || 'ui'
            const cacheKey = `${originalText}|${effectiveCtx}`
            const cache = effectiveCtx === 'ui' ? uiTranslations : translations

            // Cache the translation
            cache[cacheKey] = translatedText

            // Debug logging
            devDebug('[useLangie] Cached translation:', {
              original: originalText,
              translated: translatedText,
              context: effectiveCtx,
              cacheKey
            })

            // Save to localStorage
            saveCachedTranslations()
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
  const l = (text: string, ctx?: string, originalLang?: string) => {
    const from = originalLang || ltDefaults.orig
    const to = currentLanguage.value

    // Skip translation if source and target languages are the same
    if (from === to) {
      return text
    }

    // Use provided context or global defaults, but don't fallback to 'ui' if ctx is explicitly provided
    const effectiveCtx = ctx !== undefined ? ctx : ltDefaults.ctx || 'ui'
    const cacheKey = `${text}|${effectiveCtx}`
    const cache = effectiveCtx === 'ui' ? uiTranslations : translations

    // Return cached translation if available
    if (cache[cacheKey]) {
      return cache[cacheKey]
    }

    // Check if we've recently queued this translation
    const languageCacheKey = `${cacheKey}|${from}|${to}`
    if (recentlyQueued.has(languageCacheKey)) {
      return text
    }

    // Queue for translation
    batching.queueTranslation(text, effectiveCtx, from, to, cacheKey)

    // Mark as recently queued
    recentlyQueued.add(languageCacheKey)

    // Clear the recently queued cache after a short delay
    // Use a shorter delay for tests to allow retries
    const clearDelay = 100 // Always use short delay for faster updates
    setTimeout(() => {
      recentlyQueued.delete(languageCacheKey)
    }, clearDelay)

    // Return original text for now (will be updated when translation arrives)
    return text
  }

  /**
   * Get a reactive translation that automatically updates when the translation becomes available.
   * This function returns a string directly, making it easier to use in templates and computed properties.
   */
  const lr = (text: string, ctx?: string, originalLang?: string) => {
    // Force reactivity by depending on currentLanguage
    void currentLanguage.value

    const from = originalLang || ltDefaults.orig
    const to = currentLanguage.value

    // Skip translation if source and target languages are the same
    if (from === to) {
      return text
    }

    // Use provided context or global defaults, but don't fallback to 'ui' if ctx is explicitly provided
    const effectiveCtx = ctx !== undefined ? ctx : ltDefaults.ctx || 'ui'
    const cacheKey = `${text}|${effectiveCtx}`
    const cache = effectiveCtx === 'ui' ? uiTranslations : translations

    // Return cached translation if available
    if (cache[cacheKey]) {
      return cache[cacheKey]
    }

    // Check if we've recently queued this translation
    const languageCacheKey = `${cacheKey}|${from}|${to}`
    if (recentlyQueued.has(languageCacheKey)) {
      return text
    }

    // Queue for translation
    batching.queueTranslation(text, effectiveCtx, from, to, cacheKey)

    // Mark as recently queued
    recentlyQueued.add(languageCacheKey)

    // Clear the recently queued cache after a short delay
    // Use a shorter delay for tests to allow retries
    const clearDelay = 100 // Always use short delay for faster updates
    setTimeout(() => {
      recentlyQueued.delete(languageCacheKey)
    }, clearDelay)

    // Return original text for now (will be updated when translation arrives)
    return text
  }

  const fetchAndCacheBatch = async (
    items: { [API_FIELD_TEXT]: string; [API_FIELD_CTX]?: string }[],
    from?: string,
    to = currentLanguage.value,
    globalCtx?: string
  ) => {
    if (items.length === 0) return

    // Use global defaults for from language if not provided
    const effectiveFrom = from || ltDefaults.orig

    // Skip translation if source and target languages are the same
    if (effectiveFrom === to) {
      return
    }

    isLoading.value = true

    try {
      // Use global context if provided, otherwise fall back to global defaults or 'ui'
      const effectiveCtx = globalCtx || ltDefaults.ctx || 'ui'

      const response = await fetch(`${translatorHost}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          translations: items.map((item) => ({
            [API_FIELD_TEXT]: item[API_FIELD_TEXT],
            [API_FIELD_CTX]: item[API_FIELD_CTX] || effectiveCtx
          })),
          [API_FIELD_FROM]: effectiveFrom,
          [API_FIELD_TO]: to
        })
      })

      if (!response.ok) {
        throw new Error(`Translation request failed: ${response.status}`)
      }

      const result = await response.json()

      if (result[API_FIELD_TRANSLATIONS]) {
        result[API_FIELD_TRANSLATIONS].forEach(
          (translation: TranslationWithContext, index: number) => {
            const item = items[index]
            const originalText = item?.[API_FIELD_TEXT]
            if (!originalText) {
              return
            }

            // Handle language detection response
            if (translation[API_FIELD_FROM] && !translation[API_FIELD_TEXT]) {
              // Не кешируем детекцию
              return
            }

            // Handle translation response
            const translatedText = translation[API_FIELD_TEXT]
            if (translatedText) {
              // Skip caching if translation equals original text
              if (translatedText === originalText) {
                devDebug('[useLangie] Skipping cache for identical translation (batch):', {
                  original: originalText,
                  translated: translatedText,
                  context: item[API_FIELD_CTX] || effectiveCtx
                })
                return
              }

              // Use the context from the original item, not from the response
              const originalCtx = item[API_FIELD_CTX]
              const translationCtx = originalCtx !== undefined ? originalCtx : effectiveCtx
              const cacheKey = `${originalText}|${translationCtx}`
              const cache = translationCtx === 'ui' ? uiTranslations : translations
              cache[cacheKey] = translatedText

              // Debug logging
              devDebug('[useLangie] Cached translation (batch):', {
                original: originalText,
                translated: translatedText,
                context: translationCtx,
                cacheKey
              })

              // Save to localStorage
              saveCachedTranslations()
            }
          }
        )
      }
    } catch (error) {
      console.error('[useLangie] Translation error:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Watch for language changes - load translations for new language
  watch(currentLanguage, () => {
    // Clear memory cache
    Object.keys(translations).forEach((key) => delete translations[key])
    Object.keys(uiTranslations).forEach((key) => delete uiTranslations[key])

    // Load cached translations for new language
    loadCachedTranslations()

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
    getBatchingStats: () => batching.getStats(),

    // lt component defaults management
    setLtDefaults,
    getLtDefaults
  }
}

// --- GLOBAL SINGLETON LOGIC ---
// Always use window.__LANGIE_SINGLETON__ as the source of truth
function getGlobalLangieInstance(): LangieInstance | null {
  if (typeof window !== 'undefined') {
    return (
      (window as unknown as { __LANGIE_SINGLETON__?: LangieInstance }).__LANGIE_SINGLETON__ || null
    )
  }
  return globalLangieInstance
}
function setGlobalLangieInstance(instance: LangieInstance, options?: TranslatorOptions) {
  if (typeof window !== 'undefined') {
    ;(window as unknown as { __LANGIE_SINGLETON__?: LangieInstance }).__LANGIE_SINGLETON__ =
      instance
    if (options && options.translatorHost) {
      localStorage.setItem('__LANGIE_SINGLETON_URL__', options.translatorHost)
    }
  }
  globalLangieInstance = instance
}

export function useLangie(options: TranslatorOptions = {}) {
  const globalInstance: LangieInstance | null = getGlobalLangieInstance()

  // If we have a global instance and no specific options, use it
  if (globalInstance && Object.keys(options).length === 0) {
    return globalInstance
  }

  // If we have a global instance but options are provided, check if they match
  if (globalInstance) {
    const currentHost = (globalInstance as LangieInstance).translatorHost
    const newHost = options.translatorHost
    if (currentHost === newHost) {
      return globalInstance
    } else {
      // Create new instance
      const instance: LangieInstance = createLangieInstance(options)

      // Store as global singleton ONLY if this is the first instance OR if it has a translatorHost
      if (!globalInstance) {
        setGlobalLangieInstance(instance, options)
      } else if (options.translatorHost && !(globalInstance as LangieInstance).translatorHost) {
        setGlobalLangieInstance(instance, options)
      } else {
        // Remove global instance
        globalLangieInstance = null
      }

      return instance
    }
  }

  // Create new instance
  const instance: LangieInstance = createLangieInstance(options)

  // Store as global singleton ONLY if this is the first instance OR if it has a translatorHost
  if (!globalInstance) {
    setGlobalLangieInstance(instance, options)
  } else if (options.translatorHost && !(globalInstance as LangieInstance).translatorHost) {
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

// Global lt component defaults management
export function setLtDefaults(defaults: { ctx?: string; orig?: string }) {
  const instance = getGlobalLangieInstance()
  if (instance && instance.setLtDefaults) {
    instance.setLtDefaults(defaults)
  }
}

export function getLtDefaults() {
  const instance = getGlobalLangieInstance()
  if (instance && instance.getLtDefaults) {
    return instance.getLtDefaults()
  }
  return { ctx: 'ui', orig: '' }
}
