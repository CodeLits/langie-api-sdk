import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTranslator } from './useTranslator'
import type { TranslatorLanguage } from './types'

vi.mock('./core', () => ({
  fetchAvailableLanguages: vi.fn(),
  translateBatch: vi.fn()
}))

describe('useTranslator', () => {
  let core: typeof import('./core')
  let useTranslatorFresh: typeof import('./useTranslator').useTranslator

  beforeEach(async () => {
    vi.resetModules()
    core = await import('./core')
    useTranslatorFresh = (await import('./useTranslator')).useTranslator
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
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

  it('fetches and caches languages', async () => {
    const mockLangs: TranslatorLanguage[] = [
      { code: 'en', name: 'English', native_name: 'English' }
    ]
    vi.mocked(core).fetchAvailableLanguages.mockResolvedValue(mockLangs)

    const translator = useTranslatorFresh()

    // First call
    const langs1 = await translator.fetchLanguages()
    expect(langs1).toEqual(mockLangs)
    expect(core.fetchAvailableLanguages).toHaveBeenCalledTimes(1)

    // Second call should hit cache
    const langs2 = await translator.fetchLanguages()
    expect(langs2).toEqual(mockLangs)
    expect(core.fetchAvailableLanguages).toHaveBeenCalledTimes(1) // Should not be called again

    // Force refetch
    await translator.fetchLanguages({ force: true })
    expect(core.fetchAvailableLanguages).toHaveBeenCalledTimes(2)
  })

  it('queues translations and flushes them', async () => {
    const translator = useTranslatorFresh()
    translator.setLanguage('es')

    // Mock fetch for this test
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        translations: [
          { text: 'hello', translated: 'hola' },
          { text: 'world', translated: 'mundo' }
        ]
      })
    } as unknown as Response)

    // Call t() for two different keys
    const r1 = translator.t('hello')
    const r2 = translator.t('world')

    // Initially, should return original text
    expect(r1).toBe('hello')
    expect(r2).toBe('world')

    // Advance timers to trigger the flush
    await vi.advanceTimersByTimeAsync(100)

    // Check that fetch was called once with both items
    expect(global.fetch).toHaveBeenCalledTimes(1)
    const fetchBody = JSON.parse((global.fetch as any).mock.calls[0][1].body)
    expect(fetchBody.translations).toHaveLength(2)
    expect(fetchBody.translations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: 'hello', to_lang: 'es' }),
        expect.objectContaining({ text: 'world', to_lang: 'es' })
      ])
    )

    // Now, calling t() again should return the translated text from cache
    const r3 = translator.t('hello')
    const r4 = translator.t('world')
    expect(r3).toBe('hola')
    expect(r4).toBe('mundo')
  })
})
