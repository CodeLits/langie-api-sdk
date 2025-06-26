<template>
  <select
    :value="modelValue"
    @change="handleChange"
    class="language-select w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
  >
    <option value="" disabled>Select language</option>
    <option
      v-for="language in languages"
      :key="language.value || language.code"
      :value="language.value || language.code"
    >
      {{ displayName(language) }}
    </option>
  </select>
</template>

<script lang="ts" setup>
// TypeScript now checks this file – avoid suppressing errors globally.

import type { PropType } from 'vue'
import { watch } from 'vue'
import { applyLanguageAlias } from '../search-utils.js'

interface LanguageOption {
  value?: string
  code?: string
  name?: string
  native_name?: string
  label?: string
  flag?: string | string[]
}

const props = defineProps({
  modelValue: {
    type: String,
    required: false,
    default: ''
  },
  languages: {
    type: Array as PropType<LanguageOption[]>,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const displayName = (language: LanguageOption): string => {
  if (!language) return ''
  return (
    language.native_name || language.name || language.label || language.value || language.code || ''
  )
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}

// ---------------------------------------------------------------------------
// Developer aid: surface language / translation loading issues in the console

const logLanguagesState = (list: unknown, phase = 'init') => {
  if (!Array.isArray(list) || list.length === 0) {
    console.error(
      `[LanguageSelect] No languages available during ${phase}. This usually indicates a translation-service error.`
    )
  }
}

watch(
  () => props.languages,
  (newVal) => {
    logLanguagesState(newVal, 'update')
  },
  { deep: false }
)
</script>

<style scoped>
.language-select {
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.language-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dark .language-select {
  background-color: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark .language-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
