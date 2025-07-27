import type { DefineComponent } from 'vue'

// Component type definitions
export type LanguageSelectProps = {
  showFlags?: boolean
  showNativeNames?: boolean
  class?: string
}

export type ltProps = {
  msg?: string
  ctx?: string
  orig?: string
}

export type InterfaceLanguageSelectProps = {
  placeholder?: string
  disabled?: boolean
  isDark?: boolean
  class?: string
}

// Component declarations
export declare const LanguageSelect: DefineComponent<LanguageSelectProps>
export declare const InterfaceLanguageSelect: DefineComponent<InterfaceLanguageSelectProps>
export declare const lt: DefineComponent<ltProps>
