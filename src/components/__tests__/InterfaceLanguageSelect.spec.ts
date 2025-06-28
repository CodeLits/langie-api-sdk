import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/vue'
import InterfaceLanguageSelect from '../InterfaceLanguageSelect.vue'
import type { TranslatorLanguage } from '../../types'

// Mock useLangie composable
const mockLanguages: TranslatorLanguage[] = [
  { code: 'en', name: 'English', native_name: 'English', flag_country: 'us' },
  { code: 'ru', name: 'Russian', native_name: 'Русский', flag_country: 'ru' },
  { code: 'fr', name: 'French', native_name: 'Français', flag_country: 'fr' }
]

vi.mock('../../useLangie', () => ({
  useLangie: () => ({
    availableLanguages: { value: mockLanguages },
    currentLanguage: { value: 'en' },
    setLanguage: vi.fn(),
    isLoading: { value: false }
  })
}))

describe('InterfaceLanguageSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders properly', () => {
    const { container } = render(InterfaceLanguageSelect)

    // Should render the multiselect component
    const multiselect = container.querySelector('[data-multiselect]')
    expect(multiselect).toBeTruthy()
  })

  it('uses default placeholder', () => {
    const { container } = render(InterfaceLanguageSelect)

    // Should have default placeholder
    const input = container.querySelector('input')
    expect(input?.placeholder).toBe('Select interface language')
  })

  it('accepts custom placeholder', () => {
    const { container } = render(InterfaceLanguageSelect, {
      props: {
        placeholder: 'Choose UI language'
      }
    })

    const input = container.querySelector('input')
    expect(input?.placeholder).toBe('Choose UI language')
  })

  it('applies dark theme class', () => {
    const { container } = render(InterfaceLanguageSelect, {
      props: {
        isDark: true
      }
    })

    const wrapper = container.querySelector('.language-select')
    expect(wrapper?.classList.contains('is-dark')).toBe(true)
  })

  it('emits update:modelValue event', () => {
    const { emitted } = render(InterfaceLanguageSelect)

    // Component should emit the current language object on mount
    expect(emitted()['update:modelValue']).toBeTruthy()
  })
})
