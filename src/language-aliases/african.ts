import type { AliasEntry } from './types'

export const AFRICAN_LANGUAGES: AliasEntry[] = [
  // African Languages
  {
    lang: 'swahili',
    match: ['swa', 'sw', 'kiswahili', 'tanzania', 'kenya'],
    suggest: ['arabic']
  },
  {
    lang: 'amharic',
    match: ['amh', 'am', 'ethiopia', 'ethiopian'],
    suggest: ['tigrinya', 'oromo']
  },
  {
    lang: 'yoruba',
    match: ['yor', 'yo', 'nigeria', 'benin'],
    suggest: ['igbo', 'hausa']
  },
  {
    lang: 'zulu',
    match: ['zul', 'zu', 'south africa'],
    suggest: ['xhosa', 'afrikaans']
  }
]
