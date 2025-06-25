<template>
  <div class="translator-example">
    <h1>Vue Translator SDK Example</h1>

    <div class="language-selector">
      <LanguageSelect />
    </div>

    <div class="translation-demo">
      <h2>Current language: {{ currentLanguage }}</h2>

      <div class="translation-card">
        <h3>Basic Translation</h3>
        <p>Original: Hello world!</p>
        <p>Translated: {{ translate('Hello world!') }}</p>
      </div>

      <div class="translation-card">
        <h3>Using T Component</h3>
        <p>Original: Welcome to our application!</p>
        <p>Translated: <T>Welcome to our application!</T></p>
      </div>

      <div class="translation-card">
        <h3>With Dynamic Content</h3>
        <p>Original: Hello {{ username }}!</p>
        <p>Translated: <T>Hello {{ username }}!</T></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTranslator, LanguageSelect, T } from 'vue-translator-sdk'

// Initialize the translator
const { translate, currentLanguage } = useTranslator({
  translatorHost: 'https://your-translation-api.com',
  apiKey: 'your-api-key', // Optional
  defaultLanguage: 'en',
  fallbackLanguage: 'en'
})

// Sample data
const username = ref('John')
</script>

<style scoped>
.translator-example {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.language-selector {
  margin-bottom: 20px;
}

.translation-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

h1 {
  color: #2c3e50;
}

h2 {
  color: #42b883;
}

h3 {
  margin-top: 0;
  color: #3498db;
}
</style>
