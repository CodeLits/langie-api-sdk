<template>
  <v-select
    v-if="validLanguages.length > 0"
    :key="validLanguages?.length || 0"
    class="language-select"
    :value="props.modelValue"
    :reduce="reduceOption"
    :options="validLanguages"
    :get-option-label="getOptionLabelFn"
    :get-option-key="getOptionKeyFn"
    searchable
    :clearable="false"
    :filter="fuseSearchFn"
    @input="handleSelect"
  >
    <template #option="option">
      <div v-if="option" class="flex items-center gap-2">
        <img
          v-if="getFlagCode(option, 0)"
          :src="`https://flagcdn.com/${getFlagCode(option, 0)}.svg`"
          :alt="option?.native_name"
          class="w-5 h-4 mr-2 inline-block"
        />
        <span>{{ getOptionLabelFn(option) }}</span>
      </div>
    </template>
    <template #selected-option="option">
      <div v-if="option" class="flex items-center gap-2">
        <img
          v-if="getFlagCode(option, 0)"
          :src="`https://flagcdn.com/${getFlagCode(option, 0)}.svg`"
          :alt="option?.native_name"
          class="w-5 h-4 mr-2 inline-block"
        />
        <span>{{ getOptionLabelFn(option) }}</span>
      </div>
    </template>
    <template #no-options="{ search, searching }">
      <template v-if="searching">
        No results found for <em>{{ search }}</em
        >.
      </template>
      <em v-else style="opacity: 0.5">Start typing to search for a language.</em>
    </template>
  </v-select>

  <!-- Fallback while loading -->
  <div v-else class="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
</template>

<script lang="ts" setup>
// TypeScript now checks this file – avoid suppressing errors globally.

import 'vue-select/dist/vue-select.css'
import type { PropType } from 'vue'
import { computed } from 'vue'
import VueSelect from 'vue-select'
import Fuse from 'fuse.js'
import { applyLanguageAlias } from '../composables/search-utils.js'

interface LanguageOption {
  value: string
  name?: string
  native_name?: string
  label?: string
  flag?: string | string[]
}

// Register the component locally
const vSelect = VueSelect

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

// Handle select event
const handleSelect = (value: string) => {
  emit('update:modelValue', value)
}

// Functions for vue-select props
const reduceOption = (option: LanguageOption): string => {
  return option?.value || ''
}

const getOptionKeyFn = (option: LanguageOption): string => {
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
const getFlagCode = (option: LanguageOption | null | undefined, index = 0): string => {
  if (!option) return ''
  if (typeof option.flag === 'string') {
    const match = option.flag.match(/flagcdn\.com\/(\w{2})\.svg/)
    if (match) return match[1].toLowerCase()
    return option.flag.toLowerCase()
  }
  if (Array.isArray(option.flag) && option.flag.length > index) {
    return option.flag[index]?.toLowerCase() || ''
  }
  return ''
}

// Filter function for vue-select
const fuseSearchFn = (options: LanguageOption[], search: string): LanguageOption[] => {
  if (!search || !Array.isArray(options)) {
    return options || []
  }

  try {
    const aliasResult = applyLanguageAlias(search)
    const rawLower = search.toLowerCase()
    const aliasTerms = Array.isArray(aliasResult) ? aliasResult : [aliasResult]

    // Build separate result sets for raw term and alias terms
    const fuse = new Fuse(options, {
      keys: ['native_name', 'name', 'label'],
      shouldSort: true,
      threshold: 0.3
    })

    // Primary results from raw input
    const primary = rawLower ? fuse.search(rawLower).map(({ item }) => item) : []

    // Secondary results from alias terms (deduplicated)
    const secondarySet = new Map<string, LanguageOption>()
    for (const term of aliasTerms) {
      if (!term || term === rawLower) continue
      fuse.search(term).forEach(({ item }) => {
        // Skip if already in primary list
        if (!primary.find((p) => p.value === item.value)) {
          secondarySet.set(item.value, item)
        }
      })
    }
    const secondary = Array.from(secondarySet.values())

    // Combine results
    const combined: LanguageOption[] = []
    if (primary.length) combined.push(primary[0])
    combined.push(...secondary.slice(0, 2))
    combined.push(...primary.slice(1))
    combined.push(...secondary.slice(2))

    return combined.length ? combined : options
  } catch (error) {
    console.warn('[LanguageSelect] Search error:', error)
    return options || []
  }
}
</script>

<style scoped>
/* Light mode overrides (apply when no .dark ancestor) */
:deep(.language-select) {
  /* Control (input) */
  --vs-controls-color: #334155; /* slate-700 */
  --vs-border-color: #cbd5e1; /* slate-300 */

  /* Dropdown panel */
  --vs-dropdown-bg: #ffffff; /* white */
  --vs-dropdown-color: #0f172a; /* slate-900 */
  --vs-dropdown-option-color: #0f172a;

  /* Selected option (pill) */
  --vs-selected-bg: #e2e8f0; /* slate-200 */
  --vs-selected-color: #0f172a; /* slate-900 */

  /* Search input inside dropdown */
  --vs-search-input-color: #0f172a;

  /* Active / highlighted option */
  --vs-dropdown-option--active-bg: #db2777; /* pink-600 */
  --vs-dropdown-option--active-color: #ffffff;
}
/* Dark mode overrides for vue-select (tailored colors) */
.dark :deep(.language-select) {
  /* Control (input) */
  --vs-controls-color: #e2e8f0; /* slate-200 */
  --vs-border-color: #334155; /* slate-700 */

  /* Dropdown panel */
  --vs-dropdown-bg: #1e293b; /* slate-800 */
  --vs-dropdown-color: #e2e8f0; /* slate-200 */
  --vs-dropdown-option-color: #e2e8f0;

  /* Selected option (pill) */
  --vs-selected-bg: #334155; /* slate-700 */
  --vs-selected-color: #e2e8f0;

  /* Search input inside dropdown */
  --vs-search-input-color: #e2e8f0;

  /* Active / highlighted option */
  --vs-dropdown-option--active-bg: #db2777; /* pink-600 */
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
