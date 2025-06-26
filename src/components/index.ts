/**
 * Vue components for translation
 */
import { defineAsyncComponent } from 'vue'

// Export components using defineAsyncComponent for better compatibility
export const LanguageSelect = defineAsyncComponent(() => import('./LanguageSelect.vue'))
export const lt = defineAsyncComponent(() => import('./lt.vue'))
