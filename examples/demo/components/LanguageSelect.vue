<template>
  <VueSelect
    v-if="validLanguages.length > 0"
    :key="validLanguages?.length || 0"
    class="language-select"
    v-model="selectedValue"
    :options="validLanguages"
    :get-option-label="getOptionLabelFn"
    :get-option-value="getOptionValueFn"
    searchable
    :clearable="false"
    :filterable="true"
    :filterBy="filterByFn"
  >
    <template #option="{ option }">
      <div v-if="option" class="flex items-center gap-2">
        <img
          v-if="getFlagCode(option)"
          :src="`https://flagcdn.com/${getFlagCode(option)}.svg`"
          :alt="option?.native_name"
          class="w-5 h-4 mr-2 inline-block"
        />
        <span>{{ getOptionLabelFn(option) }}</span>
      </div>
    </template>
    <template #selected-option="{ option }">
      <div v-if="option" class="flex items-center gap-2">
        <img
          v-if="getFlagCode(option)"
          :src="`https://flagcdn.com/${getFlagCode(option)}.svg`"
          :alt="option?.native_name"
          class="w-5 h-4 mr-2 inline-block"
        />
        <span>{{ getOptionLabelFn(option) }}</span>
      </div>
    </template>
    <template #no-options="{ search }">
      <em v-if="search" style="opacity: 0.5"> No results found for "{{ search }}". </em>
      <em v-else style="opacity: 0.5">Start typing to search for a language.</em>
    </template>
  </VueSelect>

  <!-- Fallback while loading -->
  <div v-else class="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
</template>

<script lang="ts" setup>
// TypeScript now checks this file – avoid suppressing errors globally.

import 'vue-select/dist/vue-select.css'
import type { PropType } from 'vue'
import { computed } from 'vue'
import { applyLanguageAlias } from '../composables/search-utils.js'

interface LanguageOption {
  value: string
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

// Ensure languages array is always valid
const validLanguages = computed(() => {
  return Array.isArray(props.languages) ? props.languages : []
})

// v-model computed property
const selectedValue = computed({
  get: () => props.modelValue || '',
  set: (value: string) => emit('update:modelValue', value)
})

// Functions for vue3-select-component
const getOptionValueFn = (option: LanguageOption): string => {
  return option?.value || ''
}

const getOptionLabelFn = (option: LanguageOption): string => {
  if (!option) return ''
  const candidate = option.native_name || option.name || option.label
  if (typeof candidate === 'string') return candidate
  if (candidate && typeof candidate === 'object') {
    // pick first string value
    const val = Object.values(candidate).find((v) => typeof v === 'string')
    if (val) return val
  }
  return String(candidate || '')
}

// Function to get the flag code from region code
const getFlagCode = (option: LanguageOption | null | undefined): string => {
  if (!option) return ''
  if (typeof option.flag === 'string') {
    const match = option.flag.match(/flagcdn\.com\/(\w{2})\.svg/)
    if (match) return match[1].toLowerCase()
    return option.flag.toLowerCase()
  }
  if (Array.isArray(option.flag) && option.flag.length > 0) {
    return option.flag[0]?.toLowerCase() || ''
  }
  return ''
}

// Simple filter function for vue3-select-component
const filterByFn = (option: LanguageOption, search: string): boolean => {
  if (!search) return true

  try {
    const aliasResult = applyLanguageAlias(search)
    const searchTerms = Array.isArray(aliasResult) ? aliasResult : [aliasResult]
    searchTerms.push(search) // Add original search term

    const optionText = getOptionLabelFn(option).toLowerCase()

    return searchTerms.some((term) => term && optionText.includes(term.toLowerCase()))
  } catch (error) {
    console.warn('[LanguageSelect] Search error:', error)
    return getOptionLabelFn(option).toLowerCase().includes(search.toLowerCase())
  }
}
</script>

<style scoped>
/* Custom styles for vue3-select-component */
.language-select {
  --vs-controls-color: #334155;
  --vs-border-color: #cbd5e1;
  --vs-dropdown-bg: #ffffff;
  --vs-dropdown-color: #0f172a;
  --vs-selected-bg: #e2e8f0;
  --vs-selected-color: #0f172a;
  --vs-search-input-color: #0f172a;
  --vs-dropdown-option--active-bg: #db2777;
  --vs-dropdown-option--active-color: #ffffff;
}

.dark .language-select {
  --vs-controls-color: #e2e8f0;
  --vs-border-color: #334155;
  --vs-dropdown-bg: #1e293b;
  --vs-dropdown-color: #e2e8f0;
  --vs-selected-bg: #334155;
  --vs-selected-color: #e2e8f0;
  --vs-search-input-color: #e2e8f0;
  --vs-dropdown-option--active-bg: #db2777;
  --vs-dropdown-option--active-color: #ffffff;
}
</style>

<style>
/* Global (not scoped) dark-mode variables for vue-select */
.dark {
  /* Control & border */
  --vs-controls-color: #e2e8f0; /* slate-200 */
  --vs-border-color: #334155; /* slate-700 */

  /* Dropdown */
  --vs-dropdown-bg: #1e293b; /* slate-800 */
  --vs-dropdown-color: #e2e8f0; /* slate-200 */
  --vs-dropdown-option-color: #e2e8f0;

  /* Selected & chips */
  --vs-selected-bg: #334155; /* slate-700 */
  --vs-selected-color: #e2e8f0;

  /* Search input */
  --vs-search-input-color: #e2e8f0;

  /* Highlight */
  --vs-dropdown-option--active-bg: #db2777; /* pink-600 */
  --vs-dropdown-option--active-color: #ffffff;
}
</style>
