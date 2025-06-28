import { createApp, ref } from 'vue'
// Explicit global CSS imports (executed once when module loads)
import 'langie-api-sdk/dist/index.css'
import '@vueform/multiselect/themes/default.css'

import { LanguageSelect } from 'langie-api-sdk/components'

createApp({
  components: { LanguageSelect },
  setup() {
    const picked = ref(null)
    const langs = ref([
      { code: 'en', name: 'English', native_name: 'English' },
      { code: 'fr', name: 'French', native_name: 'Français' },
      { code: 'it', name: 'Italian', native_name: 'Italiano' }
    ])
    return { picked, langs }
  },
  template: `
    <main>
      <h2>Global CSS import demo</h2>
      <p>Here we explicitly import SDK & Multiselect styles in JS.<br>Component is imported from <code>langie-api-sdk/components</code>.</p>
      <LanguageSelect v-model="picked" :languages="langs" placeholder="Pick language" />
      <p style="margin-top:1rem">Selected: {{ picked ? picked.name : 'none' }}</p>
    </main>
  `
}).mount('#app')
