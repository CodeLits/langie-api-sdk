<template>
  <div class="interface-language-select-wrapper">
    <LanguageSelect
      :key="`interface-lang-${effectiveLanguages.length}`"
      :model-value="currentLanguageObject"
      :languages="effectiveLanguages"
      :placeholder="props.placeholder"
      :disabled="props.disabled || isChangingLanguage"
      :is-dark="props.isDark"
      @update:model-value="handleLanguageChange"
    />

    <!-- Loading overlay -->
    <div
      v-if="isChangingLanguage"
      class="language-change-loader"
      :class="{ 'is-dark': props.isDark }"
    >
      <div class="loader-spinner"></div>
      <span class="loader-text">Changing language...</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch, onMounted, ref } from 'vue'
import LanguageSelect from './LanguageSelect.vue'
import { useLangie } from '../useLangie'
import type { TranslatorLanguage } from '../types'
import { getCountryCode } from '../utils/getCountryCode'

// Loading state for language change
const isChangingLanguage = ref(false)

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

// Use the same SDK instance as the main app
const { availableLanguages, currentLanguage, setLanguage, fetchLanguages } = useLangie()

// Use provided languages if available, otherwise use SDK's languages
const effectiveLanguages = computed(() => {
  const languages =
    props.languages && props.languages.length > 0 ? props.languages : availableLanguages.value

  // Ensure all languages have required fields to prevent jumping
  return languages
    .map((lang) => ({
      ...lang,
      native_name: lang.native_name || lang.name,
      flag_country: lang.flag_country || lang.code
    }))
    .sort((a, b) => a.name.localeCompare(b.name)) // Stable sorting
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

async function handleLanguageChange(selectedLanguage: TranslatorLanguage | null) {
  if (selectedLanguage) {
    // Start loading
    isChangingLanguage.value = true

    try {
      // Simulate language change delay (in real app this would be actual translation loading)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setLanguage(selectedLanguage.code)
      // Save to localStorage when user manually changes language
      localStorage.setItem('interface_language', selectedLanguage.code)
      emit('update:modelValue', selectedLanguage)
    } finally {
      // End loading
      isChangingLanguage.value = false
    }
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

<style scoped>
.interface-language-select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

/* Fix spacing for the language select component */
.interface-language-select-wrapper :deep(.multiselect) {
  width: 100%;
  min-width: 200px;
}

.interface-language-select-wrapper :deep(.multiselect-dropdown) {
  padding: 8px 0;
}

.interface-language-select-wrapper :deep(.multiselect-option) {
  padding: 8px 12px;
  margin: 0;
  border-radius: 0;
}

.interface-language-select-wrapper :deep(.multiselect-option:hover) {
  background-color: #f3f4f6;
}

.is-dark .interface-language-select-wrapper :deep(.multiselect-option:hover) {
  background-color: #374151;
}

.language-change-loader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(2px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.language-change-loader.is-dark {
  background: rgba(30, 30, 30, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.loader-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

.language-change-loader.is-dark .loader-spinner {
  border-color: #374151;
  border-top-color: #3b82f6;
}

.loader-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-align: center;
}

.language-change-loader.is-dark .loader-text {
  color: #9ca3af;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
