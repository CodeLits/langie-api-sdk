# Langie API SDK

[![npm version](https://img.shields.io/npm/v/langie-api-sdk.svg?style=flat)](https://www.npmjs.com/package/langie-api-sdk)
[![Apache 2.0 License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

A lightweight, flexible translation SDK for Vue.js applications. Easily integrate multilingual support into your Vue projects with minimal configuration.

## 🚀 Live Demo

**[Try the live demo →](https://langie-demo.netlify.app/)**

Experience all features including:

- Language selection with flags and native names
- Real-time translation
- Search functionality with intelligent aliases
- Responsive design

## Features

- 🌍 **Language Detection** - Automatically detect user's preferred language
- 🔄 **Batch Translation** - Efficiently translate multiple texts in a single request
- 🧩 **Vue Components** - Ready-to-use Vue components for common translation needs
- 📦 **Lightweight** - Small footprint with no heavy dependencies
- 🔌 **Composable API** - Use the `useLangie` composable for reactive translations
- 🚀 **Flexible Backend** - Connect to any translation service with a compatible API
- ⚡ **SSR Compatible** - Works seamlessly with Nuxt.js and other SSR frameworks
- 🔍 **Enhanced UI** - Searchable language dropdowns with flag icons

## Installation

```bash
npm install langie-api-sdk
```

## Quick Start

### Basic Usage

```vue
<script setup>
import { useLangie } from 'langie-api-sdk'

const { translate, currentLanguage } = useLangie({
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
    <LanguageSelect />
    <lt>Welcome to our application!</lt>
  </div>
</template>
```

## API Reference

### Core Functions

#### `translateBatch(translations, options)`

```js
import { translateBatch } from 'langie-api-sdk'

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

```js
import { fetchAvailableLanguages } from 'langie-api-sdk'

const languages = await fetchAvailableLanguages({
  translatorHost: 'https://your-translator-api.com',
  minPopularity: 0.1, // Filter by minimum popularity
  country: 'US' // Optional country filter
})
```

### Composables

#### `useLangie(options)`

```js
const { translate, currentLanguage, setLanguage, availableLanguages, isLoading } = useLangie({
  translatorHost: 'https://your-translator-api.com',
  defaultLanguage: 'en'
})
```

### Components

#### `<LanguageSelect />`

```vue
<LanguageSelect :show-flags="true" :show-native-names="true" class="my-custom-class" />
```

#### `<lt>`

```vue
<lt>Hello world!</lt>
<lt>Hello {{ username }}!</lt>
<lt v-html="'<b>Bold</b> text'"></lt>
```

## Configuration

### Global Configuration

```js
import { createApp } from 'vue'
import { useLangie } from 'langie-api-sdk'

const { install } = useLangie({
  translatorHost: process.env.TRANSLATOR_HOST,
  apiKey: process.env.TRANSLATOR_API_KEY,
  defaultLanguage: 'en'
})

const app = createApp(App)
app.use(install)
app.mount('#app')
```

## Backend Requirements

Your translation service needs these endpoints:

- `POST /translate` - For translating text
- `GET /languages` - For fetching available languages

## Framework Compatibility

### ✅ Supported Frameworks

- **Vue.js 3.x** - Full Composition API support
- **Nuxt.js 3.x** - SSR/SSG compatible with automatic client-only rendering
- **Vite** - Optimized builds and HMR
- **TypeScript** - Full type definitions included

### SSR Support

Components automatically handle SSR environments:

```vue
<!-- Works in both SSR and client-only environments -->
<lt>Text to translate</lt>
```

Features:

- ✅ Safe server-side rendering without hydration mismatches
- ✅ Automatic `ClientOnly` wrapper in Nuxt environments
- ✅ Proper fallback rendering during SSR
- ✅ Dynamic imports and code splitting support

## License

[Apache 2.0](LICENSE)
