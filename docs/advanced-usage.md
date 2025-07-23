# Advanced Usage

This guide covers advanced usage patterns for Vue Translator SDK.

## Handling Dynamic Content

### Interpolation

You can use interpolation in your translations:

```vue
<template>
  <div>
    <lt>Hello {{ username }}!</lt>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { T } from 'langie-api-sdk/components'
import { useLangie } from 'langie-api-sdk'

const { l, lr } = useLangie()

const username = ref('John')
</script>
```

### Pluralization

For pluralization, you can use conditional rendering:

```vue
<template>
  <div>
    <lt v-if="count === 0">No items</lt>
    <lt v-else-if="count === 1">One item</lt>
    <lt v-else>{{ count }} items</lt>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { T } from 'langie-api-sdk/components'
import { useLangie } from 'langie-api-sdk'

const { l, lr } = useLangie()

const count = ref(2)
</script>
```

### Formatting

For more complex formatting, you can use computed properties:

```vue
<template>
  <div>
    <lt>{{ formattedMessage }}</lt>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { T } from 'langie-api-sdk/components'
import { useLangie } from 'langie-api-sdk'

const { l, lr } = useLangie()

const props = defineProps({
  username: String,
  lastLogin: Date
})

const formattedMessage = computed(() => {
  const date = new Intl.DateTimeFormat().format(props.lastLogin)
  return `${props.username} last logged in on ${date}`
})
</script>
```

## Custom Translation Providers

You can create a custom translation provider to extend the SDK's functionality:

```js
// translationProvider.js
import { ref, readonly, inject, provide } from 'vue'
import { useLangie } from 'langie-api-sdk'

const TRANSLATOR_INJECTION_KEY = Symbol('translator')

export function createTranslator(options = {}) {
  // Get base functionality from the SDK
  const base = useLangie(options)

  // Add custom functionality
  const customTranslator = {
    ...base,

    // Add a method for translating with context
    translateWithContext: (text, ctx, targetLang) => {
      // Add context information to the translation
      return base.translate(`${ctx}: ${text}`, targetLang).replace(`${ctx}: `, '')
    },

    // Add a method for translating with fallback
    translateWithFallback: (text, targetLang, fallback) => {
      try {
        return base.translate(text, targetLang)
      } catch (error) {
        console.error('Translation failed, using fallback', error)
        return fallback || text
      }
    }
  }

  return customTranslator
}

// Provider for dependency injection
export function provideTranslator(options = {}) {
  const translator = createTranslator(options)
  provide(TRANSLATOR_INJECTION_KEY, readonly(translator))
  return translator
}

// Consumer for dependency injection
export function useLangieInjection() {
  const translator = inject(TRANSLATOR_INJECTION_KEY)
  if (!translator) {
    throw new Error('No translator provided! Did you call provideTranslator?')
  }
  return translator
}
```

Then use it in your application:

```vue
<!-- App.vue -->
<script setup>
import { provideTranslator } from './translationProvider'

// Provide the translator to all child components
provideTranslator({
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-api-key'
})
</script>

<!-- ChildComponent.vue -->
<template>
  <div>
    <p>{{ translateWithContext('Submit', 'button') }}</p>
    <p>{{ translateWithFallback('Complex phrase', 'fr', 'Fallback text') }}</p>
  </div>
</template>

<script setup>
import { useLangieInjection } from './translationProvider'

const { translateWithContext, translateWithFallback } = useLangieInjection()
</script>
```

## Optimizing Batch Translations with Global Context

When translating multiple items with the same context, you can optimize by using a global context parameter:

```javascript
// Instead of repeating context in each item:
const translations = [
  { t: 'My API Keys', ctx: 'ui' },
  { t: 'Translations', ctx: 'ui' },
  { t: 'API Keys', ctx: 'ui' },
  { t: 'Docs', ctx: 'ui' },
  { t: 'Logout', ctx: 'ui' }
]

// Use global context (more efficient):
const { fetchAndCacheBatch } = useLangie()

await fetchAndCacheBatch(
  [{ t: 'My API Keys' }, { t: 'Translations' }, { t: 'API Keys' }, { t: 'Docs' }, { t: 'Logout' }],
  'en',
  'fr',
  'ui' // Global context for all items
)
```

