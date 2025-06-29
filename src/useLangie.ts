import { ref, watch, reactive } from 'vue'
import type { Ref } from 'vue'
import type { TranslatorOptions, TranslatorLanguage, TranslateServiceResponse } from './types'
import { DEFAULT_API_HOST } from './constants'

const availableLanguages: Ref<TranslatorLanguage[]> = ref([])
const translations: { [key: string]: string } = reactive({})
const uiTranslations: { [key: string]: string } = reactive({})
const currentLanguage: Ref<string> = ref('en')

// Global state for the translator host
let _translatorHost: string = DEFAULT_API_HOST

// Prevent repeated auto-selection of interface language
let _autoSelected = false

// Module-scope cache for languages so multiple composable instances / hot-reload don't refetch
let _languagesCache: TranslatorLanguage[] | null = null
let _languagesPromise: Promise<TranslatorLanguage[]> | null = null

export function useLangie(options: TranslatorOptions = {}) {
  // If a host is provided in options, it overrides the global host for all instances.
  // This ensures that the first initialization (e.g., from App.vue) sets the host correctly.
  if (options.translatorHost) {
    _translatorHost = options.translatorHost
  }

  const translatorHost = _translatorHost // Use the shared host
  const defaultLanguage = options.defaultLanguage || 'en'

  const isLoading = ref(false)

  // Initialize shared currentLanguage with default if not already set
  if (currentLanguage.value === 'en' && defaultLanguage !== 'en') {
    currentLanguage.value = defaultLanguage
  }

  const setLanguage = (lang: string) => {
    if (lang && lang !== currentLanguage.value) {
      console.log(`[useLangie] setLanguage: ${currentLanguage.value} → ${lang}`)
    }
    currentLanguage.value = lang
  }

  const fetchLanguages = async (opts: { force?: boolean; country?: string } = {}) => {
    const { force = false, country: explicitCountry } = opts
    if (!force) {
      if (_languagesCache) return _languagesCache
      if (_languagesPromise) return _languagesPromise
    }
    try {
      // Determine country hint
      let countryHint = explicitCountry || null
      if (!countryHint && availableLanguages.value && availableLanguages.value.length) {
        const currentLang = currentLanguage.value
        const entry = availableLanguages.value.find(
          (l: TranslatorLanguage) => l.code === currentLang
        )
        if (entry) {
          const c = Array.isArray(entry.flag_country)
            ? entry.flag_country[0]
            : typeof entry.flag_country === 'string'
              ? (entry.flag_country as string).split(',')[0]
              : null
          if (c) countryHint = c.toUpperCase()
        }
      }
      if (!countryHint && typeof window !== 'undefined') {
        const match = (navigator.languages || []).find((l) => l.includes('-'))
        if (match) countryHint = match.split('-')[1].toUpperCase()
        if (!countryHint) {
          const intlLoc = Intl?.DateTimeFormat?.().resolvedOptions().locale || ''
          if (intlLoc.includes('-')) countryHint = intlLoc.split('-')[1].toUpperCase()
        }
        if (!countryHint) {
          const base = navigator.language || (navigator as any).userLanguage || ''
          if (base.includes('-')) countryHint = base.split('-')[1].toUpperCase()
        }
      }

      let url = '/languages'
      if (countryHint) url += `?country=${countryHint}`
      console.log('[useLangie] Fetching languages', { country: countryHint, url })

      _languagesPromise = fetch(`${translatorHost}${url}`).then((res) => res.json())
      const response = (await _languagesPromise) as any
      const rawList: TranslatorLanguage[] = Array.isArray(response)
        ? response
        : response.languages || []

      // normalise to expected structure
      const mapped: TranslatorLanguage[] = rawList.map((lang: any) => {
        let flag = lang.flag_country || lang.code
        if (Array.isArray(flag)) {
          flag = flag[0]
        }
        return {
          ...lang,
          value: lang.code,
          flag_country: flag
        }
      })

      // Keep only desired Serbian variants
      const filtered: TranslatorLanguage[] = mapped.filter((l) => {
        if (l.code.startsWith('sr')) {
          return l.code === 'sr-latn' || l.code === 'sr-cyrl'
        }
        return true
      })

      availableLanguages.value = filtered

      // Auto-select browser language only once if not previously saved
      if (!_autoSelected && !localStorage.getItem('interface_language')) {
        const locale =
          typeof navigator !== 'undefined'
            ? navigator.languages?.[0] || navigator.language || ''
            : ''
        const browserCode = locale.split('-')[0]
        console.log('[useLangie] Browser code', browserCode)
        if (browserCode) {
          let pick: TranslatorLanguage | undefined = undefined
          if (browserCode === 'sr') {
            const isLatin = /latn/i.test(locale) || locale === 'sr'
            const target = isLatin ? 'sr-latn' : 'sr-cyrl'
            pick = mapped.find((l) => l.value === target)
          } else if (browserCode === 'sh') {
            pick =
              mapped.find((l) => l.value === 'sr-latn') ||
              mapped.find((l) => l.code.startsWith('sr'))
          } else {
            pick = mapped.find((l) => l.value === browserCode)
            if (!pick) pick = mapped.find((l) => l.code.startsWith(browserCode))
          }
          if (pick && pick.value) setLanguage(pick.value)
        }
        _autoSelected = true
      }
      _languagesCache = filtered
      _languagesPromise = null
      return filtered
    } catch (error) {
      console.error('Language fetch error:', error)
      return []
    }
  }

  /**
   * Synchronously get translation for the provided key.
   * If the key is not yet translated, the original key will be returned and
   * an asynchronous request will be triggered to fetch the translation in the
   * background (this avoids Promise objects leaking into the template).
   */
  const pendingRequests = new Set<string>()
  const queueMap = new Map<string, Map<string, { text: string; context: string }>>() // batchKey (from|to) -> Map<cacheKey, { text, context }>
  let flushTimeout: NodeJS.Timeout | null = null
  // Initial batching settings
  const DEFAULT_INITIAL_DELAY = 600
  const DEFAULT_FOLLOWUP_DELAY = 100

  const isInitialLoad = true
  const initialBatchDelay =
    typeof options.initialBatchDelay === 'number'
      ? options.initialBatchDelay
      : DEFAULT_INITIAL_DELAY

  const followupBatchDelay =
    typeof options.followupBatchDelay === 'number'
      ? options.followupBatchDelay
      : DEFAULT_FOLLOWUP_DELAY

  const flushQueues = async () => {
    const pendingBeforeFlush = Array.from(queueMap.values()).reduce((sum, m) => sum + m.size, 0)
    console.log(
      `[useLangie] flushing ${pendingBeforeFlush} queued keys (buckets: ${queueMap.size})`
    )
    // Collect all pending requests into a single batch
    const allRequests: Array<{
      text: string
      context: string
      fromLang: string
      toLang: string
      cacheKey: string
    }> = []

    for (const [batchKey, map] of Array.from(queueMap.entries())) {
      if (!map || map.size === 0) {
        queueMap.delete(batchKey)
        continue
      }

      const [fromLang, toLang] = batchKey.split('|')
      for (const [cacheKey, item] of map.entries()) {
        allRequests.push({
          text: item.text,
          context: item.context,
          fromLang,
          toLang,
          cacheKey
        })
      }
      queueMap.delete(batchKey)
    }

    // Make a single batch request for all translations
    if (allRequests.length > 0) {
      await fetchAndCacheBatchMixed(allRequests)
    }

    // If new items queued during this flush, schedule another run
    if (queueMap.size > 0) {
      scheduleFlush()
    }

    // Mark that initial load has completed after first flush
  }

  const scheduleFlush = () => {
    // If a flush is already scheduled, do nothing (debounce)
    if (flushTimeout !== null) return

    const timeout = isInitialLoad ? initialBatchDelay : followupBatchDelay

    console.log(`[useLangie] Scheduling flush in ${timeout}ms (initial: ${isInitialLoad})`)

    flushTimeout = setTimeout(() => {
      flushTimeout = null // Allow future scheduling
      flushQueues()
    }, timeout)
  }

  /**
   * Synchronously get translation for the provided text.
   * If originalLang is not provided, the language will be detected from the text automatically.
   */
  const l = (text: string, context?: string, originalLang?: string) => {
    const lang = currentLanguage.value

    // Skip translation when target and source are identical (explicit) or interface is en and originalLang indicates English
    if ((originalLang && originalLang === lang) || (!originalLang && lang === 'en')) {
      return text
    }

    const effectiveContext = context || 'ui'
    // If originalLang not supplied, use empty string so backend auto-detects
    const fromLang = originalLang === undefined || originalLang === null ? '' : originalLang
    const cacheKey = `${text}_${lang}_${effectiveContext}`

    // If source and target languages are the same, no translation needed
    if (fromLang && fromLang === lang) {
      // Populate cache so future calls hit instantly
      translations[cacheKey] = text
      uiTranslations[cacheKey] = text
      return text
    }

    // Return from cache if available
    if (translations[cacheKey]) {
      return translations[cacheKey]
    }

    // If not cached and no pending request for this key, enqueue fetch
    if (!pendingRequests.has(cacheKey)) {
      pendingRequests.add(cacheKey)

      const normFrom = !fromLang || fromLang === 'en' ? '' : fromLang
      const batchKey = `${normFrom}|${lang}`
      if (!queueMap.has(batchKey)) queueMap.set(batchKey, new Map())
      queueMap.get(batchKey)!.set(cacheKey, { text, context: effectiveContext })
      // Debug: show queue size after adding a key
      try {
        const totalQueued = Array.from(queueMap.values()).reduce((sum, m) => sum + m.size, 0)
        console.log(`[useLangie] queued "${text.slice(0, 25)}…" – pending keys: ${totalQueued}`)
      } catch (_) {
        /* noop */
      }
      scheduleFlush()
    }

    // Fallback to original key while translation is being fetched
    return text
  }

  /**
   * Fetch translations for the provided keys in a single batch request and
   * populate the internal caches so that subsequent calls to t() will
   * synchronously resolve.
   */
  const fetchAndCacheBatch = async (
    items: { text: string; context?: string }[],
    fromLang = 'en',
    toLang = currentLanguage.value
  ) => {
    if (!Array.isArray(items) || items.length === 0) {
      return {}
    }

    if (fromLang === toLang) {
      // No translation needed, just echo input
      items.forEach((item) => {
        const { text, context } = item
        const ctx = context || 'ui'
        const ck = `${text}_${toLang}_${ctx}`
        translations[ck] = text
        uiTranslations[ck] = text
      })
      return items.map(({ text }) => ({ translated: text, text }))
    }

    try {
      const requestBody = {
        translations: items.map((item) => ({
          text: item.text,
          context: item.context || 'ui',
          from_lang: fromLang,
          to_lang: toLang
        }))
      }
      const resp = await fetch(`${translatorHost}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }).then((res) => res.json())

      const translatedItems = resp.translations || []

      // Populate cache
      translatedItems.forEach((item: TranslateServiceResponse, index: number) => {
        const originalText = item.text || (items[index] && items[index].text) || ''
        const ctx = (items[index] && items[index].context) || 'ui'
        const translatedText = item.translated || item.t || originalText
        const ck = `${originalText}_${toLang}_${ctx}`
        translations[ck] = translatedText
        uiTranslations[ck] = translatedText
        pendingRequests.delete(ck)

        // No warning in production
      })

      return translatedItems
    } catch (error) {
      console.error('Batch translation error:', error)
      return {}
    }
  }

  /**
   * Fetch translations for mixed language pairs in a single batch request
   * This combines all pending translations into one request for better performance
   */
  const fetchAndCacheBatchMixed = async (
    requests: Array<{
      text: string
      context: string
      fromLang: string
      toLang: string
      cacheKey: string
    }>
  ) => {
    if (!Array.isArray(requests) || requests.length === 0) {
      return {}
    }

    try {
      console.log(`[useLangie] Making single batch request for ${requests.length} translations`)

      const requestBody = {
        translations: requests.map((req) => ({
          text: req.text,
          context: req.context || 'ui',
          from_lang: req.fromLang,
          to_lang: req.toLang
        }))
      }

      const resp = await fetch(`${translatorHost}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }).then((res) => res.json())

      const translatedItems = resp.translations || []

      // Populate cache with results
      translatedItems.forEach((item: TranslateServiceResponse, index: number) => {
        const request = requests[index]
        if (!request) return

        const originalText = item.text || request.text
        const translatedText = item.translated || item.t || originalText
        const cacheKey = request.cacheKey

        translations[cacheKey] = translatedText
        uiTranslations[cacheKey] = translatedText
        pendingRequests.delete(cacheKey)
      })

      console.log(`[useLangie] Successfully cached ${translatedItems.length} translations`)
      return translatedItems
    } catch (error) {
      console.error('Batch translation error:', error)
      // Clear pending requests on error to allow retry
      requests.forEach((req) => {
        pendingRequests.delete(req.cacheKey)
      })
      return {}
    }
  }

  // Derive country code for a language entry
  const getCountryFromLang = (langCode: string): string | undefined => {
    if (!availableLanguages.value || !availableLanguages.value.length) return undefined
    const entry = availableLanguages.value.find((l: TranslatorLanguage) => l.code === langCode)
    if (!entry) return undefined
    if (Array.isArray(entry.flag_country) && entry.flag_country.length)
      return entry.flag_country[0].toUpperCase()
    if (typeof entry.flag_country === 'string')
      return (entry.flag_country as string).split(',')[0].toUpperCase()
    return undefined
  }

  // Watch for interface language change to clear caches
  watch(
    () => currentLanguage.value,
    (newLang, oldLang) => {
      if (newLang !== oldLang) {
        console.log(`[useLangie] Interface language changed: ${oldLang} → ${newLang}`)
      }
      clearTranslations()
    }
  )

  const getTranslation = (key: string, context = 'ui') => {
    const lang = currentLanguage.value
    const cacheKey = `${key}_${lang}_${context}`
    return uiTranslations[cacheKey] || key
  }

  const clearTranslations = () => {
    // Clear cached translations
    Object.keys(translations).forEach((key) => delete translations[key])
    Object.keys(uiTranslations).forEach((key) => delete uiTranslations[key])

    // Reset request tracking so subsequent language switches can re-queue keys
    pendingRequests.clear()
    queueMap.clear()
  }

  const translate = l

  // Auto-fetch languages on initialization if not already cached/loading
  if (!_languagesCache && !_languagesPromise) {
    fetchLanguages()
  }

  return {
    setLanguage,
    fetchLanguages,
    availableLanguages,
    currentLanguage,
    translations,
    uiTranslations,
    l,
    translate,
    getCountryFromLang,
    getTranslation,
    clearTranslations,
    fetchAndCacheBatch,
    isLoading
  }
}
