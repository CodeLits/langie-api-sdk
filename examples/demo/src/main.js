import { createApp } from 'vue'
import App from './App.vue'
import { lt, LanguageSelect, InterfaceLanguageSelect } from 'langie-api-sdk/components'
import { setLtDefaults } from 'langie-api-sdk'
import './input.css'

const app = createApp(App)

// Register components globally
app.component('Lt', lt)
app.component('LanguageSelect', LanguageSelect)
app.component('InterfaceLanguageSelect', InterfaceLanguageSelect)

// Set global defaults for lt component
setLtDefaults({
  ctx: 'ui', // default context
  orig: 'en' // optional original language (no default)
})

app.mount('#app')
