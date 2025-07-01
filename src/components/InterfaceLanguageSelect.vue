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
import { debugOnlyDev } from '../utils/debug'

const props = defineProps({
  languages: {
    type: Array as () => TranslatorLanguage[],
    default: () => []
  },
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

// Debug logging
debugOnlyDev('[InterfaceLanguageSelect] useLangie options:', langieOptions.value)
debugOnlyDev('[InterfaceLanguageSelect] availableLanguages:', availableLanguages.value?.length)
debugOnlyDev('[InterfaceLanguageSelect] currentLanguage:', currentLanguage.value)

// Use provided languages if available, otherwise use fetched languages
const effectiveLanguages = computed(() => {
  const languages = props.languages.length > 0 ? props.languages : availableLanguages.value
  debugOnlyDev('[InterfaceLanguageSelect] effectiveLanguages:', languages?.length)
  return languages
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

// Watch for changes in provided languages to set browser language
watch(
  () => props.languages,
  (newLanguages) => {
    debugOnlyDev('[InterfaceLanguageSelect] Languages changed:', newLanguages.length)
    if (newLanguages.length > 0 && !currentLanguage.value) {
      // Only set browser language if no language is currently selected
      const savedLanguageCode = localStorage.getItem('interface_language')
      debugOnlyDev('[InterfaceLanguageSelect] Saved language from localStorage:', savedLanguageCode)

      if (savedLanguageCode) {
        // Check if saved language exists in the provided languages
        const savedLangExists = newLanguages.find((lang) => lang.code === savedLanguageCode)
        debugOnlyDev(
          '[InterfaceLanguageSelect] Saved language found in available languages:',
          savedLangExists
        )
        if (savedLangExists) {
          debugOnlyDev('[InterfaceLanguageSelect] Setting saved language:', savedLanguageCode)
          setLanguage(savedLanguageCode)
          return
        }
      }

      // If no saved language or saved language doesn't exist, detect browser language
      const browserLang = detectBrowserLanguage(newLanguages)
      debugOnlyDev('[InterfaceLanguageSelect] Detected browser language:', browserLang)
      if (browserLang) {
        setLanguage(browserLang)
      }
    }
  },
  { immediate: true }
)

// Load saved language from localStorage on initialization
onMounted(async () => {
  debugOnlyDev('[InterfaceLanguageSelect] onMounted called')

  // Fetch languages if not provided via props
  if (props.languages.length === 0) {
    debugOnlyDev('[InterfaceLanguageSelect] Fetching languages...')
    await fetchLanguages()
    debugOnlyDev('[InterfaceLanguageSelect] Languages fetched:', availableLanguages.value.length)
  }

  debugOnlyDev('[InterfaceLanguageSelect] onMounted - currentLanguage:', currentLanguage.value)
  debugOnlyDev(
    '[InterfaceLanguageSelect] onMounted - effectiveLanguages:',
    effectiveLanguages.value.length
  )
  debugOnlyDev('[InterfaceLanguageSelect] onMounted - props.languages:', props.languages.length)
  debugOnlyDev(
    '[InterfaceLanguageSelect] onMounted - availableLanguages:',
    availableLanguages.value.length
  )

  const savedLanguageCode = localStorage.getItem('interface_language')
  debugOnlyDev('[InterfaceLanguageSelect] onMounted - savedLanguageCode:', savedLanguageCode)

  if (savedLanguageCode && savedLanguageCode !== currentLanguage.value) {
    // Check if saved language exists in current languages
    const currentLanguages = effectiveLanguages.value
    const savedLangExists = currentLanguages.find((lang) => lang.code === savedLanguageCode)
    debugOnlyDev('[InterfaceLanguageSelect] onMounted - savedLangExists:', savedLangExists)

    if (savedLangExists) {
      debugOnlyDev(
        '[InterfaceLanguageSelect] onMounted - setting saved language:',
        savedLanguageCode
      )
      setLanguage(savedLanguageCode)
    } else if (currentLanguages.length > 0) {
      // If saved language doesn't exist, try to detect browser language
      const browserLang = detectBrowserLanguage(currentLanguages)
      debugOnlyDev('[InterfaceLanguageSelect] onMounted - browserLang:', browserLang)
      if (browserLang) {
        setLanguage(browserLang)
      }
    }
  } else if (!currentLanguage.value && effectiveLanguages.value.length > 0) {
    // If no saved language and no current language, detect browser language
    const browserLang = detectBrowserLanguage(effectiveLanguages.value)
    debugOnlyDev(
      '[InterfaceLanguageSelect] onMounted - no saved language, browserLang:',
      browserLang
    )
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
