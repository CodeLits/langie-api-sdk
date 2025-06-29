import type { AliasEntry } from './types'
import { EUROPEAN_LANGUAGES } from './european'
import { ASIAN_LANGUAGES } from './asian'
import { AFRICAN_LANGUAGES } from './african'

export const LANGUAGE_ALIAS_TABLE: AliasEntry[] = [
  ...EUROPEAN_LANGUAGES,
  ...ASIAN_LANGUAGES,
  ...AFRICAN_LANGUAGES
]

export type { AliasEntry }
export { EUROPEAN_LANGUAGES, ASIAN_LANGUAGES, AFRICAN_LANGUAGES }
