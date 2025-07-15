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
    t: string // The text to translate
    from?: string // Source language code (optional)
    to?: string // Target language code
    ctx?: string // Context for translation
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
import { translateBatch } from 'langie-api-sdk'

// Translate multiple texts in a single request
const results = await translateBatch(
  [
    { t: 'Hello', from: 'en', to: 'fr' },
    { t: 'World', from: 'en', to: 'fr' }
  ],
  {
    translatorHost: 'https://your-translation-api.com',
    apiKey: 'your-api-key'
  }
)

console.log(results)
// [
//   { t: 'Hello', t: 'Bonjour' },
//   { t: 'World', t: 'Monde' }
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
import { fetchAvailableLanguages } from 'langie-api-sdk'

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
import { translateBatch } from 'langie-api-sdk'

try {
  const results = await translateBatch([{ t: 'Hello', to: 'fr' }])
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

## Caching

The SDK automatically caches translations and language lists to improve performance and reduce API calls:

### Translation Caching

- **Memory Cache**: Translations are cached in memory during the session
- **Persistent Cache**: Translations are saved to localStorage with TTL (7 days) and persist between page reloads
- **Language-Specific**: Each language has its own cache, so switching languages loads the correct cached translations
- **Size Limits**: Cache is automatically managed to prevent localStorage overflow (max 2MB, 1000 items)

### Language List Caching

- **Persistent Cache**: The list of available languages is cached in localStorage with TTL (7 days)
- **Automatic Loading**: Cached languages are loaded on initialization, avoiding unnecessary API calls
- **Cache Preservation**: Language cache is preserved when clearing translation cache

### Cache Management

```javascript
import { clearTranslations, getCacheStats, clearCache } from 'langie-api-sdk'

// Clear only translation cache (preserves language cache)
clearTranslations()

// Get cache statistics
const stats = getCacheStats()
console.log(`Cache size: ${stats.size} bytes, Items: ${stats.items}`)

// Clear all langie cache
clearCache()

// Clear specific cache items
clearCache('translations_cache')
```

### Cache Configuration

The SDK uses intelligent cache management with the following defaults:

- **TTL (Time To Live)**:
  - Translations: 7 days
  - Languages: 7 days
- **Size Limits**:
  - Maximum cache size: 2MB
  - Maximum items: 1000
- **Automatic Cleanup**: Expired items are automatically removed
- **LRU Eviction**: Oldest items are removed when limits are exceeded

## Advanced Usage

### Batch Processing

For large amounts of text, consider breaking them into smaller batches:

```javascript
import { translateBatch } from 'langie-api-sdk'

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
      t: text,
      to: targetLang
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
import { translateBatch } from 'langie-api-sdk'

// Simple in-memory cache
const translationCache = new Map()

async function translateWithCache(text, fromLang, toLang, options) {
  const cacheKey = `${text}|${fromLang}|${toLang}`

  // Check cache first
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)
  }

  // Not in cache, perform translation
  const [result] = await translateBatch([{ t: text, from: fromLang, to: toLang }], options)

  // Store in cache
  translationCache.set(cacheKey, result.t)

  return result.t
}
```

## Next Steps

- Learn about the [Vue Composables](./composables.md) for reactive translations
- Check out the [Components](./components.md) for ready-to-use UI elements
- Explore [Backend Integration](./backend-integration.md) for setting up your translation service
