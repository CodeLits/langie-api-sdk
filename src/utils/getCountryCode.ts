// Get user's country code from browser locale
export function getCountryCode(): string | null {
  const langs = navigator.languages || [navigator.language]
  for (const locale of langs) {
    const parts = locale.split('-')
    if (parts.length > 1) {
      return parts[1].toUpperCase()
    }
  }
  return null
}
