# JavaScript Usage

Vue Translator SDK can be used in vanilla JavaScript applications without Vue.js. This guide shows how to integrate translation functionality into your JavaScript projects.

## Basic Usage

### Core API Functions

The SDK provides core functions that work independently of Vue:

```javascript
import { translateBatch, fetchAvailableLanguages } from 'langie-api-sdk'

// Translate a single text
const results = await translateBatch([{ text: 'Hello world', to_lang: 'es' }], {
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-api-key'
})

console.log(results[0].translated) // "Hola mundo"

// Fetch available languages
const languages = await fetchAvailableLanguages({
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-api-key'
})

console.log(languages) // Array of language objects
```

### Language Detection

```javascript
import { detectBrowserLanguage, BROWSER_LANGUAGE_MAP } from 'langie-api-sdk'

// Detect browser language
const browserLang = detectBrowserLanguage()
console.log(browserLang) // 'en', 'es', 'fr', etc.

// Check language mapping
console.log(BROWSER_LANGUAGE_MAP['zh']) // 'zh-cn'
console.log(BROWSER_LANGUAGE_MAP['sr']) // 'sr-latn'
```

## DOM Integration

### Manual DOM Updates

```javascript
import { translateBatch } from 'langie-api-sdk'

class Translator {
  constructor(options = {}) {
    this.options = {
      translatorHost: 'https://your-translation-api.com',
      apiKey: 'your-api-key',
      defaultLanguage: 'en',
      ...options
    }
    this.currentLanguage = this.options.defaultLanguage
    this.cache = new Map()
  }

  async translateElement(element, targetLang = null) {
    const text = element.textContent
    const lang = targetLang || this.currentLanguage

    if (lang === 'en') return // No translation needed

    // Check cache first
    const cacheKey = `${text}|${lang}`
    if (this.cache.has(cacheKey)) {
      element.textContent = this.cache.get(cacheKey)
      return
    }

    try {
      const results = await translateBatch([{ text, to_lang: lang }], this.options)

      const translated = results[0].translated
      this.cache.set(cacheKey, translated)
      element.textContent = translated
    } catch (error) {
      console.error('Translation failed:', error)
    }
  }

  async translatePage(targetLang) {
    this.currentLanguage = targetLang

    // Find all translatable elements
    const elements = document.querySelectorAll('[data-translate]')

    // Batch translate all texts
    const texts = Array.from(elements).map((el) => el.textContent)
    const uniqueTexts = [...new Set(texts)]

    try {
      const results = await translateBatch(
        uniqueTexts.map((text) => ({ text, to_lang: targetLang })),
        this.options
      )

      // Update DOM elements
      elements.forEach((element) => {
        const text = element.textContent
        const result = results.find((r) => r.text === text)
        if (result) {
          element.textContent = result.translated
        }
      })
    } catch (error) {
      console.error('Page translation failed:', error)
    }
  }
}

// Usage
const translator = new Translator({
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-api-key'
})

// Translate a single element
const title = document.querySelector('h1')
await translator.translateElement(title, 'es')

// Translate entire page
await translator.translatePage('fr')
```

### HTML Integration

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Translated App</title>
  </head>
  <body>
    <h1 data-translate>Welcome to our application</h1>
    <p data-translate>This text will be translated</p>
    <button data-translate>Click me</button>

    <div>
      <label>Language:</label>
      <select id="languageSelect">
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>

    <script type="module">
      import { Translator } from './translator.js'

      const translator = new Translator()

      // Handle language changes
      document.getElementById('languageSelect').addEventListener('change', async (e) => {
        await translator.translatePage(e.target.value)
      })

      // Initial translation based on browser language
      const browserLang = navigator.language.split('-')[0]
      if (browserLang !== 'en') {
        await translator.translatePage(browserLang)
      }
    </script>
  </body>
</html>
```

## React Integration

### Custom Hook

```javascript
import { useState, useEffect } from 'react'
import { translateBatch, fetchAvailableLanguages } from 'langie-api-sdk'

