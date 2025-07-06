import { describe, it, expect } from 'vitest'
import Fuse from 'fuse.js'
import type { TranslatorLanguage } from '../../types'

// Mock data for testing
const mockLanguages: TranslatorLanguage[] = [
  {
    code: 'en',
    name: 'English',
    native_name: 'English',
    popularity: 1000000,
    flag_country: 'gb'
  },
  {
    code: 'ru',
    name: 'Russian',
    native_name: 'Русский',
    popularity: 1000000,
    flag_country: 'ru'
  },
  {
    code: 'sr-latn',
    name: 'Serbian',
    native_name: 'Srpski',
    popularity: 100000,
    flag_country: 'rs'
  },
  {
    code: 'kk',
    name: 'Kazakh',
    native_name: 'Қазақша',
    popularity: 100000,
    flag_country: 'kz'
  },
  {
    code: 'es',
    name: 'Spanish',
    native_name: 'Español',
    popularity: 1000000,
    flag_country: 'es'
  },
  {
    code: 'fr',
    name: 'French',
    native_name: 'Français',
    popularity: 1000000,
    flag_country: 'fr'
  }
]

// Test search function
function testLanguageSearch(query: string, languages: TranslatorLanguage[] = mockLanguages) {
  const fuse = new Fuse(languages, {
    keys: ['name', 'native_name', 'code'],
    includeScore: true,
    threshold: 0.6,
    isCaseSensitive: false,
    minMatchCharLength: 1
  })

  return fuse.search(query).map((result) => ({
    name: result.item.name,
    code: result.item.code,
    score: result.score
  }))
}

describe('LanguageSelect Search Tests', () => {
  describe('Short query tests', () => {
    it('should find Serbian when searching "се"', () => {
      const results = testLanguageSearch('се')
      // Search results for "се"

      const serbianResults = results.filter((r) => r.code === 'sr-latn')
      expect(serbianResults.length).toBeGreaterThan(0)
    })

    it('should find Kazakh when searching "ка"', () => {
      const results = testLanguageSearch('ка')
      // Search results for "ка"

      const kazakhResults = results.filter((r) => r.code === 'kk')
      expect(kazakhResults.length).toBeGreaterThan(0)
    })

    it('should find Kazakh when searching "каз"', () => {
      const results = testLanguageSearch('каз')
      // Search results for "каз"

      const kazakhResults = results.filter((r) => r.code === 'kk')
      expect(kazakhResults.length).toBeGreaterThan(0)
    })

    it('should find Spanish when searching "es"', () => {
      const results = testLanguageSearch('es')

      const spanishResults = results.filter((r) => r.code === 'es')
      expect(spanishResults.length).toBeGreaterThan(0)
    })

    it('should find French when searching "fr"', () => {
      const results = testLanguageSearch('fr')

      const frenchResults = results.filter((r) => r.code === 'fr')
      expect(frenchResults.length).toBeGreaterThan(0)
    })
  })

  describe('Partial name tests', () => {
    it('should find Serbian when searching "serb"', () => {
      const results = testLanguageSearch('serb')

      const serbianResults = results.filter((r) => r.code === 'sr-latn')
      expect(serbianResults.length).toBeGreaterThan(0)
    })

    it('should find Kazakh when searching "kaz"', () => {
      const results = testLanguageSearch('kaz')

      const kazakhResults = results.filter((r) => r.code === 'kk')
      expect(kazakhResults.length).toBeGreaterThan(0)
    })

    it('should find Russian when searching "russ"', () => {
      const results = testLanguageSearch('russ')

      const russianResults = results.filter((r) => r.code === 'ru')
      expect(russianResults.length).toBeGreaterThan(0)
    })
  })

  describe('Native name tests', () => {
    it('should find Russian when searching "рус"', () => {
      const results = testLanguageSearch('рус')

      const russianResults = results.filter((r) => r.code === 'ru')
      expect(russianResults.length).toBeGreaterThan(0)
    })

    it('should find Spanish when searching "españ"', () => {
      const results = testLanguageSearch('españ')

      const spanishResults = results.filter((r) => r.code === 'es')
      expect(spanishResults.length).toBeGreaterThan(0)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty query', () => {
      const results = testLanguageSearch('')
      expect(results.length).toBe(0)
    })

    it('should handle single character query', () => {
      const results = testLanguageSearch('e')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should handle case insensitive search', () => {
      const results1 = testLanguageSearch('SERB')
      const results2 = testLanguageSearch('serb')

      expect(results1.length).toBe(results2.length)
    })

    it('should handle non-existent query', () => {
      const results = testLanguageSearch('xyz123')
      expect(results.length).toBe(0)
    })
  })

  describe('Score analysis', () => {
    it('should return better scores for exact matches', () => {
      const results = testLanguageSearch('serbian')

      const serbianResult = results.find((r) => r.code === 'sr-latn')
      expect(serbianResult).toBeDefined()
      expect(serbianResult!.score).toBeLessThan(0.1) // Better score for exact match
    })

    it('should return reasonable scores for partial matches', () => {
      const results = testLanguageSearch('serb')

      const serbianResult = results.find((r) => r.code === 'sr-latn')
      expect(serbianResult).toBeDefined()
      expect(serbianResult!.score).toBeLessThan(0.4) // Should be within threshold
    })
  })
})
