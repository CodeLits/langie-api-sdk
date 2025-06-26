import { ref, watch, reactive } from 'vue'
import type { Ref } from 'vue'
import { translateBatch, fetchAvailableLanguages } from './core'
import type { TranslatorOptions, TranslatorLanguage } from './types'
import { DEFAULT_API_HOST } from './constants'

const availableLanguages: Ref<TranslatorLanguage[]> = ref([])
const translations: { [key: string]: string } = reactive({})
const uiTranslations: { [key: string]: string } = reactive({})

// Prevent repeated auto-selection of interface language
let _autoSelected = false

// Module-scope cache for languages so multiple composable instances / hot-reload don't refetch
let _languagesCache: TranslatorLanguage[] | null = null
let _languagesPromise: Promise<TranslatorLanguage[]> | null = null

export function useTranslator(options: TranslatorOptions = {}) {
  const translatorHost = options.translatorHost || DEFAULT_API_HOST
  const defaultLanguage = options.defaultLanguage || 'en'
  const fallbackLanguage = options.fallbackLanguage || 'en'

  const isLoading = ref(false)
  const availableLanguages = ref<TranslatorLanguage[]>([])

  const currentLanguage = ref(defaultLanguage)

  const setLanguage = (lang: string) => {
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

      let url = '/api/languages'
      if (countryHint) url += `?country=${countryHint}`
      console.log('[useTranslator] Fetching languages', { country: countryHint, url })

      _languagesPromise = fetch(`${translatorHost}${url}`).then((res) => res.json())
      const response = (await _languagesPromise) as any
      const rawList: TranslatorLanguage[] = Array.isArray(response)
        ? response
        : response.languages || []

      // normalise to expected structure
      const mapped = rawList.map((lang) => {
        let flags: string[] = []
        if (Array.isArray(lang.flag_country)) flags = lang.flag_country
        else if (typeof lang.flag_country === 'string')
          flags = (lang.flag_country as string)
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean)
        return {
          value: lang.code,
          name: lang.name,
          native_name: lang.native_name,
          flag: flags,
          flag_country: flags,
          code: lang.code
        }
      })

      // Keep only desired Serbian variants
      const filtered: TranslatorLanguage[] = mapped.filter((l: any) => {
        if (l.value.startsWith('sr')) {
          return l.value === 'sr-latn' || l.value === 'sr-cyrl'
        }
        return true
      }) as any

      availableLanguages.value = filtered

      // Auto-select browser language only once if not previously saved
      if (!_autoSelected && !localStorage.getItem('interface_language')) {
        const locale =
          typeof navigator !== 'undefined'
            ? navigator.languages?.[0] || navigator.language || ''
            : ''
        const browserCode = locale.split('-')[0]
        console.log('[useTranslator] Browser code', browserCode)
        if (browserCode) {
          let pick: any = null
          if (browserCode === 'sr') {
            const isLatin = /latn/i.test(locale) || locale === 'sr'
            const target = isLatin ? 'sr-latn' : 'sr-cyrl'
            pick = mapped.find((l) => l.value === target)
          } else if (browserCode === 'sh') {
            pick =
              mapped.find((l) => l.value === 'sr-latn') ||
              mapped.find((l) => l.value.startsWith('sr'))
          } else {
            pick = mapped.find((l) => l.value === browserCode)
            if (!pick) pick = mapped.find((l) => l.value.startsWith(browserCode))
          }
          if (pick) setLanguage(pick.value)
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

  // Thin wrapper: reuse translateBatch for single-string translations, removing duplicated request logic
  let translate: any // forward-declared to be defined after translateBatch

  /**
   * Synchronously get translation for the provided key.
   * If the key is not yet translated, the original key will be returned and
   * an asynchronous request will be triggered to fetch the translation in the
   * background (this avoids Promise objects leaking into the template).
   */
  const pendingRequests = new Set<string>()
  const queueMap = new Map<string, Map<string, { text: string; context: string }>>() // batchKey (from|to) -> Map<cacheKey, { text, context }>
  let flushTimeout: NodeJS.Timeout | null = null

  const flushQueues = async () => {
    for (const [batchKey, map] of Array.from(queueMap.entries())) {
      if (!map || map.size === 0) {
        queueMap.delete(batchKey)
        continue
      }
      queueMap.delete(batchKey)
      const items = Array.from(map.values()) as {
        text: string
        context: string
      }[]
      const [fromLang, toLang] = batchKey.split('|')
      await fetchAndCacheBatch(items, fromLang, toLang)
    }

    // If new items queued during this flush, schedule another run
    if (queueMap.size > 0) {
      scheduleFlush()
    }
  }

  const scheduleFlush = () => {
    if (flushTimeout !== null) clearTimeout(flushTimeout)
    flushTimeout = setTimeout(flushQueues, 10)
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
      items.forEach(({ text, context }) => {
        const ctx = context || 'ui'
        const ck = `${text}_${toLang}_${ctx}`
        translations[ck] = text
        uiTranslations[ck] = text
      })
      return items.map(({ text }) => ({ translated: text, text }))
    }

    try {
      const requestBody = {
        translations: items.map(({ text, context }) => ({
          text,
          context: context || 'ui',
          from_lang: fromLang,
          to_lang: toLang
        }))
      }
      const resp = await fetch(`${translatorHost}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }).then((res) => res.json())

      const translatedItems = resp.translations || []

      // Populate cache
      translatedItems.forEach((item: any) => {
        const originalText = item.text || items[item.index].text
        const ctx = items[item.index].context || 'ui'
        const translatedText = item.translated || item.t || item.translation || originalText
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

  // Watch for interface language change: refresh languages so ordering adapts
  watch(
    () => currentLanguage.value,
    async (newLang: string) => {
      // Only refetch if we already have languages and newLang differs
      if (!availableLanguages.value || availableLanguages.value.length === 0) return
      const country = getCountryFromLang(newLang)
      console.log('[useTranslator] Interface language changed, refetching languages', {
        newLang,
        country
      })
      await fetchLanguages({ force: true, country })
    }
  )

  // Watch for interface language change to clear caches
  watch(
    () => currentLanguage.value,
    () => {
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

  // Expose the batch translation method
  const fetchBatchTranslations = fetchAndCacheBatch

  // ------------------------------------------------------------------
  // Define translate wrapper simplified
  translate = async (text: string, sourceLang?: string, targetLang?: string, context = 'ui') => {
    const toLang = targetLang || currentLanguage.value
    const fromLang = sourceLang === undefined || sourceLang === null ? '' : sourceLang

    // If translating to same language, just return text
    if (fromLang && fromLang === toLang) return text

    const res = await fetchAndCacheBatch([{ text, context }], fromLang, toLang)
    if (Array.isArray(res) && res.length > 0) {
      return (res[0] as any).translated || (res[0] as any).t || (res[0] as any).translation || text
    }
    return text
  }

  return {
    availableLanguages,
    translatorHost,
    translate,
    l,
    getTranslation,
    clearTranslations,
    fetchLanguages,
    fetchBatchTranslations,
    currentLanguage,
    setLanguage,
    isLoading
  }
}
