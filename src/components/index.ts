/**
 * Vue components for translation
 */
import { h, defineComponent, defineAsyncComponent } from 'vue'

// Lazy load components to avoid SSR issues
export const LanguageSelect = defineAsyncComponent(() => import('./LanguageSelect.vue'))
export const T = defineAsyncComponent(() => import('./T.vue'))

// SSR-safe fallbacks
export const LanguageSelectSSR = defineComponent({
	name: 'LanguageSelect',
	render: () => h('div')
})

export const TSSR = defineComponent({
	name: 'T',
	render: () => h('span')
})
