import { ref, reactive } from 'vue'
import type { Ref } from 'vue'
import type { TranslatorOptions, TranslatorLanguage } from '../types'
import { DEFAULT_API_HOST } from '../constants'
import { devDebug } from '../utils/debug'
import { getCountryCode } from '../utils/getCountryCode'

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

// Test reset function
export function __resetLangieCoreForTests() {
  availableLanguages.value = []
  Object.keys(translations).forEach((key) => delete translations[key])
  Object.keys(uiTranslations).forEach((key) => delete uiTranslations[key])
  currentLanguage.value = 'en'
  _translatorHost = DEFAULT_API_HOST
  _autoSelected = false
  _languagesCache = null
  _languagesPromise = null

  // Clear localStorage for tests
  if (typeof window !== 'undefined') {
    localStorage.removeItem('interface_language')
    localStorage.removeItem('langie_translations_cache')
    localStorage.removeItem('langie_ui_translations_cache')
    localStorage.removeItem('langie_languages_cache')
  }
}

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
  // Always respect the defaultLanguage option if it's different from 'en'
  if (defaultLanguage !== 'en' && currentLanguage.value === 'en') {
    currentLanguage.value = defaultLanguage
  }

  // Restore saved language from localStorage if available
  if (typeof window !== 'undefined' && currentLanguage.value === 'en') {
    const savedLanguage = localStorage.getItem('interface_language')
    if (savedLanguage) {
      currentLanguage.value = savedLanguage
    }
  }

  const setLanguage = (lang: string) => {
    if (lang && lang !== currentLanguage.value) {
      // debugOnlyDev(`[useLangie] setLanguage: ${currentLanguage.value} → ${lang}`)
    }
    currentLanguage.value = lang

    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('interface_language', lang)
    }
  }

  const fetchLanguages = async (opts: { force?: boolean; country?: string } = {}) => {
    const { force = false, country: explicitCountry } = opts
    // const startTime = Date.now()

    if (!force) {
      if (_languagesCache) {
        return _languagesCache
      }
      if (_languagesPromise) {
        return _languagesPromise
      }
    }

    try {
      // Determine country hint - but only if we don't have cached languages
      let countryHint = explicitCountry || null
      if (
        !countryHint &&
        !_languagesCache &&
        availableLanguages.value &&
        availableLanguages.value.length
      ) {
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
      if (!countryHint && !_languagesCache && typeof window !== 'undefined') {
        // Use only browser locale for country hint (synchronous)
        const cc = await getCountryCode()
        countryHint = cc
      }

      let url = '/languages'
      // Добавляем language и timezone
      const language =
        (typeof navigator !== 'undefined' && navigator.languages && navigator.languages[0]) ||
        (typeof navigator !== 'undefined' && navigator.language) ||
        ''
      const timezone =
        (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || ''
      const params = new URLSearchParams()
      if (countryHint) params.append('country', countryHint)
      if (language) params.append('language', language)
      if (timezone) params.append('timezone', timezone)
      if (Array.from(params).length > 0) url += `?${params.toString()}`

      // Note: /languages endpoint should NOT increase usage count
      _languagesPromise = fetch(`${translatorHost}${url}`).then((res) => res.json())
      const response = (await _languagesPromise) as
        | TranslatorLanguage[]
        | { languages: TranslatorLanguage[] }
      const rawList: TranslatorLanguage[] = Array.isArray(response)
        ? response
        : response.languages || []

      // normalise to expected structure
      const mapped: TranslatorLanguage[] = rawList.map(
        (lang: TranslatorLanguage & { flag_country?: string | string[] }) => {
          let flag = lang.flag_country || lang.code
          if (Array.isArray(flag)) {
            flag = flag[0]
          }
          return {
            ...lang,
            value: lang.code,
            flag_country: flag
          }
        }
      )

      // Keep only desired Serbian variants
      const filtered: TranslatorLanguage[] = mapped.filter((l) => {
        if (l.code.startsWith('sr')) {
          return l.code === 'sr-latn' || l.code === 'sr-cyrl'
        }
        return true
      })

      availableLanguages.value = filtered

      // Save languages to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('langie_languages_cache', JSON.stringify(filtered))
        } catch (error) {
          console.warn('[useLangie] Failed to save cached languages:', error)
        }
      }

      // Auto-select browser language only once if not previously saved
      if (!_autoSelected && !localStorage.getItem('interface_language')) {
        const locale =
          typeof navigator !== 'undefined'
            ? navigator.languages?.[0] || navigator.language || ''
            : ''
        const browserCode = locale.split('-')[0]

        if (browserCode) {
          let pick: TranslatorLanguage | undefined = undefined

          // Handle Serbian variants
          if (browserCode === 'sr') {
            const isLatin = /latn/i.test(locale) || locale === 'sr'
            const target = isLatin ? 'sr-latn' : 'sr-cyrl'
            pick = mapped.find((l) => l.value === target)
          } else if (browserCode === 'sh') {
            pick =
              mapped.find((l) => l.value === 'sr-latn') ||
              mapped.find((l) => l.code.startsWith('sr'))
          } else {
            // Try exact match first
            pick = mapped.find((l) => l.value === browserCode)

            // If no exact match, try prefix match
            if (!pick) {
              pick = mapped.find((l) => l.code.startsWith(browserCode))
            }
          }

          if (pick && pick.value) {
            setLanguage(pick.value)
          }
        }
        _autoSelected = true
      }
      _languagesCache = filtered
      _languagesPromise = null

      return filtered
    } catch (error) {
      // const totalDuration = Date.now() - startTime
      devDebug('[useLangie] Language fetch error:', { error })
      return []
    }
  }

  const clearTranslations = () => {
    Object.keys(translations).forEach((key) => delete translations[key])
    Object.keys(uiTranslations).forEach((key) => delete uiTranslations[key])

    // Clear localStorage cache for all languages (only when explicitly called)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('langie_translations_cache')
      localStorage.removeItem('langie_ui_translations_cache')
    }
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
