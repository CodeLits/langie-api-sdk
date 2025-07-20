# Best Practices

This guide covers best practices for using Langie API SDK effectively in your applications.

## 🚀 Performance Optimization

### Use Appropriate Translation Functions

```vue
<template>
  <!-- ✅ Good: Use lr() for reactive content -->
  <h1>{{ lr('Welcome to our application') }}</h1>

  <!-- ✅ Good: Use l() for event handlers -->
  <button @click="handleClick">{{ l('Submit') }}</button>

  <!-- ✅ Good: Use lt component for template content -->
  <p><lt>This will be translated automatically</lt></p>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { l, lr } = useLangie()

function handleClick() {
  // ✅ Good: l() returns immediately
  const submitText = l('Submit')
  console.log(submitText)
}
</script>
```

### Optimize Language Selection

```vue
<template>
  <!-- ✅ Good: Use InterfaceLanguageSelect for automatic detection -->
  <InterfaceLanguageSelect />

  <!-- ✅ Good: Use LanguageSelect when you have custom languages -->
  <LanguageSelect :languages="customLanguages" />

  <!-- ✅ Good: Use SimpleLanguageSelect for minimal UI -->
  <SimpleLanguageSelect :languages="languages" />
</template>
```

## 🎯 Caching Strategy

### Leverage Built-in Caching

```javascript
// ✅ Good: SDK automatically caches translations
const { l, lr } = useLangie()

// First call: API request
l('Hello world') // Returns "Hello world", queues translation

// Subsequent calls: Cached result
l('Hello world') // Returns translated text from cache
```

### Set Global Defaults

```javascript
// ✅ Good: Set global defaults to reduce repetition
import { setLtDefaults } from 'langie-api-sdk'

setLtDefaults({
  ctx: 'ui',    // Default context
  orig: 'en'    // Default original language
})

// Now you can use simplified syntax
<lt>Cancel</lt>           // Uses ctx="ui", orig="en"
<lt ctx="content">Title</lt>  // Overrides context only
```

## 🔧 Error Handling

### Handle Translation Errors Gracefully

```vue
<template>
  <div>
    <!-- ✅ Good: Always provide fallback text -->
    <h1>{{ lr('Welcome') || 'Welcome' }}</h1>

    <!-- ✅ Good: Use lt component with fallback -->
    <lt>Hello world</lt>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { lr, isLoading } = useLangie()

// ✅ Good: Show loading state
if (isLoading.value) {
  console.log('Translations are loading...')
}
</script>
```

### Handle API Failures

```javascript
// ✅ Good: Provide fallback for API failures
const { l, currentLanguage } = useLangie()

// The SDK automatically falls back to original text
// when API calls fail
const translated = l('Hello world') // Returns original if API fails
```

## 📱 SSR and Hydration

### Handle SSR Properly

```vue
<template>
  <div>
    <!-- ✅ Good: lt component handles SSR automatically -->
    <lt>Welcome to our application</lt>

    <!-- ✅ Good: Use lr() for reactive content -->
    <p>{{ lr('This will update when language changes') }}</p>
  </div>
</template>

<script setup>
import { useLangie } from 'langie-api-sdk'

const { lr } = useLangie()

// ✅ Good: Force reactivity for SSR
void lr('Force reactivity')
</script>
```

## 🎨 Styling Best Practices

### CSS Import Order

```javascript
// ✅ Good: Import CSS in correct order
import '@vueform/multiselect/themes/default.css'
import 'langie-api-sdk/dist/index.css'

// Your custom styles after
import './styles.css'
```

### Theme Integration

```vue
<template>
  <!-- ✅ Good: Pass theme to components -->
  <InterfaceLanguageSelect :is-dark="isDarkMode" />
  <LanguageSelect :is-dark="isDarkMode" />
</template>

<script setup>
import { ref } from 'vue'

const isDarkMode = ref(false)
</script>
```

## 🔒 Security

### API Key Management

