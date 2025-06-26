// Map various common synonyms, country names, and demonyms to a canonical
// language label. The canonical label must match the `name` field found in the
// languages list returned by the backend (e.g. "English", "French", ...).

interface AliasEntry {
  lang: string
  match: string[]
}

const ALIAS_TABLE: AliasEntry[] = [
  {
    lang: 'english',
    match: [
      'eng',
      'en', // Language code and abbreviation
      'united states',
      'united states of america',
      'usa',
      'us',
      'state',
      'states',
      'stat',
      'great britain',
      'britain',
      'british',
      'england',
      'united kingdom',
      'uk'
    ]
  },
  {
    lang: 'spanish',
    match: [
      'spa',
      'es', // Language code and abbreviation
      'spain',
      'español',
      'mexico',
      'mexican'
    ]
  },
  {
    lang: 'french',
    match: [
      'fra',
      'fr', // Language code and abbreviation
      'france',
      'français',
      'canada',
      'canadian',
      'quebec'
    ]
  },
  {
    lang: 'german',
    match: [
      'ger',
      'de', // Language code and abbreviation
      'germany',
      'deutsch',
      'austria',
      'austrian',
      'switzerland',
      'swiss german'
    ]
  },
  {
    lang: 'italian',
    match: [
      'ita',
      'it', // Language code and abbreviation
      'italy',
      'italiano',
      'swiss italian'
    ]
  },
  {
    lang: 'portuguese',
    match: [
      'por',
      'pt', // Language code and abbreviation
      'portugal',
      'brazil',
      'brazilian',
      'braz'
    ]
  },
  {
    lang: 'russian',
    match: [
      'rus',
      'ru', // Language code and abbreviation
      'russia',
      'belarus',
      'kazakhstan',
      'ukraine'
    ]
  },
  {
    lang: 'chinese',
    match: [
      'chi',
      'zh',
      'zh-cn',
      'cn', // Language codes and abbreviations
      'china',
      'mandarin',
      'zhongwen'
    ]
  },
  {
    lang: 'japanese',
    match: [
      'jpn',
      'ja',
      'jp', // Language codes and abbreviations
      'japan',
      'nihongo'
    ]
  },
  {
    lang: 'korean',
    match: [
      'kor',
      'ko',
      'kr', // Language codes and abbreviations
      'korea',
      'hangul'
    ]
  },
  {
    lang: 'dutch',
    match: [
      'dut',
      'nl', // Language code and abbreviation
      'netherlands',
      'holland'
    ]
  },
  {
    lang: 'polish',
    match: [
      'pol',
      'pl', // Language code and abbreviation
      'poland'
    ]
  },
  {
    lang: 'turkish',
    match: [
      'tur',
      'tr', // Language code and abbreviation
      'turkey'
    ]
  },
  {
    lang: 'arabic',
    match: [
      'ara',
      'ar', // Language code and abbreviation
      'arab',
      'saudi',
      'egypt'
    ]
  },
  {
    lang: 'hindi',
    match: [
      'hin',
      'hi', // Language code and abbreviation
      'india',
      'indian'
    ]
  }
]

export function applyLanguageAlias(term = ''): string | string[] {
  const s = term.toLowerCase().trim()
  if (!s) return term

  // Helper decides whether a candidate alias matches the typed search string
  const isMatch = (alias: string, input: string): boolean => {
    if (input === alias) return true // exact match
    // Input fully contains the alias (and alias has 3+ chars) → e.g., "germ" vs "german"
    if (alias.length >= 3 && input.length >= alias.length && input.startsWith(alias)) return true
    // Alias contains the input (user typed prefix, at least 2 chars) → e.g., "ge" → "german"
    if (input.length >= 2 && alias.startsWith(input)) return true
    return false
  }

  const hits = new Set<string>()

  for (const { lang, match } of ALIAS_TABLE) {
    for (const m of match) {
      if (isMatch(m, s)) hits.add(lang)
    }
  }

  if (hits.size === 0) return term
  if (hits.size === 1) return [...hits][0]
  return [...hits] // multiple potential languages
}
