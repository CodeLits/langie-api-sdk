# Langie API SDK

[![npm version](https://img.shields.io/npm/v/langie-api-sdk.svg?style=flat)](https://www.npmjs.com/package/langie-api-sdk)
[![Apache 2.0 License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

Lightweight translation SDK for Vue.js, Nuxt.js, and vanilla JavaScript applications with smart interface language selection and limit monitoring.

## 🚀 [Live Demo](https://langie-demo.netlify.app/)

## Installation

```bash
npm install langie-api-sdk
```

### Dependencies

The SDK uses the following external libraries:

- `countries-and-timezones` - For accurate timezone to country mapping (316KB, MIT license)
- `@vueform/multiselect` - For the language selection dropdown component

## Quick Start

### Basic Usage

```vue
<script setup>
import { useLangie } from 'langie-api-sdk'
import { lt } from 'langie-api-sdk/components'

const { lr, setLanguage } = useLangie()
</script>

<template>
  <h1>{{ lr('Welcome to our application') }}</h1>
  <lt>Hello world!</lt>
  <button @click="setLanguage('es')">Switch to Spanish</button>
</template>
```

### Global Component Registration

You can register the `lt` component globally for easier usage throughout your application:

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import { lt } from 'langie-api-sdk/components'

const app = createApp(App)

// Register lt component globally
app.component('lt', lt)

app.mount('#app')
```

Then use it directly in templates without importing:

```vue
<template>
  <div>
    <h1><lt>Welcome to our application!</lt></h1>
    <p><lt>This text will be translated automatically.</lt></p>
    <button><lt>Click me</lt></button>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { setLanguage } = useLangie()
</script>
```

## Documentation

- **[Getting Started](./docs/getting-started.md)** - Installation and basic setup
- **[Vue.js Usage](./docs/vue.md)** - Vue composables, components, and best practices
- **[Nuxt.js Integration](./docs/nuxt.md)** - SSR support, plugins, and deployment
- **[JavaScript Usage](./docs/javascript.md)** - Vanilla JS, React, and Node.js integration
- **[Components](./docs/components.md)** - Ready-to-use Vue components
- **[Composables](./docs/composables.md)** - Vue composables and reactive state
- **[Core API](./docs/core-api.md)** - Core translation functions
- **[Advanced Usage](./docs/advanced-usage.md)** - Complex patterns and optimization
- **[Backend Integration](./docs/backend-integration.md)** - API requirements and setup
- **[TypeScript Support](./docs/typescript.md)** - TypeScript integration guide
- **[Contributing](./docs/contributing.md)** - Development and contribution guidelines

## Required CSS

For `LanguageSelect` component:

```js
// main.js
import '@vueform/multiselect/themes/default.css'
import 'langie-api-sdk/dist/index.css'
```

## Features

- **Reactive translations** with automatic UI updates
- **SSR support** for Nuxt.js applications
- **Smart caching** with context-aware storage
- **Language detection** with browser locale support
- **Limit monitoring** with usage tracking
- **TypeScript support** with full type definitions
- **Multiple frameworks** - Vue.js, Nuxt.js, vanilla JavaScript

## Backend Requirements

Your translation service needs these endpoints:

- `POST /translate` - Translate texts
- `GET /languages` - Available languages
- `GET /limit` - API usage limits
- `GET /health` - Service health check

See [Backend Integration](./docs/backend-integration.md) for detailed API specifications and setup guide.

## License

[Apache 2.0](LICENSE)
