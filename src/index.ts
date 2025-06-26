/**
 * Vue Translator SDK
 * Main entry point for the SDK
 */

// Export core functionality
export { translateBatch, fetchAvailableLanguages } from './core'
export { useTranslator } from './useTranslator'

// Export constants
export { DEFAULT_API_HOST, DEFAULT_TRANSLATOR_OPTIONS, DEV_API_HOST } from './constants'

// Export types
export type { TranslateRequestBody, TranslateServiceResponse, TranslatorLanguage } from './types'

// Export utility functions
export { isClientOnly, isNuxtEnvironment, shouldUseClientOnly } from './utils/client-only'

// Export components
export { LanguageSelect, lt } from './components'
