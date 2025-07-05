import * as ct from 'countries-and-timezones'

// Get country from multiple sources with fallback
export async function getCountryCode(): Promise<string | null> {
  // Try locale first
  const localeCountry = getCountryCodeFromBrowser()
  if (localeCountry) return localeCountry

  // Try timezone
  const timezoneCountry = getCountryFromTimezone()
  if (timezoneCountry) return timezoneCountry

  // Try IP as last resort
  return await getCountryFromIP()
}

// Get country from timezone using countries-and-timezones library
function getCountryFromTimezone(): string | null {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return getCountryFromTimezoneString(timezone)
  } catch (error) {
    return null
  }
}

// Helper function to get country code from timezone string
export function getCountryFromTimezoneString(timezone: string): string | null {
  try {
    const country = ct.getCountryForTimezone(timezone)
    return country?.id || null
  } catch (error) {
    return null
  }
}

// Get country from IP (requires external service)
async function getCountryFromIP(): Promise<string | null> {
  try {
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    return data.country_code || null
  } catch (error) {
    return null
  }
}

// Get user's country code from browser locale
export function getCountryCodeFromBrowser(): string | null {
  const langs = navigator.languages || [navigator.language]
  for (const locale of langs) {
    const parts = locale.split('-')
    if (parts.length > 1) {
      return parts[1].toUpperCase()
    }
  }
  return null
}
