# Langie API SDK

[![npm version](https://img.shields.io/npm/v/langie-api-sdk.svg?style=flat)](https://www.npmjs.com/package/langie-api-sdk)
[![Apache 2.0 License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

Lightweight translation SDK for Vue.js applications.

## 🚀 [Live Demo](https://langie-demo.netlify.app/)

## Installation

```bash
npm install langie-api-sdk
```

## Quick Start

### Basic Translation Component

```vue
<script setup>
import { lt } from 'langie-api-sdk/components'
</script>

<template>
  <lt>Hello world!</lt>
  <lt>Welcome {{ username }}!</lt>
</template>
```

### Language Selection

```vue
<script setup>
import { LanguageSelect, InterfaceLanguageSelect } from 'langie-api-sdk/components'
import '@vueform/multiselect/themes/default.css'
import 'langie-api-sdk/dist/index.css'
</script>

<template>
  <!-- Manual language selection -->
  <LanguageSelect v-model="selectedLang" :languages="languages" />

  <!-- Automatic interface language selection -->
  <InterfaceLanguageSelect />
</template>
```

### Translation Function

```vue
<script setup>
import { useLangie } from 'langie-api-sdk'

const { translate, setLanguage } = useLangie({
  translatorHost: 'https://your-api.com'
})
</script>

<template>
  <p>{{ translate('Hello world!') }}</p>
</template>
```

## Required CSS

For `LanguageSelect` component:

```js
// main.js
import '@vueform/multiselect/themes/default.css'
import 'langie-api-sdk/dist/index.css'
```

## API

### Components

- `<lt>` - Translate text inline
- `<LanguageSelect>` - Language dropdown with flags
- `<InterfaceLanguageSelect>` - Automatic interface language selection with API integration
- `<SimpleLanguageSelect>` - Basic HTML select (no dependencies)

### Composables

- `useLangie(options)` - Main translation composable

### Functions

- `translateBatch(texts, options)` - Batch translation
- `fetchAvailableLanguages(options)` - Get available languages

## Backend Requirements

Your translation service needs:

- `POST /translate` - Translate texts
- `GET /languages` - Available languages
- `GET /limit` - API usage limits (returns `{"type":"anonymous","used":0,"limit":100}`)

## User Types & Request Flow

The SDK supports different user types with different request flows:

### Anonymous Users

- **Chain**: `frontend → api`
- **Type**: `anonymous`
- **Usage**: Limited (typically 100 requests)

### Registered & Pro Users

- **Chain**: `frontend → backend → api`
- **Type**: `user`
- **Usage**: Higher limits (varies by plan)
- **Authentication**: Requires API key

The request chain is automatically determined based on your authentication setup. For registered users, you need to provide an API key in your configuration.

**Get your API key**: [https://api.langie.uk/](https://api.langie.uk/)

## License

[Apache 2.0](LICENSE)
