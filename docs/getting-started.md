# Getting Started

This guide will help you get started with Vue Translator SDK in your Vue.js application.

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
import { useTranslator } from 'langie-api-sdk'

const app = createApp(App)

// Optional: Register globally
const { install } = useTranslator({
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
import { useTranslator } from 'langie-api-sdk'

const { translate, setLanguage, currentLanguage } = useTranslator()
</script>
```

## Using Components

### Import Components

```vue
<template>
  <div>
    <LanguageSelect />
    <T>Welcome to our application!</T>
  </div>
</template>

<script setup>
import { LanguageSelect, T } from 'langie-api-sdk/components'
</script>
```

## Configuration Options

When initializing the translator, you can provide several configuration options:

```js
const { translate } = useTranslator({
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

## Next Steps

- Learn about the [Core API](./core-api.md)
- Explore the [Vue Composables](./composables.md)
- Check out the [Components](./components.md)
- See [Advanced Usage](./advanced-usage.md) for more complex scenarios
