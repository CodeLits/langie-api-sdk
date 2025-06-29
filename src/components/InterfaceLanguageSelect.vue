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
  }
})

const emit = defineEmits(['update:modelValue'])

// Use useLangie to get languages and current language automatically
const { availableLanguages, currentLanguage, setLanguage } = useLangie()

// Use provided languages if available, otherwise use fetched languages
const effectiveLanguages = computed(() => {
  const languages = props.languages.length > 0 ? props.languages : availableLanguages.value
  // Only filter out the currently selected language if there are other languages available
  const filtered = languages.filter((lang) => lang.code !== currentLanguage.value)
  // If filtering would result in an empty list, return the original list
  return filtered.length > 0 ? filtered : languages
})

const currentLanguageObject = computed(() => {
  if (!currentLanguage.value) {
    // If no current language is set, return undefined instead of null
    // This prevents the LanguageSelect component from receiving null model-value
    return undefined
  }
  // Look for current language in the full language list (not filtered)
  const allLanguages = props.languages.length > 0 ? props.languages : availableLanguages.value
  return allLanguages.find((lang) => lang.code === currentLanguage.value) || undefined
})

function handleLanguageChange(selectedLanguage: TranslatorLanguage | null | undefined) {
  if (selectedLanguage && selectedLanguage.code) {
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

// Load saved language from localStorage on initialization
onMounted(() => {
  const savedLanguageCode = localStorage.getItem('interface_language')
  if (savedLanguageCode && savedLanguageCode !== currentLanguage.value) {
    // Only set if different from current to avoid unnecessary changes
    setLanguage(savedLanguageCode)
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
