# Components

Vue Translator SDK provides ready-to-use Vue components that you can integrate into your application.

## Importing Components

Components are available through the `/components` subpath:

```js
import { LanguageSelect, T } from 'langie-api-sdk/components'
```

## LanguageSelect

The `LanguageSelect` component provides a dropdown menu for selecting a language.

## InterfaceLanguageSelect

The `InterfaceLanguageSelect` component is a specialized version of `LanguageSelect` that automatically manages interface language selection. It integrates with the `useLangie` composable to automatically fetch available languages from the API and detect the browser language. The currently selected language is automatically excluded from the dropdown options.

### Key Features

- **Automatic API Integration**: Languages are fetched automatically from your translation API
- **Backend Language Support**: Can accept languages list as prop from your backend
- **Smart Browser Detection**: Automatically detects and sets browser language from both API and custom language lists
- **Persistent State**: Uses `useLangie` composable to maintain language state across the application
- **Fallback Logic**: Intelligent fallback system for language selection priority

### Language Selection Priority

The component uses the following priority order for setting the initial language:

1. **Saved Language**: Previously saved language from localStorage (if it exists in current language list)
2. **Browser Language**: Automatically detected from `navigator.languages` (if available in current language list)
3. **No Selection**: No language set if none of the above match

This priority system works with both API-fetched languages and custom backend languages.

### Props

| Prop             | Type      | Default                       | Description                                   |
| ---------------- | --------- | ----------------------------- | --------------------------------------------- |
| `languages`      | `Array`   | `[]`                          | Array of languages from backend (optional)    |
| `placeholder`    | `String`  | `'Select interface language'` | Placeholder text when no language is selected |
| `disabled`       | `Boolean` | `false`                       | Whether the select is disabled                |
| `isDark`         | `Boolean` | `false`                       | Whether to use dark theme styling             |
| `translatorHost` | `String`  | `''`                          | Custom translator API endpoint URL            |
| `apiKey`         | `String`  | `''`                          | API key for translator authentication         |

### Events

| Event               | Payload              | Description                                |
| ------------------- | -------------------- | ------------------------------------------ |
| `update:modelValue` | `TranslatorLanguage` | Emitted when the selected language changes |

### Basic Usage

```vue
<template>
  <div>
    <InterfaceLanguageSelect />
  </div>
</template>

<script setup>
import { InterfaceLanguageSelect } from 'langie-api-sdk/components'
</script>
```

### With Backend Languages

```vue
<template>
  <div>
    <InterfaceLanguageSelect :languages="backendLanguages" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { InterfaceLanguageSelect } from 'langie-api-sdk/components'

const backendLanguages = ref([])

onMounted(async () => {
  // Fetch languages from your backend
  const response = await fetch('/api/languages')
  backendLanguages.value = await response.json()
})
</script>
```

### With Event Handling

```vue
<template>
  <div>
    <InterfaceLanguageSelect @update:modelValue="handleLanguageChange" :is-dark="isDarkMode" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { InterfaceLanguageSelect } from 'langie-api-sdk/components'

const isDarkMode = ref(false)

function handleLanguageChange(language) {
  console.log(`Interface language changed to: ${language.name} (${language.code})`)
}
</script>
```

### With Custom API Configuration

```vue
<template>
  <div>
    <InterfaceLanguageSelect
      :languages="backendLanguages"
      translator-host="https://api.example.com"
      api-key="your-api-key"
      @update:modelValue="handleLanguageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { InterfaceLanguageSelect } from 'langie-api-sdk/components'

const backendLanguages = ref([])

onMounted(async () => {
  // Fetch languages from your backend
  const response = await fetch('/api/languages')
  backendLanguages.value = await response.json()
})

function handleLanguageChange(language) {
  console.log(`Interface language changed to: ${language.name} (${language.code})`)
}
</script>
```

### Language Source Priority

The component uses languages in the following priority order:

1. **Languages prop**: If provided, uses the languages array from props
2. **API languages**: Falls back to automatically fetched languages from the translation API

This allows you to:

- Use your own backend language list when available
- Fall back to automatic API fetching when no languages are provided
- Maintain flexibility in how languages are sourced

### Difference from LanguageSelect

- **LanguageSelect**: Requires languages to be passed as props, suitable for general language selection
- **InterfaceLanguageSelect**: Automatically manages languages and integrates with the global language state, specifically designed for interface language selection

### Props

| Prop              | Type      | Default             | Description                                                  |
| ----------------- | --------- | ------------------- | ------------------------------------------------------------ |
| `showFlags`       | `Boolean` | `true`              | Whether to show country flags next to language names         |
| `showNativeNames` | `Boolean` | `true`              | Whether to show language names in their native script        |
| `disabled`        | `Boolean` | `false`             | Whether the select is disabled                               |
| `placeholder`     | `String`  | `'Select language'` | Placeholder text when no language is selected                |
| `customClass`     | `String`  | `''`                | Additional CSS class to apply to the select element          |
| `popupClass`      | `String`  | `''`                | Additional CSS class to apply to the dropdown popup          |
| `size`            | `String`  | `'medium'`          | Size of the select element ('small', 'medium', 'large')      |
| `filterable`      | `Boolean` | `true`              | Whether the languages can be filtered by typing              |
| `clearable`       | `Boolean` | `false`             | Whether the selection can be cleared                         |
| `placement`       | `String`  | `'bottom'`          | Placement of the dropdown ('top', 'bottom', 'left', 'right') |

### Events

| Event    | Payload  | Description                                                                   |
| -------- | -------- | ----------------------------------------------------------------------------- |
| `change` | `String` | Emitted when the selected language changes, with the language code as payload |
| `focus`  | `Event`  | Emitted when the select element gains focus                                   |
| `blur`   | `Event`  | Emitted when the select element loses focus                                   |

