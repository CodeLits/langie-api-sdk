<template>
  <div>
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <lt orig="en">Text to translate</lt>
      </label>
      <input
        :value="textToTranslate"
        type="text"
        :placeholder="placeholder"
        class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        @input="$emit('update:textToTranslate', $event.target.value)"
      />
    </div>

    <button
      :disabled="
        !isMounted || isLoading || !textToTranslate || (rateLimited && !isRateLimitExpired)
      "
      class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
      @click="$emit('translate')"
    >
      <span v-if="isLoading"><lt orig="en">Translating...</lt></span>
      <span v-else-if="rateLimited && !isRateLimitExpired">
        <lt orig="en">Rate Limited - Please Wait</lt>
      </span>
      <span v-else><lt orig="en">Translate</lt></span>
    </button>

    <div v-if="translation" class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
      <h2 class="text-lg font-semibold mb-2"><lt orig="en">Translation</lt></h2>
      <p class="text-gray-800 dark:text-gray-100">{{ translation }}</p>
    </div>

    <div
      v-if="error"
      class="mt-6 p-4 bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-md"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { lt } from '@/index'

defineProps({
  textToTranslate: String,
  placeholder: String,
  isMounted: Boolean,
  isLoading: Boolean,
  rateLimited: Boolean,
  isRateLimitExpired: Boolean,
  translation: String,
  error: String
})

defineEmits(['update:textToTranslate', 'translate'])
</script>
