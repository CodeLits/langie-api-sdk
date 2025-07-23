# Vue.js Usage

Vue Translator SDK is designed specifically for Vue.js applications. This guide covers Vue-specific features and best practices.

## Quick Start

### Basic Setup

```vue
<template>
  <div>
    <h1>{{ l('Welcome to our application') }}</h1>
    <p>{{ lr('This text will be translated automatically') }}</p>
    <button @click="setLanguage('es')">Switch to Spanish</button>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { l, lr, setLanguage } = useLangie({
  apiKey: 'your-api-key',
  defaultLanguage: 'en'
})

// Example: translate from English to French
const translated = l('Hello', 'ui', 'en', 'fr')
const translatedReactive = lr('Hello', 'ui', 'en', 'fr')
</script>
```

## Composables

### useLangie

The main composable that provides all translation functionality:

```vue
<script setup>
import { useLangie } from 'langie-api-sdk'

const {
  // Core functionality
  availableLanguages,
  translations,
  uiTranslations,
  currentLanguage,
  isLoading,
  setLanguage,
  fetchLanguages,
  translatorHost,

  // Translation functions
  l,
  lr,
  fetchAndCacheBatch,

  // Utility functions
  cleanup,
  getBatchingStats
} = useLangie({
  apiKey: 'your-api-key',
  defaultLanguage: 'en'
})
</script>
```

### Translation Functions

#### `l()` - Synchronous Translation

```vue
<template>
  <div>
    <button @click="handleClick">{{ l('Submit') }}</button>
    <p>{{ l('Welcome', 'ui') }}</p>
    <p>{{ l('Article title', 'content') }}</p>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { l } = useLangie()

function handleClick() {
  // l() returns immediately - perfect for event handlers
  const submitText = l('Submit', 'ui')
  console.log(submitText) // Returns cached translation or "Submit"
}
</script>
```

#### `lr()` - Reactive Translation

```vue
<template>
  <div>
    <h1>{{ lr('Welcome to our application') }}</h1>
    <p>{{ lr('Please select your language') }}</p>
    <p>{{ lr('This will update automatically') }}</p>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { lr } = useLangie()

// lr() automatically updates when translations are cached
// Initially shows original text, then updates to translated text
</script>
```

## Components

### lt Component

The `lt` component provides a declarative way to translate text:

```vue
<template>
  <div>
    <h1><lt>Welcome to our application!</lt></h1>
    <p><lt>This text will be translated.</lt></p>
    <button><lt>Click me</lt></button>
  </div>
</template>

<script setup>
import { lt } from 'langie-api-sdk/components'
</script>
```

### LanguageSelect Components

```vue
<template>
  <div>
    <!-- Automatic language management -->
    <InterfaceLanguageSelect />

    <!-- Manual language selection -->
    <LanguageSelect :languages="availableLanguages" />
  </div>
</template>

<script setup>
import { LanguageSelect, InterfaceLanguageSelect } from 'langie-api-sdk/components'
import { useLangie } from 'langie-api-sdk'

const { availableLanguages } = useLangie()
</script>
```

## Global Configuration

### Plugin Installation

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import { useLangie } from 'langie-api-sdk'
import { lt, LanguageSelect, InterfaceLanguageSelect } from 'langie-api-sdk/components'

const app = createApp(App)

// Configure globally
const { install } = useLangie({
  apiKey: process.env.VUE_APP_TRANSLATOR_API_KEY,
  defaultLanguage: 'en'
})

// Install as a plugin
app.use(install)

// Register components globally
app.component('lt', lt)
app.component('LanguageSelect', LanguageSelect)
app.component('InterfaceLanguageSelect', InterfaceLanguageSelect)

app.mount('#app')
```

### Global Component Usage

After registering components globally, you can use them directly in templates:

```vue
<template>
  <div>
    <h1><lt>Welcome to our application!</lt></h1>
    <p><lt>This text will be translated automatically.</lt></p>
    <InterfaceLanguageSelect />
    <button @click="setLanguage('es')">Switch to Spanish</button>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { setLanguage } = useLangie()