### Basic Usage

```vue
<template>
  <div>
    <LanguageSelect />
    <p>Current language: {{ currentLanguage }}</p>
  </div>
</template>

<script setup>
import { LanguageSelect } from 'langie-api-sdk/components'
import { useLangie } from 'langie-api-sdk'

const { currentLanguage } = useLangie()
</script>
```

### Customized Usage

```vue
<template>
  <div>
    <LanguageSelect
      :show-flags="true"
      :show-native-names="true"
      size="large"
      custom-class="my-language-select"
      :filterable="true"
      :clearable="false"
      placement="bottom"
      @change="handleLanguageChange"
    />
  </div>
</template>

<script setup>
import { LanguageSelect } from 'langie-api-sdk/components'

function handleLanguageChange(langCode) {
  console.log(`Language changed to: ${langCode}`)
}
</script>

<style scoped>
.my-language-select {
  width: 200px;
  border-radius: 8px;
}
</style>
```

## lt Component

The `lt` component is a lightweight wrapper for translating text within templates. It uses the reactive `lr()` function internally to automatically update when translations become available.

### Props

| Prop   | Type     | Default | Description                                     |
| ------ | -------- | ------- | ----------------------------------------------- |
| `ctx`  | `String` | `'ui'`  | Context for the translation (defaults to 'ui')  |
| `orig` | `String` | `'en'`  | Original language code (defaults to 'en')       |
| `msg`  | `String` | `''`    | Text to translate (alternative to slot content) |

### Slots

| Slot      | Description           |
| --------- | --------------------- |
| `default` | The text to translate |

### Basic Usage

```vue
<template>
  <div>
    <h1><lt>Welcome to our application!</lt></h1>
    <p><lt>This text will be translated.</lt></p>
  </div>
</template>

<script setup>
import { lt } from 'langie-api-sdk/components'
</script>
```

### With Dynamic Content

```vue
<template>
  <div>
    <lt>Hello {{ username }}!</lt>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { lt } from 'langie-api-sdk/components'

const username = ref('John')
</script>
```

### With HTML Content

```vue
<template>
  <div>
    <lt :html="true"> Welcome to <b>our application</b>! </lt>
  </div>
</template>

<script setup>
import { lt } from 'langie-api-sdk/components'
</script>
```

### With Message Prop

```vue
<template>
  <div>
    <lt msg="Welcome!" />
    <lt msg="This is a paragraph." />
    <lt :msg="dynamicMessage" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { lt } from 'langie-api-sdk/components'

const dynamicMessage = ref('Dynamic message')
</script>
```

### With Context and Original Language

```vue
<template>
  <div>
    <p>UI Context: <lt ctx="ui">Hello</lt></p>
    <p>Content Context: <lt ctx="content">Hello</lt></p>
    <p>Custom Original: <lt orig="fr">Bonjour</lt></p>
  </div>
</template>

<script setup>
import { lt } from 'langie-api-sdk/components'
</script>
```

### How lt Component Works

The `lt` component uses the reactive `lr()` function internally, which means:

- **Automatic Updates**: The component automatically updates when translations become available
- **Context-Aware Caching**: Uses the appropriate cache based on the `ctx` prop
- **Reactive Dependencies**: Creates reactive dependencies on translation caches and current language
- **SSR Safe**: Handles server-side rendering gracefully

### Important Notes (v1.7.2+)

The `lt` component now properly handles translation caching:

- **UI Context**: When `ctx="ui"` or `ctx` is undefined, uses `uiTranslations` cache
- **Other Contexts**: Uses `translations` cache for content contexts
- **Automatic Reactivity**: Updates automatically when translations are cached
- **Consistent Caching**: All translation functions now use the same cache selection logic

## Server-Side Rendering (SSR)

For SSR environments, the SDK provides special versions of the components that work during server rendering:

```js
import { LanguageSelectSSR, ltSSR } from 'langie-api-sdk/components'
```

These components render minimal placeholders during server rendering and are replaced with the full components during client hydration.

### Example with Nuxt.js

```vue
<template>
  <div>
    <client-only>
      <LanguageSelect />
      <template #fallback>
        <div class="language-select-placeholder">Loading...</div>
      </template>
    </client-only>

    <lt>Welcome to our application!</lt>
  </div>
</template>

<script setup>
import { LanguageSelect, T } from 'langie-api-sdk/components'
</script>
```

## Styling Components

The components provide minimal styling by default and can be customized using CSS:

```vue
<style scoped>
/* Style the language select */
:deep(.translator-language-select) {
  width: 200px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Style the flags */
:deep(.translator-language-flag) {
  margin-right: 8px;
}

/* Style the lt component */
:deep(.translator-text) {
  font-style: italic;
}
</style>
```

## Creating Custom Components

You can create your own custom components that use the translation functionality:

```vue
<!-- TranslatedButton.vue -->
<template>
  <button :class="[customClass, { 'is-loading': isLoading }]" @click="$emit('click', $event)">
    <lt>{{ text }}</lt>
  </button>
</template>

<script setup>
import { T } from 'langie-api-sdk/components'
import { useLangie } from 'langie-api-sdk'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  customClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])
const { isLoading } = useLangie()
</script>
```

Then use it in your application:

```vue
<template>
  <div>
    <TranslatedButton text="Save changes" custom-class="primary-button" @click="saveChanges" />
  </div>
</template>

<script setup>
import TranslatedButton from './TranslatedButton.vue'

function saveChanges() {
  // Handle save
}
</script>
```

## Next Steps

- Learn about [Backend Integration](./backend-integration.md) for setting up your translation service
- Explore [Advanced Usage](./advanced-usage.md) for more complex scenarios
- Check out [TypeScript Support](./typescript.md) for type-safe translations
