<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useLangie, DEFAULT_API_HOST, DEV_API_HOST, InterfaceLanguageSelect } from '@/index'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/solid'

import { devDebug as debugOnlyDev } from '@/utils/debug'

// Components
import ServiceStatus from './components/ServiceStatus.vue'
import ApiWarning from './components/ApiWarning.vue'
import LanguageSelector from './components/LanguageSelector.vue'
import TranslationForm from './components/TranslationForm.vue'
import ComponentDemo from './components/ComponentDemo.vue'

// Composables
import { useTheme } from './composables/useTheme.js'

// Use production API in production, dev API in development
const API_HOST = import.meta.env.PROD ? DEFAULT_API_HOST : DEV_API_HOST

const {
  availableLanguages,
  l,
  lr,
  isLoading: isTranslatorLoading,
  setLanguage,
  currentLanguage,
  fetchLanguages,
  getTranslationError
} = useLangie({
  translatorHost: API_HOST,
  // Optimized batching settings with reduced timings
  initialBatchDelay: 100, // Reduced initial batch delay
  followupBatchDelay: 50, // Reduced followup delay
  maxBatchSize: 100, // Larger batch size
  maxWaitTime: 1500 // Reduced maximum wait time
})

// Theme management
const { isDark, toggleTheme, initTheme } = useTheme()

// State
const sourceLang = ref(null)
const targetLang = ref(null)
const textToTranslate = ref('Welcome to the application! Enjoy!')
const translation = ref('')
const error = ref('')
const isMounted = ref(false)
const isTranslating = ref(false)
const serviceStatus = ref('Checking...')
const rateLimited = ref(false)
const lastRateLimitTime = ref(null)

const isLoading = computed(() => isTranslatorLoading.value || isTranslating.value)

const isRateLimitExpired = computed(() => {
  if (!lastRateLimitTime.value) return true
  return Date.now() - lastRateLimitTime.value > 60000
})

const checkServiceHealth = async () => {
  try {
    // Note: /health endpoint should NOT increase usage count
    const response = await fetch(`${API_HOST}/health`)
    if (response.ok) {
      const data = await response.json()
      serviceStatus.value = data.status === 'ok' ? 'Online' : 'Issues'
    } else {
      serviceStatus.value = 'Offline'
    }
  } catch (error) {
    serviceStatus.value = 'Offline'
  }
}

onMounted(async () => {
  initTheme()

  const saved = localStorage.getItem('translateText')
  if (saved) textToTranslate.value = saved

  // Restore interface language if saved and different
  const savedInterfaceLang = localStorage.getItem('interface_language')
  if (savedInterfaceLang && savedInterfaceLang !== currentLanguage.value) {
    setLanguage(savedInterfaceLang)
  }

  // Fetch available languages
  debugOnlyDev('[App] Fetching languages...')
  await fetchLanguages()
  debugOnlyDev('[App] Languages fetched:', availableLanguages.value?.length || 0, 'languages')

  await checkServiceHealth()
  isMounted.value = true
})

// Remove handleTranslate and all usages of translateBatch

const swapLanguages = () => {
  const temp = sourceLang.value
  sourceLang.value = targetLang.value
  targetLang.value = temp
}

// Computed
const displayLanguages = computed(() => {
  return availableLanguages.value?.length > 0 ? availableLanguages.value : []
})

const findLang = (code) => displayLanguages.value.find((l) => l.code === code) || null

// Watchers
watch(
  sourceLang,
  (newLang) => {
    if (newLang?.code) {
      localStorage.setItem('sourceLang', newLang.code)
      // Auto-change target if same as source
      if (targetLang.value?.code === newLang.code) {
        const alternativeLang = displayLanguages.value.find(
          (lang) => lang.code !== newLang.code && lang.code !== 'auto'
        )
        if (alternativeLang) targetLang.value = alternativeLang
      }
      // Refresh usage after language change
    }
  },
  { deep: true }
)

watch(
  targetLang,
  (newLang) => {
    if (newLang?.code) {
      localStorage.setItem('targetLang', newLang.code)
      // Refresh usage after language change
    }
  },
  { deep: true }
)

watch(textToTranslate, (val) => {
  localStorage.setItem('translateText', val)
})

watch(
  displayLanguages,
  (langs) => {
    if (langs.length > 0) {
      if (!sourceLang.value) {
        const savedCode = localStorage.getItem('sourceLang') || 'en'
        sourceLang.value = findLang(savedCode)
      }
      if (!targetLang.value) {
        const savedCode = localStorage.getItem('targetLang') || 'es'
        targetLang.value = findLang(savedCode)
      }
    }
  },
  { immediate: true, deep: true }
)

