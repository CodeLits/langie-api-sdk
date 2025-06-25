# Core API

Vue Translator SDK provides a set of core functions for translating text and managing languages. These functions can be used independently of Vue components.

## translateBatch

The `translateBatch` function is the core translation function that sends requests to your translation service.

### Signature

```typescript
async function translateBatch(
  translations: TranslateRequestBody[] = [],
  options: TranslatorOptions = {}
): Promise<TranslateServiceResponse[]>
```

### Parameters

- `translations`: An array of translation requests with the following structure:

  ```typescript
  interface TranslateRequestBody {
    text: string // The text to translate
    from_lang?: string // Source language code (optional)
    to_lang?: string // Target language code
    context?: string // Optional context for the translation
  }
  ```

- `options`: Configuration options with the following structure:
  ```typescript
  interface TranslatorOptions {
    translatorHost?: string // URL of the translation service
    apiKey?: string // API key for authentication
    defaultLanguage?: string // Default language
    fallbackLanguage?: string // Fallback language
    minPopularity?: number // Minimum popularity threshold
    country?: string // Country filter
    region?: string // Region filter
  }
  ```

### Returns

A Promise that resolves to an array of translation results:

```typescript
interface TranslateServiceResponse {
  text: string // Original text
  translated: string // Translated text
  translations?: TranslateServiceResponse[] // Nested translations
  t?: string // Legacy field for single translation
}
```

### Example

```javascript
import { translateBatch } from 'vue-translator-sdk'

// Translate multiple texts in a single request
const results = await translateBatch(
  [
    { text: 'Hello', from_lang: 'en', to_lang: 'fr' },
    { text: 'World', from_lang: 'en', to_lang: 'fr' }
  ],
  {
    translatorHost: 'https://your-translation-api.com',
    apiKey: 'your-api-key'
  }
)

console.log(results)
// [
//   { text: 'Hello', translated: 'Bonjour' },
//   { text: 'World', translated: 'Monde' }
// ]
```

## fetchAvailableLanguages

The `fetchAvailableLanguages` function retrieves a list of available languages from your translation service.

### Signature

```typescript
async function fetchAvailableLanguages(
  options: TranslatorOptions = {}
): Promise<TranslatorLanguage[]>
```

### Parameters

- `options`: Configuration options (same as for `translateBatch`)

### Returns

A Promise that resolves to an array of language objects:

```typescript
interface TranslatorLanguage {
  code: string // Language code (e.g., 'en', 'fr')
  name: string // Language name in English
  native_name: string // Language name in its native script
  popularity?: number // Popularity score
  flag_country?: string[] // Country codes for flags
}
```

### Example

```javascript
import { fetchAvailableLanguages } from 'vue-translator-sdk'

// Fetch available languages
const languages = await fetchAvailableLanguages({
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-api-key',
  minPopularity: 0.1,
  country: 'US'
})

console.log(languages)
// [
//   {
//     code: 'en',
//     name: 'English',
//     native_name: 'English',
//     popularity: 2882794269,
//     flag_country: ['us', 'gb', 'au', 'ca']
//   },
//   {
//     code: 'es',
//     name: 'Spanish',
//     native_name: 'Español',
//     popularity: 470121545,
//     flag_country: ['mx', 'es', 'ar', 'co']
//   },
//   ...
// ]
```

## Error Handling

The core functions throw errors when something goes wrong. You should wrap your calls in try/catch blocks to handle these errors:

```javascript
import { translateBatch } from 'vue-translator-sdk'

try {
  const results = await translateBatch([{ text: 'Hello', to_lang: 'fr' }])
  console.log(results)
} catch (error) {
  console.error('Translation failed:', error.message)
  // Handle the error appropriately
}
```

Common errors include:

- Network errors when the translation service is unavailable
- Authentication errors when the API key is invalid
- Timeout errors when the request takes too long
- Service errors when the translation service returns an error

## Advanced Usage

### Batch Processing

For large amounts of text, consider breaking them into smaller batches:

```javascript
import { translateBatch } from 'vue-translator-sdk'

// Helper function to chunk an array
function chunkArray(array, size) {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  )
}

// Translate a large array of texts
async function translateLarge(texts, targetLang, options) {
  const chunks = chunkArray(texts, 50) // Process 50 at a time
  const results = []

  for (const chunk of chunks) {
    const translations = chunk.map((text) => ({
      text,
      to_lang: targetLang
    }))

    const chunkResults = await translateBatch(translations, options)
    results.push(...chunkResults)
  }

  return results
}

// Usage
const largeTextArray = ['Text 1', 'Text 2' /* ... many more texts ... */]
const translations = await translateLarge(largeTextArray, 'fr', {
  translatorHost: 'https://your-translation-api.com'
})
```

### Caching

For better performance, you might want to implement a simple cache:

```javascript
import { translateBatch } from 'vue-translator-sdk'

// Simple in-memory cache
const translationCache = new Map()

async function translateWithCache(text, fromLang, toLang, options) {
  const cacheKey = `${text}|${fromLang}|${toLang}`

  // Check cache first
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)
  }

  // Not in cache, perform translation
  const [result] = await translateBatch([{ text, from_lang: fromLang, to_lang: toLang }], options)

  // Store in cache
  translationCache.set(cacheKey, result.translated)

  return result.translated
}
```

## Next Steps

- Learn about the [Vue Composables](./composables.md) for reactive translations
- Check out the [Components](./components.md) for ready-to-use UI elements
- Explore [Backend Integration](./backend-integration.md) for setting up your translation service
