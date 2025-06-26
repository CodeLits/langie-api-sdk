<template>
  <!-- Show simple select on server-side for Nuxt SSR -->
  <select
    v-if="isNuxt && isServerSide"
    :value="modelValue"
    @change="handleFallbackChange"
    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
  >
    <option value="" disabled>Select language</option>
    <option v-for="language in processedLanguages" :key="language.value" :value="language.value">
      {{ language.label }}
    </option>
  </select>

  <!-- Show vue3-select-component on client-side or non-Nuxt environments -->
  <VueSelect
    v-else-if="validLanguages.length > 0"
    :key="validLanguages?.length || 0"
    class="language-select"
    v-model="selectedValue"
    :options="validLanguages"
    :get-option-label="getOptionLabelFn"
    :get-option-value="getOptionValueFn"
    searchable
    :clearable="false"
    :filterable="true"
    :filter="filterFn"
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

import type { PropType } from 'vue'
import { computed, watch } from 'vue'
import VueSelect from 'vue3-select-component'
import Fuse from 'fuse.js'
import { applyLanguageAlias } from '../search-utils'

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

// Detect if we're running in Nuxt
const isNuxt = computed(() => {
  if (typeof window !== 'undefined') {
    return !!(window as any).__NUXT__
  }
  if (typeof process !== 'undefined') {
    return !!(process.env as any).NUXT_SSR_BASE || !!(process.env as any).NUXT_PUBLIC_BASE_URL
  }
  return false
})

// Check if we're on server-side
const isServerSide = computed(() => {
  return typeof window === 'undefined'
})

// Ensure languages array is always valid
const validLanguages = computed(() => {
  return Array.isArray(props.languages) ? props.languages : []
})

const processedLanguages = computed(() => {
  return props.languages.map((lang) => ({
    ...lang,
    label: getOptionLabelFn(lang),
    value: getOptionValueFn(lang)
  }))
})

// v-model computed property
const selectedValue = computed({
  get: () => props.modelValue || '',
  set: (value: string) => emit('update:modelValue', value)
})

// Functions for vue3-select-component
const getOptionValueFn = (option: LanguageOption): string => {
  return option?.value || option?.code || ''
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

// Filter function using both Fuse.js and search-utils.js
const filterFn = (options: LanguageOption[], search: string): LanguageOption[] => {
  if (!search || !Array.isArray(options)) return options

  console.log('[DEBUG] Search input:', {
    search,
    optionsCount: options.length,
    sampleOption: options[0]
  })

  try {
    // Use applyLanguageAlias to get canonical language names or aliases
    const aliasResult = applyLanguageAlias(search)
    let searchTerms: string[] = []

    if (Array.isArray(aliasResult)) {
      searchTerms = aliasResult
    } else {
      searchTerms = [aliasResult]
    }

    // Also include the original search term
    searchTerms.push(search)

    console.log('[DEBUG] Alias result:', { aliasResult, searchTerms })

    // Create Fuse instance for fuzzy searching with all possible fields
    const fuse = new Fuse(options, {
      keys: [
        'native_name',
        'name',
        'label', // For fallback languages
        'code', // Language code like 'ru', 'en' from API
        'value' // For fallback languages
      ],
      threshold: 0.4, // Slightly more permissive
      includeScore: true,
      shouldSort: true,
      includeMatches: false,
      isCaseSensitive: false, // Make search case-insensitive
      ignoreLocation: true, // Ignore position of match within string
      minMatchCharLength: 2 // Allow shorter matches
    })

    // Collect results from all search terms
    const resultMap = new Map<string, { option: LanguageOption; score: number }>()

    for (const term of searchTerms) {
      if (!term) continue

      console.log(`[DEBUG] Searching for term: "${term}"`)

      // Perform fuzzy search with Fuse.js
      const fuseResults = fuse.search(term)

      console.log(
        `[DEBUG] Fuse results for "${term}":`,
        fuseResults.map((r) => ({
          label: getOptionLabelFn(r.item),
          score: r.score,
          value: getOptionValueFn(r.item)
        }))
      )

      for (const result of fuseResults) {
        const option = result.item
        const optionKey = getOptionValueFn(option)
        const score = result.score || 0

        // Keep the best (lowest) score for each option
        if (!resultMap.has(optionKey) || score < resultMap.get(optionKey)!.score) {
          resultMap.set(optionKey, { option, score })
        }
      }
    }

    // Convert map to array and sort by score (lower is better)
    const finalResults = Array.from(resultMap.values())
      .sort((a, b) => a.score - b.score)
      .map((item) => item.option)

    console.log(
      '[DEBUG] Final results:',
      finalResults.map((r) => ({
        label: getOptionLabelFn(r),
        value: getOptionValueFn(r)
      }))
    )

    // Return results or fallback to simple text search if no fuzzy matches
    if (finalResults.length > 0) {
      return finalResults
    } else {
      console.log('[DEBUG] No fuzzy results, trying simple text search')
      const simpleResults = options.filter((option) =>
        getOptionLabelFn(option).toLowerCase().includes(search.toLowerCase())
      )
      console.log(
        '[DEBUG] Simple search results:',
        simpleResults.map((r) => ({
          label: getOptionLabelFn(r),
          value: getOptionValueFn(r)
        }))
      )
      return simpleResults
    }
  } catch (error) {
    console.warn('[LanguageSelect] Search error:', error)
    // Fallback to simple text matching
    return options.filter((option) =>
      getOptionLabelFn(option).toLowerCase().includes(search.toLowerCase())
    )
  }
}

const handleFallbackChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}

