/**
 * Default API configuration constants
 */
export const DEFAULT_API_HOST = 'https://api.langie.uk/v1'

/**
 * Default translator options
 */
export const DEFAULT_TRANSLATOR_OPTIONS = {
  translatorHost: DEFAULT_API_HOST,
  defaultLanguage: 'en',
  fallbackLanguage: 'en'
} as const
