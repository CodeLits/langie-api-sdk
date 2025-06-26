import { describe, it, expect } from 'vitest'
import { applyLanguageAlias } from '../search-utils'

describe('applyLanguageAlias', () => {
  it('returns canonical language for common country/demonym terms', () => {
    expect(applyLanguageAlias('british').primary).toBe('english')
    expect(applyLanguageAlias('france').primary).toBe('french')
    expect(applyLanguageAlias('mexican').primary).toBe('spanish')
  })

  it('returns original term when no alias match found', () => {
    expect(applyLanguageAlias('klingon').primary).toBe('klingon')
  })

  it('returns correct language for partial prefix match', () => {
    const res = applyLanguageAlias('kaz')
    expect(res.primary).toBe('kazakh')
    expect(res.suggestions).toContain('russian')
  })

  it('returns an array of languages for an ambiguous term', () => {
    const res = applyLanguageAlias('swiss')
    expect(res.primary).toEqual(expect.arrayContaining(['german', 'italian']))
  })
})
