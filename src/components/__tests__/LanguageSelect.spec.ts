import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageSelect from '../LanguageSelect.vue'
import type { TranslatorLanguage } from '../../types'

// Mock Multiselect component
vi.mock('@vueform/multiselect', () => ({
  default: {
    name: 'Multiselect',
    template:
      '<div class="mock-multiselect"><slot name="option" v-for="option in options" :option="option" :key="option.code"></slot></div>',
    props: [
      'modelValue',
      'options',
      'searchable',
      'canClear',
      'allowEmpty',
      'object',
      'placeholder',
      'disabled',
      'loading',
      'trackBy',
      'label',
      'valueProp',
      'filterResults'
    ]
  }
}))

// Mock Fuse.js
vi.mock('fuse.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    search: vi.fn().mockReturnValue([])
  }))
}))

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
  },
  {
    code: 'de',
    name: 'German',
    native_name: 'Deutsch',
    popularity: 85,
    flag_country: 'DE'
  }
]

describe('LanguageSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should filter out the currently selected language from options', async () => {
    const selectedLanguage = mockLanguages[0] // English

    const wrapper = mount(LanguageSelect, {
      props: {
        modelValue: selectedLanguage,
        languages: mockLanguages
      }
    })

    // Wait for component to be ready
    await wrapper.vm.$nextTick()

    // Get the filteredLanguages computed property
    const filteredLanguages = (wrapper.vm as unknown as { filteredLanguages: TranslatorLanguage[] })
      .filteredLanguages

    // Should have 3 languages (original 4 minus the selected one)
    expect(filteredLanguages).toHaveLength(3)

    // Should not include the selected language
    expect(filteredLanguages.find((lang: TranslatorLanguage) => lang.code === 'en')).toBeUndefined()

    // Should include all other languages
    expect(filteredLanguages.find((lang: TranslatorLanguage) => lang.code === 'es')).toBeDefined()
    expect(filteredLanguages.find((lang: TranslatorLanguage) => lang.code === 'fr')).toBeDefined()
    expect(filteredLanguages.find((lang: TranslatorLanguage) => lang.code === 'de')).toBeDefined()
  })

  it('should include all languages when no language is selected', async () => {
    const wrapper = mount(LanguageSelect, {
      props: {
        modelValue: null,
        languages: mockLanguages
      }
    })

    await wrapper.vm.$nextTick()

    const filteredLanguages = (wrapper.vm as unknown as { filteredLanguages: TranslatorLanguage[] })
      .filteredLanguages

    // Should have all 4 languages when none is selected
    expect(filteredLanguages).toHaveLength(4)

    // Should include all languages
    expect(filteredLanguages.find((lang: TranslatorLanguage) => lang.code === 'en')).toBeDefined()
    expect(filteredLanguages.find((lang: TranslatorLanguage) => lang.code === 'es')).toBeDefined()
    expect(filteredLanguages.find((lang: TranslatorLanguage) => lang.code === 'fr')).toBeDefined()
    expect(filteredLanguages.find((lang: TranslatorLanguage) => lang.code === 'de')).toBeDefined()
  })

  it('should update filtered languages when selected language changes', async () => {
    const wrapper = mount(LanguageSelect, {
      props: {
        modelValue: mockLanguages[0], // Initially English
        languages: mockLanguages
      }
    })

    await wrapper.vm.$nextTick()

    // Initially should not include English
    let filteredLanguages = (wrapper.vm as unknown as { filteredLanguages: TranslatorLanguage[] })
      .filteredLanguages
    expect(filteredLanguages.find((lang: TranslatorLanguage) => lang.code === 'en')).toBeUndefined()
    expect(filteredLanguages.find((lang: TranslatorLanguage) => lang.code === 'es')).toBeDefined()

    // Change selected language to Spanish
    await wrapper.setProps({
      modelValue: mockLanguages[1] // Spanish
    })

    // Now should not include Spanish, but should include English
    filteredLanguages = (wrapper.vm as unknown as { filteredLanguages: TranslatorLanguage[] })
      .filteredLanguages
    expect(filteredLanguages.find((lang: TranslatorLanguage) => lang.code === 'es')).toBeUndefined()
    expect(filteredLanguages.find((lang: TranslatorLanguage) => lang.code === 'en')).toBeDefined()
  })

  it('should handle empty languages array', async () => {
    const wrapper = mount(LanguageSelect, {
      props: {
        modelValue: null,
        languages: []
      }
    })

    await wrapper.vm.$nextTick()

    const filteredLanguages = (wrapper.vm as unknown as { filteredLanguages: TranslatorLanguage[] })
      .filteredLanguages
    expect(filteredLanguages).toHaveLength(0)
  })
})
