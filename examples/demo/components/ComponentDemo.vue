<template>
  <div class="mt-8 border-t pt-6 dark:border-gray-700">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        <lt orig="en">Component Demo</lt>
      </h2>
      <button
        class="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
        @click="showDemo = !showDemo"
      >
        <lt v-if="showDemo" orig="en">Hide Demo</lt>
        <lt v-else orig="en">Show Demo</lt>
      </button>
    </div>

    <div v-if="showDemo" class="space-y-6">
      <!-- Advanced LanguageSelect Demo -->
      <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 class="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
          <lt orig="en">Advanced LanguageSelect</lt>
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <lt orig="en">
            Features: Search, flags, fuzzy matching (requires @vueform/multiselect + fuse.js)
          </lt>
        </p>
        <div class="max-w-md">
          <LanguageSelect
            v-model="demoLangAdvanced"
            placeholder="Choose a language..."
            :disabled="isLoading"
            :is-dark="isDark"
            :languages="languages"
          />
        </div>
        <div v-if="demoLangAdvanced" class="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <lt orig="en">Selected:</lt> {{ demoLangAdvanced.name }} ({{ demoLangAdvanced.code }})
          <span v-if="demoLangAdvanced.native_name"> - {{ demoLangAdvanced.native_name }}</span>
        </div>
      </div>

      <!-- InterfaceLanguageSelect Demo -->
      <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 class="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
          <lt orig="en">InterfaceLanguageSelect</lt>
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <lt orig="en">
            Features: Auto API integration, browser language detection, excludes selected language
          </lt>
        </p>
        <div class="max-w-md">
          <InterfaceLanguageSelect
            placeholder="Choose interface language..."
            :is-dark="isDark"
            @update:model-value="handleInterfaceLanguageChange"
          />
        </div>
        <div v-if="selectedInterfaceLang" class="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <lt orig="en">Selected:</lt> {{ selectedInterfaceLang.name }} ({{
            selectedInterfaceLang.code
          }})
          <span v-if="selectedInterfaceLang.native_name">
            - {{ selectedInterfaceLang.native_name }}</span
          >
        </div>
      </div>

      <!-- Simple LanguageSelect Demo -->
      <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 class="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
          <lt orig="en">SimpleLanguageSelect</lt>
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <lt orig="en">Features: Basic HTML select, no dependencies, works everywhere</lt>
        </p>
        <div class="max-w-md">
          <SimpleLanguageSelect
            v-model="demoLangSimple"
            placeholder="Pick a language..."
            :disabled="isLoading"
            :show-native-names="true"
            :languages="languages"
          />
        </div>
        <div v-if="demoLangSimple" class="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <lt orig="en">Selected:</lt> {{ demoLangSimple.name }} ({{ demoLangSimple.code }})
          <span v-if="demoLangSimple.native_name"> - {{ demoLangSimple.native_name }}</span>
        </div>
      </div>

      <!-- Comparison Info -->
      <div
        class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
      >
        <h4 class="font-medium text-blue-900 dark:text-blue-200 mb-2">
          <lt orig="en">When to use which component?</lt>
        </h4>
        <div class="text-sm text-blue-800 dark:text-blue-300 space-y-2">
          <div>
            <strong><lt orig="en">LanguageSelect:</lt></strong>
            <lt orig="en"
              >When you want advanced features like search, flags, and fuzzy matching</lt
            >
          </div>
          <div>
            <strong><lt orig="en">InterfaceLanguageSelect:</lt></strong>
            <lt orig="en">For interface language selection with automatic API integration</lt>
          </div>
          <div>
            <strong><lt orig="en">SimpleLanguageSelect:</lt></strong>
            <lt orig="en">When you want minimal dependencies and a native dropdown</lt>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { LanguageSelect, SimpleLanguageSelect, InterfaceLanguageSelect, lt } from '@/index'

defineProps({
  languages: Array,
  isLoading: Boolean,
  isDark: Boolean
})

const showDemo = ref(false)
const demoLangAdvanced = ref(null)
const demoLangSimple = ref(null)
const selectedInterfaceLang = ref(null)

function handleInterfaceLanguageChange(language) {
  selectedInterfaceLang.value = language
  console.log('Interface language changed to:', language)
}
</script>
