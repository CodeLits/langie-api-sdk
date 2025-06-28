/**
 * Vue components for translation
 */
import ltComponent from './lt.vue'
import LanguageSelectComponent from './LanguageSelect.vue'
import SimpleLanguageSelectComponent from './SimpleLanguageSelect.vue'
import InterfaceLanguageSelectComponent from './InterfaceLanguageSelect.vue'

// Export components as synchronous components for immediate use
export const lt = ltComponent
export const LanguageSelect = LanguageSelectComponent
export const SimpleLanguageSelect = SimpleLanguageSelectComponent
export const InterfaceLanguageSelect = InterfaceLanguageSelectComponent

// Re-export types
export type {
  LanguageSelectProps,
  SimpleLanguageSelectProps,
  InterfaceLanguageSelectProps,
  ltProps
} from './types'
