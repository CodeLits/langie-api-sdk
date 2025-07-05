// Get user's country code from browser locale
export function getCountryCode(): string | undefined {
	const locale = navigator.language || navigator.languages?.[0]
	if (locale) {
		const parts = locale.split('-')
		if (parts.length > 1) {
			return parts[1].toUpperCase() // e.g., 'en-US' -> 'US'
		}
	}
	return undefined
} 