function handleInterfaceLanguageChange(lang) {
  if (lang?.code && lang.code !== currentLanguage.value) {
    setLanguage(lang.code)
    localStorage.setItem('interface_language', lang.code)
  }
}

// Add debug watcher for availableLanguages
watch(
  availableLanguages,
  (languages, oldLanguages) => {
    const newLength = languages?.length || 0
    const oldLength = oldLanguages?.length || 0

    // Only log when there's a significant change
    if (newLength > 0 && Math.abs(newLength - oldLength) > 5) {
      debugOnlyDev('[App] availableLanguages changed:', newLength, 'languages')
    }
  },
  { immediate: true }
)

const handleTranslate = () => {
  if (!textToTranslate.value.trim()) {
    translation.value = ''
    error.value = ''
    isTranslating.value = false
    return
  }

  // Clear previous error and translation
  error.value = ''
  translation.value = ''
  isTranslating.value = true

  // Use selected targetLang as the translation target
  const to = targetLang.value?.code || 'en'

  // Get the translation
  const result = lr(textToTranslate.value, 'ui', 'en', to)

  // If translation is immediately available and different from original
  if (result !== textToTranslate.value) {
    translation.value = result
    isTranslating.value = false
    return
  }

  // If result is same as original, it might be an error or still loading
  // Wait for translation to arrive or timeout
  let attempts = 0
  const maxAttempts = 5 // 2.5 seconds total (5 * 500ms) - reduced for faster error detection

  const checkTranslation = () => {
    attempts++
    const currentResult = lr(textToTranslate.value, 'ui', 'en', to)

    // Check if there's an error for this translation
    const translationError = getTranslationError(textToTranslate.value, 'ui', 'en', to)
    if (translationError) {
      error.value = translationError
      isTranslating.value = false
      return
    }

    if (currentResult !== textToTranslate.value) {
      // Translation arrived
      translation.value = currentResult
      isTranslating.value = false
    } else if (attempts >= maxAttempts) {
      // Timeout - check for error one more time before giving up
      const finalError = getTranslationError(textToTranslate.value, 'ui', 'en', to)
      if (finalError) {
        error.value = finalError
      } else {
        error.value = 'Translation failed or not supported for this language.'
      }
      isTranslating.value = false
    } else {
      // Still waiting, check again in 300ms
      setTimeout(checkTranslation, 300)
    }
  }

  // Start checking for translation
  setTimeout(checkTranslation, 300)
}
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
            <ServiceStatus :status="serviceStatus" :api-host="API_HOST" />
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button
            class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900"
            :class="isDark ? 'bg-blue-600' : 'bg-gray-200'"
            @click="toggleTheme"
          >
            <span
              class="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out"
              :class="isDark ? 'translate-x-7' : 'translate-x-1'"
            >
              <SunIcon v-if="isDark" class="w-4 h-4 text-yellow-500 mx-auto mt-0.5" />
              <MoonIcon v-else class="w-4 h-4 text-gray-600 mx-auto mt-0.5" />
            </span>
          </button>
        </div>
      </div>

      <ApiWarning :service-status="serviceStatus" :rate-limited="rateLimited" />

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <lt>Interface Language</lt>
        </label>
        <InterfaceLanguageSelect
          placeholder="UI Language"
          :is-dark="isDark"
          @update:model-value="handleInterfaceLanguageChange"
        />
      </div>

      <h2 class="text-2xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-6">
        <lt>Translation</lt>
      </h2>

      <LanguageSelector
        v-model:source-lang="sourceLang"
        v-model:target-lang="targetLang"
        :languages="displayLanguages"
        :is-loading="isLoading"
        :is-dark="isDark"
        :swap-title="l('Swap languages', 'ui button title for swapping languages')"
        @swap="swapLanguages"
      />

      <TranslationForm
        v-model:text-to-translate="textToTranslate"
        :placeholder="l('Enter text to translate', 'ui', 'en')"
        :is-mounted="isMounted"
        :is-loading="isLoading"
        :rate-limited="rateLimited"
        :is-rate-limit-expired="isRateLimitExpired"
        :translation="translation"
        :error="error"
        @translate="handleTranslate"
      />

      <ComponentDemo :languages="displayLanguages" :is-loading="isLoading" :is-dark="isDark" />
    </div>
  </div>
</template>