// CSS is now imported directly from node_modules

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
/* Custom styles for vue3-select-component with comprehensive dark mode */
.language-select {
  /* Light mode variables */
  --vs-controls-color: #374151;
  --vs-border-color: #d1d5db;
  --vs-border-width: 1px;
  --vs-border-style: solid;
  --vs-border-radius: 6px;

  /* Dropdown container */
  --vs-dropdown-bg: #ffffff;
  --vs-dropdown-color: #1f2937;
  --vs-dropdown-box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --vs-dropdown-z-index: 1000;

  /* Selected item */
  --vs-selected-bg: #f3f4f6;
  --vs-selected-color: #1f2937;
  --vs-selected-border-color: #d1d5db;

  /* Search input */
  --vs-search-input-color: #1f2937;
  --vs-search-input-bg: transparent;
  --vs-search-input-placeholder-color: #9ca3af;

  /* Options */
  --vs-dropdown-option-color: #1f2937;
  --vs-dropdown-option-bg: #ffffff;
  --vs-dropdown-option-padding: 8px 12px;

  /* Hover/Active states */
  --vs-dropdown-option--hover-bg: #f9fafb;
  --vs-dropdown-option--hover-color: #1f2937;
  --vs-dropdown-option--active-bg: #3b82f6;
  --vs-dropdown-option--active-color: #ffffff;
  --vs-dropdown-option--selected-bg: #e0e7ff;
  --vs-dropdown-option--selected-color: #1e40af;

  /* Focus states */
  --vs-state-focus-border-color: #3b82f6;
  --vs-state-focus-box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);

  /* Disabled state */
  --vs-state-disabled-bg: #f3f4f6;
  --vs-state-disabled-color: #9ca3af;
  --vs-state-disabled-border-color: #e5e7eb;

  /* Clear button */
  --vs-clear-color: #6b7280;
  --vs-clear-color-hover: #374151;

  /* Open indicator */
  --vs-open-indicator-color: #6b7280;

  /* No options message */
  --vs-dropdown-option--disabled-color: #9ca3af;
}

/* Dark mode overrides */
.dark .language-select {
  --vs-controls-color: #d1d5db;
  --vs-border-color: #4b5563;

  /* Dropdown container - dark */
  --vs-dropdown-bg: #1f2937;
  --vs-dropdown-color: #f9fafb;
  --vs-dropdown-box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);

  /* Selected item - dark */
  --vs-selected-bg: #374151;
  --vs-selected-color: #f9fafb;
  --vs-selected-border-color: #4b5563;

  /* Search input - dark */
  --vs-search-input-color: #f9fafb;
  --vs-search-input-bg: transparent;
  --vs-search-input-placeholder-color: #9ca3af;

  /* Options - dark */
  --vs-dropdown-option-color: #f9fafb;
  --vs-dropdown-option-bg: #1f2937;

  /* Hover/Active states - dark */
  --vs-dropdown-option--hover-bg: #374151;
  --vs-dropdown-option--hover-color: #f9fafb;
  --vs-dropdown-option--active-bg: #3b82f6;
  --vs-dropdown-option--active-color: #ffffff;
  --vs-dropdown-option--selected-bg: #1e3a8a;
  --vs-dropdown-option--selected-color: #dbeafe;

  /* Focus states - dark */
  --vs-state-focus-border-color: #3b82f6;
  --vs-state-focus-box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);

  /* Disabled state - dark */
  --vs-state-disabled-bg: #374151;
  --vs-state-disabled-color: #6b7280;
  --vs-state-disabled-border-color: #4b5563;

  /* Clear button - dark */
  --vs-clear-color: #9ca3af;
  --vs-clear-color-hover: #d1d5db;

  /* Open indicator - dark */
  --vs-open-indicator-color: #9ca3af;

  /* No options message - dark */
  --vs-dropdown-option--disabled-color: #6b7280;
}

