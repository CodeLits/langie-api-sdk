<template>
  <div class="language-select" :class="{ 'is-dark': isDark }">
    <Multiselect
      v-if="!isLoading && validLanguages.length"
      v-model="selectedLanguage"
      :options="filteredLanguages"
      :searchable="true"
      :canClear="false"
      :allow-empty="false"
      :object="true"
      :placeholder="placeholder"
      :disabled="props.disabled"
      :loading="isLoading"
      track-by="name"
      label="name"
      value-prop="code"
      :filter-results="false"
      @search-change="handleSearch"
    >
      <template #singlelabel="{ value }">
        <div class="multiselect-single-label" v-if="value">
          <img
            v-if="value.code"
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
        <div class="multiselect-no-options">No languages available.</div>
      </template>
    </Multiselect>
    <div v-else class="skeleton-loader"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import type { PropType } from 'vue'
import Multiselect from '@vueform/multiselect'
import Fuse from 'fuse.js'
import { applyLanguageAlias } from '../search-utils'
import type { TranslatorLanguage } from '../types'

const getFlagCode = (lang: TranslatorLanguage): string => {
  return lang.flag_country || lang.code
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

const selectedLanguage = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (value) {
      emit('update:modelValue', value)
    }
  }
})

const filteredLanguages = computed(() => {
  if (!fuse.value) return []
  const query = searchQuery.value.trim()

  let results
  if (!query) {
    results = validLanguages.value
  } else {
    // Get the most likely alias or the original term
    const aliasResult = applyLanguageAlias(query)
    const searchTerm = Array.isArray(aliasResult) ? aliasResult[0] : aliasResult

    const fuseResults = fuse.value.search(searchTerm)
    results = fuseResults.map((result) => result.item)
  }

  // Remove the currently selected language from the options
  return results.filter((lang) => !props.modelValue || lang.code !== props.modelValue.code)
})

function handleSearch(query: string) {
  searchQuery.value = query
}

const onFlagError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

onMounted(() => {
  if (validLanguages.value.length > 0) {
    isLoading.value = false
  }
})

watch(
  () => props.languages,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      isLoading.value = false
    }
  },
  { immediate: true }
)
</script>

<style src="@vueform/multiselect/themes/default.css"></style>

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
  --ms-py: 0.5rem;
  --ms-px: 0.875rem;
  --ms-ring-width: 3px;
  --ms-ring-color: #10b98130;
  --ms-placeholder-color: #9ca3af;

  /* Options */
  --ms-option-font-size: 1rem;
  --ms-option-line-height: 1.5;
  --ms-option-py: 0.5rem;
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

.lang-flag {
  width: 20px;
  height: 15px;
  margin-right: 10px;
  border: 1px solid #eee;
  border-radius: 2px;
  object-fit: cover;
}

.is-dark .lang-flag {
  border-color: #4b5563;
}

.multiselect-single-label,
.multiselect-option {
  display: flex;
  align-items: center;
}

.native-name {
  color: #6b7280;
  margin-left: 0.5rem;
  font-size: 0.9em;
}

.is-dark .native-name {
  color: #9ca3af;
}

.multiselect-no-results,
.multiselect-no-options {
  padding: 0.5rem 0.875rem;
  color: #6b7280;
}

.is-dark .multiselect-no-results,
.is-dark .multiselect-no-options {
  color: #9ca3af;
}
</style>
