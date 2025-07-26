import { describe, it, expect, vi, beforeEach } from 'vitest'
import { translateBatch, fetchAvailableLanguages, clearTranslationCache } from './core'
import { API_FIELD_ERROR, API_FIELD_TEXT } from './constants'

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
    clearTranslationCache()
  })

  it('throws an error for empty translations array', async () => {
    await expect(translateBatch([])).rejects.toThrow('translations must be a non-empty array')
  })

  it('does not call fetch for same-language translations', async () => {
    const translations = [{ [API_FIELD_TEXT]: 'hello', from: 'en', to: 'en' }]
    const result = await translateBatch(translations)
    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toEqual([{ [API_FIELD_TEXT]: 'hello' }])
  })

  it('calls fetch for translations that need it', async () => {
    const translations = [{ [API_FIELD_TEXT]: 'hello', from: 'en', to: 'es' }]
    mockFetch.mockResolvedValue(
      createMockResponse({
        translations: [{ [API_FIELD_TEXT]: 'hola' }]
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
    const translations = [{ [API_FIELD_TEXT]: 'hello', from: 'en', to: 'es' }]
    mockFetch.mockResolvedValue(
      createMockResponse({
        translations: [{ [API_FIELD_TEXT]: 'hola' }]
      })
    )

    const result = await translateBatch(translations)
    expect(result).toEqual([{ [API_FIELD_TEXT]: 'hola' }])
  })

  it('handles API error response', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse('Server error', false, 500, 'Internal Server Error')
    )

    await expect(translateBatch([{ [API_FIELD_TEXT]: 'Hello', to: 'fr' }])).rejects.toThrow(
      'Failed to connect to translator'
    )
  })

  it('handles API response with error field in translations', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse({
        translations: [
          {
            [API_FIELD_TEXT]: 'Enter text to translate',
            [API_FIELD_ERROR]: 'Translation failed or not supported for this language.'
          }
        ]
      })
    )

    const results = await translateBatch([
      { [API_FIELD_TEXT]: 'Enter text to translate', to: 'fr' }
    ])

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      [API_FIELD_TEXT]: 'Enter text to translate', // Should return original text
      [API_FIELD_ERROR]: 'Translation failed or not supported for this language.'
    })
  })

  it('handles network error', async () => {
    const translations = [{ [API_FIELD_TEXT]: 'hello', from: 'en', to: 'es' }]
    mockFetch.mockRejectedValue(new Error('Network failure'))

    await expect(translateBatch(translations)).rejects.toThrow(/Failed to connect to translator/)
  })

  it('reassembles results in correct order', async () => {
    const translations = [
      { [API_FIELD_TEXT]: 'one', from: 'en', to: 'es' },
      { [API_FIELD_TEXT]: 'two', from: 'en', to: 'en' },
      { [API_FIELD_TEXT]: 'three', from: 'en', to: 'fr' }
    ]

    mockFetch.mockResolvedValue(
      createMockResponse({
        translations: [{ [API_FIELD_TEXT]: 'uno' }, { [API_FIELD_TEXT]: 'trois' }]
      })
    )

    const result = await translateBatch(translations)
    expect(result).toEqual([
      { [API_FIELD_TEXT]: 'uno' },
      { [API_FIELD_TEXT]: 'two' },
      { [API_FIELD_TEXT]: 'trois' }
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
