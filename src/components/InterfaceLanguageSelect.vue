<template>
  <LanguageSelect
    :model-value="currentLanguageObject"
    :languages="filteredLanguages"
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

const currentLanguageObject = computed(() => {
  if (!currentLanguage.value) return null
  return availableLanguages.value.find((lang) => lang.code === currentLanguage.value) || null
})

// Filter out the currently selected language from the dropdown options
const filteredLanguages = computed(() => {
  return availableLanguages.value.filter(
    (lang) => !currentLanguage.value || lang.code !== currentLanguage.value
  )
})

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
