# Backend Integration

Vue Translator SDK is designed to work with any translation service that provides a compatible API. This guide explains how to integrate with various backend services.

## API Requirements

The SDK expects the following API endpoints:

### Translation Endpoint

```
POST /api/translate
```

**Request Body:**

```json
{
  "translations": [
    {
      "t": "Hello world",
      "ctx": "ui"
    }
  ],
  "from": "en",
  "to": "fr"
}
```

**Response Body:**

```json
{
  "translations": [
    {
      "t": "Hello world",
      "ctx": "ui"
    }
  ],
  "from": "en",
  "to": "fr"
}
```

### Languages Endpoint

```
GET /api/languages
```

**Response Body:**

```json
[
  {
    "code": "en",
    "name": "English",
    "native_name": "English",
    "popularity": 2882794269,
    "flag_country": ["us", "gb", "au", "ca"]
  },
  {
    "code": "fr",
    "name": "French",
    "native_name": "Français",
    "popularity": 511001905,
    "flag_country": ["fr", "ca", "be", "ch"]
  }
]
```

## Integration Examples

### Express.js Backend

Here's an example of a simple Express.js backend that implements the required API endpoints:

```javascript
const express = require('express')
const cors = require('cors')
const app = express()
const port = 8081

// Sample language data
const languages = [
  {
    code: 'en',
    name: 'English',
    native_name: 'English',
    popularity: 2882794269,
    flag_country: ['us', 'gb', 'au', 'ca']
  },
  {
    code: 'fr',
    name: 'French',
    native_name: 'Français',
    popularity: 511001905,
    flag_country: ['fr', 'ca', 'be', 'ch']
  },
  {
    code: 'es',
    name: 'Spanish',
    native_name: 'Español',
    popularity: 470121545,
    flag_country: ['mx', 'es', 'ar', 'co']
  }
]

// Simple translation function (replace with your actual translation service)
function translateText(text, fromLang, toLang) {
  if (fromLang === toLang) return text

  // This is just a mock - replace with actual translation logic
  const translations = {
    'en-fr': {
      Hello: 'Bonjour',
      World: 'Monde',
      'How are you?': 'Comment allez-vous ?'
    },
    'en-es': {
      Hello: 'Hola',
      World: 'Mundo',
      'How are you?': '¿Cómo estás?'
    }
  }

  const key = `${fromLang}-${toLang}`
  return translations[key]?.[text] || `[${toLang}] ${text}`
}

app.use(cors())
app.use(express.json())

// Languages endpoint
app.get('/api/languages', (req, res) => {
  // Optional filtering by country
  const { country } = req.query
  let filteredLanguages = languages

  if (country) {
    filteredLanguages = languages.filter((lang) =>
      lang.flag_country.includes(country.toLowerCase())
    )
  }

  res.json(filteredLanguages)
})

// Translation endpoint
app.post('/api/translate', (req, res) => {
  const { translations } = req.body

  if (!translations || !Array.isArray(translations)) {
    return res.status(400).json({ error: 'Invalid request format' })
  }

  const results = translations.map((item) => {
    const { t, from = 'en', to } = item

    return {
      t,
      translated: translateText(t, from, to)
    }
  })

  res.json({ translations: results })
})

app.listen(port, () => {
  console.log(`Translation service running at http://localhost:${port}`)
})
```

### Using Third-Party Translation Services

#### Google Cloud Translation

```javascript
const express = require('express')
const cors = require('cors')
const { TranslationServiceClient } = require('@google-cloud/translate')
const app = express()
const port = 8081

// Initialize Google Cloud Translation
const translationClient = new TranslationServiceClient()
const projectId = 'your-google-cloud-project-id'
const location = 'global'

app.use(cors())
app.use(express.json())

// Languages endpoint
app.get('/api/languages', async (req, res) => {
  try {
    const [response] = await translationClient.getSupportedLanguages({
      parent: `projects/${projectId}/locations/${location}`
    })

    const languages = response.languages.map((lang) => ({
      code: lang.languageCode,
      name: lang.displayName,
      native_name: lang.displayName, // Google doesn't provide native names
      popularity: 1 // Set a default popularity
    }))

    res.json(languages)
  } catch (error) {
    console.error('Error fetching languages:', error)
    res.status(500).json({ error: 'Failed to fetch languages' })
  }
})

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  const { translations } = req.body

  if (!translations || !Array.isArray(translations)) {
    return res.status(400).json({ error: 'Invalid request format' })
  }

  try {
    const results = await Promise.all(
      translations.map(async (item) => {
        const { t, to } = item

        const [response] = await translationClient.translateText({
          parent: `projects/${projectId}/locations/${location}`,
          contents: [t],
          mimeType: 'text/plain',
          targetLanguageCode: to
        })

        return {
          t,
          translated: response.translations[0].t
        }
      })
    )

    res.json({ translations: results })
  } catch (error) {
    console.error('Error translating text:', error)
    res.status(500).json({ error: 'Translation failed' })
  }
})

