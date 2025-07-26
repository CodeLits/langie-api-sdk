import { watch } from 'vue'
import type { TranslatorOptions, TranslateServiceResponse, TranslatorLanguage } from './types'
import { useLangieCore, __resetLangieCoreForTests } from './composables/useLangie-core'
import { TranslationBatching } from './composables/useLangie-batching'
import {
  API_FIELD_TEXT,
  API_FIELD_FROM,
  API_FIELD_TO,
  API_FIELD_CTX,
  API_FIELD_TRANSLATIONS,
  API_FIELD_ERROR
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

// Helper for safe localStorage access
function safeLocalStorageAccess<T>(operation: () => T): T | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    return operation()
  } catch (e) {
    devDebug('[useLangie] localStorage error:', e)
    return undefined
  }
}

// Also check if we have a stored singleton in localStorage as backup
if (!globalLangieInstance && typeof window !== 'undefined') {
  const stored = safeLocalStorageAccess(() => localStorage.getItem('__LANGIE_SINGLETON_URL__'))
  if (stored) {
    // Use stored URL to prevent recreation with wrong options
    const storedOptions = { translatorHost: stored }
    globalLangieInstance = createLangieInstance(storedOptions)
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

  // Watch for language changes to load cached translations
  watch(currentLanguage, () => {
    // Clear current translations before loading new ones
    Object.keys(translations).forEach((key) => delete translations[key])
    Object.keys(uiTranslations).forEach((key) => delete uiTranslations[key])
    loadCachedTranslations()
  })

  // Create batching instance
  const batching = new TranslationBatching(
    {
      initialBatchDelay: options.initialBatchDelay,
      followupBatchDelay: options.followupBatchDelay,
      maxBatchSize: options.maxBatchSize,
      maxWaitTime: options.maxWaitTime
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

      // --- PATCH: Map translations to requests by index (since ctx is not present in response) ---
      // Flatten all translation arrays from results
      let translationsArray: TranslationWithContext[] = []
      results.forEach((result) => {
        if (Array.isArray(result)) {
          translationsArray = translationsArray.concat(result)
        } else if (result.translations && Array.isArray(result.translations)) {
          translationsArray = translationsArray.concat(result.translations)
        }
      })

      translationsArray.forEach((translation, idx) => {
        const request = requests[idx]
        if (!request) {
          devDebug('[useLangie] No matching request for translation:', translation)
          return
        }
        const originalText = request[API_FIELD_TEXT]
        const originalCtx = request[API_FIELD_CTX] ?? (ltDefaults.ctx || 'ui')

        // Handle error responses
        if (translation[API_FIELD_ERROR]) {
          devDebug(
            '[useLangie] Translation error for',
            originalText,
            ':',
            translation[API_FIELD_ERROR]
          )

          // Record the error for future reference
          const errorKey = `${originalText}|${originalCtx}|${request[API_FIELD_FROM]}|${request[API_FIELD_TO]}`
          translationErrors.set(errorKey, translation[API_FIELD_ERROR])
          console.log(`[Debug] Recorded error:`, { errorKey, error: translation[API_FIELD_ERROR] })

          return // Don't cache translations with errors
        }

        // Handle language detection response
        if (translation[API_FIELD_FROM] && !translation[API_FIELD_TEXT]) {
          return
        }

        const translatedText = translation[API_FIELD_TEXT]
        if (translatedText) {
          // PATCH: Only skip as outdated if toLang was not explicitly set
          const requestedLanguage = request[API_FIELD_TO]
          const explicitToLang = request.__explicitToLang
          if (!explicitToLang && requestedLanguage !== currentLanguage.value) {
            devDebug('[useLangie] Skipping outdated translation:', {
              original: originalText,
              translated: translatedText,
              requestedLanguage,
              currentLanguage: currentLanguage.value
            })
            return
          }

          // Skip caching if translation equals original text
          if (translatedText === originalText) {
            devDebug('[useLangie] Skipping cache for identical translation:', {
              original: originalText,
              translated: translatedText,
              context: originalCtx
            })
            return
          }

          const effectiveCtx = originalCtx
          const cacheKey = `${originalText}|${effectiveCtx}`
          const cache = effectiveCtx === 'ui' ? uiTranslations : translations

          // Cache the translation
          cache[cacheKey] = translatedText

          // Debug logging
          devDebug('[useLangie] Cached translation:', {
            original: originalText,
            translated: translatedText,
            context: effectiveCtx,
            cacheKey,
            language: requestedLanguage
          })

          // Save to localStorage
          saveCachedTranslations()
        }
      })
    }
  )

  // Simple cache to track recently queued translations
  const recentlyQueued = new Set<string>()
  // Set to track timeout ids for cleanup
  const pendingTimeouts = new Set<ReturnType<typeof setTimeout>>()

  // Track translation errors
  const translationErrors = new Map<string, string>()

  // Internal translation logic shared by l and lr
  const translateInternal = (
    text: string,
    ctx?: string,
    originalLang?: string,
    toLang?: string,
    reactive = false
  ) => {
    if (reactive) {
      void currentLanguage.value // For Vue reactivity
    }
    const from = originalLang || ltDefaults.orig || ''
    const to = toLang || currentLanguage.value

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

    // Check if we have a recorded error for this translation
    const errorKey = `${text}|${effectiveCtx}|${from}|${to}`
    if (translationErrors.has(errorKey)) {
      return text // Return original text for failed translations
    }

    // Check if we've recently queued this translation
    const languageCacheKey = `${cacheKey}|${from}|${to}`
    if (recentlyQueued.has(languageCacheKey)) {
      return text
    }

    // Queue for translation, pass __explicitToLang if toLang is set
    batching.queueTranslation(text, effectiveCtx, from, to, cacheKey, toLang !== undefined)

    // Mark as recently queued
    recentlyQueued.add(languageCacheKey)

    // Clear the recently queued cache after a short delay
    // Use a shorter delay for tests to allow retries
    const clearDelay = 100 // Always use short delay for faster updates
    const timeoutId = setTimeout(() => {
      recentlyQueued.delete(languageCacheKey)
      pendingTimeouts.delete(timeoutId)
    }, clearDelay)
    pendingTimeouts.add(timeoutId)

    // Return original text for now (will be updated when translation arrives)
    return text
  }

  /**
   * l(): Non-reactive translation for plain JavaScript usage.
   * Returns translation or original text. Does NOT auto-update on language change.
   */
  const l = (text: string, ctx?: string, originalLang?: string, toLang?: string) =>
    translateInternal(text, ctx, originalLang, toLang, false)

  /**
   * lr(): Reactive translation for Vue usage.
   * Returns translation or original text. Auto-updates on language change (reactive).
   * Use in templates or computed properties.
   */
  const lr = (text: string, ctx?: string, originalLang?: string, toLang?: string) =>
    translateInternal(text, ctx, originalLang, toLang, true)

  const fetchAndCacheBatch = async (
    items: { [API_FIELD_TEXT]: string; [API_FIELD_CTX]?: string }[],
    from?: string,
    to = currentLanguage.value,
    globalCtx?: string
  ) => {
    if (items.length === 0) return

    // Use global defaults for from language if not provided
    const effectiveFrom = from || ltDefaults.orig || ''

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

      // Handle top-level error responses
      if (result[API_FIELD_ERROR]) {
        devDebug('[useLangie] Top-level API error:', result[API_FIELD_ERROR])

        // Create error responses for all items
        const errorResponses = items.map((item) => ({
          [API_FIELD_TEXT]: item[API_FIELD_TEXT],
          [API_FIELD_ERROR]: result[API_FIELD_ERROR]
        }))

        // Process error responses
        errorResponses.forEach((translation: TranslationWithContext, index: number) => {
          const item = items[index]
          const originalText = item?.[API_FIELD_TEXT]
          if (!originalText) {
            return
          }

          // Handle error responses
          if (translation[API_FIELD_ERROR]) {
            devDebug(
              '[useLangie] Translation error for',
              originalText,
              ':',
              translation[API_FIELD_ERROR]
            )

            // Record the error for future reference
            const errorKey = `${originalText}|${item[API_FIELD_CTX] || effectiveCtx}|${effectiveFrom}|${to}`
            translationErrors.set(errorKey, translation[API_FIELD_ERROR])

            return // Don't cache translations with errors
          }
        })

        return // Skip normal processing
      }

      if (result[API_FIELD_TRANSLATIONS]) {
        result[API_FIELD_TRANSLATIONS].forEach(
          (translation: TranslationWithContext, index: number) => {
            const item = items[index]
            const originalText = item?.[API_FIELD_TEXT]
            if (!originalText) {
              return
            }

            // Handle error responses
            if (translation[API_FIELD_ERROR]) {
              devDebug(
                '[useLangie] Translation error for',
                originalText,
                ':',
                translation[API_FIELD_ERROR]
              )
              return // Don't cache translations with errors
            }

            // Handle language detection response
            if (translation[API_FIELD_FROM] && !translation[API_FIELD_TEXT]) {
              // Не кешируем детекцию
              return
            }

            // Handle translation response
            const translatedText = translation[API_FIELD_TEXT]
            if (translatedText) {
              // Check if the target language is still current
              if (to !== currentLanguage.value) {
                devDebug('[useLangie] Skipping outdated translation (batch):', {
                  original: originalText,
                  translated: translatedText,
                  requestedLanguage: to,
                  currentLanguage: currentLanguage.value
                })
                return
              }

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
                cacheKey,
                language: to
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
    // Clear recently queued cache to prevent race conditions
    recentlyQueued.clear()

    // Load cached translations for new language
    loadCachedTranslations()

    // Cleanup batching to cancel pending requests
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

    // Error handling
    getTranslationError: (text: string, ctx?: string, from?: string, to?: string) => {
      const effectiveCtx = ctx !== undefined ? ctx : ltDefaults.ctx || 'ui'
      const effectiveFrom = from || ltDefaults.orig || ''
      const effectiveTo = to || currentLanguage.value
      const errorKey = `${text}|${effectiveCtx}|${effectiveFrom}|${effectiveTo}`
      const error = translationErrors.get(errorKey) || null
      console.log(`[Debug] getTranslationError:`, {
        text,
        ctx,
        from,
        to,
        errorKey,
        error,
        allErrors: Array.from(translationErrors.entries())
      })
      return error
    },

    // Utility functions
    cleanup: () => {
      clearTranslations()
      batching.cleanup()
      // Очистка всех таймеров
      pendingTimeouts.forEach((id) => clearTimeout(id))
      pendingTimeouts.clear()
      translationErrors.clear()
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
      safeLocalStorageAccess(() =>
        localStorage.setItem('__LANGIE_SINGLETON_URL__', options.translatorHost!)
      )
    }
  }
  globalLangieInstance = instance
}

export function useLangie(options: TranslatorOptions = {}) {
  const globalInstance: LangieInstance | null = getGlobalLangieInstance()

  // If no options or options match, always return the global instance if it exists
  if (globalInstance) {
    const currentHost = globalInstance.translatorHost
    const newHost = options.translatorHost
    if (!options.translatorHost || currentHost === newHost) {
      return globalInstance
    }
  }

  // Otherwise, create a new instance
  const instance: LangieInstance = createLangieInstance(options)
  setGlobalLangieInstance(instance, options)
  return instance
}

export function __resetLangieSingletonForTests() {
  if (globalLangieInstance) {
    globalLangieInstance.cleanup()
  }
  globalLangieInstance = null

  // Clear localStorage backup
  if (typeof window !== 'undefined') {
    safeLocalStorageAccess(() => localStorage.removeItem('__LANGIE_SINGLETON_URL__'))
    try {
      delete (window as unknown as Record<string, unknown>).__LANGIE_SINGLETON__
    } catch (e) {
      devDebug('[useLangie] window singleton delete error:', e)
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
