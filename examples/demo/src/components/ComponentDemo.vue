<template>
  <div class="mt-8 border-t pt-6 dark:border-gray-700">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        <lt>Vue Components Demo</lt>
      </h2>
      <button
        class="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-all duration-200 ease-in-out"
        @click="showDemo = true"
      >
        <lt>Show Demo</lt>
      </button>
    </div>

    <!-- Modal for demo -->
    <Modal v-model="showDemo">
      <template #title>
        <lt>Vue Components Demo</lt>
      </template>

      <div class="space-y-6">
        <!-- Advanced LanguageSelect Demo -->
        <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[180px]">
          <h3 class="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
            Advanced <span class="text-blue-500">{{ '<LanguageSelect />' }}</span>
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <lt>Features: Smart search, smart flags detection</lt>
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
            <lt>Selected:</lt> {{ demoLangAdvanced.name }} ({{ demoLangAdvanced.code }})
            <span v-if="demoLangAdvanced.native_name"> - {{ demoLangAdvanced.native_name }}</span>
          </div>
        </div>

        <!-- InterfaceLanguageSelect Demo -->
        <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[180px]">
          <h3 class="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
            <span class="text-blue-500">{{ '<InterfaceLanguageSelect />' }}</span>
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <lt>
              Features: Auto API integration, browser language detection, smart search, smart flags
              detection
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
            <lt>Selected:</lt> {{ selectedInterfaceLang.name }} ({{ selectedInterfaceLang.code }})
            <span v-if="selectedInterfaceLang.native_name">
              - {{ selectedInterfaceLang.native_name }}</span
            >
          </div>
        </div>

        <!-- Simple LanguageSelect Demo -->
        <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[180px]">
          <h3 class="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
            <span class="text-blue-500">{{ '<SimpleLanguageSelect />' }}</span>
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <lt>Features: Perfect device integration, HTML select, no dependencies</lt>
          </p>
          <div class="max-w-md">
            <SimpleLanguageSelect
              v-model="demoLangSimple"
              placeholder="Pick a language..."
              :disabled="isLoading"
              :show-native-names="true"
              :languages="languages"
              :is-dark="isDark"
            />
          </div>
          <div v-if="demoLangSimple" class="mt-3 text-sm text-gray-600 dark:text-gray-400">
            <lt>Selected:</lt> {{ demoLangSimple.name }} ({{ demoLangSimple.code }})
            <span v-if="demoLangSimple.native_name"> - {{ demoLangSimple.native_name }}</span>
          </div>
        </div>

        <!-- Comparison Info -->
        <div
          class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 min-h-[120px]"
        >
          <h4 class="font-medium text-blue-900 dark:text-blue-200 mb-2">
            <lt>When to use which component?</lt>
          </h4>
          <div class="text-sm text-blue-800 dark:text-blue-300 space-y-2">
            <div>
              <strong><lt>LanguageSelect:</lt></strong>
              <br />
              <lt>Smart name/code search, flags, autocomplete</lt>
            </div>
            <div>
              <strong><lt>InterfaceLanguageSelect:</lt></strong>
              <br />
              <lt>For switching app interface language (auto API, smart search)</lt>
            </div>
            <div>
              <strong><lt>SimpleLanguageSelect:</lt></strong>
              <br />
              <lt>Perfect for native device integration</lt>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { LanguageSelect, SimpleLanguageSelect, InterfaceLanguageSelect, lt } from '@/index'
import Modal from './Modal.vue'

const props = defineProps({
  languages: Array,
  isLoading: Boolean,
  isDark: Boolean
})

const showDemo = ref(false)
const demoLangAdvanced = ref(null)
const demoLangSimple = ref(null)
const selectedInterfaceLang = ref(null)

// Set English as default for Advanced LanguageSelect
watch(
  () => props.languages,
  (languages) => {
    if (languages && languages.length > 0 && !demoLangAdvanced.value) {
      const english = languages.find((lang) => lang.code === 'en')
      if (english) {
        demoLangAdvanced.value = english
      }
    }
  },
  { immediate: true }
)

function handleInterfaceLanguageChange(language) {
  selectedInterfaceLang.value = language
  // Interface language changed
}
</script>
