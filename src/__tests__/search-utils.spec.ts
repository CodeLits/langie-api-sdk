import { describe, it, expect } from 'vitest'
import { applyLanguageAlias } from '../search-utils'

describe('applyLanguageAlias', () => {
  it('returns canonical language for common country/demonym terms', () => {
    expect(applyLanguageAlias('british')).toBe('english')
    expect(applyLanguageAlias('france')).toBe('french')
    expect(applyLanguageAlias('mexican')).toBe('spanish')
  })

  it('returns original term when no alias match found', () => {
    expect(applyLanguageAlias('klingon')).toBe('klingon')
  })

  it('returns correct language for partial prefix match', () => {
    const res = applyLanguageAlias('kaz')
    expect(res).toBe('russian')
  })

  it('returns an array of languages for an ambiguous term', () => {
    const res = applyLanguageAlias('swiss')
    expect(res).toEqual(expect.arrayContaining(['german', 'italian']))
  })
})
