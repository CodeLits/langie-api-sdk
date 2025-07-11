import { createApp } from 'vue'
import App from './App.vue'
import { lt, LanguageSelect, InterfaceLanguageSelect } from 'langie-api-sdk/components'
import './input.css'

const app = createApp(App)

// Register components globally
app.component('Lt', lt)
app.component('LanguageSelect', LanguageSelect)
app.component('InterfaceLanguageSelect', InterfaceLanguageSelect)

app.mount('#app')
