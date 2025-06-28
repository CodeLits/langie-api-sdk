# 🎨 LanguageSelect Styling Troubleshooting

## Problem: LanguageSelect looks ugly/broken

If your `LanguageSelect` component looks like this:

- No styling/plain HTML select appearance
- Broken layout
- Missing search functionality
- No flags showing

## ✅ Solution: Import Required CSS

The `LanguageSelect` component requires `@vueform/multiselect` CSS to look good.

### Quick Fix

Add this to your `main.js` or main entry file:

```js
import '@vueform/multiselect/themes/default.css'
```

### Different Ways to Import CSS

#### 1. **Global Import (Best)**

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import '@vueform/multiselect/themes/default.css' // ← Add this line

createApp(App).mount('#app')
```

#### 2. **Component Level**

```vue
<script setup>
import '@vueform/multiselect/themes/default.css' // ← Add this line
import { LanguageSelect } from 'langie-api-sdk/components'
</script>
```

#### 3. **CSS Import**

```css
/* In your main CSS file (style.css, main.css, etc.) */
@import '@vueform/multiselect/themes/default.css';
```

#### 4. **Vite/Webpack Config**

```js
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import '@vueform/multiselect/themes/default.css';`
      }
    }
  }
}
```

## Alternative: Use SimpleLanguageSelect

If you don't want to deal with CSS imports, use the dependency-free alternative:

```vue
<script setup>
import { SimpleLanguageSelect } from 'langie-api-sdk/components'
</script>

<template>
  <SimpleLanguageSelect v-model="selectedLang" :languages="languages" />
</template>
```

## Verification

After importing the CSS, your `LanguageSelect` should have:

- ✅ Styled dropdown with search
- ✅ Country flags
- ✅ Proper hover/focus states
- ✅ Dark mode support

## Still Having Issues?

1. **Check browser dev tools** - Look for CSS loading errors
2. **Verify dependencies** - Make sure `@vueform/multiselect` is installed
3. **Try SimpleLanguageSelect** - As a fallback option
4. **Check build tools** - Some bundlers need special CSS handling

## Dependencies Required

```bash
npm install @vueform/multiselect fuse.js
```

Only for `LanguageSelect`. `SimpleLanguageSelect` needs no dependencies.
