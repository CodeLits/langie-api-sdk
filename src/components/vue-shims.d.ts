declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module 'vue-select' {
  import { DefineComponent } from 'vue'

  interface VSelectProps {
    value?: any
    options?: any[]
    reduce?: (option: any) => any
    label?: string
    filterable?: boolean
    searchable?: boolean
    placeholder?: string
    multiple?: boolean
    taggable?: boolean
    disabled?: boolean
    clearable?: boolean
    [key: string]: any
  }

  const VSelect: DefineComponent<VSelectProps>
  export default VSelect
}
