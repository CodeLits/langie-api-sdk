import type { AliasEntry } from './types'

export const ASIAN_LANGUAGES: AliasEntry[] = [
  // Asian Languages
  {
    lang: 'chinese',
    match: [
      'chi',
      'zh',
      'zho',
      'zh-cn',
      'cn',
      'china',
      'mandarin',
      'zhongwen',
      'simplified',
      'traditional'
    ],
    suggest: ['cantonese', 'taiwanese', 'hakka']
  },
  {
    lang: 'japanese',
    match: ['jpn', 'ja', 'jp', 'japan', 'nihongo'],
    suggest: ['okinawan']
  },
  {
    lang: 'korean',
    match: ['kor', 'ko', 'kr', 'korea', 'hangul', 'south korea', 'north korea'],
    suggest: ['jeju']
  },
  {
    lang: 'hindi',
    match: ['hin', 'hi', 'india', 'indian', 'devanagari'],
    suggest: ['urdu', 'punjabi', 'gujarati', 'marathi', 'bengali']
  },
  {
    lang: 'arabic',
    match: ['ara', 'ar', 'arab', 'saudi', 'egypt', 'egyptian', 'gulf', 'levantine', 'maghreb'],
    suggest: ['persian', 'hebrew', 'urdu']
  },
  {
    lang: 'thai',
    match: ['tha', 'th', 'thailand', 'siam'],
    suggest: ['lao', 'khmer']
  },
  {
    lang: 'vietnamese',
    match: ['vie', 'vi', 'vietnam'],
    suggest: ['khmer', 'lao']
  },
  {
    lang: 'indonesian',
    match: ['ind', 'id', 'indonesia', 'bahasa'],
    suggest: ['malay', 'javanese', 'sundanese']
  },
  {
    lang: 'malay',
    match: ['msa', 'ms', 'malaysia', 'brunei'],
    suggest: ['indonesian']
  },

  // Central Asian & Turkic Languages
  {
    lang: 'kazakh',
    match: ['kaz', 'kk', 'kazakh', 'kazakhstan', 'ка', 'каз', 'казах', 'казахский'],
    suggest: ['russian', 'kyrgyz', 'uzbek']
  },
  {
    lang: 'turkish',
    match: ['tur', 'tr', 'turkey'],
    suggest: ['kurdish', 'azerbaijani']
  },
  {
    lang: 'uzbek',
    match: ['uzb', 'uz', 'uzbekistan'],
    suggest: ['tajik', 'kazakh', 'kyrgyz']
  },
  {
    lang: 'kyrgyz',
    match: ['kir', 'ky', 'kyrgyzstan'],
    suggest: ['kazakh', 'uzbek']
  },
  {
    lang: 'tajik',
    match: ['tgk', 'tg', 'tajikistan'],
    suggest: ['persian', 'uzbek']
  },
  {
    lang: 'azerbaijani',
    match: ['aze', 'az', 'azerbaijan'],
    suggest: ['turkish', 'persian']
  },

  // Middle Eastern Languages
  {
    lang: 'persian',
    match: ['fas', 'fa', 'per', 'iran', 'farsi', 'dari', 'afghanistan'],
    suggest: ['tajik', 'kurdish', 'pashto']
  },
  {
    lang: 'hebrew',
    match: ['heb', 'he', 'israel', 'israeli'],
    suggest: ['arabic', 'yiddish']
  },
  {
    lang: 'kurdish',
    match: ['kur', 'ku', 'kurdistan', 'kurmanji', 'sorani'],
    suggest: ['turkish', 'persian', 'arabic']
  },

  // South Asian Languages
  {
    lang: 'urdu',
    match: ['urd', 'ur', 'pakistan', 'pakistani'],
    suggest: ['hindi', 'punjabi']
  },
  {
    lang: 'bengali',
    match: ['ben', 'bn', 'bangladesh', 'bengal'],
    suggest: ['hindi', 'assamese']
  },
  {
    lang: 'punjabi',
    match: ['pan', 'pa', 'punjab'],
    suggest: ['hindi', 'urdu']
  },
  {
    lang: 'gujarati',
    match: ['guj', 'gu', 'gujarat'],
    suggest: ['hindi', 'marathi']
  },
  {
    lang: 'marathi',
    match: ['mar', 'mr', 'maharashtra'],
    suggest: ['hindi', 'gujarati']
  },
  {
    lang: 'tamil',
    match: ['tam', 'ta', 'tamil nadu', 'sri lanka'],
    suggest: ['malayalam', 'telugu', 'kannada']
  },
  {
    lang: 'telugu',
    match: ['tel', 'te', 'andhra pradesh'],
    suggest: ['tamil', 'kannada']
  },
  {
    lang: 'kannada',
    match: ['kan', 'kn', 'karnataka'],
    suggest: ['tamil', 'telugu', 'malayalam']
  },
  {
    lang: 'malayalam',
    match: ['mal', 'ml', 'kerala'],
    suggest: ['tamil', 'kannada']
  },
  {
    lang: 'nepali',
    match: ['nep', 'ne', 'nepal'],
    suggest: ['hindi']
  },
  {
    lang: 'sinhala',
    match: ['sin', 'si', 'sri lanka', 'ceylon'],
    suggest: ['tamil']
  },

  // Southeast Asian Languages
  {
    lang: 'burmese',
    match: ['mya', 'my', 'myanmar', 'burma'],
    suggest: ['thai']
  },
  {
    lang: 'khmer',
    match: ['khm', 'km', 'cambodia', 'cambodian'],
    suggest: ['vietnamese', 'thai']
  },
  {
    lang: 'lao',
    match: ['lao', 'lo', 'laos'],
    suggest: ['thai', 'vietnamese']
  },
  {
    lang: 'tagalog',
    match: ['tgl', 'tl', 'philippines', 'filipino'],
    suggest: ['cebuano', 'ilocano']
  }
]
