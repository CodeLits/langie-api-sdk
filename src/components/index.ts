/**
 * Vue components for translation
 */
import { defineAsyncComponent } from 'vue'
import ltComponent from './lt.vue'

// Export lt as a regular synchronous component for immediate use
export const lt = ltComponent

// Export LanguageSelect as async component since it has more dependencies
export const LanguageSelect = defineAsyncComponent(() => import('./LanguageSelect.vue'))
