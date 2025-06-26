# Langie API SDK

[![npm version](https://img.shields.io/npm/v/langie-api-sdk.svg?style=flat)](https://www.npmjs.com/package/langie-api-sdk)
[![Apache 2.0 License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

A lightweight, flexible translation SDK for Vue.js applications. Easily integrate multilingual support into your Vue projects with minimal configuration.

## 🚀 Live Demo

**[Try the live demo →](https://langie-demo.netlify.app/)**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/VivaProgress/langie-api-sdk)

Experience all features including:

- Language selection with flags and native names
- Real-time translation
- Search functionality with intelligent aliases
- Dark/light theme toggle
- Responsive design

## Features

- 🌍 **Language Detection** - Automatically detect user's preferred language
- 🔄 **Batch Translation** - Efficiently translate multiple texts in a single request
- 🧩 **Vue Components** - Ready-to-use Vue components for common translation needs
- 📦 **Lightweight** - Small footprint with no heavy dependencies
- 🔌 **Composable API** - Use the `useTranslator` composable for reactive translations
- 🚀 **Flexible Backend** - Connect to any translation service with a compatible API
- ⚡ **SSR Compatible** - Works seamlessly with Nuxt.js and other SSR frameworks
- 🔍 **Enhanced UI** - Searchable language dropdowns with flag icons using vue-select

## Installation

```bash
# npm
npm install langie-api-sdk

# yarn
yarn add langie-api-sdk

# pnpm
pnpm add langie-api-sdk

# bun
bun add langie-api-sdk
```

## Quick Start

### Basic Usage

```vue
<script setup>
import { useTranslator } from 'langie-api-sdk'

const { translate, currentLanguage, l } = useTranslator({
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-api-key' // Optional
})
</script>

<template>
  <div>
    <p>Current language: {{ currentLanguage }}</p>
    <p>{{ translate('Hello world!') }}</p>
  </div>
</template>
```

### Using Components

```vue
<script setup>
import { LanguageSelect, lt } from 'langie-api-sdk/components'
</script>

<template>
  <div>
    <!-- Language selector dropdown -->
    <LanguageSelect />

    <!-- Translate text -->
    <lt>Welcome to our application!</lt>
  </div>
</template>
```

## API Reference

### Core Functions

#### `translateBatch(translations, options)`

Translates multiple texts in a single request.

```js
import { translateBatch } from 'langie-api-sdk'

// Example usage
const results = await translateBatch(
  [
    { text: 'Hello', from_lang: 'en', to_lang: 'fr' },
    { text: 'World', from_lang: 'en', to_lang: 'fr' }
  ],
  {
    translatorHost: 'https://your-translator-api.com',
    apiKey: 'optional-api-key'
  }
)
```

#### `fetchAvailableLanguages(options)`

Fetches available languages from the translation service.

```js
import { fetchAvailableLanguages } from 'langie-api-sdk'

// Example usage
const languages = await fetchAvailableLanguages({
  translatorHost: 'https://your-translator-api.com',
  apiKey: 'optional-api-key',
  minPopularity: 0.1, // Filter by minimum popularity
  country: 'US', // Optional country filter
  region: 'EU' // Optional region filter
})
```

### Composables

#### `useTranslator(options)`

Vue composable for reactive translations.

```js
const { translate, currentLanguage, setLanguage, availableLanguages, isLoading } = useTranslator({
  translatorHost: 'https://your-translator-api.com',
  apiKey: 'optional-api-key',
  defaultLanguage: 'en',
  fallbackLanguage: 'en'
})
```

### Components

#### `<LanguageSelect />`

A dropdown component for selecting languages.

```vue
<LanguageSelect :show-flags="true" :show-native-names="true" class="my-custom-class" />
```

#### `<lt>`

A component for translating text.

```vue
<lt>Hello world!</lt>

<!-- With dynamic content -->
<lt>Hello {{ username }}!</lt>

<!-- With HTML -->
<lt v-html="'<b>Bold</b> text'"></lt>
```

## Backend API Requirements

To use this SDK, you need a translation service with the following API endpoints:

- `POST /api/translate` - For translating text
- `GET /api/languages` - For fetching available languages

See the [API Documentation](https://github.com/langer/langie-api-sdk/wiki/API-Documentation) for detailed API requirements.

## Configuration

You can configure the SDK globally or per-instance:

```js
// In your main.js
import { createApp } from 'vue'
import App from './App.vue'
import { useTranslator } from 'langie-api-sdk'

// Global configuration
const { install } = useTranslator({
  translatorHost: process.env.TRANSLATOR_HOST,
  apiKey: process.env.TRANSLATOR_API_KEY,
  defaultLanguage: 'en',
  fallbackLanguage: 'en'
})

const app = createApp(App)
app.use(install)
app.mount('#app')
```

## Framework Compatibility

### ✅ Tested and Working

- **Vue.js 3.x** - Full support with Composition API
- **Nuxt.js 3.x** - SSR/SSG compatible with automatic client-only rendering
- **Vite** - Optimized builds and hot module replacement
- **TypeScript** - Full type definitions included

### SSR Support

The SDK automatically detects SSR environments (like Nuxt) and handles hydration properly:

```vue
<!-- Automatically wraps in ClientOnly for Nuxt -->
<lt>Text to translate</lt>

<!-- Works normally in client-only Vue apps -->
<lt>Another text</lt>
```

The components will:

- ✅ Render server-side safely without hydration mismatches
- ✅ Automatically use `ClientOnly` wrapper in Nuxt environments
- ✅ Provide fallback rendering during server-side rendering
- ✅ Handle dynamic imports and code splitting properly

## License

[Apache 2.0](LICENSE)
