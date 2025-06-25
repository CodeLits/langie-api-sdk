# TypeScript Support

Vue Translator SDK is built with TypeScript and provides full type definitions for all its APIs. This guide explains how to use the SDK with TypeScript.

## Type Definitions

The SDK exports the following type definitions:

```typescript
// Core types for translation requests and responses
interface TranslateRequestBody {
  text: string
  from_lang?: string
  to_lang?: string
  context?: string
}

interface TranslateServiceResponse {
  text: string
  translated: string
  translations?: TranslateServiceResponse[]
  t?: string
}

// Language definition
interface TranslatorLanguage {
  code: string
  name: string
  native_name: string
  popularity?: number
  flag_country?: string[]
}

// Configuration options
interface TranslatorOptions {
  translatorHost?: string
  apiKey?: string
  defaultLanguage?: string
  fallbackLanguage?: string
  minPopularity?: number
  country?: string
  region?: string
}
```

## Importing Types

You can import these types in your TypeScript files:

```typescript
import type {
  TranslateRequestBody,
  TranslateServiceResponse,
  TranslatorLanguage,
  TranslatorOptions
} from 'vue-translator-sdk'
```

## Using Types with API Functions

The SDK's API functions are fully typed:

```typescript
import { translateBatch, fetchAvailableLanguages } from 'vue-translator-sdk'
import type { TranslateRequestBody, TranslatorOptions } from 'vue-translator-sdk'

// Type-safe function calls
async function translate() {
  const options: TranslatorOptions = {
    translatorHost: 'https://your-translation-api.com',
    apiKey: 'your-api-key'
  }

  const translations: TranslateRequestBody[] = [{ text: 'Hello', from_lang: 'en', to_lang: 'fr' }]

  const results = await translateBatch(translations, options)
  // results is typed as TranslateServiceResponse[]

  const languages = await fetchAvailableLanguages(options)
  // languages is typed as TranslatorLanguage[]
}
```

## Using Types with Composables

The `useTranslator` composable returns fully typed objects:

```typescript
import { ref } from 'vue'
import { useTranslator } from 'vue-translator-sdk'
import type { TranslatorOptions, TranslatorLanguage } from 'vue-translator-sdk'

// Typed options
const options: TranslatorOptions = {
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-api-key',
  defaultLanguage: 'en'
}

// All return values are properly typed
const {
  translate,
  translateAsync,
  currentLanguage,
  setLanguage,
  availableLanguages,
  isLoading,
  isLanguageSupported
} = useTranslator(options)

// Type checking works
const message = ref('Hello world!')
const translated = translate(message.value) // string
const isSupported = isLanguageSupported('fr') // boolean

// Type-safe language handling
function findLanguageByCode(code: string): TranslatorLanguage | undefined {
  return availableLanguages.value.find((lang) => lang.code === code)
}
```

## Typing Component Props

When creating custom components that use the SDK, you can leverage TypeScript for props:

```typescript
// CustomTranslator.vue
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { useTranslator } from 'vue-translator-sdk'
import type { TranslatorOptions } from 'vue-translator-sdk'

export default defineComponent({
  props: {
    text: {
      type: String,
      required: true
    },
    targetLang: {
      type: String,
      default: ''
    },
    options: {
      type: Object as PropType<TranslatorOptions>,
      default: () => ({})
    }
  },
  setup(props) {
    const { translate } = useTranslator(props.options)

    return {
      translatedText: computed(() =>
        translate(props.text, props.targetLang)
      )
    }
  }
})
</script>
```

Or with the script setup syntax:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useTranslator } from 'vue-translator-sdk'
import type { TranslatorOptions } from 'vue-translator-sdk'

const props = defineProps<{
  text: string
  targetLang?: string
  options?: TranslatorOptions
}>()

const { translate } = useTranslator(props.options || {})

const translatedText = computed(() => translate(props.text, props.targetLang))
</script>
```

## Typing Custom Extensions

When extending the SDK's functionality, you can create your own type definitions:

```typescript
// customTranslator.ts
import { useTranslator } from 'vue-translator-sdk'
import type { TranslatorOptions, TranslatorLanguage } from 'vue-translator-sdk'
import { ref, computed } from 'vue'

