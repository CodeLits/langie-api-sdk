# Nuxt.js Integration

Vue Translator SDK provides seamless integration with Nuxt.js applications, including server-side rendering (SSR) support and automatic language detection.

## Quick Start

### Basic Setup

```vue
<!-- app.vue -->
<template>
  <div>
    <h1><lt>Welcome to our Nuxt application</lt></h1>
    <p>{{ lr('This text will be translated automatically') }}</p>
    <InterfaceLanguageSelect />
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'
import { InterfaceLanguageSelect, lt } from 'langie-api-sdk/components'

const { lr } = useLangie({
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-api-key'
})
</script>
```

## Nuxt Module (Recommended)

### Installation

```bash
npm install @langie/nuxt
```

### Configuration

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@langie/nuxt'],

  langie: {
    translatorHost: process.env.TRANSLATOR_HOST,
    apiKey: process.env.TRANSLATOR_API_KEY,
    defaultLanguage: 'en',
    autoDetect: true
  }
})
```

### Environment Variables

```env
# .env
TRANSLATOR_HOST=https://your-translation-api.com
TRANSLATOR_API_KEY=your-api-key
```

## Manual Integration

### Plugin Setup

```javascript
// plugins/langie.client.ts
import { useLangie } from 'langie-api-sdk'
import { lt, LanguageSelect, InterfaceLanguageSelect } from 'langie-api-sdk/components'

export default defineNuxtPlugin((nuxtApp) => {
  const translator = useLangie({
    translatorHost: useRuntimeConfig().public.translatorHost,
    apiKey: useRuntimeConfig().translatorApiKey,
    defaultLanguage: 'en'
  })

  // Register components globally
  nuxtApp.vueApp.component('lt', lt)
  nuxtApp.vueApp.component('LanguageSelect', LanguageSelect)
  nuxtApp.vueApp.component('InterfaceLanguageSelect', InterfaceLanguageSelect)

  return {
    provide: {
      translator
    }
  }
})
```

### Global Component Usage

After registering components globally in the plugin, you can use them directly in templates:

```vue
<template>
  <div>
    <h1><lt>Welcome to our Nuxt application</lt></h1>
    <p><lt>This text will be translated automatically</lt></p>
    <InterfaceLanguageSelect />
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { lr } = useLangie({
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-api-key'
})
</script>
```

### Runtime Config

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    translatorApiKey: process.env.TRANSLATOR_API_KEY,
    public: {
      translatorHost: process.env.TRANSLATOR_HOST
    }
  }
})
```

## Server-Side Rendering (SSR)

### SSR-Safe Components

The SDK provides SSR-safe versions of components that handle server-side rendering gracefully:

```vue
<template>
  <div>
    <!-- SSR-safe translation component -->
    <lt>Welcome to our application</lt>

    <!-- SSR-safe language selector -->
    <InterfaceLanguageSelect />
  </div>
</template>

<script setup>
import { InterfaceLanguageSelect, lt } from 'langie-api-sdk/components'
</script>
```

### SSR Considerations

```vue
<script setup>
import { useLangie } from 'langie-api-sdk'

const { lr, currentLanguage } = useLangie()

// The lt component automatically handles SSR
// It renders the original text on the server and updates on the client
</script>

<template>
  <div>
    <!-- This will render "Welcome" on server, then translate on client -->
    <lt>Welcome</lt>

    <!-- This will also work correctly with SSR -->
    <p>{{ lr('Hello world') }}</p>
  </div>
</template>
```

## Language Detection

### Browser Language Detection

```javascript
// composables/useLanguageDetection.ts
import { detectBrowserLanguage } from 'langie-api-sdk'

export function useLanguageDetection() {
  const { $translator } = useNuxtApp()

  onMounted(() => {
    // Detect browser language on client side
    const browserLang = detectBrowserLanguage()

    // Set language if different from current
    if (browserLang && browserLang !== $translator.currentLanguage.value) {
      $translator.setLanguage(browserLang)
    }
  })

  return {
    detectBrowserLanguage
  }
}
```

