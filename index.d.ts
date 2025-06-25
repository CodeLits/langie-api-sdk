import { TranslatorLanguage, TranslateServiceResponse, TranslateServiceResponseTranslation } from './types'

// Runtime helpers / composables ------------------------------------------------

import type { DefineComponent } from 'vue'

// Export the composable for reactive translation handling
export function useTranslator(): any

// Lightweight translation component (<T>)
export const T: DefineComponent<any, any, any>

export { TranslatorLanguage, TranslateServiceResponse, TranslateServiceResponseTranslation }

export function translateBatch(translations: Array<{ text: string; from_lang: string; to_lang: string }>, options?: Record<string, any>): Promise<TranslateServiceResponseTranslation[]>;

export function fetchAvailableLanguages(options?: Record<string, any>): Promise<TranslatorLanguage[]>;

// Re-exporting runtime components is unnecessary in a .d.ts file because
// the implementation (.js) file already provides them. This file only augments
// type information.
