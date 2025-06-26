interface AliasEntry {
  lang: string
  match: string[]
  suggest?: string[]
}

export const LANGUAGE_ALIAS_TABLE: AliasEntry[] = [
  // Major European Languages
  {
    lang: 'english',
    match: [
      'eng',
      'en',
      'united states',
      'united states of america',
      'usa',
      'us',
      'great britain',
      'britain',
      'british',
      'england',
      'united kingdom',
      'uk'
    ],
    suggest: ['irish', 'scottish', 'welsh']
  },
  {
    lang: 'spanish',
    match: [
      'spa',
      'es',
      'esp',
      'spain',
      'español',
      'mexico',
      'mexican',
      'argentina',
      'colombia',
      'venezuela'
    ],
    suggest: ['catalan', 'galician', 'basque']
  },
  {
    lang: 'french',
    match: [
      'fra',
      'fr',
      'fre',
      'france',
      'français',
      'canada',
      'canadian',
      'quebec',
      'belgium',
      'swiss'
    ],
    suggest: ['occitan', 'breton', 'corsican']
  },
  {
    lang: 'german',
    match: [
      'ger',
      'de',
      'deu',
      'germany',
      'deutsch',
      'austria',
      'austrian',
      'switzerland',
      'swiss'
    ],
    suggest: ['bavarian', 'saxon', 'luxembourgish']
  },
  {
    lang: 'italian',
    match: ['ita', 'it', 'italy', 'italiano', 'swiss italian'],
    suggest: ['sardinian', 'neapolitan', 'venetian']
  },
  {
    lang: 'portuguese',
    match: ['por', 'pt', 'portugal', 'brazil', 'brazilian', 'braz', 'mozambique', 'angola'],
    suggest: ['galician', 'mirandese']
  },
  {
    lang: 'dutch',
    match: ['dut', 'nl', 'nld', 'netherlands', 'holland', 'flemish', 'belgium'],
    suggest: ['frisian', 'afrikaans']
  },

  // Slavic Languages
  {
    lang: 'russian',
    match: ['rus', 'ru', 'russia', 'belarus'],
    suggest: ['kazakh', 'tatar', 'belarusian', 'tajik', 'uzbek', 'moldovan']
  },
  {
    lang: 'ukrainian',
    match: ['ukr', 'uk', 'ukraine'],
    suggest: ['russian', 'belarusian']
  },
  {
    lang: 'polish',
    match: ['pol', 'pl', 'poland'],
    suggest: ['silesian', 'kashubian']
  },
  {
    lang: 'czech',
    match: ['ces', 'cs', 'cze', 'czech republic', 'czechia'],
    suggest: ['slovak', 'moravian']
  },
  {
    lang: 'slovak',
    match: ['slk', 'sk', 'slovakia'],
    suggest: ['czech', 'rusyn']
  },
  {
    lang: 'croatian',
    match: ['hrv', 'hr', 'croatia'],
    suggest: ['serbian', 'bosnian', 'montenegrin']
  },
  {
    lang: 'serbian',
    match: ['srp', 'sr', 'ser', 'serbia', 'serbian', 'srpski', 'србија', 'српски'],
    suggest: ['croatian', 'bosnian', 'montenegrin']
  },
  {
    lang: 'bulgarian',
    match: ['bul', 'bg', 'bulgaria'],
    suggest: ['macedonian']
  },
  {
    lang: 'slovenian',
    match: ['slv', 'sl', 'slovenia'],
    suggest: ['croatian']
  },

  // Nordic Languages
  {
    lang: 'swedish',
    match: ['swe', 'sv', 'sweden'],
    suggest: ['norwegian', 'danish', 'finnish']
  },
  {
    lang: 'norwegian',
    match: ['nor', 'no', 'norway'],
    suggest: ['swedish', 'danish']
  },
  {
    lang: 'danish',
    match: ['dan', 'da', 'denmark'],
    suggest: ['norwegian', 'swedish']
  },
  {
    lang: 'finnish',
    match: ['fin', 'fi', 'finland'],
    suggest: ['estonian', 'swedish']
  },
  {
    lang: 'icelandic',
    match: ['isl', 'is', 'iceland'],
    suggest: ['faroese', 'norwegian']
  },

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
    match: ['kaz', 'kk', 'kazakh', 'kazakhstan'],
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
  },

  // Other European Languages
  {
    lang: 'greek',
    match: ['ell', 'el', 'gre', 'greece', 'hellenic'],
    suggest: ['macedonian', 'albanian']
  },
  {
    lang: 'romanian',
    match: ['ron', 'ro', 'rum', 'romania'],
    suggest: ['moldovan', 'hungarian']
  },
  {
    lang: 'hungarian',
    match: ['hun', 'hu', 'hungary', 'magyar'],
    suggest: ['romanian', 'slovak']
  },
  {
    lang: 'albanian',
    match: ['sqi', 'sq', 'alb', 'albania', 'kosovo'],
    suggest: ['greek', 'macedonian']
  },
  {
    lang: 'lithuanian',
    match: ['lit', 'lt', 'lithuania'],
    suggest: ['latvian', 'polish']
  },
  {
    lang: 'latvian',
    match: ['lav', 'lv', 'latvia'],
    suggest: ['lithuanian', 'estonian']
  },
  {
    lang: 'estonian',
    match: ['est', 'et', 'estonia'],
    suggest: ['finnish', 'latvian']
  },

  // Celtic Languages
  {
    lang: 'irish',
    match: ['gle', 'ga', 'ireland', 'gaelic'],
    suggest: ['scottish', 'welsh']
  },
  {
    lang: 'welsh',
    match: ['cym', 'cy', 'wales', 'cymru'],
    suggest: ['irish', 'cornish']
  },
  {
    lang: 'scottish',
    match: ['gla', 'gd', 'scotland', 'scots gaelic'],
    suggest: ['irish', 'english']
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
  },

  // Additional Languages
  {
    lang: 'esperanto',
    match: ['epo', 'eo', 'esperanto'],
    suggest: []
  },
  {
    lang: 'latin',
    match: ['lat', 'la', 'latin'],
    suggest: ['italian', 'spanish', 'french']
  }
]
