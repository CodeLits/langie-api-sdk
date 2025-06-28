import { createApp, ref } from 'vue'
import { LanguageSelect } from 'langie-api-sdk'

createApp({
  components: { LanguageSelect },
  setup() {
    const picked = ref(null)
    const langs = ref([
      { code: 'en', name: 'English', native_name: 'English' },
      { code: 'es', name: 'Spanish', native_name: 'Español' },
      { code: 'de', name: 'German', native_name: 'Deutsch' }
    ])
    return { picked, langs }
  },
  template: `
    <main style="padding:20px;font-family:sans-serif">
      <h2>Plain import demo (no CSS)</h2>
      <p>This page imports <code>LanguageSelect</code> exactly as you would in another project,<br> without any global CSS imports. Notice how flags lack borders etc.</p>
      <LanguageSelect v-model="picked" :languages="langs" placeholder="Pick language" />
      <p style="margin-top:1rem">Selected: {{ picked ? picked.name : 'none' }}</p>
    </main>
  `
}).mount('#app')