### Route-Based Language Detection

```javascript
// middleware/language.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const { $translator } = useNuxtApp()

  // Extract language from route
  const langFromRoute = to.params.lang || to.query.lang

  if (langFromRoute && langFromRoute !== $translator.currentLanguage.value) {
    $translator.setLanguage(langFromRoute)
  }
})
```

## Advanced Patterns

### Composable with SSR Support

```javascript
// composables/useTranslation.ts
export function useTranslation() {
  const { $translator } = useNuxtApp()

  // SSR-safe translation function
  const translate = (text: string, context = 'ui') => {
    // On server, return original text
    if (process.server) {
      return text
    }

    // On client, use translation
    return $translator.l(text, context)
  }

  // SSR-safe reactive translation
  const translateReactive = (text: string, context = 'ui') => {
    // On server, return original text
    if (process.server) {
      return text
    }

    // On client, use reactive translation
    return $translator.lr(text, context)
  }

  return {
    translate,
    translateReactive,
    currentLanguage: $translator.currentLanguage,
    setLanguage: $translator.setLanguage,
    isLoading: $translator.isLoading
  }
}
```

### Page-Level Translation

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <h1><lt>Welcome to our application</lt></h1>
    <p>{{ translateReactive('This is the home page') }}</p>
    <InterfaceLanguageSelect />
  </div>
</template>

<script setup>
import { InterfaceLanguageSelect, lt } from 'langie-api-sdk/components'
import { useTranslation } from '~/composables/useTranslation'

const { translateReactive } = useTranslation()

// Set page title with translation
useHead({
  title: 'Welcome to our application'
})
</script>
```

### API Routes Integration

```javascript
// server/api/translate.post.ts
import { translateBatch } from 'langie-api-sdk'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { texts, targetLang } = body

  try {
    const results = await translateBatch(
      texts.map((text: string) => ({
        t: text,
        to: targetLang
      })),
      {
        translatorHost: useRuntimeConfig().public.translatorHost,
        apiKey: useRuntimeConfig().translatorApiKey
      }
    )

    return { translations: results }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Translation failed'
    })
  }
})
```

## SEO and Meta Tags

### Dynamic Meta Tags

```vue
<!-- pages/[lang]/index.vue -->
<template>
  <div>
    <h1><lt>Welcome to our application</lt></h1>
  </div>
</template>

<script setup>
import { lt } from 'langie-api-sdk/components'
import { useTranslation } from '~/composables/useTranslation'

const { currentLanguage } = useTranslation()
const route = useRoute()

// Dynamic meta tags based on language
useHead({
  title: 'Welcome to our application',
  htmlAttrs: {
    lang: currentLanguage.value
  },
  meta: [
    {
      name: 'description',
      content: 'Welcome to our multilingual application'
    }
  ]
})

// Handle language parameter
const lang = route.params.lang
if (lang && lang !== currentLanguage.value) {
  setLanguage(lang)
}
</script>
```

### Structured Data

```vue
<script setup>
import { useTranslation } from '~/composables/useTranslation'

const { currentLanguage } = useTranslation()

// Structured data with translations
useJsonld(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Our Application',
  description: 'Welcome to our multilingual application',
  inLanguage: currentLanguage.value
}))
</script>
```

## Performance Optimization

### Lazy Loading Components

```vue
<script setup>
// Lazy load translation components
const InterfaceLanguageSelect = defineAsyncComponent(() =>
  import('langie-api-sdk/components').then((m) => ({
    default: m.InterfaceLanguageSelect
  }))
)

