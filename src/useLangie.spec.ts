import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { TranslatorLanguage } from './types'

// Mock the core module
vi.mock('./core', () => ({
  fetchAvailableLanguages: vi.fn(),
  translateBatch: vi.fn()
}))

describe('useLangie', () => {
  let useLangieFresh: typeof import('./useLangie').useLangie
  let core: typeof import('./core')

  beforeEach(async () => {
    vi.resetModules()
    core = await import('./core')
    useLangieFresh = (await import('./useLangie')).useLangie
    vi.clearAllMocks()
  })

  it('initializes correctly', () => {
    const { currentLanguage, availableLanguages } = useLangieFresh({ defaultLanguage: 'fr' })

    expect(currentLanguage.value).toBe('fr')
    expect(availableLanguages.value).toEqual([])
  })

  it('sets language correctly', () => {
    const { currentLanguage, setLanguage } = useLangieFresh()
    expect(currentLanguage.value).toBe('en') // default
    setLanguage('de')
    expect(currentLanguage.value).toBe('de')
  })

  it('fetches languages', async () => {
    const mockLangs: TranslatorLanguage[] = [
      { code: 'en', name: 'English', native_name: 'English' }
    ]

    // Mock global fetch instead of core.fetchAvailableLanguages
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockLangs)
    })
    global.fetch = mockFetch

    const translator = useLangieFresh()
    const langs = await translator.fetchLanguages()

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(langs).toEqual(expect.arrayContaining(mockLangs))
  })

  it('returns original text when calling l() initially', () => {
    const translator = useLangieFresh()
    translator.setLanguage('es')

    const result = translator.l('hello')
    expect(result).toBe('hello') // Should return original text initially
  })
})
