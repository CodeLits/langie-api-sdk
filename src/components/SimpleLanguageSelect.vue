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
import { COLORS } from '../constants/colors'
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
  border: 1px solid v-bind('COLORS.border.light');
  border-radius: 6px;
  background-color: v-bind('COLORS.neutral.white');
  font-size: 14px;
  color: v-bind('COLORS.text.primary');
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.language-dropdown:hover {
  border-color: v-bind('COLORS.neutral.gray400');
}

.language-dropdown:focus {
  outline: none;
  border-color: v-bind('COLORS.primary.blue');
  box-shadow: 0 0 0 3px v-bind('COLORS.primary.blueAlpha30');
}

.language-dropdown:disabled {
  background-color: v-bind('COLORS.neutral.gray50');
  color: v-bind('COLORS.neutral.gray400');
  cursor: not-allowed;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .language-dropdown {
    background-color: v-bind('COLORS.neutral.gray800');
    border-color: v-bind('COLORS.border.dark');
    color: v-bind('COLORS.neutral.gray50');
  }

  .language-dropdown:hover {
    border-color: v-bind('COLORS.neutral.gray500');
  }

  .language-dropdown:disabled {
    background-color: v-bind('COLORS.neutral.gray700');
    color: v-bind('COLORS.neutral.gray500');
  }
}
</style>
