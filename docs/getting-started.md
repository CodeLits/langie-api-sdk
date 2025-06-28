# Getting Started

This guide will help you get started with Vue Translator SDK in your Vue.js application.

## 🚀 Live Demo

Before diving into the installation, you can try the live demo to see all features in action:

**[https://langie-demo.netlify.app/](https://langie-demo.netlify.app/)**

The demo showcases:

- Language selection with flags and native names
- Real-time translation using production API
- Search functionality with intelligent aliases
- Dark/light theme toggle
- Responsive design
- All 184+ supported languages

## Installation

```bash
# npm
npm install langie-api-sdk
```

## Basic Setup

### 1. Import and Initialize

```js
// main.js or main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { useLangie } from 'langie-api-sdk'

const app = createApp(App)

// Optional: Register globally
const { install } = useLangie({
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-api-key', // Optional
  defaultLanguage: 'en',
  fallbackLanguage: 'en'
})

app.use(install)
app.mount('#app')
```

### 2. Use in Components

```vue
<template>
  <div>
    <p>{{ translate('Hello world!') }}</p>
    <button @click="setLanguage('fr')">Switch to French</button>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { translate, setLanguage, currentLanguage } = useLangie()
</script>
```

## Using Components

### Import Components

```vue
<template>
  <div>
    <!-- Manual language selection (requires languages prop) -->
    <LanguageSelect :languages="languages" />

    <!-- Automatic interface language selection -->
    <InterfaceLanguageSelect />

    <!-- Text translation -->
    <lt>Welcome to our application!</lt>
  </div>
</template>

<script setup>
import { LanguageSelect, InterfaceLanguageSelect, lt } from 'langie-api-sdk/components'
</script>
```

### Interface Language Selection

For interface language selection, use the smart `InterfaceLanguageSelect` component:

```vue
<template>
  <div>
    <!-- Automatically handles everything -->
    <InterfaceLanguageSelect placeholder="Choose interface language" :is-dark="isDarkMode" />
  </div>
</template>

<script setup>
import { InterfaceLanguageSelect } from 'langie-api-sdk/components'
import { ref } from 'vue'

const isDarkMode = ref(false)
</script>
```

**Key Features:**

- ✅ Automatically fetches languages from your API
- ✅ Detects browser language on first load
- ✅ Persists selection in localStorage
- ✅ Excludes currently selected language from dropdown
- ✅ Integrates with global app state

## Configuration Options

When initializing the translator, you can provide several configuration options:

```js
const { translate } = useLangie({
  // Required: URL of your translation service
  translatorHost: 'https://your-translation-api.com',

  // Optional: API key for authentication
  apiKey: 'your-api-key',

  // Optional: Default language to use (defaults to browser language or 'en')
  defaultLanguage: 'en',

  // Optional: Fallback language if translation fails
  fallbackLanguage: 'en',

  // Optional: Minimum popularity threshold for languages
  minPopularity: 0.1,

  // Optional: Country filter for language list
  country: 'US',

  // Optional: Region filter for language list
  region: 'EU'
})
```

## Environment Variables

You can also configure the SDK using environment variables:

```
# .env file
TRANSLATOR_HOST=https://your-translation-api.com
TRANSLATOR_API_KEY=your-api-key
MIN_LANGUAGE_POPULARITY=0.1
```

## SSR and Nuxt.js Support

The SDK automatically detects and handles SSR environments:

```vue
<!-- In Nuxt.js - automatically uses ClientOnly -->
<template>
  <div>
    <lt>Welcome message</lt>
    <LanguageSelect />
  </div>
</template>

<script setup>
import { LanguageSelect, lt } from 'langie-api-sdk/components'
</script>
```

### Manual SSR Control

If you need manual control over SSR behavior:

```vue
<script setup>
import { isNuxtEnvironment, shouldUseClientOnly } from 'langie-api-sdk'

// Check if running in Nuxt
const isNuxt = isNuxtEnvironment()

// Check if component should be client-only
const useClientOnly = shouldUseClientOnly()
</script>
```

## Next Steps

- Learn about the [Core API](./core-api.md)
- Explore the [Vue Composables](./composables.md)
- Check out the [Components](./components.md)
- See [Advanced Usage](./advanced-usage.md) for more complex scenarios
