/**
 * Vue Translator SDK
 * Main entry point for the SDK
 */

// Export core functionality
export { translateBatch, fetchAvailableLanguages } from './core'
export { useLangie } from './useLangie'

// Export constants
export { DEFAULT_API_HOST, DEFAULT_TRANSLATOR_OPTIONS, DEV_API_HOST } from './constants'

// Export types
export type { TranslateRequestBody, TranslateServiceResponse, TranslatorLanguage } from './types'
export type {
  LanguageSelectProps,
  SimpleLanguageSelectProps,
  InterfaceLanguageSelectProps,
  ltProps
} from './components'

// Export utility functions
export { isClientOnly, isNuxtEnvironment, shouldUseClientOnly } from './utils/client-only'
export { applyLanguageAlias } from './search-utils'

// Export language aliases
export { LANGUAGE_ALIAS_TABLE } from './language-aliases'

// Export components
export { LanguageSelect, SimpleLanguageSelect, InterfaceLanguageSelect, lt } from './components'

// Import teleport styles to ensure flag styling works out of the box
import './styles/teleport.css'
