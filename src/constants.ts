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