```javascript
// ✅ Good: Use environment variables
const { useLangie } = useLangie({
  apiKey: process.env.VUE_APP_TRANSLATOR_API_KEY,
  translatorHost: process.env.VUE_APP_TRANSLATOR_HOST
})

// ✅ Good: Don't hardcode API keys
// ❌ Bad: const apiKey = 'your-api-key-here'
```

### Input Validation

```vue
<template>
  <!-- ✅ Good: Validate user input -->
  <input v-model="userInput" @input="validateInput" placeholder="Enter text to translate" />
</template>

<script setup>
import { ref } from 'vue'

const userInput = ref('')

function validateInput() {
  // ✅ Good: Sanitize user input
  userInput.value = userInput.value.trim()
}
</script>
```

## 📊 Monitoring and Analytics

### Track Translation Usage

```javascript
// ✅ Good: Monitor translation performance
const { l, getBatchingStats } = useLangie()

// Track translation requests
function trackTranslation(text, context) {
  console.log('Translation requested:', { text, context })
  return l(text, context)
}

// Monitor batching performance
const stats = getBatchingStats()
console.log('Batching stats:', stats)
```

## 🧪 Testing

### Test Translation Functions

```javascript
// ✅ Good: Test translation functions
import { useLangie } from 'langie-api-sdk'

const { l, lr } = useLangie()

// Test synchronous translation
expect(l('Hello')).toBe('Hello') // Returns original initially

// Test reactive translation
const translated = lr('Welcome')
expect(translated).toBe('Welcome') // Returns original initially
```

### Test Components

```vue
<!-- ✅ Good: Test components with proper props -->
<template>
  <LanguageSelect :languages="testLanguages" :placeholder="'Select language'" :disabled="false" />
</template>

<script setup>
const testLanguages = [
  { code: 'en', name: 'English', native_name: 'English' },
  { code: 'es', name: 'Spanish', native_name: 'Español' }
]
</script>
```

## 🚀 Production Deployment

### Optimize for Production

```javascript
// ✅ Good: Configure for production
const { useLangie } = useLangie({
  apiKey:
    process.env.NODE_ENV === 'production' ? process.env.PROD_API_KEY : process.env.DEV_API_KEY,
  translatorHost: process.env.TRANSLATOR_HOST,
  defaultLanguage: 'en'
})
```

### Cache Management

```javascript
// ✅ Good: Clear cache when needed
const { cleanup } = useLangie()

// Clear all cached translations
cleanup()

// ✅ Good: Handle language changes properly
watch(currentLanguage, () => {
  // Cache is automatically managed by the SDK
  console.log('Language changed to:', currentLanguage.value)
})
```

## 📚 Common Patterns

### Language Detection Pattern

```vue
<template>
  <div>
    <!-- Auto-detect and select language -->
    <InterfaceLanguageSelect />

    <!-- Show current language -->
    <p>Current language: {{ currentLanguage }}</p>
  </div>
</template>
```

### Translation Context Pattern

```vue
<template>
  <div>
    <!-- UI elements -->
    <button><lt ctx="ui">Submit</lt></button>

    <!-- Content -->
    <article>
      <h1><lt ctx="content">Article Title</lt></h1>
      <p><lt ctx="content">Article content...</lt></p>
    </article>
  </div>
</template>
```

### Error Boundary Pattern

```vue
<template>
  <div>
    <ErrorBoundary>
      <InterfaceLanguageSelect />
    </ErrorBoundary>

    <ErrorBoundary>
      <lt>This text will be translated</lt>
    </ErrorBoundary>
  </div>
</template>
```

## 🎯 Performance Checklist

- [ ] Use `lr()` for reactive content
- [ ] Use `l()` for event handlers
- [ ] Use `lt` component for template content
- [ ] Set global defaults to reduce repetition
- [ ] Import CSS in correct order
- [ ] Handle SSR properly
- [ ] Use environment variables for API keys
- [ ] Monitor translation performance
- [ ] Test translation functions and components
- [ ] Configure for production environment
