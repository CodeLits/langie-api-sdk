<template>
  <div class="mb-6">
    <div class="grid grid-cols-5 gap-4 items-end">
      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <lt>Source Language</lt>
        </label>
        <LanguageSelect
          :model-value="sourceLang"
          placeholder="Source Language"
          :disabled="isLoading"
          :is-dark="isDark"
          :languages="languages"
          @update:model-value="$emit('update:sourceLang', $event)"
        />
      </div>
      <div class="col-span-1 flex justify-center">
        <button
          :disabled="isLoading || !sourceLang || !targetLang"
          class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 hover:shadow-md disabled:hover:scale-100 disabled:active:scale-100"
          :title="swapTitle"
          @click="$emit('swap')"
        >
          <ArrowPathIcon
            class="w-7 h-7 text-gray-600 dark:text-gray-300 transition-transform duration-300 ease-in-out hover:rotate-180"
          />
        </button>
      </div>
      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <lt>Target Language</lt>
        </label>
        <LanguageSelect
          :model-value="targetLang"
          placeholder="Target Language"
          :disabled="isLoading"
          :is-dark="isDark"
          :languages="targetLanguageOptions"
          @update:model-value="$emit('update:targetLang', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { LanguageSelect, lt } from '@/index'

const props = defineProps({
  sourceLang: { type: Object, default: null },
  targetLang: { type: Object, default: null },
  languages: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  isDark: { type: Boolean, default: false },
  swapTitle: { type: String, default: '' }
})

defineEmits(['update:sourceLang', 'update:targetLang', 'swap'])

const targetLanguageOptions = computed(() => {
  return props.languages.filter((lang) => !props.sourceLang || lang.code !== props.sourceLang.code)
})
</script>
