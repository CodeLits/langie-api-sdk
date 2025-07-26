/**
 * TypeScript declarations for langie-api-sdk
 */

// API field constants
declare const API_FIELD_TEXT: 't'
declare const API_FIELD_FROM: 'from'
declare const API_FIELD_TO: 'to'
declare const API_FIELD_CTX: 'ctx'
declare const API_FIELD_TRANSLATIONS: 'translations'

// Core exports
export declare function useLangie(options?: TranslatorOptions): {
  availableLanguages: import('vue').Ref<TranslatorLanguage[]>
  translations: { [key: string]: string }
  uiTranslations: { [key: string]: string }
  currentLanguage: import('vue').Ref<string>
  isLoading: import('vue').Ref<boolean>
  setLanguage: (lang: string) => void
  fetchLanguages: (opts?: { force?: boolean; country?: string }) => Promise<TranslatorLanguage[]>
  l: (text: string, ctx?: string, originalLang?: string) => string
  lr: (text: string, ctx?: string, originalLang?: string) => string
  fetchAndCacheBatch: (
    items: { text: string; ctx?: string }[],
    from?: string,
    to?: string,
    globalCtx?: string
  ) => Promise<void>
  getTranslationError: (text: string, ctx?: string, from?: string, to?: string) => string | null
  cleanup: () => void
  getBatchingStats: () => {
    pendingRequests: number
    queuedBatches: number
    queuedThisTick: number
    hasFlushTimeout: boolean
  }
  setLtDefaults: (defaults: { ctx?: string; orig?: string }) => void
  getLtDefaults: () => { ctx: string; orig: string }
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
  [API_FIELD_TEXT]: string
  [API_FIELD_FROM]?: string
  [API_FIELD_TO]?: string
  [API_FIELD_CTX]?: string
}

export interface TranslateServiceResponse {
  [API_FIELD_TEXT]?: string
  [API_FIELD_FROM]?: string
  [API_FIELD_TRANSLATIONS]?: TranslateServiceResponse[]
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

// Runtime translation helper – same as returned from useLangie but accessible directly after global initialisation
export declare function l(text: string, ctx?: string, originalLang?: string): string

// Country code detection utility
export declare function getCountryCode(): Promise<string>

// Language mapping utilities
export declare const BROWSER_LANGUAGE_MAP: Record<string, string>
export declare function detectBrowserLanguage(): string

// lt component defaults management
export declare function setLtDefaults(defaults: { ctx?: string; orig?: string }): void
export declare function getLtDefaults(): { ctx: string; orig: string }
