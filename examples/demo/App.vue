<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useTranslator } from '../../dist/index.mjs'

const {
  translate,
  currentLanguage,
  availableLanguages,
  setLanguage,
  isLoading: isTranslatorLoading
} = useTranslator({
  translatorHost: 'http://localhost:8081/v1'
})

const isDark = ref(false)
const interfaceLang = ref('en')
const sourceLang = ref('en')
const targetLang = ref('ru')
const textToTranslate = ref('')
const translation = ref('')
const error = ref('')
const isMounted = ref(false)

const isLoading = computed(() => isTranslatorLoading.value)

onMounted(async () => {
  // Initialize dark mode first
  const darkMode = localStorage.getItem('darkMode') === 'true'
  isDark.value = darkMode
  updateTheme()

  // Load saved text
  const saved = localStorage.getItem('translateText')
  if (saved) textToTranslate.value = saved

  isMounted.value = true
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('darkMode', isDark.value.toString())
  updateTheme()
}

const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const handleTranslate = async () => {
  if (!textToTranslate.value.trim()) {
    error.value = 'Please enter text to translate'
    return
  }
  error.value = ''
  translation.value = ''

  try {
    const result = await translate(textToTranslate.value, sourceLang.value, targetLang.value)
    if (Array.isArray(result) && result.length > 0) {
      translation.value = result[0].text
    } else if (typeof result === 'string') {
      translation.value = result
    } else {
      translation.value = 'Translation returned an unexpected format.'
    }
  } catch (err) {
    console.error('Translation error:', err)
    error.value = err.message || 'Translation failed'
  }
}

watch(interfaceLang, (newLang) => {
  setLanguage(newLang)
})

watch(textToTranslate, (val) => {
  localStorage.setItem('translateText', val)
})

// Simple language options for now
const simpleLanguages = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Russian' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' }
]
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center transition-colors bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
  >
    <div
      class="p-8 rounded-lg shadow-md w-full max-w-2xl transition-colors bg-white dark:bg-gray-800"
    >
      <div class="flex justify-end mb-4">
        <button
          @click="toggleTheme"
          class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Interface Language
        </label>
        <select
          v-model="interfaceLang"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        >
          <option v-for="lang in simpleLanguages" :key="lang.value" :value="lang.value">
            {{ lang.label }}
          </option>
        </select>
      </div>

      <h1 class="text-2xl font-bold mb-6 text-center">Translation</h1>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Source Language
          </label>
          <select
            v-model="sourceLang"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option v-for="lang in simpleLanguages" :key="lang.value" :value="lang.value">
              {{ lang.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Language
          </label>
          <select
            v-model="targetLang"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option
              v-for="lang in simpleLanguages.filter((l) => l.value !== sourceLang)"
              :key="lang.value"
              :value="lang.value"
            >
              {{ lang.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text to translate
        </label>
        <input
          v-model="textToTranslate"
          type="text"
          placeholder="Enter text to translate"
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        />
      </div>

      <button
        :disabled="!isMounted || isLoading || !textToTranslate"
        class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        @click="handleTranslate"
      >
        <span v-if="isLoading">Translating...</span>
        <span v-else>Translate</span>
      </button>

      <div v-if="translation" class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
        <h2 class="text-lg font-semibold mb-2">Translation</h2>
        <p class="text-gray-800 dark:text-gray-100">{{ translation }}</p>
      </div>

      <div
        v-if="error"
        class="mt-6 p-4 bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-md"
      >
        {{ error }}
      </div>

      <!-- Debug info -->
      <div v-if="isMounted" class="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>Dark Mode: {{ isDark ? 'ON' : 'OFF' }}</p>
        <p>Translation Service: Working</p>
        <p>Available Languages: {{ simpleLanguages.length }} (simplified)</p>
        <p>API Languages: {{ availableLanguages.length }}</p>
        <p>Current Language: {{ currentLanguage }}</p>
      </div>
    </div>
  </div>
</template>
