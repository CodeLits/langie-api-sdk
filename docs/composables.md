# Vue Composables

Vue Translator SDK provides a powerful composable function `useLangie` that makes it easy to integrate translation capabilities into your Vue components.

## useLangie

The `useLangie` composable provides reactive translation functionality for Vue components.

### Signature

```typescript
function useLangie(options?: TranslatorOptions): {
  translate: (text: string, targetLang?: string) => string
  translateAsync: (text: string, targetLang?: string) => Promise<string>
  currentLanguage: Ref<string>
  setLanguage: (lang: string) => void
  availableLanguages: Ref<TranslatorLanguage[]>
  isLoading: Ref<boolean>
  isLanguageSupported: (lang: string) => boolean
  install: (app: App) => void
}
```

### Parameters

- `options`: Configuration options (optional if already configured globally)
  ```typescript
  interface TranslatorOptions {
    translatorHost?: string
    apiKey?: string
    defaultLanguage?: string
    fallbackLanguage?: string
    minPopularity?: number
    country?: string
    region?: string
  }
  ```

### Returns

An object containing the following properties and methods:

- `translate`: A function that synchronously translates text using the current language
- `translateAsync`: A function that asynchronously translates text
- `currentLanguage`: A reactive reference to the current language code
- `setLanguage`: A function to change the current language
- `availableLanguages`: A reactive reference to the list of available languages
- `isLoading`: A reactive reference indicating whether translations are loading
- `isLanguageSupported`: A function to check if a language is supported
- `install`: A function to install the translator as a Vue plugin

### Basic Usage

```vue
<template>
  <div>
    <p>Current language: {{ currentLanguage }}</p>
    <p>{{ translate('Hello world!') }}</p>
    <button @click="setLanguage('fr')">Switch to French</button>
    <button @click="setLanguage('es')">Switch to Spanish</button>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { translate, currentLanguage, setLanguage } = useLangie({
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-api-key',
  defaultLanguage: 'en'
})
</script>
```

### Async Translation

For longer texts or when you need to handle loading states:

```vue
<template>
  <div>
    <p v-if="isLoading">Translating...</p>
    <p v-else>{{ translation }}</p>
    <button @click="translateText">Translate</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLangie } from 'langie-api-sdk'

const { translateAsync, isLoading } = useLangie()
const translation = ref('')

async function translateText() {
  translation.value = await translateAsync(
    'This is a longer text that might take some time to translate.',
    'fr'
  )
}
</script>
```

### Language Selection

Working with the available languages:

```vue
<template>
  <div>
    <select v-model="selectedLanguage">
      <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
        {{ lang.native_name }} ({{ lang.name }})
      </option>
    </select>

    <p>{{ translate('Hello world!') }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLangie } from 'langie-api-sdk'

const { translate, currentLanguage, setLanguage, availableLanguages } = useLangie()

const selectedLanguage = computed({
  get: () => currentLanguage.value,
  set: (value) => setLanguage(value)
})
</script>
```

## Global Configuration

You can configure the translator globally in your main.js/ts file:

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import { useLangie } from 'langie-api-sdk'

const app = createApp(App)

// Configure globally
const { install } = useLangie({
  translatorHost: process.env.TRANSLATOR_HOST,
  apiKey: process.env.TRANSLATOR_API_KEY,
  defaultLanguage: 'en',
  fallbackLanguage: 'en'
})

// Install as a plugin
app.use(install)

app.mount('#app')
```

Then use it in components without providing options:

```vue
<script setup>
import { useLangie } from 'langie-api-sdk'

// Uses global configuration
const { translate } = useLangie()
</script>
```

## Persistent Language Preference

You can persist the user's language preference in localStorage:

```js
import { useLangie } from 'langie-api-sdk'
import { watch } from 'vue'

const STORAGE_KEY = 'preferred-language'

// Get stored preference
const storedLanguage = localStorage.getItem(STORAGE_KEY)

// Initialize with stored preference
const { currentLanguage, setLanguage } = useLangie({
  defaultLanguage: storedLanguage || 'en'
})

// Save preference when it changes
watch(currentLanguage, (newLang) => {
  localStorage.setItem(STORAGE_KEY, newLang)
})
```

## Detecting Browser Language

The composable automatically detects the user's browser language, but you can customize this behavior:

```js
import { useLangie } from 'langie-api-sdk'

// Custom language detection function
function detectUserLanguage() {
  // Get browser language
  const browserLang = navigator.language.split('-')[0]

  // Check if it's in our supported list
  const supportedLanguages = ['en', 'fr', 'es', 'de', 'it']
  return supportedLanguages.includes(browserLang) ? browserLang : 'en'
}

// Use custom detection
const { translate } = useLangie({
  defaultLanguage: detectUserLanguage()
})
```

## Advanced Usage

### Combining with Other Composables

```vue
<script setup>
import { useLangie } from 'langie-api-sdk'
import { useRouter } from 'vue-router'

const router = useRouter()
const { translate, setLanguage } = useLangie()

// Change language and update route
function switchLanguage(lang) {
  setLanguage(lang)
  router.push({
    query: { ...router.currentRoute.value.query, lang }
  })
}
</script>
```

### Creating a Custom Provider

For more complex scenarios, you can create a custom provider:

```js
// translator-provider.js
import { provide, inject, reactive, readonly } from 'vue'
import { useLangie } from 'langie-api-sdk'

const TRANSLATOR_KEY = Symbol('translator')

export function provideTranslator(options) {
  const translator = useLangie(options)

  // Add custom functionality
  const enhancedTranslator = {
    ...translator,
    translateWithFallback: (text, targetLang, fallbackText) => {
      try {
        return translator.translate(text, targetLang)
      } catch (error) {
        console.error('Translation failed, using fallback', error)
        return fallbackText || text
      }
    }
  }

  provide(TRANSLATOR_KEY, readonly(enhancedTranslator))
  return enhancedTranslator
}

export function useLangieInjection() {
  const translator = inject(TRANSLATOR_KEY)
  if (!translator) {
    throw new Error('No translator provided. Did you call provideTranslator?')
  }
  return translator
}
```

Then use it in your components:

```vue
<!-- App.vue -->
<script setup>
import { provideTranslator } from './translator-provider'

provideTranslator({
  translatorHost: 'https://your-translation-api.com'
})
</script>

<!-- ChildComponent.vue -->
<script setup>
import { useLangieInjection } from './translator-provider'

const { translate, translateWithFallback } = useLangieInjection()
</script>
```

## Next Steps

- Check out the [Components](./components.md) for ready-to-use UI elements
- Learn about [TypeScript Support](./typescript.md) for type-safe translations
- Explore [Advanced Usage](./advanced-usage.md) for more complex scenarios