function useTranslator(options = {}) {
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [languages, setLanguages] = useState([])
  const [cache, setCache] = useState(new Map())
  const [isLoading, setIsLoading] = useState(false)

  const translatorOptions = {
    translatorHost: 'https://your-translation-api.com',
    apiKey: 'your-api-key',
    ...options
  }

  useEffect(() => {
    // Fetch available languages
    fetchAvailableLanguages(translatorOptions).then(setLanguages)
  }, [])

  const translate = async (text, targetLang = currentLanguage) => {
    if (targetLang === 'en') return text

    const cacheKey = `${text}|${targetLang}`
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }

    setIsLoading(true)
    try {
      const results = await translateBatch([{ text, to_lang: targetLang }], translatorOptions)

      const translated = results[0].translated
      setCache((prev) => new Map(prev).set(cacheKey, translated))
      return translated
    } catch (error) {
      console.error('Translation failed:', error)
      return text
    } finally {
      setIsLoading(false)
    }
  }

  const changeLanguage = async (lang) => {
    setCurrentLanguage(lang)
    // Optionally translate all cached texts to new language
  }

  return {
    currentLanguage,
    languages,
    translate,
    changeLanguage,
    isLoading
  }
}

// Usage in React component
function App() {
  const { currentLanguage, languages, translate, changeLanguage, isLoading } = useTranslator()
  const [title, setTitle] = useState('Welcome')

  useEffect(() => {
    translate('Welcome').then(setTitle)
  }, [currentLanguage])

  return (
    <div>
      <h1>{title}</h1>
      <select value={currentLanguage} onChange={(e) => changeLanguage(e.target.value)}>
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      {isLoading && <p>Translating...</p>}
    </div>
  )
}
```

## Node.js Usage

### Server-side Translation

```javascript
import { translateBatch, fetchAvailableLanguages } from 'langie-api-sdk'

// Express.js middleware
function translationMiddleware(req, res, next) {
  req.translate = async (text, targetLang) => {
    try {
      const results = await translateBatch([{ text, to_lang: targetLang }], {
        translatorHost: process.env.TRANSLATOR_HOST,
        apiKey: process.env.TRANSLATOR_API_KEY
      })
      return results[0].translated
    } catch (error) {
      console.error('Translation failed:', error)
      return text
    }
  }
  next()
}

// Usage in route
app.get('/api/translate', translationMiddleware, async (req, res) => {
  const { text, targetLang } = req.query
  const translated = await req.translate(text, targetLang)
  res.json({ translated })
})

// Batch translation endpoint
app.post('/api/translate/batch', translationMiddleware, async (req, res) => {
  const { texts, targetLang } = req.body

  try {
    const results = await translateBatch(
      texts.map((text) => ({ text, to_lang: targetLang })),
      {
        translatorHost: process.env.TRANSLATOR_HOST,
        apiKey: process.env.TRANSLATOR_API_KEY
      }
    )

    res.json({ translations: results })
  } catch (error) {
    res.status(500).json({ error: 'Translation failed' })
  }
})
```

## Error Handling

```javascript
import { translateBatch } from 'langie-api-sdk'

async function safeTranslate(text, targetLang, options) {
  try {
    const results = await translateBatch([{ text, to_lang: targetLang }], options)

    return results[0].translated
  } catch (error) {
    // Handle different types of errors
    if (error.message.includes('401')) {
      console.error('Authentication failed - check your API key')
      return text
    } else if (error.message.includes('429')) {
      console.error('Rate limit exceeded - try again later')
      return text
    } else if (error.message.includes('500')) {
      console.error('Translation service error - try again later')
      return text
    } else {
      console.error('Translation failed:', error.message)
      return text
    }
  }
}
```

## Performance Optimization

### Caching Strategy

```javascript
class TranslationCache {
  constructor() {
    this.cache = new Map()
    this.maxSize = 1000
  }

  get(key) {
    return this.cache.get(key)
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  clear() {
    this.cache.clear()
  }
}

// Usage with caching
const cache = new TranslationCache()

async function translateWithCache(text, targetLang, options) {
  const cacheKey = `${text}|${targetLang}`

  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Translate and cache
  const translated = await safeTranslate(text, targetLang, options)
  cache.set(cacheKey, translated)

  return translated
}
```

## Next Steps

- Check out [Vue.js Usage](./vue.md) for Vue-specific integration
- Learn about [Nuxt.js Integration](./nuxt.md) for SSR applications
- Explore [Advanced Usage](./advanced-usage.md) for more complex scenarios
