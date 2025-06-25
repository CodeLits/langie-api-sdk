import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { TranslatorLanguage } from './types'

// Mock the core module
vi.mock('./core', () => ({
  fetchAvailableLanguages: vi.fn(),
  translateBatch: vi.fn()
}))

describe('useTranslator', () => {
  let useTranslatorFresh: typeof import('./useTranslator').useTranslator
  let core: typeof import('./core')

  beforeEach(async () => {
    vi.resetModules()
    core = await import('./core')
    useTranslatorFresh = (await import('./useTranslator')).useTranslator
    vi.clearAllMocks()
  })

  it('initializes correctly', () => {
    const { currentLanguage, availableLanguages } = useTranslatorFresh({ defaultLanguage: 'fr' })

    expect(currentLanguage.value).toBe('fr')
    expect(availableLanguages.value).toEqual([])
  })

  it('sets language correctly', () => {
    const { currentLanguage, setLanguage } = useTranslatorFresh()
    expect(currentLanguage.value).toBe('en') // default
    setLanguage('de')
    expect(currentLanguage.value).toBe('de')
  })

  it('fetches languages', async () => {
    const mockLangs: TranslatorLanguage[] = [
      { code: 'en', name: 'English', native_name: 'English' }
    ]
    vi.mocked(core.fetchAvailableLanguages).mockResolvedValue(mockLangs)

    const translator = useTranslatorFresh()
    const langs = await translator.fetchLanguages()

    expect(core.fetchAvailableLanguages).toHaveBeenCalledTimes(1)
    expect(langs).toEqual(expect.arrayContaining(mockLangs))
  })

  it('returns original text when calling t() initially', () => {
    const translator = useTranslatorFresh()
    translator.setLanguage('es')

    const result = translator.t('hello')
    expect(result).toBe('hello') // Should return original text initially
  })
})
