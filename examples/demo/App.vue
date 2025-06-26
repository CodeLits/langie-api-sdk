<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useTranslator, DEV_API_HOST } from '../../dist/index.mjs'
// Import the component directly from source for demo
import lt from '../../src/components/lt.vue'

const {
  translate,
  currentLanguage,
  availableLanguages,
  setLanguage,
  fetchLanguages,
  l,
  isLoading: isTranslatorLoading
} = useTranslator({
  translatorHost: DEV_API_HOST
})

const isDark = ref(false)
const interfaceLang = ref('en')
const sourceLang = ref('en')
const targetLang = ref('es')
const textToTranslate = ref('Welcome to the application!')
const translation = ref('')
const error = ref('')
const isMounted = ref(false)
const serviceStatus = ref('Checking...')
const rateLimited = ref(false)
const lastRateLimitTime = ref(null)

const isLoading = computed(() => isTranslatorLoading.value)

const checkServiceHealth = async () => {
  try {
    const response = await fetch(`${DEV_API_HOST}/health`)
    if (response.ok) {
      const data = await response.json()
      serviceStatus.value = data.status === 'ok' ? '✅ Online' : '⚠️ Issues'
    } else {
      serviceStatus.value = '❌ Offline'
    }
  } catch (error) {
    serviceStatus.value = '❌ Offline'
  }
}

const handleRateLimit = () => {
  rateLimited.value = true
  lastRateLimitTime.value = Date.now()

  // Reset rate limit after 1 minute
  setTimeout(() => {
    rateLimited.value = false
    lastRateLimitTime.value = null
  }, 60000)
}

const isRateLimitExpired = computed(() => {
  if (!lastRateLimitTime.value) return true
  return Date.now() - lastRateLimitTime.value > 60000
})

