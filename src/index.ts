/**
 * Vue Translator SDK
 * Main entry point for the SDK
 */

// Core exports
export { useLangie } from './useLangie'
export { translateBatch } from './core'

// Component exports
export { default as LanguageSelect } from './components/LanguageSelect.vue'
export { default as SimpleLanguageSelect } from './components/SimpleLanguageSelect.vue'
export { default as InterfaceLanguageSelect } from './components/InterfaceLanguageSelect.vue'
export { default as lt } from './components/lt.vue'

// Type exports
export type { TranslatorOptions, TranslatorLanguage, TranslateServiceResponse } from './types'

// Constant exports
export {
  DEFAULT_API_HOST,
  DEV_API_HOST,
  API_FIELD_TEXT,
  API_FIELD_FROM,
  API_FIELD_TO,
  API_FIELD_CTX,
  API_FIELD_TRANSLATED,
  API_FIELD_TRANSLATIONS
} from './constants'
export { COLORS, THEME_COLORS, CSS_VARS } from './constants/colors'

// Theme utilities
export { setThemeColors, clearThemeColors } from './utils/theme'

// Language aliases
export { LANGUAGE_ALIAS_TABLE, type AliasEntry } from './language-aliases'

// Import teleport styles to ensure flag styling works out of the box
import './styles/teleport.css'

export { getCountryCode } from './utils/getCountryCode'

// Export language mapping utilities
export { detectBrowserLanguage, BROWSER_LANGUAGE_MAP } from './utils/languageMapping'
