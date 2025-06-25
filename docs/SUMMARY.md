# Vue Translator SDK Documentation Summary

## Overview

Vue Translator SDK is a comprehensive solution for adding translation capabilities to Vue.js applications. The SDK provides a simple yet powerful API for translating text, managing language preferences, and rendering translated content.

## Documentation Structure

The documentation is organized into the following sections:

1. **[Getting Started](./getting-started.md)** - Installation and basic setup
2. **[Core API](./core-api.md)** - Core translation functions
3. **[Vue Composables](./composables.md)** - Vue composable for reactive translations
4. **[Components](./components.md)** - Ready-to-use Vue components
5. **[Advanced Usage](./advanced-usage.md)** - Advanced patterns and techniques
6. **[Backend Integration](./backend-integration.md)** - Setting up a translation service
7. **[TypeScript Support](./typescript.md)** - Using the SDK with TypeScript

## Key Features

- **Easy Integration**: Works seamlessly with Vue 3 applications
- **Flexible Backend**: Connect to any translation service with a compatible API
- **Vue Components**: Ready-to-use components for common translation needs
- **TypeScript Support**: Full type definitions for all APIs
- **SSR Compatible**: Works with server-side rendering frameworks like Nuxt.js
- **Lightweight**: Small footprint with minimal dependencies

## Quick Start

```bash
# Install the package
npm install vue-translator-sdk

# Import and use
import { useTranslator } from 'vue-translator-sdk'
import { LanguageSelect, T } from 'vue-translator-sdk/components'

// Use in components
const { translate } = useTranslator({
  translatorHost: 'https://your-translation-api.com'
})
```

## API Overview

- **Core Functions**:

  - `translateBatch()` - Translate multiple texts in a batch
  - `fetchAvailableLanguages()` - Get available languages

- **Composables**:

  - `useTranslator()` - Vue composable for reactive translations

- **Components**:
  - `<LanguageSelect />` - Language selection dropdown
  - `<T>` - Translation component

## Contributing

We welcome contributions to the Vue Translator SDK! Please see the [Contributing Guide](../CONTRIBUTING.md) for more information.

## License

Vue Translator SDK is licensed under the [MIT License](../LICENSE).