/* Additional styles for better dark mode integration */
.language-select :deep(.vs__dropdown-toggle) {
  background: var(--vs-dropdown-bg);
  border: var(--vs-border-width) var(--vs-border-style) var(--vs-border-color);
  border-radius: var(--vs-border-radius);
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.language-select :deep(.vs__dropdown-toggle:focus-within) {
  border-color: var(--vs-state-focus-border-color);
  box-shadow: var(--vs-state-focus-box-shadow);
  outline: none;
}

.language-select :deep(.vs__selected) {
  color: var(--vs-selected-color);
  background: var(--vs-selected-bg);
  border-color: var(--vs-selected-border-color);
}

.language-select :deep(.vs__search) {
  color: var(--vs-search-input-color);
  background: var(--vs-search-input-bg);
}

.language-select :deep(.vs__search::placeholder) {
  color: var(--vs-search-input-placeholder-color);
}

.language-select :deep(.vs__dropdown-menu) {
  background: var(--vs-dropdown-bg);
  border: var(--vs-border-width) var(--vs-border-style) var(--vs-border-color);
  border-radius: var(--vs-border-radius);
  box-shadow: var(--vs-dropdown-box-shadow);
  z-index: var(--vs-dropdown-z-index);
}

.language-select :deep(.vs__dropdown-option) {
  color: var(--vs-dropdown-option-color);
  background: var(--vs-dropdown-option-bg);
  padding: var(--vs-dropdown-option-padding);
  transition:
    background-color 0.15s ease-in-out,
    color 0.15s ease-in-out;
}

.language-select :deep(.vs__dropdown-option:hover) {
  background: var(--vs-dropdown-option--hover-bg);
  color: var(--vs-dropdown-option--hover-color);
}

.language-select :deep(.vs__dropdown-option--selected) {
  background: var(--vs-dropdown-option--selected-bg);
  color: var(--vs-dropdown-option--selected-color);
}

.language-select :deep(.vs__dropdown-option--highlight) {
  background: var(--vs-dropdown-option--active-bg);
  color: var(--vs-dropdown-option--active-color);
}

.language-select :deep(.vs__clear) {
  fill: var(--vs-clear-color);
  transition: fill 0.15s ease-in-out;
}

.language-select :deep(.vs__clear:hover) {
  fill: var(--vs-clear-color-hover);
}

.language-select :deep(.vs__open-indicator) {
  fill: var(--vs-open-indicator-color);
  transition: fill 0.15s ease-in-out;
}

.language-select :deep(.vs__no-options) {
  color: var(--vs-dropdown-option--disabled-color);
  font-style: italic;
  padding: var(--vs-dropdown-option-padding);
}

/* Custom flag styling for better dark mode contrast */
.language-select img {
  filter: brightness(1);
  transition: filter 0.15s ease-in-out;
}

.dark .language-select img {
  filter: brightness(0.9) contrast(1.1);
}

/* Animation for smooth transitions */
.language-select {
  transition: all 0.15s ease-in-out;
}

/* Base styles for vue3-select-component */
.language-select :deep(.vue-select-component) {
  position: relative;
  width: 100%;
}

.language-select :deep(.vue-select-component__control) {
  min-height: 40px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.language-select :deep(.vue-select-component__value-container) {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
  align-items: center;
}

.language-select :deep(.vue-select-component__single-value) {
  color: var(--vs-selected-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.language-select :deep(.vue-select-component__input-container) {
  display: flex;
  align-items: center;
}

.language-select :deep(.vue-select-component__input) {
  flex: 1;
  min-width: 60px;
  border: none;
  outline: none;
  font-size: inherit;
  line-height: inherit;
  background: transparent;
  color: var(--vs-search-input-color);
}

.language-select :deep(.vue-select-component__input::placeholder) {
  color: var(--vs-search-input-placeholder-color);
}

.language-select :deep(.vue-select-component__indicators) {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.language-select :deep(.vue-select-component__indicator) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
  transition: color 0.15s ease-in-out;
}

.language-select :deep(.vue-select-component__dropdown-indicator) {
  color: var(--vs-open-indicator-color);
}

.language-select :deep(.vue-select-component__clear-indicator) {
  color: var(--vs-clear-color);
}

.language-select :deep(.vue-select-component__clear-indicator:hover) {
  color: var(--vs-clear-color-hover);
}

.language-select :deep(.vue-select-component__menu) {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 2px;
  z-index: var(--vs-dropdown-z-index);
}

.language-select :deep(.vue-select-component__menu-list) {
  padding: 0;
  margin: 0;
  list-style: none;
}

.language-select :deep(.vue-select-component__option) {
  cursor: pointer;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: var(--vs-dropdown-option-padding);
  color: var(--vs-dropdown-option-color);
  background: var(--vs-dropdown-option-bg);
  transition:
    background-color 0.15s ease-in-out,
    color 0.15s ease-in-out;
}

.language-select :deep(.vue-select-component__option:hover) {
  background: var(--vs-dropdown-option--hover-bg);
  color: var(--vs-dropdown-option--hover-color);
}

.language-select :deep(.vue-select-component__option--is-focused) {
  background: var(--vs-dropdown-option--active-bg);
  color: var(--vs-dropdown-option--active-color);
}

.language-select :deep(.vue-select-component__option--is-selected) {
  background: var(--vs-dropdown-option--selected-bg);
  color: var(--vs-dropdown-option--selected-color);
}

.language-select :deep(.vue-select-component__no-options-message) {
  text-align: center;
  font-style: italic;
  color: var(--vs-dropdown-option--disabled-color);
  padding: var(--vs-dropdown-option-padding);
}

.language-select :deep(.vue-select-component__placeholder) {
  color: var(--vs-search-input-placeholder-color);
}
</style>