const lt = defineAsyncComponent(() =>
  import('langie-api-sdk/components').then((m) => ({
    default: m.lt
  }))
)
</script>
```

### Preloading Translations

```javascript
// plugins/preload-translations.client.ts
export default defineNuxtPlugin(async () => {
  const { $translator } = useNuxtApp()

  // Preload common translations
  await $translator.fetchAndCacheBatch([
    { t: 'Welcome', ctx: 'ui' },
    { t: 'Submit', ctx: 'ui' },
    { t: 'Cancel', ctx: 'ui' },
    { t: 'Loading...', ctx: 'ui' }
  ])
})
```

## Error Handling

### Global Error Handling

```javascript
// plugins/error-handler.client.ts
export default defineNuxtPlugin(() => {
  const { $translator } = useNuxtApp()

  // Handle translation errors
  const originalTranslate = $translator.l
  $translator.l = (text, context) => {
    try {
      return originalTranslate(text, context)
    } catch (error) {
      console.error('Translation failed:', error)
      return text // Fallback to original text
    }
  }
})
```

### Component Error Boundaries

```vue
<!-- components/TranslationErrorBoundary.vue -->
<template>
  <div>
    <div v-if="error" class="translation-error">
      <p>Translation error: {{ error.message }}</p>
      <button @click="retry">Retry</button>
    </div>
    <div v-else>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const error = ref(null)
const emit = defineEmits(['retry'])

const retry = () => {
  error.value = null
  emit('retry')
}

// Expose error handling
defineExpose({
  setError: (err) => {
    error.value = err
  }
})
</script>
```

## Testing

### Component Testing with SSR

```javascript
// tests/components/LtComponent.test.js
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { LtComponent } from 'langie-api-sdk/components'

describe('LtComponent SSR', () => {
  test('renders original text on server', async () => {
    const wrapper = await mountSuspended(LtComponent, {
      props: {
        msg: 'Hello world'
      }
    })

    expect(wrapper.text()).toBe('Hello world')
  })
})
```

### E2E Testing

```javascript
// tests/e2e/translation.spec.js
describe('Translation E2E', () => {
  test('translates page content', async () => {
    await page.goto('/')

    // Check original text is shown initially
    await expect(page.locator('h1')).toContainText('Welcome')

    // Change language
    await page.selectOption('select', 'es')

    // Check translation appears
    await expect(page.locator('h1')).toContainText('Bienvenido')
  })
})
```

## Deployment

### Environment Configuration

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    translatorApiKey: process.env.TRANSLATOR_API_KEY,
    public: {
      translatorHost: process.env.TRANSLATOR_HOST || 'https://default-api.com'
    }
  },

  // Build configuration
  build: {
    transpile: ['langie-api-sdk']
  }
})
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV TRANSLATOR_HOST=https://your-translation-api.com
ENV TRANSLATOR_API_KEY=your-api-key

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

## Best Practices

### 1. Use SSR-Safe Components

```vue
<!-- ✅ Use lt component for SSR-safe translations -->
<lt>Welcome</lt>

<!-- ✅ Use lr() for reactive translations -->
<p>{{ lr('Hello world') }}</p>

<!-- ❌ Avoid direct API calls in SSR -->
<!-- <p>{{ await translateText('Hello') }}</p> -->
```

### 2. Handle Language Changes

```vue
<script setup>
import { watch } from 'vue'
import { useTranslation } from '~/composables/useTranslation'

const { currentLanguage } = useTranslation()
const route = useRouter()

// Update route when language changes
watch(currentLanguage, (newLang) => {
  route.push({
    query: { ...route.currentRoute.value.query, lang: newLang }
  })
})
</script>
```

### 3. Optimize Bundle Size

```javascript
// ✅ Import only what you need
import { useLangie } from 'langie-api-sdk'
import { lt } from 'langie-api-sdk/components'

// ❌ Don't import everything
// import * from 'langie-api-sdk'
```

### 4. Handle Loading States

```vue
<template>
  <div>
    <div v-if="isLoading" class="loading">
      <lt>Loading translations...</lt>
    </div>
    <div v-else>
      <h1>{{ lr('Welcome') }}</h1>
    </div>
  </div>
</template>

<script setup>
import { useTranslation } from '~/composables/useTranslation'

const { isLoading, lr } = useTranslation()
</script>
```

## Next Steps

- Check out [Vue.js Usage](./vue.md) for general Vue integration
- Learn about [JavaScript Usage](./javascript.md) for vanilla JS integration
- Explore [Advanced Usage](./advanced-usage.md) for more complex scenarios
