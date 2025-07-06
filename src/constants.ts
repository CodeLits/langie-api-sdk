/**
 * Default API configuration constants
 */
export const DEFAULT_API_HOST = 'https://api.langie.uk/v1'

/**
 * Development/Demo API host for local testing
 */
export const DEV_API_HOST = 'http://localhost:8081/v1'

/**
 * Default translator options
 */
export const DEFAULT_TRANSLATOR_OPTIONS = {
  translatorHost: DEFAULT_API_HOST,
  defaultLanguage: 'en',
  fallbackLanguage: 'en'
} as const

/**
 * API field constants
 * Used throughout the SDK to ensure consistency
 */

// Translation text field
export const API_FIELD_TEXT = 't'

// Source language field
export const API_FIELD_FROM = 'from'

// Target language field
export const API_FIELD_TO = 'to'

// Context field
export const API_FIELD_CTX = 'ctx'

// Translated text field (same as text field for response)
export const API_FIELD_TRANSLATED = 't'

// Translations array field
export const API_FIELD_TRANSLATIONS = 'translations'
