<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import {
  useLangie,
  DEFAULT_API_HOST,
  DEV_API_HOST,
  lt,
  InterfaceLanguageSelect,
  translateBatch
} from '@/index'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/solid'

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
  isLoading: isTranslatorLoading
} = useLangie({
  translatorHost: API_HOST
})

// Theme management
const { isDark, toggleTheme, initTheme } = useTheme()

// State
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

const isRateLimitExpired = computed(() => {
  if (!lastRateLimitTime.value) return true
  return Date.now() - lastRateLimitTime.value > 60000
})

const checkServiceHealth = async () => {
  try {
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

const handleRateLimit = () => {
  rateLimited.value = true
  lastRateLimitTime.value = Date.now()
  setTimeout(() => {
    rateLimited.value = false
    lastRateLimitTime.value = null
  }, 60000)
}

onMounted(async () => {
  initTheme()

  const saved = localStorage.getItem('translateText')
  if (saved) textToTranslate.value = saved

  await checkServiceHealth()
  isMounted.value = true
})

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
    const [result] = await translateBatch(
      [
        {
          text: textToTranslate.value,
          from_lang: sourceLang.value?.code || 'auto',
          to_lang: targetLang.value?.code || 'en'
        }
      ],
      {
        translatorHost: API_HOST
      }
    )

    translation.value = result?.translated || result?.text || result || 'Translation failed'
  } catch (err) {
    console.error('Translation error:', err)

    if (err.message?.includes('429') || err.message?.includes('CORS')) {
      handleRateLimit()
      error.value = err.message?.includes('CORS')
        ? 'CORS error: The translation API needs CORS headers configured for this domain.'
        : 'API rate limit exceeded. Please wait a moment before trying again.'
    } else {
      error.value = err.message || 'Translation failed'
    }
  }
}

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
    }
  },
  { deep: true }
)

watch(
  targetLang,
  (newLang) => {
    if (newLang?.code) localStorage.setItem('targetLang', newLang.code)
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
            <ServiceStatus :status="serviceStatus" />
            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ API_HOST }}
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button
            class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            @click="toggleTheme"
          >
            <SunIcon v-if="isDark" class="w-7 h-7 text-yellow-500" />
            <MoonIcon v-else class="w-7 h-7 text-blue-400" />
          </button>
        </div>
      </div>

      <ApiWarning :service-status="serviceStatus" :rate-limited="rateLimited" />

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <lt orig="en">Interface Language</lt>
        </label>
        <InterfaceLanguageSelect placeholder="UI Language" :is-dark="isDark" />
      </div>

      <h2 class="text-2xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-6">
        <lt orig="en">Translation</lt>
      </h2>

      <LanguageSelector
        v-model:source-lang="sourceLang"
        v-model:target-lang="targetLang"
        :languages="displayLanguages"
        :is-loading="isLoading"
        :is-dark="isDark"
        :swap-title="l('Swap languages')"
        @swap="swapLanguages"
      />

      <TranslationForm
        v-model:text-to-translate="textToTranslate"
        :placeholder="l('Enter text to translate')"
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
