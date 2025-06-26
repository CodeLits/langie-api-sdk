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

  <!-- Show vue-select on client-side or non-Nuxt environments -->
  <v-select
    v-else
    :value="modelValue"
    @input="handleChange"
    :options="searchableLanguages"
    :filterable="false"
    :searchable="true"
    @search="onSearch"
    :reduce="reduceValue"
    label="label"
    placeholder="Select language"
    class="language-select"
  >
    <template #option="option">
      <div class="flex items-center space-x-2">
        <span v-if="option.flag" class="text-lg">{{ getFlag(option.flag) }}</span>
        <span>{{ option.label }}</span>
      </div>
    </template>
    <template #selected-option="option">
      <div class="flex items-center space-x-2">
        <span v-if="option.flag" class="text-lg">{{ getFlag(option.flag) }}</span>
        <span>{{ option.label }}</span>
      </div>
    </template>
  </v-select>
</template>

<script lang="ts" setup>
// TypeScript now checks this file – avoid suppressing errors globally.

import type { PropType } from 'vue'
import { ref, computed, watch, onMounted } from 'vue'
import vSelect from 'vue-select'
import Fuse from 'fuse.js'
import { applyLanguageAlias } from '../search-utils.js'

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

const searchTerm = ref('')
const fuse = ref<Fuse<LanguageOption> | null>(null)

const displayName = (language: LanguageOption): string => {
  if (!language) return ''
  return (
    language.native_name || language.name || language.label || language.value || language.code || ''
  )
}

const processedLanguages = computed(() => {
  return props.languages.map((lang) => ({
    ...lang,
    label: displayName(lang),
    value: lang.value || lang.code || ''
  }))
})

const searchableLanguages = computed(() => {
  if (!searchTerm.value) return processedLanguages.value

  if (!fuse.value) {
    fuse.value = new Fuse(processedLanguages.value, {
      keys: ['label', 'name', 'native_name', 'code'],
      threshold: 0.3
    })
  }

  return fuse.value.search(searchTerm.value).map((result) => result.item)
})

const handleChange = (value: string) => {
  emit('update:modelValue', value)
}

const onSearch = (search: string) => {
  searchTerm.value = search
}

const reduceValue = (option: LanguageOption): string => {
  return option.value || option.code || ''
}

const getFlag = (flag: string | string[]): string => {
  if (!flag) return ''
  const flagCode = Array.isArray(flag) ? flag[0] : flag
  if (!flagCode) return ''

  // Convert country code to flag emoji
  return flagCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
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
