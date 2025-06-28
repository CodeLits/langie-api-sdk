<template>
  <div class="simple-language-select">
    <select
      :value="modelValue?.code || ''"
      :disabled="disabled"
      class="language-dropdown"
      @change="handleChange"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="lang in languages" :key="lang.code" :value="lang.code">
        {{ showNativeNames ? `${lang.name} (${lang.native_name})` : lang.name }}
      </option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import type { TranslatorLanguage } from '../types'

defineOptions({
  name: 'SimpleLanguageSelect'
})

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
  showNativeNames: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const selectedCode = target.value
  const selectedLang = props.languages.find((lang) => lang.code === selectedCode)
  emit('update:modelValue', selectedLang || null)
}
</script>

<style scoped>
.simple-language-select {
  display: inline-block;
  position: relative;
}

.language-dropdown {
  width: 100%;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.language-dropdown:hover {
  border-color: #9ca3af;
}

.language-dropdown:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.language-dropdown:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .language-dropdown {
    background-color: #1f2937;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .language-dropdown:hover {
    border-color: #6b7280;
  }

  .language-dropdown:disabled {
    background-color: #374151;
    color: #6b7280;
  }
}
</style>
