import { ref } from 'vue'

export function useTheme() {
  const isDark = ref(false)

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('darkMode', isDark.value.toString())
    updateTheme()
  }

  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const initTheme = () => {
    const savedDarkMode = localStorage.getItem('darkMode')
    let darkMode = false

    if (savedDarkMode !== null) {
      // User has explicitly set a preference
      darkMode = savedDarkMode === 'true'
    } else {
      // No saved preference, use system preference
      darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      // Save the detected system preference
      localStorage.setItem('darkMode', darkMode.toString())
    }

    isDark.value = darkMode
    updateTheme()
  }

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}
