// Map various common synonyms, country names, and demonyms to a canonical
// language label. The canonical label must match the `name` field found in the
// languages list returned by the backend (e.g. "English", "French", ...).

import { LANGUAGE_ALIAS_TABLE } from './language-aliases'

export function applyLanguageAlias(term = ''): {
  primary: string | string[]
  suggestions: string[]
} {
  const s = term.toLowerCase().trim()
  if (!s) return { primary: term, suggestions: [] }

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
  const suggestions = new Set<string>()

  for (const { lang, match, suggest } of LANGUAGE_ALIAS_TABLE) {
    // Check primary matches
    for (const m of match) {
      if (isMatch(m, s)) {
        hits.add(lang)
        // If this language has suggestions, add them
        if (suggest) {
          suggest.forEach((sug: string) => suggestions.add(sug))
        }
      }
    }
  }

  let primary: string | string[]
  if (hits.size === 0) {
    primary = term
  } else if (hits.size === 1) {
    primary = Array.from(hits)[0]
  } else {
    primary = Array.from(hits)
  }

  return { primary, suggestions: Array.from(suggestions) }
}
