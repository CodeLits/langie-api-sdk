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
