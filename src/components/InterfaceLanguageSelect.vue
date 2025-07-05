<template>
  <LanguageSelect
    :model-value="currentLanguageObject"
    :languages="effectiveLanguages"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :is-dark="props.isDark"
    @update:model-value="handleLanguageChange"
  />
</template>

<script lang="ts" setup>
import { computed, watch, onMounted } from 'vue'
import LanguageSelect from './LanguageSelect.vue'
import { useLangie } from '../useLangie'
import type { TranslatorLanguage } from '../types'
import { getCountryCode } from '../utils/getCountryCode'
import { devDebug } from '@/utils/debug'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Select interface language'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  isDark: {
    type: Boolean,
    default: false
  },
  translatorHost: {
    type: String,
    default: ''
  },
  apiKey: {
    type: String,
    default: ''
  },
  languages: {
    type: Array as () => TranslatorLanguage[],
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

// Use useLangie to get languages and current language automatically
const langieOptions = computed(() => {
  const options: any = {}
  if (props.translatorHost) options.translatorHost = props.translatorHost
  if (props.apiKey) options.apiKey = props.apiKey
  return options
})

const { availableLanguages, currentLanguage, setLanguage, fetchLanguages } = useLangie(
  langieOptions.value
)

// Use provided languages if available, otherwise use SDK's languages
const effectiveLanguages = computed(() => {
  if (props.languages && props.languages.length > 0) {
    return props.languages
  }
  return availableLanguages.value
})

const currentLanguageObject = computed(() => {
  if (!currentLanguage.value) return null
  return effectiveLanguages.value.find((lang) => lang.code === currentLanguage.value) || null
})

// Function to detect browser language from available languages
function detectBrowserLanguage(languages: TranslatorLanguage[]): string | null {
  if (languages.length === 0) return null

  // Get browser languages in order of preference
  const browserLanguages = navigator.languages || [navigator.language || 'en']

  // Try to find exact match first
  for (const browserLang of browserLanguages) {
    const langCode = browserLang.toLowerCase().split('-')[0] // Extract language code (e.g., 'en' from 'en-US')
    const exactMatch = languages.find((lang) => lang.code.toLowerCase() === langCode)
    if (exactMatch) {
      return exactMatch.code
    }
  }

  // If no exact match, try with full locale (e.g., 'en-US')
  for (const browserLang of browserLanguages) {
    const fullLangCode = browserLang.toLowerCase()
    const localeMatch = languages.find((lang) => lang.code.toLowerCase() === fullLangCode)
    if (localeMatch) {
      return localeMatch.code
    }
  }

  return null
}

function handleLanguageChange(selectedLanguage: TranslatorLanguage | null) {
  if (selectedLanguage) {
    setLanguage(selectedLanguage.code)
    // Save to localStorage when user manually changes language
    localStorage.setItem('interface_language', selectedLanguage.code)
    emit('update:modelValue', selectedLanguage)
  }
}

// Watch for current language changes to save to localStorage
watch(currentLanguage, (newLangCode) => {
  if (newLangCode) {
    localStorage.setItem('interface_language', newLangCode)
  }
})

// Watch for changes in effective languages to set browser language
watch(
  () => effectiveLanguages.value,
  (newLanguages) => {
    if (newLanguages.length > 0 && !currentLanguage.value) {
      // Only set browser language if no language is currently selected
      const savedLanguageCode = localStorage.getItem('interface_language')

      if (savedLanguageCode) {
        // Check if saved language exists in the provided languages
        const savedLangExists = newLanguages.find((lang) => lang.code === savedLanguageCode)
        if (savedLangExists) {
          setLanguage(savedLanguageCode)
          return
        }
      }

      // If no saved language or saved language doesn't exist, detect browser language
      const browserLang = detectBrowserLanguage(newLanguages)
      if (browserLang) {
        setLanguage(browserLang)
      }
    }
  },
  { immediate: true }
)

// Load saved language from localStorage on initialization
onMounted(async () => {
  // Only fetch languages if not provided via props
  if (!props.languages || props.languages.length === 0) {
    // Get country code from browser for better language ordering
    const countryCode = await getCountryCode()
    devDebug('[InterfaceLanguageSelect] fetching languages for country:', countryCode)
    await fetchLanguages({ country: countryCode || undefined })
  }

  const savedLanguageCode = localStorage.getItem('interface_language')

  if (savedLanguageCode && savedLanguageCode !== currentLanguage.value) {
    // Check if saved language exists in current languages
    const currentLanguages = effectiveLanguages.value
    const savedLangExists = currentLanguages.find((lang) => lang.code === savedLanguageCode)

    if (savedLangExists) {
      setLanguage(savedLanguageCode)
    } else if (currentLanguages.length > 0) {
      // If saved language doesn't exist, try to detect browser language
      const browserLang = detectBrowserLanguage(currentLanguages)
      if (browserLang) {
        setLanguage(browserLang)
      }
    }
  } else if (!currentLanguage.value && effectiveLanguages.value.length > 0) {
    // If no saved language and no current language, detect browser language
    const browserLang = detectBrowserLanguage(effectiveLanguages.value)
    if (browserLang) {
      setLanguage(browserLang)
    }
  }
})

// Emit the current language when it changes
watch(
  currentLanguageObject,
  (newValue) => {
    if (newValue) {
      emit('update:modelValue', newValue)
    }
  },
  { immediate: true }
)
</script>
