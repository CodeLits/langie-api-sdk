/**
 * Vue Translator SDK
 * Main entry point for the SDK
 */

// Export core functionality
export { translateBatch, fetchAvailableLanguages } from './core'
export { useTranslator } from './useTranslator'

// Export types
export type {
	TranslateRequestBody,
	TranslateServiceResponse,
	TranslatorLanguage
} from './types'

// Export components
export { LanguageSelect, T } from './components'