</script>
```

### Environment Variables

```env
# .env
VUE_APP_TRANSLATOR_API_KEY=your-api-key
```

## Advanced Patterns

### Custom Translation Hook

```vue
<script setup>
import { computed } from 'vue'
import { useLangie } from 'langie-api-sdk'

// Custom hook for specific translation needs
function useTranslation() {
  const { l, lr, currentLanguage, setLanguage } = useLangie()

  const translate = (key, context = 'ui') => l(key, context)
  const translateReactive = (key, context = 'ui') => lr(key, context)

  const isEnglish = computed(() => currentLanguage.value === 'en')

  return {
    translate,
    translateReactive,
    currentLanguage,
    setLanguage,
    isEnglish
  }
}

// Usage
const { translate, translateReactive, currentLanguage, setLanguage } = useTranslation()
</script>
```

### Translation Provider Pattern

```vue
<!-- TranslationProvider.vue -->
<template>
  <slot />
</template>

<script setup>
import { provide } from 'vue'
import { useLangie } from 'langie-api-sdk'

const translator = useLangie({
  apiKey: 'your-api-key'
})

// Provide translator to child components
provide('translator', translator)
</script>
```

```vue
<!-- ChildComponent.vue -->
<template>
  <div>
    <h1>{{ translator.lr('Welcome') }}</h1>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const translator = inject('translator')
