import { ref, reactive } from 'vue'
import type { Ref } from 'vue'
import type { TranslatorOptions, TranslatorLanguage } from '../types'
import { DEFAULT_API_HOST } from '../constants'

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

export function useLangieCore(options: TranslatorOptions = {}) {
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
      // console.log(`[useLangie] setLanguage: ${currentLanguage.value} → ${lang}`)
    }
    currentLanguage.value = lang
  }

  const fetchLanguages = async (opts: { force?: boolean; country?: string } = {}) => {
    const { force = false, country: explicitCountry } = opts
    // const startTime = Date.now()

    // console.debug('[useLangie] fetchLanguages called', { force, explicitCountry })

    if (!force) {
      if (_languagesCache) {
        // console.debug('[useLangie] Using cached languages', {
        //   cacheSize: _languagesCache.length,
        //   duration: `${Date.now() - startTime}ms`
        // })
        return _languagesCache
      }
      if (_languagesPromise) {
        // console.debug('[useLangie] Using existing languages promise')
        return _languagesPromise
      }
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
      // console.log('[useLangie] Fetching languages', { country: countryHint, url })

      _languagesPromise = fetch(`${translatorHost}${url}`).then((res) => res.json())
      const response = (await _languagesPromise) as any
      const rawList: TranslatorLanguage[] = Array.isArray(response)
        ? response
        : response.languages || []

      // console.debug('[useLangie] Raw languages received', {
      //   isArray: Array.isArray(response),
      //   hasLanguages: !!response.languages,
      //   rawCount: rawList.length
      // })

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

      // console.debug('[useLangie] Languages processed', {
      //   mappedCount: mapped.length,
      //   filteredCount: filtered.length,
      //   serbianFiltered: mapped.length - filtered.length
      // })

      availableLanguages.value = filtered

      // Auto-select browser language only once if not previously saved
      if (!_autoSelected && !localStorage.getItem('interface_language')) {
        const locale =
          typeof navigator !== 'undefined'
            ? navigator.languages?.[0] || navigator.language || ''
            : ''
        const browserCode = locale.split('-')[0]
        // console.log('[useLangie] Browser code', browserCode)
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
          if (pick && pick.value) {
            // console.debug('[useLangie] Auto-selecting browser language', {
            //   browserCode,
            //   selected: pick.value,
            //   name: pick.name
            // })
            setLanguage(pick.value)
          }
        }
        _autoSelected = true
      }
      _languagesCache = filtered
      _languagesPromise = null

      // const totalDuration = Date.now() - startTime
      // console.debug('[useLangie] fetchLanguages completed', {
      //   totalDuration: `${totalDuration}ms`,
      //   finalCount: filtered.length
      // })

      return filtered
    } catch (error) {
      // const totalDuration = Date.now() - startTime
      console.error('[useLangie] Language fetch error:', { error })
      return []
    }
  }

  const clearTranslations = () => {
    Object.keys(translations).forEach((key) => delete translations[key])
    Object.keys(uiTranslations).forEach((key) => delete uiTranslations[key])
  }

  return {
    availableLanguages,
    translations,
    uiTranslations,
    currentLanguage,
    isLoading,
    setLanguage,
    fetchLanguages,
    clearTranslations,
    translatorHost
  }
}
