# Components

Vue Translator SDK provides ready-to-use Vue components that you can integrate into your application.

## Importing Components

Components are available through the `/components` subpath:

```js
import { LanguageSelect, T } from 'vue-translator-sdk/components'
```

## LanguageSelect

The `LanguageSelect` component provides a dropdown menu for selecting a language.

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
import { LanguageSelect } from 'vue-translator-sdk/components'
import { useTranslator } from 'vue-translator-sdk'

const { currentLanguage } = useTranslator()
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
import { LanguageSelect } from 'vue-translator-sdk/components'

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

## T Component

The `T` component is a lightweight wrapper for translating text within templates.

### Props

| Prop         | Type      | Default  | Description                                        |
| ------------ | --------- | -------- | -------------------------------------------------- |
| `tag`        | `String`  | `'span'` | HTML tag to use for the wrapper element            |
| `targetLang` | `String`  | `null`   | Target language (defaults to the current language) |
| `html`       | `Boolean` | `false`  | Whether to render the content as HTML              |

### Slots

| Slot      | Description           |
| --------- | --------------------- |
| `default` | The text to translate |

### Basic Usage

```vue
<template>
  <div>
    <h1><T>Welcome to our application!</T></h1>
    <p><T>This text will be translated.</T></p>
  </div>
</template>

<script setup>
import { T } from 'vue-translator-sdk/components'
</script>
```

### With Dynamic Content

```vue
<template>
  <div>
    <T>Hello {{ username }}!</T>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { T } from 'vue-translator-sdk/components'

const username = ref('John')
</script>
```

### With HTML Content

```vue
<template>
  <div>
    <T :html="true"> Welcome to <b>our application</b>! </T>
  </div>
</template>

<script setup>
import { T } from 'vue-translator-sdk/components'
</script>
```

### With Custom Tag

```vue
<template>
  <div>
    <T tag="h1">Welcome!</T>
    <T tag="p">This is a paragraph.</T>
    <T tag="button" @click="doSomething">Click me</T>
  </div>
</template>

<script setup>
import { T } from 'vue-translator-sdk/components'

function doSomething() {
  alert('Button clicked!')
}
</script>
```

### With Specific Target Language

```vue
<template>
  <div>
    <p>English: <T>Hello</T></p>
    <p>French: <T target-lang="fr">Hello</T></p>
    <p>Spanish: <T target-lang="es">Hello</T></p>
  </div>
</template>

<script setup>
import { T } from 'vue-translator-sdk/components'
</script>
```

## Server-Side Rendering (SSR)

For SSR environments, the SDK provides special versions of the components that work during server rendering:

```js
import { LanguageSelectSSR, TSSR } from 'vue-translator-sdk/components'
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

    <T>Welcome to our application!</T>
  </div>
</template>

<script setup>
import { LanguageSelect, T } from 'vue-translator-sdk/components'
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

/* Style the T component */
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
    <T>{{ text }}</T>
  </button>
</template>

<script setup>
import { T } from 'vue-translator-sdk/components'
import { useTranslator } from 'vue-translator-sdk'

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
const { isLoading } = useTranslator()
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
