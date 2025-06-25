import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import LanguageSelect from '../LanguageSelect.vue'

const mockLanguages = [
  { value: 'en', name: 'English', native_name: 'English', flag: 'gb' },
  { value: 'ru', name: 'Russian', native_name: 'Русский', flag: 'ru' },
  { value: 'sr', name: 'Serbian', native_name: 'Српски', flag: 'rs' }
]

describe('LanguageSelect', () => {
  it('renders properly', () => {
    const { getByRole } = render(LanguageSelect, {
      props: {
        modelValue: 'ru',
        languages: mockLanguages
      }
    })
    expect(getByRole('combobox')).toBeTruthy()
  })

  it('emits update:modelValue event when selection changes', async () => {
    const { getByRole, findByText, emitted } = render(LanguageSelect, {
      props: {
        modelValue: 'ru',
        languages: mockLanguages
      }
    })
    const select = getByRole('combobox')
    await fireEvent.click(select) // Open the dropdown

    // Find and click the 'Serbian' option
    const serbianOption = await findByText('Српски')
    await fireEvent.click(serbianOption)

    // Check if the event was emitted with the correct value
    const updateEvent = emitted()['update:modelValue']
    expect(updateEvent).toBeTruthy()
    expect(updateEvent[0]).toEqual(['sr'])
  })

  it('displays flag for selected language', async () => {
    const { findByRole, container } = render(LanguageSelect, {
      props: {
        modelValue: 'ru',
        languages: mockLanguages
      }
    })

    const selected = container.querySelector('.vs__selected')
    expect(selected).toBeTruthy()
    if (selected) {
      const flag = selected.querySelector('img')
      expect(flag).toBeTruthy()
      expect(flag?.getAttribute('src')).toContain('flagcdn.com/ru.svg')
    }
  })
})