This approach:

- **Reduces payload size** by not repeating the same context
- **Improves performance** with smaller API requests
- **Maintains backward compatibility** - individual contexts still work
- **Simplifies code** when all items share the same context

## Handling Translation Loading States

For a better user experience, you can handle loading states:

```vue
<template>
  <div>
    <div v-if="isLoading" class="loading-overlay">
      <span class="loading-spinner"></span>
      <p><lt>Loading translations...</lt></p>
    </div>

    <div v-else>
      <!-- Your translated content -->
      <h1><lt>Welcome to our application!</lt></h1>
      <p><lt>This content is now translated.</lt></p>
    </div>
  </div>
</template>

<script setup>
import { T } from 'langie-api-sdk/components'
import { useLangie } from 'langie-api-sdk'

const { isLoading } = useLangie()
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
```

## Lazy Loading Translations

For large applications, you might want to lazy load translations:

```js
// translationLoader.js
import { ref, computed } from 'vue'
import { useLangie } from 'langie-api-sdk'

export function useLazyTranslator(options = {}) {
  const { translate, currentLanguage, setLanguage, ...rest } = useLangie(options)

  // Track loaded translation modules
  const loadedModules = ref(new Set())

  // Lazy load a translation module
  async function loadTranslationModule(moduleName) {
    if (loadedModules.value.has(moduleName)) {
      return true
    }

    try {
      // This would be your API call to load additional translations
      await fetch(
        `${options.translatorHost}/api/translations/${moduleName}?lang=${currentLanguage.value}`
      )
      loadedModules.value.add(moduleName)
      return true
    } catch (error) {
      console.error(`Failed to load translation module: ${moduleName}`, error)
      return false
    }
  }

  return {
    translate,
    currentLanguage,
    setLanguage,
    ...rest,
    loadTranslationModule,
    loadedModules: computed(() => Array.from(loadedModules.value))
  }
}
```

Then use it in your components:

```vue
<template>
  <div>
    <button @click="loadAdminTranslations">
      <lt>Load Admin Interface</lt>
    </button>

    <div v-if="isAdminLoaded">
      <!-- Admin interface with translations -->
      <h2><lt>Admin Dashboard</lt></h2>
      <p><lt>Welcome to the admin area.</lt></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { T } from 'vue-translator-sdk/components'
import { useLazyTranslator } from './translationLoader'

const { loadTranslationModule } = useLazyTranslator()
const isAdminLoaded = ref(false)

async function loadAdminTranslations() {
  const success = await loadTranslationModule('admin')
  isAdminLoaded.value = success
}
</script>
```

## Integrating with Pinia

You can integrate the translator with Pinia for state management:

```js
// stores/translator.js
import { defineStore } from 'pinia'
import { useLangie } from 'vue-translator-sdk'

export const useLangieStore = defineStore('translator', () => {
  const { translate, translateAsync, currentLanguage, setLanguage, availableLanguages, isLoading } =
    useLangie({
      translatorHost: 'https://your-translation-api.com',
      apiKey: 'your-api-key'
    })

  // Add additional state or methods
  const recentTranslations = ref([])

  function trackTranslation(text, translated) {
    recentTranslations.value.push({
      original: text,
      translated,
      timestamp: new Date()
    })

    // Keep only the last 10 translations
    if (recentTranslations.value.length > 10) {
      recentTranslations.value.shift()
    }
  }

  // Wrap the translate function to track translations
  function translateAndTrack(text, targetLang) {
    const translated = translate(text, targetLang)
    trackTranslation(text, translated)
    return translated
  }

  return {
    translate: translateAndTrack,
    translateAsync,
    currentLanguage,
    setLanguage,
    availableLanguages,
    isLoading,
    recentTranslations
  }
})
```

Then use it in your components:

```vue
<template>
  <div>
    <p>{{ translate('Hello world!') }}</p>

    <div v-if="recentTranslations.length">
      <h3><lt>Recent Translations</lt></h3>
      <ul>
        <li v-for="(item, index) in recentTranslations" :key="index">
          {{ item.original }} → {{ item.t }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { T } from 'vue-translator-sdk/components'
import { useLangieStore } from './stores/translator'

const { translate, recentTranslations } = useLangieStore()
</script>
```

## Handling Offline Mode

You can implement offline support by caching translations:

```js
// offlineTranslator.js
import { ref, watch } from 'vue'
import { useLangie } from 'vue-translator-sdk'

// Check if we're online
const isOnline = ref(navigator.onLine)
window.addEventListener('online', () => (isOnline.value = true))
window.addEventListener('offline', () => (isOnline.value = false))

export function useOfflineTranslator(options = {}) {
  const { translate, translateAsync, currentLanguage, setLanguage, ...rest } = useLangie(options)

  // Initialize cache from localStorage
  const CACHE_KEY = 'translation-cache'
  const translationCache = ref(JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'))

  // Save cache when it changes
  watch(
    translationCache,
    (newCache) => {
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache))
    },
    { deep: true }
  )

  // Wrap translate function to use cache when offline
  function translateWithOfflineSupport(text, targetLang) {
    // If we're online, use the normal translation and cache the result
    if (isOnline.value) {
      try {
        const translated = translate(text, targetLang)

        // Cache the result
        if (!translationCache.value[targetLang]) {
          translationCache.value[targetLang] = {}
        }
        translationCache.value[targetLang][text] = translated

        return translated
      } catch (error) {
        console.error('Translation failed, trying cache', error)
        // Fall through to cache lookup
      }
    }

    // If we're offline or the translation failed, use the cache
    const cached = translationCache.value[targetLang]?.[text]
    if (cached) {
      return cached
    }

    // If not in cache, return the original text
    console.warn(`No cached translation for "${text}" in ${targetLang}`)
    return text
  }

  // Async version
  async function translateAsyncWithOfflineSupport(text, targetLang) {
    // If we're online, use the normal translation and cache the result
    if (isOnline.value) {
      try {
        const translated = await translateAsync(text, targetLang)

        // Cache the result
        if (!translationCache.value[targetLang]) {
          translationCache.value[targetLang] = {}
        }
        translationCache.value[targetLang][text] = translated

        return translated
      } catch (error) {
        console.error('Translation failed, trying cache', error)
        // Fall through to cache lookup
      }
    }

    // If we're offline or the translation failed, use the cache
    const cached = translationCache.value[targetLang]?.[text]
    if (cached) {
      return cached
    }

    // If not in cache, return the original text
    console.warn(`No cached translation for "${text}" in ${targetLang}`)
    return text
  }

  return {
    translate: translateWithOfflineSupport,
    translateAsync: translateAsyncWithOfflineSupport,
    currentLanguage,
    setLanguage,
    isOnline,
    clearCache: () => {
      translationCache.value = {}
      localStorage.removeItem(CACHE_KEY)
    },
    ...rest
  }
}
```

Then use it in your application:

```vue
<template>
  <div>
    <div v-if="!isOnline" class="offline-warning">
      <lt>You are currently offline. Using cached translations.</lt>
    </div>

    <p>{{ translate('Hello world!') }}</p>

    <button @click="clearCache">
      <lt>Clear Translation Cache</lt>
    </button>
  </div>
</template>

<script setup>
import { T } from 'vue-translator-sdk/components'
import { useOfflineTranslator } from './offlineTranslator'

const { translate, isOnline, clearCache } = useOfflineTranslator({
  translatorHost: 'https://your-translation-api.com'
})
</script>

<style scoped>
.offline-warning {
  background-color: #fff3cd;
  color: #856404;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  border: 1px solid #ffeeba;
}
</style>
```

## Next Steps

- Learn about [TypeScript Support](./typescript.md) for type-safe translations
- Check out [Backend Integration](./backend-integration.md) for setting up your translation service
- Explore the [Components](./components.md) for ready-to-use UI elements
