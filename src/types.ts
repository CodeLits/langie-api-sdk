/**
 * Type definitions for Vue Translator SDK
 */

/**
 * Language definition returned by the translation service
 */
export interface TranslatorLanguage {
  code: string
  name: string
  native_name: string
  popularity?: number
  flag_country?: string
}

/**
 * Translation request body
 */
export interface TranslateRequestBody {
  text: string
  from_lang?: string
  to_lang?: string
  context?: string
}

/**
 * Translation service response
 */
export interface TranslateServiceResponse {
  text: string
  translated: string
  translations?: TranslateServiceResponse[]
  t?: string // legacy field for single translation
}

/**
 * Configuration options for the translator
 */
export interface TranslatorOptions {
  translatorHost?: string
  apiKey?: string
  defaultLanguage?: string
  fallbackLanguage?: string
  minPopularity?: number
  country?: string
  region?: string
}
