// Map various common synonyms, country names, and demonyms to a canonical
// language label. The canonical label must match the `name` field found in the
// languages list returned by the backend (e.g. "English", "French", ...).

const ALIAS_TABLE = [
	{
		lang: 'english',
		match: [
			'english',
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
	{ lang: 'spanish', match: ['spain', 'español', 'mexico', 'mexican'] },
	{ lang: 'french', match: ['france', 'français', 'canada', 'canadian', 'quebec'] },
	{
		lang: 'german',
		match: ['germany', 'deutsch', 'austria', 'austrian', 'switzerland', 'swiss german']
	},
	{ lang: 'italian', match: ['italy', 'italiano', 'swiss italian'] },
	{ lang: 'portuguese', match: ['portugal', 'brazil', 'brazilian', 'braz'] },
	{ lang: 'russian', match: ['russia', 'belarus', 'kazakhstan', 'ukraine'] },
	{ lang: 'chinese', match: ['china', 'mandarin', 'zhongwen'] },
	{ lang: 'japanese', match: ['japan', 'nihongo'] },
	{ lang: 'korean', match: ['korea', 'hangul'] }
]

export function applyLanguageAlias(term = '') {
	const s = term.toLowerCase().trim()
	if (!s) return term

	// Helper decides whether a candidate alias matches the typed search string
	const isMatch = (alias, input) => {
		if (input === alias) return true // exact match
		// Input fully contains the alias (and alias has 3+ chars) → e.g., "germ" vs "german"
		if (alias.length >= 3 && input.length >= alias.length && input.startsWith(alias)) return true
		// Alias contains the input (user typed prefix, at least 3 chars) → e.g., "kaz" → "kazakhstan"
		if (input.length >= 3 && alias.startsWith(input)) return true
		return false
	}

	const hits = new Set()

	for (const { lang, match } of ALIAS_TABLE) {
		for (const m of match) {
			if (isMatch(m, s)) hits.add(lang)
		}
	}

	if (hits.size === 0) return term
	if (hits.size === 1) return [...hits][0]
	return [...hits] // multiple potential languages
}
