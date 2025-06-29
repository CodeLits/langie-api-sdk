/**
 * TypeScript declarations for langie-api-sdk
 */

// Core exports
export declare function useLangie(options?: TranslatorOptions): {
  availableLanguages: import('vue').Ref<TranslatorLanguage[]>
  translations: { [key: string]: string }
  uiTranslations: { [key: string]: string }
  currentLanguage: import('vue').Ref<string>
  isLoading: import('vue').Ref<boolean>
  setLanguage: (lang: string) => void
  fetchLanguages: (opts?: { force?: boolean; country?: string }) => Promise<TranslatorLanguage[]>
  l: (text: string, context?: string, originalLang?: string) => string
  fetchAndCacheBatch: (
    items: { text: string; context?: string }[],
    fromLang?: string,
    toLang?: string
  ) => Promise<void>
  cleanup: () => void
  getBatchingStats: () => {
    pendingRequests: number
    queuedBatches: number
    queuedThisTick: number
    hasFlushTimeout: boolean
  }
}

export declare function translateBatch(
  translations: TranslateRequestBody[]
): Promise<TranslateServiceResponse[]>

// Type exports
export interface TranslatorLanguage {
  code: string
  name: string
  native_name: string
  popularity?: number
  flag_country?: string
  value?: string
}

export interface TranslateRequestBody {
  text: string
  from_lang?: string
  to_lang?: string
  context?: string
}

export interface TranslateServiceResponse {
  text: string
  translated: string
  translations?: TranslateServiceResponse[]
  t?: string
}

export interface TranslatorOptions {
  translatorHost?: string
  apiKey?: string
  defaultLanguage?: string
  fallbackLanguage?: string
  initialBatchDelay?: number
  followupBatchDelay?: number
  maxBatchSize?: number
  minPopularity?: number
  country?: string
  region?: string
}

// Constant exports
export declare const DEFAULT_API_HOST: string
export declare const DEV_API_HOST: string
export declare const COLORS: {
  primary: { blue: string; blueHover: string }
  text: { primary: string; secondary: string }
  neutral: { gray400: string }
  border: { flag: string; dark: string }
}
export declare const THEME_COLORS: {
  light: {
    background: string
    backgroundDisabled: string
    border: string
    ring: string
    placeholder: string
    optionPointed: string
    optionPointedText: string
    optionSelected: string
    optionSelectedText: string
    dropdownBackground: string
    dropdownBorder: string
  }
  dark: {
    background: string
    backgroundDisabled: string
    border: string
    placeholder: string
    ring: string
    optionPointed: string
    optionPointedText: string
    optionSelected: string
    optionSelectedText: string
    dropdownBackground: string
    dropdownBorder: string
    dropdownText: string
  }
}
export declare const CSS_VARS: {
  '--langie-primary': string
  '--langie-primary-hover': string
}

// Theme utilities
export declare function setThemeColors(colors: { primary?: string; primaryHover?: string }): void
export declare function clearThemeColors(): void

// Language aliases
export interface AliasEntry {
  primary: string | string[]
  suggestions: string[]
}
export declare const LANGUAGE_ALIAS_TABLE: Record<string, AliasEntry>

// Vue component exports (for runtime use, not TypeScript declarations)
export declare const LanguageSelect: any
export declare const SimpleLanguageSelect: any
export declare const InterfaceLanguageSelect: any
export declare const lt: any