// Define custom return type
interface CustomTranslator {
  translate: (text: string, targetLang?: string) => string
  translateWithContext: (text: string, context: string, targetLang?: string) => string
  currentLanguage: Ref<string>
  setLanguage: (lang: string) => void
  availableLanguages: Ref<TranslatorLanguage[]>
  favoriteLanguages: Ref<TranslatorLanguage[]>
  addFavorite: (code: string) => void
  removeFavorite: (code: string) => void
}

export function useCustomTranslator(options?: TranslatorOptions): CustomTranslator {
  const base = useTranslator(options)

  // Add custom functionality
  const favoriteLanguageCodes = ref<string[]>([])

  const favoriteLanguages = computed(() =>
    base.availableLanguages.value.filter((lang) => favoriteLanguageCodes.value.includes(lang.code))
  )

  function translateWithContext(text: string, context: string, targetLang?: string): string {
    // Add context to translation
    return base.translate(`${context}: ${text}`, targetLang).replace(`${context}: `, '')
  }

  function addFavorite(code: string): void {
    if (!favoriteLanguageCodes.value.includes(code)) {
      favoriteLanguageCodes.value.push(code)
    }
  }

  function removeFavorite(code: string): void {
    const index = favoriteLanguageCodes.value.indexOf(code)
    if (index !== -1) {
      favoriteLanguageCodes.value.splice(index, 1)
    }
  }

  return {
    ...base,
    translateWithContext,
    favoriteLanguages,
    addFavorite,
    removeFavorite
  }
}
```

## Type-Safe Event Handling

When working with components that emit events, you can type the events:

```vue
<template>
  <LanguageSelect @change="handleLanguageChange" />
</template>

<script setup lang="ts">
import { LanguageSelect } from 'vue-translator-sdk/components'

function handleLanguageChange(langCode: string) {
  console.log(`Language changed to: ${langCode}`)
  // langCode is typed as string
}
</script>
```

## Type Augmentation

If you need to augment the SDK's types, you can do so using TypeScript's module augmentation:

```typescript
// typings.d.ts
import 'vue-translator-sdk'

declare module 'vue-translator-sdk' {
  interface TranslatorOptions {
    // Add your custom options
    customFeature?: boolean
    analyticsCallback?: (event: string, data: any) => void
  }

  interface TranslatorLanguage {
    // Add your custom properties
    isPopular?: boolean
    localName?: string
  }
}
```

## Generic Translations

For more complex scenarios, you can use generics:

```typescript
// typedTranslator.ts
import { useTranslator } from 'vue-translator-sdk'
import type { TranslatorOptions } from 'vue-translator-sdk'

// Define a type for translation keys
type TranslationKey = string

// Define a type for translation values
interface TranslationMap<K extends TranslationKey> {
  [key: string]: Record<K, string>
}

// Create a typed translator
export function createTypedTranslator<K extends TranslationKey>(
  translationMap: TranslationMap<K>,
  options?: TranslatorOptions
) {
  const { translate, currentLanguage, setLanguage, ...rest } = useTranslator(options)

  // Type-safe translate function
  function translateKey(key: K, targetLang?: string): string {
    const lang = targetLang || currentLanguage.value

    // Check if we have a static translation
    if (translationMap[lang]?.[key]) {
      return translationMap[lang][key]
    }

    // Fall back to dynamic translation
    return translate(key, targetLang)
  }

  return {
    translateKey,
    currentLanguage,
    setLanguage,
    ...rest
  }
}
```

Usage:

```typescript
// Define your translation keys
type AppTranslationKey = 'welcome' | 'login' | 'logout' | 'settings'

// Define your static translations
const translations: TranslationMap<AppTranslationKey> = {
  en: {
    welcome: 'Welcome',
    login: 'Log in',
    logout: 'Log out',
    settings: 'Settings'
  },
  fr: {
    welcome: 'Bienvenue',
    login: 'Connexion',
    logout: 'Déconnexion',
    settings: 'Paramètres'
  }
}

// Create a typed translator
const { translateKey } = createTypedTranslator<AppTranslationKey>(translations, {
  translatorHost: 'https://your-translation-api.com'
})

// Type-safe usage
const welcomeMessage = translateKey('welcome') // OK
const errorMessage = translateKey('error') // Type error: 'error' is not assignable to AppTranslationKey
```

## Next Steps

- Check out the [Components](./components.md) for ready-to-use UI elements
- Learn about [Backend Integration](./backend-integration.md) for setting up your translation service
- Explore [Advanced Usage](./advanced-usage.md) for more complex scenarios
