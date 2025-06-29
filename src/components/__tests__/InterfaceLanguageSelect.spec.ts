import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import InterfaceLanguageSelect from '../InterfaceLanguageSelect.vue'
import type { TranslatorLanguage } from '../../types'

// Mock LanguageSelect component
vi.mock('../LanguageSelect.vue', () => ({
  default: {
    name: 'LanguageSelect',
    template: '<div class="mock-language-select"></div>',
    props: ['modelValue', 'languages', 'placeholder', 'disabled', 'isDark']
  }
}))

// Mock useLangie composable
const mockSetLanguage = vi.fn()
const mockCurrentLanguage = ref('')
const mockAvailableLanguages = ref([])

vi.mock('../../useLangie', () => ({
  useLangie: () => ({
    availableLanguages: mockAvailableLanguages,
    currentLanguage: mockCurrentLanguage,
    setLanguage: mockSetLanguage
  })
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock navigator.languages
const mockNavigator = {
  languages: ['en-US', 'en'],
  language: 'en-US'
}
Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
})

const mockLanguages: TranslatorLanguage[] = [
  {
    code: 'en',
    name: 'English',
    native_name: 'English',
    popularity: 100,
    flag_country: 'US'
  },
  {
    code: 'es',
    name: 'Spanish',
    native_name: 'Español',
    popularity: 95,
    flag_country: 'ES'
  },
  {
    code: 'fr',
    name: 'French',
    native_name: 'Français',
    popularity: 90,
    flag_country: 'FR'
  }
]

describe('InterfaceLanguageSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentLanguage.value = ''
    mockAvailableLanguages.value = []
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should detect browser language when custom languages are provided', async () => {
    // Set browser language to Spanish
    mockNavigator.languages = ['es-ES', 'es']
    mockNavigator.language = 'es-ES'

    mount(InterfaceLanguageSelect, {
      props: {
        languages: mockLanguages
      }
    })

    await new Promise((resolve) => setTimeout(resolve, 10)) // Allow watchers to run

    // Should have called setLanguage with Spanish
    expect(mockSetLanguage).toHaveBeenCalledWith('es')
  })

  it('should detect English browser language when custom languages are provided', async () => {
    // Set browser language to English
    mockNavigator.languages = ['en-US', 'en']
    mockNavigator.language = 'en-US'

    mount(InterfaceLanguageSelect, {
      props: {
        languages: mockLanguages
      }
    })

    await new Promise((resolve) => setTimeout(resolve, 10)) // Allow watchers to run

    // Should have called setLanguage with English
    expect(mockSetLanguage).toHaveBeenCalledWith('en')
  })

  it('should use saved language from localStorage if it exists in custom languages', async () => {
    mockLocalStorage.getItem.mockReturnValue('fr')
    mockNavigator.languages = ['en-US', 'en']

    mount(InterfaceLanguageSelect, {
      props: {
        languages: mockLanguages
      }
    })

    await new Promise((resolve) => setTimeout(resolve, 10)) // Allow watchers to run

    // Should have called setLanguage with saved French language
    expect(mockSetLanguage).toHaveBeenCalledWith('fr')
  })

  it('should fallback to browser language if saved language does not exist in custom languages', async () => {
    // Saved language is German, but not available in custom languages
    mockLocalStorage.getItem.mockReturnValue('de')
    mockNavigator.languages = ['es-ES', 'es']

    mount(InterfaceLanguageSelect, {
      props: {
        languages: mockLanguages
      }
    })

    await new Promise((resolve) => setTimeout(resolve, 10)) // Allow watchers to run

    // Should have called setLanguage with browser language (Spanish) since German is not available
    expect(mockSetLanguage).toHaveBeenCalledWith('es')
  })

  it('should not set language if browser language is not available in custom languages', async () => {
    // Set browser language to German which is not in mockLanguages
    mockNavigator.languages = ['de-DE', 'de']
    mockNavigator.language = 'de-DE'

    mount(InterfaceLanguageSelect, {
      props: {
        languages: mockLanguages
      }
    })

    await new Promise((resolve) => setTimeout(resolve, 10)) // Allow watchers to run

    // Should not have called setLanguage since German is not available
    expect(mockSetLanguage).not.toHaveBeenCalled()
  })

  it('should not set language if current language is already set', async () => {
    // Set current language to something
    mockCurrentLanguage.value = 'fr'
    mockNavigator.languages = ['en-US', 'en']

    mount(InterfaceLanguageSelect, {
      props: {
        languages: mockLanguages
      }
    })

    await new Promise((resolve) => setTimeout(resolve, 10)) // Allow watchers to run

    // Should not have called setLanguage since a language is already set
    expect(mockSetLanguage).not.toHaveBeenCalled()
  })
})