app.listen(port, () => {
  console.log(`Translation service running at http://localhost:${port}`)
})
```

#### DeepL API

```javascript
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const app = express()
const port = 8081

const DEEPL_API_KEY = 'your-deepl-api-key'
const DEEPL_API_URL = 'https://api-free.deepl.com/v2' // or https://api.deepl.com/v2 for Pro

app.use(cors())
app.use(express.json())

// Languages endpoint
app.get('/api/languages', async (req, res) => {
  try {
    const response = await axios.get(`${DEEPL_API_URL}/languages`, {
      params: { type: 'target' },
      headers: { Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}` }
    })

    const languages = response.data.map((lang) => ({
      code: lang.language.toLowerCase(),
      name: lang.name,
      native_name: lang.name, // DeepL doesn't provide native names
      popularity: 1 // Set a default popularity
    }))

    res.json(languages)
  } catch (error) {
    console.error('Error fetching languages:', error)
    res.status(500).json({ error: 'Failed to fetch languages' })
  }
})

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  const { translations } = req.body

  if (!translations || !Array.isArray(translations)) {
    return res.status(400).json({ error: 'Invalid request format' })
  }

  try {
    const results = await Promise.all(
      translations.map(async (item) => {
        const { t, to } = item

        const response = await axios.post(
          `${DEEPL_API_URL}/translate`,
          {
            text: [t],
            target_lang: to.toUpperCase()
          },
          {
            headers: { Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}` }
          }
        )

        return {
          t,
          translated: response.data.translations[0].t
        }
      })
    )

    res.json({ translations: results })
  } catch (error) {
    console.error('Error translating text:', error)
    res.status(500).json({ error: 'Translation failed' })
  }
})

app.listen(port, () => {
  console.log(`Translation service running at http://localhost:${port}`)
})
```

## Authentication

The SDK supports authentication using API keys. You can configure this in your backend:

```javascript
// Middleware to check API key
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '')

  if (!apiKey || apiKey !== 'your-secret-api-key') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  next()
}

// Apply to protected routes
app.get('/api/languages', validateApiKey, (req, res) => {
  // ...
})

app.post('/api/translate', validateApiKey, (req, res) => {
  // ...
})
```

Then configure the SDK to include the API key:

```javascript
import { useLangie } from 'langie-api-sdk'

const { translate } = useLangie({
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-secret-api-key'
})
```

## Rate Limiting

To protect your translation service from abuse, consider implementing rate limiting:

```javascript
const rateLimit = require('express-rate-limit')

// Create a rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
})

// Apply to translation endpoint
app.post('/api/translate', apiLimiter, (req, res) => {
  // ...
})
```

## Caching

Implement caching to improve performance and reduce API calls:

```javascript
const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 3600 }) // Cache for 1 hour

// Translation endpoint with caching
app.post('/api/translate', (req, res) => {
  const { translations } = req.body

  if (!translations || !Array.isArray(translations)) {
    return res.status(400).json({ error: 'Invalid request format' })
  }

  const results = translations.map((item) => {
    const { t, from = 'en', to } = item
    const cacheKey = `${t}|${from}|${to}`

    // Check cache first
    const cachedResult = cache.get(cacheKey)
    if (cachedResult) {
      return {
        t,
        translated: cachedResult,
        cached: true
      }
    }

    // Not in cache, perform translation
    const translated = translateText(t, from, to)

    // Store in cache
    cache.set(cacheKey, translated)

    return {
      t,
      translated
    }
  })

  res.json({ translations: results })
})
```

## Error Handling

Implement proper error handling in your backend:

```javascript
app.post('/api/translate', async (req, res) => {
  try {
    // ... translation logic
  } catch (error) {
    console.error('Translation error:', error)

    if (error.response) {
      // Error from external service
      return res.status(error.response.status).json({
        error: 'Translation service error',
        details: error.response.data
      })
    }

    if (error.request) {
      // No response received
      return res.status(504).json({
        error: 'Translation service timeout',
        details: 'No response received from translation service'
      })
    }

    // Other errors
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})
```

## Next Steps

- Learn about [Advanced Usage](./advanced-usage.md) for more complex scenarios
- Explore [TypeScript Support](./typescript.md) for type-safe translations
- Check out the [Components](./components.md) for ready-to-use UI elements
