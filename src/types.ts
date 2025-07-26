import {
  API_FIELD_TEXT,
  API_FIELD_FROM,
  API_FIELD_TO,
  API_FIELD_CTX,
  API_FIELD_TRANSLATIONS,
  API_FIELD_ERROR
} from './constants'

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
  value?: string
}

/**
 * Translation request body
 */
export interface TranslateRequestBody {
  [API_FIELD_TEXT]: string
  [API_FIELD_FROM]?: string
  [API_FIELD_TO]?: string
  [API_FIELD_CTX]?: string
}

/**
 * Translation service response
 */
export interface TranslateServiceResponse {
  [API_FIELD_TEXT]?: string
  [API_FIELD_FROM]?: string
  [API_FIELD_TRANSLATIONS]?: TranslateServiceResponse[]
  [API_FIELD_ERROR]?: string // Error message from API
}

/**
 * Configuration options for the translator
 */
export interface TranslatorOptions {
  translatorHost?: string
  apiKey?: string
  defaultLanguage?: string
  fallbackLanguage?: string
  /**
   * Delay (ms) before the first batch of UI translations is sent.
   * Allows collecting more keys into a single request on initial page load.
   * Defaults to 100ms.
   */
  initialBatchDelay?: number
  /**
   * Debounce delay (ms) for subsequent flushes after the initial batch.
   * Defaults to 25ms.
   */
  followupBatchDelay?: number
  /**
   * Maximum number of translations to send in a single batch request.
   * Defaults to 50. Larger batches may be more efficient but could timeout.
   */
  maxBatchSize?: number
  minPopularity?: number
  country?: string
  region?: string
  ctx?: string // глобальный контекст переводов
}
