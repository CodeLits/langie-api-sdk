declare module 'langie-api-sdk/components' {
  import type { DefineComponent } from 'vue'

  // Component type definitions
  export interface LanguageSelectProps {
    showFlags?: boolean
    showNativeNames?: boolean
    class?: string
    modelValue?: any
    placeholder?: string
    disabled?: boolean
    isDark?: boolean
    languages?: any[]
  }

  export interface SimpleLanguageSelectProps {
    showNativeNames?: boolean
    placeholder?: string
    disabled?: boolean
    class?: string
    modelValue?: any
    languages?: any[]
  }

  export interface ltProps {
    msg?: string
    ctx?: string
    orig?: string
  }

  export interface InterfaceLanguageSelectProps {
    placeholder?: string
    disabled?: boolean
    isDark?: boolean
    class?: string
    modelValue?: any
    languages?: any[]
    translatorHost?: string
    apiKey?: string
  }

  // Component declarations
  export const LanguageSelect: DefineComponent<LanguageSelectProps>
  export const SimpleLanguageSelect: DefineComponent<SimpleLanguageSelectProps>
  export const InterfaceLanguageSelect: DefineComponent<InterfaceLanguageSelectProps>
  export const lt: DefineComponent<ltProps>
}
