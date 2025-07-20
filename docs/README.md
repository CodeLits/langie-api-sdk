# Langie API SDK Documentation

Welcome to the Langie API SDK documentation! This guide will help you integrate powerful translation capabilities into your applications.

## 🚀 Quick Start

- **[Getting Started](./getting-started.md)** - Installation and basic setup
- **[Live Demo](https://langie-demo.netlify.app/)** - See it in action
- **[Table of Contents](./TOC.md)** - Complete documentation index

## 📚 Core Documentation

### Framework Guides

- **[Vue.js Usage](./vue.md)** - Vue composables, components, and best practices
- **[Nuxt.js Integration](./nuxt.md)** - SSR support, plugins, and deployment
- **[JavaScript Usage](./javascript.md)** - Vanilla JS, React, and Node.js integration

### API Reference

- **[Components](./components.md)** - Ready-to-use Vue components
- **[Composables](./composables.md)** - Vue composables and reactive state
- **[Core API](./core-api.md)** - Core translation functions

### Advanced Topics

- **[Advanced Usage](./advanced-usage.md)** - Complex patterns and optimization
- **[Best Practices](./best-practices.md)** - Performance, security, and testing guidelines
- **[TypeScript Support](./typescript.md)** - TypeScript integration guide
- **[Backend Integration](./backend-integration.md)** - API requirements and setup

## 🛠️ Development

- **[Contributing](./contributing.md)** - Development and contribution guidelines
- **[Compatibility Guide](../COMPATIBILITY.md)** - Version requirements and compatibility

## 📖 Learning Path

### For Beginners

1. **[Getting Started](./getting-started.md)** - Basic installation and setup
2. **[Vue.js Usage](./vue.md)** - Learn the core concepts
3. **[Components](./components.md)** - Use ready-made components

### For Intermediate Users

1. **[Advanced Usage](./advanced-usage.md)** - Optimize performance
2. **[TypeScript Support](./typescript.md)** - Add type safety
3. **[Backend Integration](./backend-integration.md)** - Set up your API

### For Advanced Users

1. **[Core API](./core-api.md)** - Direct API usage
2. **[Nuxt.js Integration](./nuxt.md)** - SSR and deployment
3. **[Contributing](./contributing.md)** - Help improve the SDK

## 🎯 Key Features

### Translation Functions

- **`l()`** - Synchronous translation (immediate return)
- **`lr()`** - Reactive translation (auto-updates)
- **`lt` component** - Template-based translation

### Language Selection

- **`LanguageSelect`** - Manual language selection
- **`InterfaceLanguageSelect`** - Smart interface language detection
- **`SimpleLanguageSelect`** - Minimal language picker

### Advanced Features

- **Batching** - Efficient API calls
- **Caching** - Persistent translation storage
- **SSR Support** - Server-side rendering
- **TypeScript** - Full type definitions

## 🔧 Requirements

- Node.js 18.0.0 or higher
- Vue 3.2.0 or higher
- Nuxt 3.0.0 or higher (optional)
- Modern browser with ES2020+ support

## 📦 Installation

```bash
# npm
npm install langie-api-sdk

# pnpm
pnpm add langie-api-sdk

# yarn
yarn add langie-api-sdk
```

## 🚀 Basic Example

```vue
<template>
  <div>
    <h1>{{ lr('Welcome to our application') }}</h1>
    <lt>This text will be translated automatically</lt>
    <button @click="setLanguage('es')">Switch to Spanish</button>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'
import { lt } from 'langie-api-sdk/components'

const { lr, setLanguage } = useLangie()
</script>
```

## 📞 Support

- **Documentation**: Check the guides above
- **Examples**: See [examples](../examples/) directory
- **Issues**: [GitHub Issues](https://github.com/VivaProgress/langie-api-sdk/issues)
- **Demo**: [Live Demo](https://langie-demo.netlify.app/)

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](../LICENSE) file for details.
