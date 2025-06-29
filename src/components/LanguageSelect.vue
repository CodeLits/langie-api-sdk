<template>
  <div class="language-select" :class="{ 'is-dark': isDark }">
    <!-- Show multiselect when we have languages OR when not loading -->
    <Multiselect
      v-if="validLanguages.length > 0 || !isLoading"
      :key="multiselectKey"
      v-model="selectedLanguage"
      :options="filteredLanguages"
      :searchable="true"
      :can-clear="false"
      :allow-empty="false"
      :object="true"
      :placeholder="validLanguages.length === 0 ? 'No languages available' : placeholder"
      :disabled="props.disabled || validLanguages.length === 0"
      :loading="isLoading"
      track-by="name"
      label="name"
      value-prop="code"
      :filter-results="false"
      @search-change="handleSearch"
    >
      <template #singlelabel="{ value }">
        <div v-if="value" class="multiselect-single-label">
          <img
            v-if="value.code"
            :key="selectedLanguageKey"
            :src="`https://flagcdn.com/${getFlagCode(value)}.svg`"
            class="lang-flag"
            :alt="`${value.name} flag`"
            @error="onFlagError"
          />
          <span>{{ value.name }}</span>
        </div>
      </template>
      <template #option="{ option }">
        <div class="multiselect-option">
          <img
            :key="`${option.code}-${option.flag_country || 'fallback'}`"
            :src="`https://flagcdn.com/${getFlagCode(option)}.svg`"
            class="lang-flag"
            :alt="`${option.name} flag`"
            @error="onFlagError"
          />
          <span
            >{{ option.name }} <span class="native-name">({{ option.native_name }})</span></span
          >
        </div>
      </template>
      <template #noresults>
        <div class="multiselect-no-results">No languages found.</div>
      </template>
      <template #nooptions>
        <div class="multiselect-no-options">
          {{
            validLanguages.length === 0
              ? 'Please provide languages via the :languages prop'
              : 'No languages available.'
          }}
        </div>
      </template>
    </Multiselect>
    <!-- Only show skeleton loader when actually loading AND we have no languages yet -->
    <div v-else-if="isLoading && validLanguages.length === 0" class="skeleton-loader"></div>
  </div>
</template>

<script lang="ts" setup>
import '@vueform/multiselect/themes/default.css'
import '../styles/teleport.css'
import { ref, computed, watch, onMounted } from 'vue'
import type { PropType } from 'vue'
import Multiselect from '@vueform/multiselect'
import Fuse from 'fuse.js'
import { applyLanguageAlias } from '../search-utils'
import type { TranslatorLanguage } from '../types'

const getFlagCode = (lang: TranslatorLanguage): string => {
  const flagCode = lang.flag_country || lang.code
  return flagCode
}

const props = defineProps({
  modelValue: {
    type: Object as PropType<TranslatorLanguage | null>,
    default: null
  },
  languages: {
    type: Array as PropType<TranslatorLanguage[]>,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Select language'
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

const isLoading = ref(true)
const searchQuery = ref('')

const validLanguages = computed(() => {
  return props.languages.filter((lang) => lang && lang.code && lang.name && lang.native_name)
})

const fuse = computed(() => {
  if (!validLanguages.value.length) return null
  return new Fuse(validLanguages.value, {
    keys: ['name', 'native_name', 'code'],
    includeScore: true,
    threshold: 0.3,
    isCaseSensitive: false
  })
})

const multiselectKey = computed(() => {
  // Create a key that changes when the language data structure changes
  const hasApiData = props.languages.length > 0 && props.languages[0].flag_country !== null
  return hasApiData ? 'api-data' : 'fallback-data'
})

const selectedLanguageKey = computed(() => {
  if (!props.modelValue) return 'no-selection'
  const key = `${props.modelValue.code}-${props.modelValue.flag_country || 'fallback'}`
  return key
})

const selectedLanguage = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (value) {
      emit('update:modelValue', value)
    }
  }
})

const filteredLanguages = computed(() => {
  const query = searchQuery.value.trim()

  let results: TranslatorLanguage[]
  if (!query) {
    // When no search query, return all valid languages (bypass Fuse.js)
    results = validLanguages.value
  } else {
    // Only use Fuse.js when there's an actual search query
    if (!fuse.value) return []

    // Get the most likely alias or the original term
    const aliasResult = applyLanguageAlias(query)
    const searchTerm = Array.isArray(aliasResult.primary)
      ? aliasResult.primary[0]
      : aliasResult.primary

    // Always use Fuse.js for the main search (both original query and alias result)
    const fuseResults = fuse.value.search(searchTerm)
    results = fuseResults.map((result) => result.item)

    // If the search term is different from query (alias was applied), also search the original query
    if (searchTerm !== query) {
      const originalResults = fuse.value.search(query)
      originalResults.forEach((result) => {
        if (!results.some((r) => r.code === result.item.code)) {
          results.push(result.item)
        }
      })
    }

    // Add suggested languages to expand the results
    if (aliasResult.suggestions.length > 0) {
      aliasResult.suggestions.forEach((suggestion) => {
        const suggestedLang = validLanguages.value.find((lang) => {
          const langName = lang.name.toLowerCase()
          const suggestion_lower = suggestion.toLowerCase()

          // Try multiple matching strategies
          return (
            langName === suggestion_lower || // Exact match
            langName.includes(suggestion_lower) || // Contains match
            lang.code.toLowerCase() === suggestion_lower || // Code match
            langName.startsWith(suggestion_lower) || // Starts with match
            // Handle common variations
            (suggestion_lower === 'tatar' && langName.includes('tatar')) ||
            (suggestion_lower === 'belarusian' &&
              (langName.includes('belarus') || langName.includes('belarusian'))) ||
            (suggestion_lower === 'moldovan' &&
              (langName.includes('moldov') || langName.includes('moldova')))
          )
        })
        if (suggestedLang && !results.some((r) => r.code === suggestedLang.code)) {
          results.push(suggestedLang)
        }
      })
    }
  }

  // Remove the currently selected language from the options
  const filtered = results.filter(
    (lang) => !props.modelValue || lang.code !== props.modelValue.code
  )

  return filtered
})

