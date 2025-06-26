<template>
  <v-select
    :key="props.languages?.length || 0"
    class="language-select"
    :value="modelValue"
    :reduce="(option) => option.value"
    :options="props.languages"
    :get-option-label="(option) => displayName(option)"
    :get-option-key="(option) => option.value"
    searchable
    :clearable="false"
    :filter="fuseSearch"
    @input="handleSelect"
  >
    <template #option="{ option }">
      <div v-if="option" class="flex items-center gap-2">
        <img
          v-if="getFlagCode(option as LanguageOption, 0)"
          :src="`https://flagcdn.com/${getFlagCode(option as LanguageOption, 0)}.svg`"
          :alt="(option as LanguageOption)?.native_name"
          class="w-5 h-4 mr-2 inline-block"
        />
        <span>{{ displayName(option as LanguageOption) }}</span>
      </div>
    </template>
    <template #selected-option="{ option }">
      <div v-if="option" class="flex items-center gap-2">
        <img
          v-if="getFlagCode(option as LanguageOption, 0)"
          :src="`https://flagcdn.com/${getFlagCode(option as LanguageOption, 0)}.svg`"
          :alt="(option as LanguageOption)?.native_name"
          class="w-5 h-4 mr-2 inline-block"
        />
        <span>{{ displayName(option as LanguageOption) }}</span>
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
</template>

<script lang="ts" setup>
// TypeScript now checks this file – avoid suppressing errors globally.

import 'vue-select/dist/vue-select.css'
import type { PropType } from 'vue'
import { watch } from 'vue'
import vSelect from 'vue-select'
import Fuse from 'fuse.js'
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
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

// Derive display label robustly handling non-string values
const displayName = (opt: LanguageOption | null | undefined): string => {
  if (!opt) return ''
  const candidate = opt.native_name || opt.name || opt.label
  if (typeof candidate === 'string') return candidate
  if (candidate && typeof candidate === 'object') {
    // pick first string value
    const val = Object.values(candidate).find((v) => typeof v === 'string')
    if (val) return val
  }
  return String(candidate)
}

// Function to get the flag code from region code
const getFlagCode = (option: LanguageOption | null | undefined, index = 0): string => {
  if (!option) return ''
  if (typeof option.flag === 'string') {
    const match = option.flag.match(/flagcdn\.com\/(\w{2})\.svg/) // extract code
    if (match) return match[1].toLowerCase()
    return option.flag.toLowerCase()
  }
  return option?.flag?.[index]?.toLowerCase() || ''
}

const handleSelect = (value: string | null): void => {
  emit('update:modelValue', value || '')
}

const fuseSearch = (options: LanguageOption[], search: string): LanguageOption[] => {
  const aliasResult = applyLanguageAlias(search)
  const rawLower = search.toLowerCase()
  const aliasTerms = Array.isArray(aliasResult) ? aliasResult : [aliasResult]

  // Build separate result sets for raw term and alias terms
  const fuse = new Fuse(options as any[], {
    keys: ['native_name', 'name', 'label'],
    shouldSort: true
  })

  // Primary results from raw input
  const primary = rawLower ? fuse.search(rawLower).map(({ item }) => item as LanguageOption) : []

  // Secondary results from alias terms (deduplicated)
  const secondarySet = new Map<string, LanguageOption>()
  for (const term of aliasTerms) {
    if (!term || term === rawLower) continue
    fuse.search(term).forEach(({ item }) => {
      const languageItem = item as LanguageOption
      // Skip if already in primary list
      if (!primary.find((p) => p.value === languageItem.value)) {
        secondarySet.set(languageItem.value, languageItem)
      }
    })
  }
  const secondary = Array.from(secondarySet.values())

  // Interleave: primary top result + up to 2 secondary alias hits, then rest of primary, then remaining secondary
  const combined: LanguageOption[] = []
  if (primary.length) combined.push(primary[0])
  combined.push(...secondary.slice(0, 2))
  combined.push(...primary.slice(1))
  combined.push(...secondary.slice(2))

  return combined.length ? combined : options
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
