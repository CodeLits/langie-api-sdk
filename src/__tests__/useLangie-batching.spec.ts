import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useLangie, __resetLangieSingletonForTests } from '../useLangie'

describe('useLangie batching', () => {
  let mockFetch: ReturnType<typeof vi.fn>
  let mockLocalStorage: {
    getItem: ReturnType<typeof vi.fn>
    setItem: ReturnType<typeof vi.fn>
    removeItem: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Reset fetch mock
    mockFetch = vi.fn((url: string) => {
      if (url.includes('/languages')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            translations: [
              { text: 'Hello', translated: 'Bonjour' },
              { text: 'World', translated: 'Monde' },
              { text: 'Welcome', translated: 'Bienvenue' }
            ]
          })
      })
    })
    globalThis.fetch = mockFetch

    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    __resetLangieSingletonForTests()
    // Small delay to ensure singleton is reset
    return new Promise((resolve) => setTimeout(resolve, 10))
  })

  function getTranslateCalls() {
    const allCalls = mockFetch.mock.calls
    const translateCalls = allCalls.filter((call: unknown[]) => {
      const url = call[0] as string
      return url.includes('/translate')
    })
    return translateCalls
  }

  it('should batch multiple translation calls into a single request', async () => {
    const { l, setLanguage } = useLangie({
      translatorHost: 'http://localhost:8081',
      initialBatchDelay: 50 // Very short delay for testing
    })

    setLanguage('fr')
    await nextTick()

    l('Hello')
    l('World')
    l('Welcome')

    await nextTick()
    // Wait for batching delay + some buffer
    await new Promise((resolve) => setTimeout(resolve, 200))

    const translateCalls = getTranslateCalls()
    expect(translateCalls).toHaveLength(1)

    const requestBody = JSON.parse(translateCalls[0][1].body)
    expect(requestBody.translations).toHaveLength(3)
    expect(requestBody.translations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: 'Hello', context: 'ui' }),
        expect.objectContaining({ text: 'World', context: 'ui' }),
        expect.objectContaining({ text: 'Welcome', context: 'ui' })
      ])
    )
    expect(requestBody.from_lang).toBe('en')
    expect(requestBody.to_lang).toBe('fr')
  })

  it('should not make duplicate requests for the same text', async () => {
    const { l, setLanguage } = useLangie({
      translatorHost: 'http://localhost:8081',
      initialBatchDelay: 50
    })

    setLanguage('fr')
    await nextTick()

    l('Hello')
    l('Hello')
    l('Hello')

    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 200))

    const translateCalls = getTranslateCalls()
    expect(translateCalls).toHaveLength(1)

    const requestBody = JSON.parse(translateCalls[0][1].body)
    expect(requestBody.translations).toHaveLength(1)
    expect(requestBody.translations[0]).toEqual(
      expect.objectContaining({ text: 'Hello', context: 'ui' })
    )
  })

  it('should handle different language pairs in the same batch', async () => {
    const { l, setLanguage } = useLangie({
      translatorHost: 'http://localhost:8081',
      initialBatchDelay: 50
    })

    setLanguage('fr')
    await nextTick()

    l('Hello') // en -> fr
    l('Hola', 'ui', 'es') // es -> fr

    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 200))

    const translateCalls = getTranslateCalls()
    expect(translateCalls).toHaveLength(2) // Two separate requests for different language pairs

    const requestBody1 = JSON.parse(translateCalls[0][1].body)
    const requestBody2 = JSON.parse(translateCalls[1][1].body)

    expect(requestBody1.translations).toHaveLength(1)
    expect(requestBody2.translations).toHaveLength(1)

    expect(requestBody1.translations[0]).toEqual(
      expect.objectContaining({ text: 'Hello', context: 'ui' })
    )
    expect(requestBody2.translations[0]).toEqual(
      expect.objectContaining({ text: 'Hola', context: 'ui' })
    )
  })

  it('should respect the initialBatchDelay setting', async () => {
    const { l, setLanguage } = useLangie({
      translatorHost: 'http://localhost:8081',
      initialBatchDelay: 100
    })

    setLanguage('fr')
    await nextTick()

    l('Hello')
    l('World')

    await nextTick()
    // Wait less than the delay - should not have called fetch yet
    await new Promise((resolve) => setTimeout(resolve, 50))
    let translateCalls = getTranslateCalls()
    expect(translateCalls).toHaveLength(0)

    // Wait for the full delay
    await new Promise((resolve) => setTimeout(resolve, 100))
    translateCalls = getTranslateCalls()
    expect(translateCalls).toHaveLength(1)
  })

  it('should handle errors gracefully and clear pending requests', async () => {
    // First, fail the request
    mockFetch.mockImplementationOnce((url: string) => {
      if (url.includes('/languages')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      }
      return Promise.resolve({ ok: false, status: 500, statusText: 'Internal Server Error' })
    })

    const { l, setLanguage } = useLangie({
      translatorHost: 'http://localhost:8081',
      initialBatchDelay: 50
    })

    setLanguage('fr')
    await nextTick()

    l('Hello')
    l('World')

    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 200))

    let translateCalls = getTranslateCalls()
    expect(translateCalls).toHaveLength(1)

    // Now, succeed
    l('Hello')
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 200))

    translateCalls = getTranslateCalls()
    expect(translateCalls).toHaveLength(2)
  })

  it('should skip translations when source and target languages are the same', async () => {
    const { l, setLanguage } = useLangie({
      translatorHost: 'http://localhost:8081',
      initialBatchDelay: 50
    })

    setLanguage('fr')
    await nextTick()

    l('Bonjour', 'ui', 'fr') // should be skipped
    l('Hello') // should be translated

    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 200))

    const translateCalls = getTranslateCalls()
    expect(translateCalls).toHaveLength(1)

    const requestBody = JSON.parse(translateCalls[0][1].body)
    expect(requestBody.translations).toHaveLength(1)
    expect(requestBody.translations[0]).toEqual(
      expect.objectContaining({ text: 'Hello', context: 'ui' })
    )
  })
})
