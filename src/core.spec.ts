import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { translateBatch, fetchAvailableLanguages } from './core'

// Mock the global fetch function
global.fetch = vi.fn()

describe('translateBatch', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.mocked(global.fetch).mockClear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('throws an error for empty translations array', async () => {
    await expect(translateBatch([])).rejects.toThrow('translations must be a non-empty array')
  })

  it('does not call fetch for same-language translations', async () => {
    const translations = [{ text: 'hello', from_lang: 'en', to_lang: 'en' }]
    const result = await translateBatch(translations)
    expect(global.fetch).not.toHaveBeenCalled()
    expect(result).toEqual([{ text: 'hello', translated: 'hello' }])
  })

  it('calls fetch for translations that need it', async () => {
    const translations = [{ text: 'hello', from_lang: 'en', to_lang: 'es' }]
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ translations: [{ text: 'hello', translated: 'hola' }] })
    } as Response)

    await translateBatch(translations)
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/translate'),
      expect.any(Object)
    )
  })

  it('handles successful API response', async () => {
    const translations = [{ text: 'hello', from_lang: 'en', to_lang: 'es' }]
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ translations: [{ text: 'hello', translated: 'hola' }] })
    } as Response)

    const result = await translateBatch(translations)
    expect(result).toEqual([{ text: 'hello', translated: 'hola' }])
  })

  it('handles API error response', async () => {
    const translations = [{ text: 'hello', from_lang: 'en', to_lang: 'es' }]
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Server error'
    } as Response)

    await expect(translateBatch(translations)).rejects.toThrow(
      'Translator service error: 500 Internal Server Error'
    )
  })

  it('handles network error', async () => {
    const translations = [{ text: 'hello', from_lang: 'en', to_lang: 'es' }]
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network failure'))

    await expect(translateBatch(translations)).rejects.toThrow(
      expect.stringContaining('Failed to connect to translator')
    )
  })

  it('handles timeout', async () => {
    const translations = [{ text: 'hello', from_lang: 'en', to_lang: 'es' }]
    vi.mocked(global.fetch).mockImplementation(async () => {
      await vi.advanceTimersByTimeAsync(6000) // Advance time by 6s, more than 5s timeout
      return new Response()
    })

    await expect(translateBatch(translations)).rejects.toThrow(
      expect.stringContaining('timed out after 5 seconds')
    )
  })

  it('reassembles results in correct order', async () => {
    const translations = [
      { text: 'one', from_lang: 'en', to_lang: 'es' },
      { text: 'two', from_lang: 'en', to_lang: 'en' },
      { text: 'three', from_lang: 'en', to_lang: 'fr' }
    ]

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        translations: [
          { text: 'one', translated: 'uno' },
          { text: 'three', translated: 'trois' }
        ]
      })
    } as Response)

    const result = await translateBatch(translations)
    expect(result).toEqual([
      { text: 'one', translated: 'uno' },
      { text: 'two', translated: 'two' },
      { text: 'three', translated: 'trois' }
    ])
  })
})

describe('fetchAvailableLanguages', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockClear()
  })

  it('calls fetch with correct URL', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => []
    } as Response)

    await fetchAvailableLanguages()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/languages'),
      expect.any(Object)
    )
  })

  it('includes query params when provided', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => []
    } as Response)

    await fetchAvailableLanguages({ country: 'US', region: 'Americas' })
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('?country=US&region=Americas'),
      expect.any(Object)
    )
  })

  it('handles successful API response', async () => {
    const mockLangs = [{ name: 'English', code: 'en' }]
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockLangs
    } as Response)

    const result = await fetchAvailableLanguages()
    expect(result).toEqual(mockLangs)
  })

  it('handles API error response', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500
    } as Response)

    await expect(fetchAvailableLanguages()).rejects.toThrow('Translator languages error: 500')
  })

  it('filters languages based on minPopularity', async () => {
    const mockLangs = [
      { name: 'English', code: 'en', popularity: 0.9 },
      { name: 'Klingon', code: 'tlh', popularity: 0.01 }
    ]
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockLangs
    } as Response)

    const result = await fetchAvailableLanguages({ minPopularity: 0.5 })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('English')
  })
})