function handleSearch(query: string) {
  searchQuery.value = query
}

const onFlagError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

watch(
  () => props.languages,
  (newVal, oldVal) => {
    // Only trigger if the length actually changed or if we went from empty to non-empty
    const newLength = newVal?.length || 0
    const oldLength = oldVal?.length || 0

    if (newLength > 0 && newLength !== oldLength) {
      isLoading.value = false
    }
  },
  { immediate: true }
)

watch(validLanguages, (val, oldVal) => {
  // Only log when there's a significant change in length
  const newLength = val.length
  const oldLength = oldVal?.length || 0

  if (newLength > 0 && newLength !== oldLength) {
    console.debug('[LanguageSelect] Loaded', newLength, 'valid languages')
  }
})

watch(filteredLanguages, (val, oldVal) => {
  // Only log when there's a significant change in length
  const newLength = val.length
  const oldLength = oldVal?.length || 0

  if (newLength > 0 && newLength !== oldLength) {
    console.debug('[LanguageSelect] Filtered to', newLength, 'languages')
  }
})

watch(isLoading, (val, oldVal) => {
  // Only log when the loading state actually changes
  if (val !== oldVal) {
    console.debug('[LanguageSelect] Loading state:', val)
  }
})

onMounted(() => {
  if (validLanguages.value.length > 0) {
    isLoading.value = false
  } else {
    setTimeout(() => {
      isLoading.value = false
    }, 2000)
  }
})
</script>

<style scoped>
.language-select {
  position: relative;
  min-height: 40px; /* To prevent layout shift while loading */
}

.skeleton-loader {
  width: 100%;
  height: 40px;
  background-color: #e2e8f0;
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}

.is-dark .skeleton-loader {
  background-color: #374151;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

:deep(.multiselect) {
  --ms-font-size: 1rem;
  --ms-line-height: 1.5;
  --ms-bg: #fff;
  --ms-bg-disabled: #f3f4f6;
  --ms-border-color: #d1d5db;
  --ms-border-width: 1px;
  --ms-radius: 4px;
  --ms-py: 0.3rem;
  --ms-px: 0.875rem;
  --ms-ring-width: 3px;
  --ms-ring-color: #10b98130;
  --ms-placeholder-color: #9ca3af;

  /* Options */
  --ms-option-font-size: 1rem;
  --ms-option-line-height: 1;
  --ms-option-py: 0.35rem;
  --ms-option-px: 0.875rem;
  --ms-option-bg-pointed: #f3f4f6;
  --ms-option-color-pointed: #1f2937;
  --ms-option-bg-selected: #10b981;
  --ms-option-color-selected: #fff;
  --ms-option-bg-disabled: #fff;
  --ms-option-color-disabled: #d1d5db;

  /* Dropdown */
  --ms-dropdown-bg: #fff;
  --ms-dropdown-border-color: #d1d5db;

  /* Others */
  --ms-tag-bg: #10b981;
}

.is-dark :deep(.multiselect) {
  --ms-bg: #1f2937;
  --ms-bg-disabled: #374151;
  --ms-border-color: #4b5563;
  --ms-placeholder-color: #9ca3af;
  --ms-ring-color: #10b98150;

  /* Options */
  --ms-option-bg-pointed: #374151;
  --ms-option-color-pointed: #f9fafb;
  --ms-option-bg-selected: #10b981;
  --ms-option-color-selected: #fff;

  /* Dropdown */
  --ms-dropdown-bg: #1f2937;
  --ms-dropdown-border-color: #4b5563;
  --ms-dropdown-color: #f9fafb;
}

:deep(.lang-flag) {
  width: 20px;
  height: 15px;
  margin-right: 10px;
  border: 1px solid #eee;
  border-radius: 2px;
  object-fit: cover;
}

.is-dark :deep(.lang-flag) {
  border-color: #4b5563;
}

:deep(.multiselect-single-label),
:deep(.multiselect-option) {
  display: flex;
  align-items: center;
}

:deep(.native-name) {
  color: #6b7280;
  margin-left: 0.5rem;
  font-size: 0.9em;
}

.is-dark :deep(.native-name) {
  color: #9ca3af;
}

:deep(.multiselect-no-results),
:deep(.multiselect-no-options) {
  padding: 0.5rem 0.875rem;
  color: #6b7280;
}

.is-dark :deep(.multiselect-no-results),
.is-dark :deep(.multiselect-no-options) {
  color: #9ca3af;
}
</style>
