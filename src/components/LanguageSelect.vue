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
            :alt="`${value.native_name || value.name} flag`"
            @error="onFlagError"
          />
          <span>{{ value.native_name || value.name }}</span>
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
            >{{ option.name }}
            <span class="native-name">({{ option.native_name || option.name }})</span></span
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
import { ref, computed } from 'vue'
import type { PropType } from 'vue'
import Multiselect from '@vueform/multiselect'
import Fuse from 'fuse.js'
import { applyLanguageAlias } from '../search-utils'
import { THEME_COLORS, COLORS } from '../constants/colors'
import type { TranslatorLanguage } from '../types'

const getFlagCode = (lang: TranslatorLanguage): string => {
  const flagCode = lang.flag_country || lang.code
  return flagCode
}

const props = defineProps({
  modelValue: {
    type: Object as PropType<TranslatorLanguage | null | undefined>,
    default: undefined
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

const isLoading = computed(() => {
  return props.languages.length <= 0
})
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
  if (!props.modelValue || !props.modelValue.code) return 'no-selection'
  const key = `${props.modelValue.code}-${props.modelValue.flag_country || 'fallback'}`
  return key
})

const selectedLanguage = computed({
  get: () => props.modelValue || null,
  set: (value) => {
    if (value && value.code) {
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
    (lang) => !props.modelValue || !props.modelValue.code || lang.code !== props.modelValue.code
  )

  return filtered
})

function handleSearch(query: string) {
  searchQuery.value = query
}

const onFlagError = (event: Event) => {
  const target = event.target as HTMLImageElement
  console.error('Flag loading error for:', target.src)
  target.style.display = 'none'
}
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
  --ms-bg: v-bind('THEME_COLORS.light.background');
  --ms-bg-disabled: v-bind('THEME_COLORS.light.backgroundDisabled');
  --ms-border-color: v-bind('THEME_COLORS.light.border');
  --ms-border-width: 1px;
  --ms-radius: 4px;
  --ms-py: 0.3rem;
  --ms-px: 0.875rem;
  --ms-ring-width: 3px;
  --ms-ring-color: v-bind('THEME_COLORS.light.ring');
  --ms-placeholder-color: v-bind('THEME_COLORS.light.placeholder');

  /* Options */
  --ms-option-font-size: 1rem;
  --ms-option-line-height: 1;
  --ms-option-py: 0.35rem;
  --ms-option-px: 0.875rem;
  --ms-option-bg-pointed: v-bind('THEME_COLORS.light.optionPointed');
  --ms-option-color-pointed: v-bind('THEME_COLORS.light.optionPointedText');
  --ms-option-bg-selected: v-bind('THEME_COLORS.light.optionSelected');
  --ms-option-color-selected: v-bind('THEME_COLORS.light.optionSelectedText');
  --ms-option-bg-disabled: #fff;
  --ms-option-color-disabled: #d1d5db;

  /* Dropdown */
  --ms-dropdown-bg: v-bind('THEME_COLORS.light.dropdownBackground');
  --ms-dropdown-border-color: v-bind('THEME_COLORS.light.dropdownBorder');

  /* Others */
  --ms-tag-bg: v-bind('THEME_COLORS.light.tagBackground');
}

.is-dark :deep(.multiselect) {
  --ms-bg: v-bind('THEME_COLORS.dark.background');
  --ms-bg-disabled: v-bind('THEME_COLORS.dark.backgroundDisabled');
  --ms-border-color: v-bind('THEME_COLORS.dark.border');
  --ms-placeholder-color: v-bind('THEME_COLORS.dark.placeholder');
  --ms-ring-color: v-bind('THEME_COLORS.dark.ring');

  /* Options */
  --ms-option-bg-pointed: v-bind('THEME_COLORS.dark.optionPointed');
  --ms-option-color-pointed: v-bind('THEME_COLORS.dark.optionPointedText');
  --ms-option-bg-selected: v-bind('THEME_COLORS.dark.optionSelected');
  --ms-option-color-selected: v-bind('THEME_COLORS.dark.optionSelectedText');

  /* Dropdown */
  --ms-dropdown-bg: v-bind('THEME_COLORS.dark.dropdownBackground');
  --ms-dropdown-border-color: v-bind('THEME_COLORS.dark.dropdownBorder');
  --ms-dropdown-color: v-bind('THEME_COLORS.dark.dropdownText');
}

:deep(.lang-flag) {
  width: 20px;
  height: 15px;
  margin-right: 10px;
  border: 1px solid v-bind('COLORS.border.flag');
  border-radius: 2px;
  object-fit: cover;
}

.is-dark :deep(.lang-flag) {
  border-color: v-bind('COLORS.border.dark');
}

:deep(.multiselect-single-label),
:deep(.multiselect-option) {
  display: flex;
  align-items: center;
}

:deep(.native-name) {
  color: v-bind('COLORS.text.secondary');
  margin-left: 0.5rem;
  font-size: 0.9em;
}

.is-dark :deep(.native-name) {
  color: v-bind('COLORS.neutral.gray400');
}

:deep(.multiselect-no-results),
:deep(.multiselect-no-options) {
  padding: 0.5rem 0.875rem;
  color: v-bind('COLORS.text.secondary');
}

.is-dark :deep(.multiselect-no-results),
.is-dark :deep(.multiselect-no-options) {
  color: v-bind('COLORS.neutral.gray400');
}
</style>
