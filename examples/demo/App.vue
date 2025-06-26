<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useLangie, DEFAULT_API_HOST, DEV_API_HOST } from '@/index'
// Import the component directly from source for demo
import lt from '@/components/lt.vue'
// Import LanguageSelect from the main package
import LanguageSelect from '@/components/LanguageSelect.vue'

// Use production API in production, dev API in development
const API_HOST = import.meta.env.PROD ? DEFAULT_API_HOST : DEV_API_HOST

const {
  translate,
  currentLanguage,
  availableLanguages,
  setLanguage,
  fetchLanguages,
  l,
  isLoading: isTranslatorLoading
} = useLangie({
  translatorHost: API_HOST
})

const isDark = ref(false)
const interfaceLang = ref(null)
const sourceLang = ref(null)
const targetLang = ref(null)
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
    const response = await fetch(`${API_HOST}/health`)
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

  // Load saved text and interface language
  const saved = localStorage.getItem('translateText')
  if (saved) textToTranslate.value = saved

  // We will set the language via the watcher once languages are loaded
  // const savedInterfaceLang = localStorage.getItem('interfaceLanguage')
  // if (savedInterfaceLang) {
  //   interfaceLang.value = savedInterfaceLang
  //   setLanguage(savedInterfaceLang)
  // }

  // Check service health first
  await checkServiceHealth()

  // The useLangie composable now handles the initial fetch automatically.
  // This explicit call is redundant and causes a double-fetch.
  //
  // if (serviceStatus.value.includes('✅') && !rateLimited.value) {
  //   try {
  //     await fetchLanguages({ force: true })
  //   } catch (err) {
  //     console.warn('Failed to fetch languages on mount:', err)
  //     // Trigger rate limiting on any fetch failure that could indicate rate limiting
  //     if (
  //       err.message?.includes('429') ||
  //       err.message?.includes('Too Many Requests') ||
  //       err.message?.includes('Failed to fetch') ||
  //       err.message?.includes('CORS')
  //     ) {
  //       handleRateLimit()
  //       console.log('Rate limiting triggered due to API errors')
  //     }
  //   }
  // }

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
    const result = await translate(
      textToTranslate.value,
      sourceLang.value?.code,
      targetLang.value?.code
    )

    if (
      result &&
      result.translations &&
      Array.isArray(result.translations) &&
      result.translations.length > 0
    ) {
      // API returns: { translations: [{ text: "original", translated: "translation" }] }
      translation.value = result.translations[0].translated
    } else if (Array.isArray(result) && result.length > 0) {
      // Fallback for array format
      translation.value = result[0].text || result[0].translated || result[0]
    } else if (typeof result === 'string') {
      translation.value = result
    } else {
      translation.value = 'Translation returned an unexpected format.'
      console.log('❌ Unexpected translation result:', result)
    }
  } catch (err) {
    console.error('❌ Translation error:', err)

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

const swapLanguages = () => {
  const temp = sourceLang.value
  sourceLang.value = targetLang.value
  targetLang.value = temp
}

watch(
  interfaceLang,
  (newLang) => {
    if (newLang && newLang.code) {
      setLanguage(newLang.code)
      localStorage.setItem('interfaceLanguage', newLang.code)
    }
  },
  { deep: true }
)

watch(
  sourceLang,
  (newLang) => {
    if (newLang && newLang.code) {
      localStorage.setItem('sourceLang', newLang.code)

      // If target language is the same as source, change it to a different one
      if (targetLang.value && targetLang.value.code === newLang.code) {
        const alternativeLang = displayLanguages.value.find(
          (lang) => lang.code !== newLang.code && lang.code !== 'auto'
        )
        if (alternativeLang) {
          targetLang.value = alternativeLang
        }
      }
    }
  },
  { deep: true }
)

watch(
  targetLang,
  (newLang) => {
    if (newLang && newLang.code) {
      localStorage.setItem('targetLang', newLang.code)
    }
  },
  { deep: true }
)

watch(textToTranslate, (val) => {
  localStorage.setItem('translateText', val)
})

// Use API languages when available, fallback to simple languages
const displayLanguages = computed(() => {
  if (availableLanguages.value && availableLanguages.value.length > 0) {
    const apiLangs = availableLanguages.value.map((lang) => ({
      code: lang.code,
      name: lang.name,
      native_name: lang.native_name,
      flag_country: lang.flag_country
    }))

    return apiLangs
  }
  // Return empty array when API languages aren't loaded yet
  return []
})

const canRetryLanguages = computed(() => {
  return (
    serviceStatus.value.includes('✅') &&
    availableLanguages.value.length === 0 &&
    (!rateLimited.value || isRateLimitExpired.value)
  )
})

const findLang = (code) => displayLanguages.value.find((l) => l.code === code) || null

const targetLanguageOptions = computed(() => {
  return displayLanguages.value.filter(
    (lang) => !sourceLang.value || lang.code !== sourceLang.value.code
  )
})

watch(
  displayLanguages,
  (langs) => {
    if (langs.length > 0) {
      if (!interfaceLang.value) {
        const savedInterfaceLangCode = localStorage.getItem('interfaceLanguage') || 'en'
        const foundLang = findLang(savedInterfaceLangCode)
        interfaceLang.value = foundLang
      }
      if (!sourceLang.value) {
        const savedSourceLangCode = localStorage.getItem('sourceLang') || 'en'
        const foundLang = findLang(savedSourceLangCode)
        sourceLang.value = foundLang
      }
      if (!targetLang.value) {
        const savedTargetLangCode = localStorage.getItem('targetLang') || 'es'
        const foundLang = findLang(savedTargetLangCode)
        targetLang.value = foundLang
      }
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center transition-colors bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
  >
    <div
      class="p-8 rounded-lg shadow-md w-full max-w-2xl transition-colors bg-white dark:bg-gray-800"
    >
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">Langie API SDK</h1>
          <div class="flex flex-col">
            <span
              class="px-2 py-1 text-xs font-semibold rounded-full"
              :class="{
                'bg-green-100 text-green-800': serviceStatus.includes('✅'),
                'bg-yellow-100 text-yellow-800': serviceStatus.includes('⚠️'),
                'bg-red-100 text-red-800': serviceStatus.includes('❌')
              }"
              >{{ serviceStatus }}</span
            >
            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ API_HOST }}
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="toggleTheme"
            class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900"
          >
            <span v-if="isDark">☀️</span>
            <span v-else>🌙</span>
          </button>
        </div>
      </div>

      <!-- API Issues warning -->
      <div
        v-if="serviceStatus.includes('❌') || rateLimited"
        class="p-4 mb-4 text-sm rounded-lg"
        :class="{
          'bg-red-100 text-red-700 dark:bg-red-200 dark:text-red-800': serviceStatus.includes('❌'),
          'bg-yellow-100 text-yellow-700 dark:bg-yellow-200 dark:text-yellow-800': rateLimited
        }"
        role="alert"
      >
        <span class="font-medium">
          <lt v-if="serviceStatus.includes('❌')" orig="en">API Offline</lt>
          <lt v-else orig="en">Rate Limit</lt>
        </span>
        <lt v-if="serviceStatus.includes('❌')" orig="en"
          >The translation service is currently offline. Using a fallback list of languages.</lt
        >
        <lt v-else orig="en"
          >API rate limit may have been reached. Language list may be incomplete. Please wait a
          moment.</lt
        >
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <lt orig="en">Interface Language</lt>
        </label>
        <LanguageSelect
          v-model="interfaceLang"
          placeholder="UI Language"
          :disabled="isLoading"
          :is-dark="isDark"
          :languages="displayLanguages"
        />
      </div>

      <h2 class="text-2xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-6">
        <lt orig="en">Translation</lt>
      </h2>

      <div class="mb-6">
        <div class="grid grid-cols-5 gap-4 items-end">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <lt orig="en">Source Language</lt>
            </label>
            <LanguageSelect
              v-model="sourceLang"
              placeholder="Source Language"
              :disabled="isLoading"
              :is-dark="isDark"
              :languages="displayLanguages"
            />
          </div>
          <div class="col-span-1 flex justify-center">
            <button
              @click="swapLanguages"
              :disabled="isLoading || !sourceLang || !targetLang"
              class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              :title="l('Swap languages')"
            >
              <svg
                class="w-5 h-5 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m0-4l4-4"
                ></path>
              </svg>
            </button>
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <lt orig="en">Target Language</lt>
            </label>
            <LanguageSelect
              v-model="targetLang"
              placeholder="Target Language"
              :disabled="isLoading"
              :is-dark="isDark"
              :languages="targetLanguageOptions"
            />
          </div>
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
    </div>
  </div>
</template>
