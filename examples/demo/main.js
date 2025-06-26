import { createApp } from 'vue'
import App from './App.vue'
import VueSelect from 'vue3-select-component'

const app = createApp(App)
app.component('VueSelect', VueSelect)
app.mount('#app')
