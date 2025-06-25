# Migration Guide

This guide will help you migrate from `@langer/translator-sdk` to the new open-source `vue-translator-sdk`.

## Installation

Replace the old package with the new one:

```bash
# npm
npm uninstall @langer/translator-sdk
npm install vue-translator-sdk

# yarn
yarn remove @langer/translator-sdk
yarn add vue-translator-sdk

# pnpm
pnpm remove @langer/translator-sdk
pnpm add vue-translator-sdk

# bun
bun remove @langer/translator-sdk
bun add vue-translator-sdk
```

## Import Path Changes

### Before

```js
import { useTranslator } from '@langer/translator-sdk'
import { LanguageSelect, T } from '@langer/translator-sdk'
```

### After

```js
import { useTranslator } from 'vue-translator-sdk'
import { LanguageSelect, T } from 'vue-translator-sdk/components'
```

## API Changes

### Configuration Options

The configuration options have been standardized:

```js
// Before
const { translate } = useTranslator({
  translatorHost: process.env.TRANSLATOR_HOST,
  apiKey: process.env.TRANSLATOR_API_KEY
})

// After - more explicit options available
const { translate } = useTranslator({
  translatorHost: process.env.TRANSLATOR_HOST,
  apiKey: process.env.TRANSLATOR_API_KEY,
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  minPopularity: 0.1,
  country: 'US',
  region: 'EU'
})
```

### SSR Support

The new package has improved SSR support:

```js
// Before
// You had to handle SSR manually

// After
import { LanguageSelectSSR, TSSR } from 'vue-translator-sdk/components'

// Use these components for SSR
```

## Breaking Changes

1. The `translateBatch` function now returns a Promise with properly typed results.
2. The `fetchAvailableLanguages` function has standardized options.
3. Component props have been standardized across all components.

## New Features

1. Improved TypeScript support with full type definitions.
2. Better error handling and logging.
3. Vue plugin support for global configuration.
4. Improved SSR support.

## Example Migration

### Before

```vue
<template>
  <div>
    <LanguageSelect />
    <p>{{ translate('Hello world!') }}</p>
  </div>
</template>

<script>
import { useTranslator, LanguageSelect } from '@langer/translator-sdk'

export default {
  components: { LanguageSelect },
  setup() {
    const { translate } = useTranslator()
    return { translate }
  }
}
</script>
```

### After

```vue
<template>
  <div>
    <LanguageSelect />
    <p>{{ translate('Hello world!') }}</p>
  </div>
</template>

<script setup>
import { useTranslator } from 'vue-translator-sdk'
import { LanguageSelect } from 'vue-translator-sdk/components'

const { translate } = useTranslator()
</script>
```
