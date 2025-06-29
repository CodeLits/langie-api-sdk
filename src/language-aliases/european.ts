import type { AliasEntry } from './types'

export const EUROPEAN_LANGUAGES: AliasEntry[] = [
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
