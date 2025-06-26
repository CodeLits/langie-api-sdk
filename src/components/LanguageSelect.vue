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
import { ref, computed, watch, onMounted } from 'vue'
import VueSelect from 'vue3-select-component'
import Fuse from 'fuse.js'
import { applyLanguageAlias } from '../search-utils'

// Load vue-select CSS dynamically in browser
let cssLoaded = false
const loadVueSelectCSS = () => {
  if (typeof window !== 'undefined' && !cssLoaded) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/vue-select@3.20.4/dist/vue-select.css'
    document.head.appendChild(link)
    cssLoaded = true
  }
}

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

// ---------------------------------------------------------------------------
// Load CSS when component is mounted
onMounted(() => {
  loadVueSelectCSS()
})

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
