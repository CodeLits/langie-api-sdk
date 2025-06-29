import { describe, it, expect, vi, beforeEach } from 'vitest'
import { translateBatch, fetchAvailableLanguages } from './core'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Helper to create proper Response mock
const createMockResponse = (
  data: unknown,
  ok: boolean = true,
  status: number = 200,
  statusText: string = 'OK'
) => {
  const response = {
    ok,
    status,
    statusText,
    json: async () => data,
    text: async () => JSON.stringify(data),
    clone: () => response
  }
  return response as Response
}

describe('translateBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws an error for empty translations array', async () => {
    await expect(translateBatch([])).rejects.toThrow('translations must be a non-empty array')
  })

  it('does not call fetch for same-language translations', async () => {
    const translations = [{ text: 'hello', from_lang: 'en', to_lang: 'en' }]
    const result = await translateBatch(translations)
    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual([{ text: 'hello', translated: 'hello' }])
  })

  it('calls fetch for translations that need it', async () => {
    const translations = [{ text: 'hello', from_lang: 'en', to_lang: 'es' }]
    mockFetch.mockResolvedValue(
      createMockResponse({
        translations: [{ text: 'hello', translated: 'hola' }]
      })
    )

    await translateBatch(translations)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/translate'),
      expect.any(Object)
    )
  })

  it('handles successful API response', async () => {
    const translations = [{ text: 'hello', from_lang: 'en', to_lang: 'es' }]
    mockFetch.mockResolvedValue(
      createMockResponse({
        translations: [{ text: 'hello', translated: 'hola' }]
      })
    )

    const result = await translateBatch(translations)
    expect(result).toEqual([{ text: 'hello', translated: 'hola' }])
  })

  it('handles API error response', async () => {
    const translations = [{ text: 'hello', from_lang: 'en', to_lang: 'es' }]
    mockFetch.mockResolvedValue(
      createMockResponse('Server error', false, 500, 'Internal Server Error')
    )

    await expect(translateBatch(translations)).rejects.toThrow(/Failed to connect to translator/)
  })

  it('handles network error', async () => {
    const translations = [{ text: 'hello', from_lang: 'en', to_lang: 'es' }]
    mockFetch.mockRejectedValue(new Error('Network failure'))

    await expect(translateBatch(translations)).rejects.toThrow(/Failed to connect to translator/)
  })

  it('reassembles results in correct order', async () => {
    const translations = [
      { text: 'one', from_lang: 'en', to_lang: 'es' },
      { text: 'two', from_lang: 'en', to_lang: 'en' },
      { text: 'three', from_lang: 'en', to_lang: 'fr' }
    ]

    mockFetch.mockResolvedValue(
      createMockResponse({
        translations: [
          { text: 'one', translated: 'uno' },
          { text: 'three', translated: 'trois' }
        ]
      })
    )

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
    vi.clearAllMocks()
  })

  it('calls fetch with correct URL', async () => {
    mockFetch.mockResolvedValue(createMockResponse([]))

    await fetchAvailableLanguages()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/languages'),
      expect.any(Object)
    )
  })

  it('includes query params when provided', async () => {
    mockFetch.mockResolvedValue(createMockResponse([]))

    await fetchAvailableLanguages({ country: 'US', region: 'Americas' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('?country=US&region=Americas'),
      expect.any(Object)
    )
  })

  it('handles successful API response', async () => {
    const mockLangs = [{ name: 'English', code: 'en' }]
    mockFetch.mockResolvedValue(createMockResponse(mockLangs))

    const result = await fetchAvailableLanguages()
    expect(result).toEqual(mockLangs)
  })

  it('handles API error response', async () => {
    mockFetch.mockResolvedValue(createMockResponse('Error', false, 500))

    await expect(fetchAvailableLanguages()).rejects.toThrow('Translator languages error: 500')
  })

  it('filters languages based on minPopularity', async () => {
    const mockLangs = [
      { name: 'English', code: 'en', popularity: 0.9 },
      { name: 'Klingon', code: 'tlh', popularity: 0.01 }
    ]
    mockFetch.mockResolvedValue(createMockResponse(mockLangs))

    const result = await fetchAvailableLanguages({ minPopularity: 0.5 })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('English')
  })
})
