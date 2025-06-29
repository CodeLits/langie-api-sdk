import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLangie, __resetLangieSingletonForTests } from './useLangie'

describe('useLangie', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    __resetLangieSingletonForTests()
    // Small delay to ensure singleton is reset
    return new Promise((resolve) => setTimeout(resolve, 10))
  })

  it('initializes correctly', () => {
    const { currentLanguage, availableLanguages } = useLangie({ defaultLanguage: 'fr' })

    expect(currentLanguage.value).toBe('fr')
    expect(availableLanguages.value).toEqual([])
  })

  it('sets language correctly', () => {
    const { currentLanguage, setLanguage } = useLangie({ defaultLanguage: 'en' })
    // The default language should be 'en' unless overridden
    expect(currentLanguage.value).toBe('en') // default
    setLanguage('de')
    expect(currentLanguage.value).toBe('de')
  })

  it('returns original text when calling l() initially', () => {
    const translator = useLangie()
    translator.setLanguage('es')

    const result = translator.l('hello')
    expect(result).toBe('hello') // Should return original text initially
  })

  it('skips translation when source and target languages are the same', () => {
    const translator = useLangie()
    translator.setLanguage('en')

    const result = translator.l('hello', 'ui', 'en')
    expect(result).toBe('hello') // Should return original text when languages are the same
  })
})