onMounted(async () => {
  // Initialize dark mode first - check localStorage then system preference
  const savedDarkMode = localStorage.getItem('darkMode')
  let darkMode = false

  if (savedDarkMode !== null) {
    // User has explicitly set a preference
    darkMode = savedDarkMode === 'true'
  } else {
    // No saved preference, use system preference
    darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    // Save the detected system preference
    localStorage.setItem('darkMode', darkMode.toString())
  }

  isDark.value = darkMode
  updateTheme()

  // Load saved text
  const saved = localStorage.getItem('translateText')
  if (saved) textToTranslate.value = saved

  // Check service health first
  await checkServiceHealth()

  // Only try to fetch languages if service is online and not rate limited
  if (serviceStatus.value.includes('✅') && !rateLimited.value) {
    try {
      await fetchLanguages({ force: true })
    } catch (err) {
      console.warn('Failed to fetch languages on mount:', err)
      // Trigger rate limiting on any fetch failure that could indicate rate limiting
      if (
        err.message?.includes('429') ||
        err.message?.includes('Too Many Requests') ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('CORS')
      ) {
        handleRateLimit()
        console.log('Rate limiting triggered due to API errors')
      }
    }
  }

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

  if (rateLimited.value && !isRateLimitExpired.value) {
    error.value = 'API rate limit exceeded. Please wait a moment before trying again.'
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

    if (
      err.message?.includes('429') ||
      err.message?.includes('Too Many Requests') ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('CORS') ||
      err.message?.includes('Access-Control-Allow-Origin')
    ) {
      handleRateLimit()
      if (err.message?.includes('CORS') || err.message?.includes('Access-Control-Allow-Origin')) {
        error.value =
          'CORS error: The translation API needs CORS headers configured for this domain.'
      } else if (err.message?.includes('429') || err.message?.includes('Too Many Requests')) {
        error.value = 'API rate limit exceeded. Please wait a moment before trying again.'
      } else {
        error.value =
          'Network/API error: Unable to connect to translation service. This could be due to rate limiting or server issues.'
      }
    } else {
      error.value = err.message || 'Translation failed'
    }
  }
}

const retryFetchLanguages = async () => {
  if (rateLimited.value && !isRateLimitExpired.value) {
    error.value = 'Please wait before retrying due to rate limits.'
    return
  }

  try {
    error.value = ''
    await fetchLanguages({ force: true })
  } catch (err) {
    if (
      err.message?.includes('429') ||
      err.message?.includes('Too Many Requests') ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('CORS')
    ) {
      handleRateLimit()
      error.value = 'API issues detected (rate limiting or CORS). Languages will use fallback list.'
    } else {
      error.value = 'Failed to fetch languages from API. Using fallback list.'
    }
  }
}

watch(interfaceLang, (newLang) => {
  setLanguage(newLang)
})

watch(textToTranslate, (val) => {
  localStorage.setItem('translateText', val)
})

// Fallback language options when API languages aren't loaded
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

// Use API languages when available, fallback to simple languages
const displayLanguages = computed(() => {
  if (availableLanguages.value && availableLanguages.value.length > 0) {
    return availableLanguages.value.map((lang) => ({
      value: lang.value || lang.code,
      label: lang.native_name || lang.name || lang.label || lang.value || lang.code
    }))
  }
  return simpleLanguages
})

const canRetryLanguages = computed(() => {
  return (
    serviceStatus.value.includes('✅') &&
    availableLanguages.value.length === 0 &&
    (!rateLimited.value || isRateLimitExpired.value)
  )
})
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center transition-colors bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
  >
    <div
      class="p-8 rounded-lg shadow-md w-full max-w-2xl transition-colors bg-white dark:bg-gray-800"
    >
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Langie API SDK - Demo App
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <lt orig="en">Real API</lt>:
            <a
              href="https://api.langie.uk"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              https://api.langie.uk
            </a>
          </p>
        </div>
        <button
          @click="toggleTheme"
          class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </div>

      <!-- API Issues warning -->
      <div
        v-if="rateLimited && !isRateLimitExpired"
        class="mb-6 p-4 bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-md border border-yellow-200 dark:border-yellow-700"
      >
        <div class="flex items-center">
          <span class="text-lg mr-2">⚠️</span>
          <div>
            <h3 class="font-semibold">API Issues Detected</h3>
            <p class="text-sm mt-1">
              The translation API is experiencing issues (rate limiting, CORS, or network problems).
              Using fallback language list. Functionality will be limited until issues resolve.
            </p>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <lt orig="en">Interface Language</lt>
          </label>
          <button
            v-if="canRetryLanguages"
            @click="retryFetchLanguages"
            class="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <lt orig="en">Load API Languages</lt>
          </button>
        </div>
        <select
          v-model="interfaceLang"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        >
          <option v-for="lang in displayLanguages" :key="lang.value" :value="lang.value">
            {{ lang.label }}
          </option>
        </select>
      </div>

      <h2 class="text-xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">
        <lt orig="en">Translation</lt>
      </h2>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <lt orig="en">Source Language</lt>
          </label>
          <select
            v-model="sourceLang"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option v-for="lang in displayLanguages" :key="lang.value" :value="lang.value">
              {{ lang.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <lt orig="en">Target Language</lt>
          </label>
          <select
            v-model="targetLang"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option
              v-for="lang in displayLanguages.filter((l) => l.value !== sourceLang)"
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
          <lt orig="en">Text to translate</lt>
        </label>
        <input
          v-model="textToTranslate"
          type="text"
          :placeholder="l('Enter text to translate')"
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        />
      </div>

      <button
        :disabled="
          !isMounted || isLoading || !textToTranslate || (rateLimited && !isRateLimitExpired)
        "
        class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        @click="handleTranslate"
      >
        <span v-if="isLoading"><lt orig="en">Translating...</lt></span>
        <span v-else-if="rateLimited && !isRateLimitExpired"
          ><lt orig="en">Rate Limited - Please Wait</lt></span
        >
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

      <!-- Debug info -->
      <div v-if="isMounted" class="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>Dark Mode: {{ isDark ? 'ON' : 'OFF' }}</p>
        <p>Translation Service: {{ serviceStatus }}</p>
        <p>
          Display Languages: {{ displayLanguages.length }}
          {{ availableLanguages.length > 0 ? '(from API)' : '(fallback)' }}
        </p>
        <p>API Languages: {{ availableLanguages.length }}</p>
        <p>Current Language: {{ currentLanguage }}</p>
        <p v-if="rateLimited">Rate Limited: {{ !isRateLimitExpired ? 'Active' : 'Expired' }}</p>
      </div>
    </div>
  </div>
</template>
