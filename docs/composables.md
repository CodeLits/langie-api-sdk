# Vue Composables

Vue Translator SDK provides a powerful composable function `useLangie` that makes it easy to integrate translation capabilities into your Vue components.

## useLangie

The `useLangie` composable provides reactive translation functionality for Vue components.

### Signature

```typescript
function useLangie(options?: TranslatorOptions): {
  // Core functionality
  availableLanguages: Ref<TranslatorLanguage[]>
  translations: Record<string, string>
  uiTranslations: Record<string, string>
  currentLanguage: Ref<string>
  isLoading: Ref<boolean>
  setLanguage: (lang: string) => void
  fetchLanguages: (opts?: { force?: boolean; country?: string }) => Promise<void>
  translatorHost: string

  // Translation functions
  l: (text: string, context?: string, originalLang?: string) => string
  lr: (text: string, context?: string, originalLang?: string) => string
  fetchAndCacheBatch: (
    items: { text: string; context?: string }[],
    fromLang?: string,
    toLang?: string,
    globalContext?: string
  ) => Promise<void>

  // Utility functions
  cleanup: () => void
  getBatchingStats: () => any
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

#### Core Functionality

- `availableLanguages`: A reactive reference to the list of available languages
- `translations`: A reactive object containing cached translations for non-UI contexts
- `uiTranslations`: A reactive object containing cached translations for UI contexts
- `currentLanguage`: A reactive reference to the current language code
- `isLoading`: A reactive reference indicating whether translations are loading
- `setLanguage`: A function to change the current language
- `fetchLanguages`: A function to fetch available languages from the API
- `translatorHost`: The configured translator host URL

#### Translation Functions

- `l`: A synchronous translation function that returns cached translations or queues for translation
- `lr`: A reactive translation function that automatically updates when translations become available
- `fetchAndCacheBatch`: A function to manually fetch and cache translations in batches

#### Utility Functions

- `cleanup`: A function to clear all cached translations and cleanup resources
- `getBatchingStats`: A function to get statistics about the batching system

### Basic Usage

```vue
<template>
  <div>
    <p>Current language: {{ currentLanguage }}</p>
    <p>{{ l('Hello world!') }}</p>
    <button @click="setLanguage('fr')">Switch to French</button>
    <button @click="setLanguage('es')">Switch to Spanish</button>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { l, currentLanguage, setLanguage } = useLangie({
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-api-key',
  defaultLanguage: 'en'
})
</script>
```

### Reactive Translation

For UI components that should automatically update when translations become available:

```vue
<template>
  <div>
    <p v-if="isLoading">Loading translations...</p>
    <p>{{ lr('Hello world!') }}</p>
    <p>{{ lr('Welcome to our application') }}</p>
    <button @click="setLanguage('fr')">Switch to French</button>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { lr, isLoading, setLanguage } = useLangie()

// lr() automatically updates when translations are cached
// It queues translations and returns the original text initially
// Then updates reactively when the translation arrives
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

    <p>{{ l('Hello world!') }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLangie } from 'langie-api-sdk'

const { l, currentLanguage, setLanguage, availableLanguages } = useLangie()

const selectedLanguage = computed({
  get: () => currentLanguage.value,
  set: (value) => setLanguage(value)
})
</script>
```

## Translation Functions

The SDK provides two main translation functions with different behaviors:

### `l()` - Synchronous Translation

The `l()` function provides immediate translation results:

```typescript
l(text: string, context?: string, originalLang?: string): string
```

- **Returns immediately**: Returns cached translation or original text
- **Queues for translation**: If not cached, queues the text for background translation
- **Use cases**: Buttons, form submissions, immediate feedback
- **Context handling**: Uses `uiTranslations` cache when context is `'ui'` or `undefined`

```vue
<template>
  <button @click="submitForm">{{ l('Submit') }}</button>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { l } = useLangie()

function submitForm() {
  // l() returns immediately - perfect for button clicks
  const submitText = l('Submit', 'ui')
  console.log(submitText) // Returns cached translation or "Submit"
}
</script>
```

### `lr()` - Reactive Translation

The `lr()` function provides reactive translations that update automatically:

```typescript
lr(text: string, context?: string, originalLang?: string): string
```

- **Reactive updates**: Automatically updates when translations become available
- **Perfect for UI**: Ideal for labels, headings, and static text
- **Context handling**: Uses `uiTranslations` cache when context is `'ui'` or `undefined`
- **Vue reactivity**: Creates reactive dependencies on translation caches

```vue
<template>
  <div>
    <h1>{{ lr('Welcome to our application') }}</h1>
    <p>{{ lr('Please select your language') }}</p>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { lr } = useLangie()

// lr() automatically updates when translations are cached
// Initially shows original text, then updates to translated text
</script>
```

### Context and Caching

Both functions use intelligent caching based on context:

- **UI Context** (`'ui'` or `undefined`): Uses `uiTranslations` cache
- **Other Contexts**: Uses `translations` cache
- **Cache Keys**: Format is `"text|context"` (e.g., `"Hello|ui"`)
- **Automatic Batching**: Multiple translations are batched for efficiency

```vue
<script setup>
import { useLangie } from 'langie-api-sdk'

const { l, lr } = useLangie()

// UI translations (buttons, labels, etc.)
const buttonText = l('Click me', 'ui')
const labelText = lr('Username', 'ui')

// Content translations (articles, descriptions, etc.)
const articleTitle = l('Breaking News', 'article')
const description = lr('Product description', 'content')
</script>
```

## Important Notes

### Translation Caching (v1.7.2+)

The SDK uses intelligent caching to improve performance and user experience:

- **Separate Caches**: UI translations (`uiTranslations`) and content translations (`translations`) are cached separately
- **Context-Aware**: Translations are cached based on their context to avoid conflicts
- **Automatic Updates**: UI components using `lr()` automatically update when translations are cached
- **Batching**: Multiple translation requests are batched for efficiency
- **Persistent Storage**: Translations are automatically saved to localStorage and restored between page reloads (v1.9.8+)

### Cache Selection Logic

The SDK automatically selects the appropriate cache based on context:

```typescript
// UI context (buttons, labels, etc.) → uiTranslations cache
l('Submit', 'ui') // Uses uiTranslations
lr('Username') // Uses uiTranslations (undefined context = 'ui')

// Content context (articles, etc.) → translations cache
l('Article title', 'article') // Uses translations
lr('Description', 'content') // Uses translations
```

### Troubleshooting

If translations aren't appearing in your UI:

1. **Check context**: Ensure you're using the same context when caching and retrieving
2. **Use `lr()` for UI**: Use `lr()` for reactive UI components that should update automatically
3. **Check cache contents**: You can inspect `uiTranslations` and `translations` objects for debugging
4. **Language changes**: Translations are cleared when the language changes
5. **Check localStorage**: Verify that translations are being saved to localStorage (v1.9.8+)
6. **Clear cache**: Use `cleanup()` to clear both memory and localStorage caches if needed

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
        return translator.l(text, 'ui')
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