</script>
```

### Computed Translations

```vue
<template>
  <div>
    <h1>{{ welcomeMessage }}</h1>
    <p>{{ description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLangie } from 'langie-api-sdk'

const { lr, currentLanguage } = useLangie()

// Computed properties for translations
const welcomeMessage = computed(() => lr('Welcome to our application'))
const description = computed(() => lr('This is a description'))

// Dynamic computed translations
const getTranslatedText = (key) => computed(() => lr(key))
</script>
```

## Context and Caching

### Understanding Contexts

```vue
<script setup>
import { useLangie } from 'langie-api-sdk'

const { l, lr } = useLangie()

// UI context (buttons, labels, etc.) → uiTranslations cache
const buttonText = l('Submit', 'ui', 'en', 'es')
const labelText = lr('Username', 'ui', 'en', 'es')

// Content context (articles, descriptions, etc.) → translations cache
const articleTitle = l('Breaking News', 'article', 'en', 'fr')
const description = lr('Product description', 'content', 'en', 'fr')

// No context specified → defaults to 'ui' → uiTranslations cache
const defaultText = l('Hello') // Same as l('Hello', 'ui')
</script>
```

### Cache Management

```vue
<script setup>
import { useLangie } from 'langie-api-sdk'
import { watch } from 'vue'

const { translations, uiTranslations, cleanup, currentLanguage } = useLangie()

// Watch cache changes
watch(
  uiTranslations,
  (newCache) => {
    console.log('UI translations updated:', Object.keys(newCache))
  },
  { deep: true }
)

// Clear cache when language changes
watch(currentLanguage, () => {
  cleanup()
})

// Manual cache inspection
console.log('UI translations:', Object.keys(uiTranslations))
console.log('Content translations:', Object.keys(translations))
</script>
```

## Performance Optimization

### Lazy Loading

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// Lazy load translation components
const LanguageSelect = defineAsyncComponent(() =>
  import('langie-api-sdk/components').then((m) => ({ default: m.LanguageSelect }))
)

const lt = defineAsyncComponent(() =>
  import('langie-api-sdk/components').then((m) => ({ default: m.lt }))
)
</script>
```

### Batch Translation

```vue
<script setup>
import { useLangie } from 'langie-api-sdk'

const { fetchAndCacheBatch } = useLangie()

// Pre-load translations
async function preloadTranslations() {
  await fetchAndCacheBatch([
    { t: 'Welcome', ctx: 'ui' },
    { t: 'Submit', ctx: 'ui' },
    { t: 'Cancel', ctx: 'ui' },
    { t: 'Loading...', ctx: 'ui' }
  ])
}

// Call on app initialization
onMounted(() => {
  preloadTranslations()
})
</script>
```

## Error Handling

### Translation Error Handling

```vue
<script setup>
import { useLangie } from 'langie-api-sdk'
import { ref } from 'vue'

const { l, lr } = useLangie()
const translationError = ref(null)

// Wrapper functions with error handling
function safeTranslate(text, context = 'ui') {
  try {
    return l(text, context)
  } catch (error) {
    translationError.value = error
    console.error('Translation failed:', error)
    return text // Fallback to original text
  }
}

function safeTranslateReactive(text, context = 'ui') {
  try {
    return lr(text, context)
  } catch (error) {
    translationError.value = error
    console.error('Reactive translation failed:', error)
    return text // Fallback to original text
  }
}
</script>

<template>
  <div>
    <p v-if="translationError" class="error">Translation error: {{ translationError.message }}</p>
    <p>{{ safeTranslateReactive('Hello world') }}</p>
  </div>
</template>
```

## Testing

### Component Testing

```javascript
// Component test example
import { mount } from '@vue/test-utils'
import { useLangie } from 'langie-api-sdk'
import MyComponent from './MyComponent.vue'

// Mock the composable
vi.mock('langie-api-sdk', () => ({
  useLangie: () => ({
    l: vi.fn((text) => `translated_${text}`),
    lr: vi.fn((text) => `translated_${text}`),
    currentLanguage: { value: 'es' },
    setLanguage: vi.fn()
  })
}))

test('translates text correctly', () => {
  const wrapper = mount(MyComponent)
  expect(wrapper.text()).toContain('translated_Hello')
})
```

### Composable Testing

```javascript
// Composable test example
import { useLangie } from 'langie-api-sdk'
import { renderComposable } from '@vue/test-utils'

test('useLangie provides translation functions', () => {
  const { result } = renderComposable(() => useLangie())

  expect(result.l).toBeDefined()
  expect(result.lr).toBeDefined()
  expect(result.currentLanguage).toBeDefined()
})
```

## Best Practices

### 1. Use Appropriate Translation Functions

```vue
<script setup>
// ✅ Use l() for immediate needs (buttons, form submissions)
const buttonText = l('Submit', 'ui')

// ✅ Use lr() for reactive UI elements (labels, headings)
const headingText = lr('Welcome', 'ui')

// ✅ Use lt component for template translations
// <lt>Welcome</lt>
</script>
```

### 2. Organize Contexts

```vue
<script setup>
// ✅ Use consistent contexts
const uiTexts = {
  submit: l('Submit', 'ui'),
  cancel: l('Cancel', 'ui'),
  loading: l('Loading...', 'ui')
}

const contentTexts = {
  title: l('Article Title', 'content'),
  description: l('Article Description', 'content')
}
</script>
```

### 3. Handle Loading States

```vue
<template>
  <div>
    <div v-if="isLoading" class="loading">
      <lt>Loading translations...</lt>
    </div>
    <div v-else>
      <h1>{{ lr('Welcome') }}</h1>
    </div>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { isLoading, lr } = useLangie()
</script>
```

### 4. Optimize Bundle Size

```javascript
// ✅ Import only what you need
import { useLangie } from 'langie-api-sdk'
import { lt } from 'langie-api-sdk/components'

// ❌ Don't import everything
// import * from 'langie-api-sdk'
```

## Next Steps

- Check out [JavaScript Usage](./javascript.md) for vanilla JS integration
- Learn about [Nuxt.js Integration](./nuxt.md) for SSR applications
- Explore [Advanced Usage](./advanced-usage.md) for more complex scenarios
