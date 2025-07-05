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

// Get country from timezone
function getCountryFromTimezone(): string | null {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    // Extract country from timezone (e.g., "Europe/London" -> "GB")
    const parts = timezone.split('/')
    if (parts.length > 1) {
      const region = parts[1]
      // Map common timezone regions to country codes
      const timezoneToCountry: Record<string, string> = {
        London: 'GB',
        Paris: 'FR',
        Berlin: 'DE',
        Rome: 'IT',
        Madrid: 'ES',
        Amsterdam: 'NL',
        Brussels: 'BE',
        Vienna: 'AT',
        Zurich: 'CH',
        Stockholm: 'SE',
        Oslo: 'NO',
        Copenhagen: 'DK',
        Helsinki: 'FI',
        Warsaw: 'PL',
        Prague: 'CZ',
        Budapest: 'HU',
        Bucharest: 'RO',
        Sofia: 'BG',
        Athens: 'GR',
        Istanbul: 'TR',
        Moscow: 'RU',
        Kiev: 'UA',
        Minsk: 'BY',
        Riga: 'LV',
        Tallinn: 'EE',
        Vilnius: 'LT',
        Almaty: 'KZ',
        Tashkent: 'UZ',
        Baku: 'AZ',
        Tbilisi: 'GE',
        Yerevan: 'AM',
        New_York: 'US',
        Chicago: 'US',
        Denver: 'US',
        Los_Angeles: 'US',
        Toronto: 'CA',
        Vancouver: 'CA',
        Montreal: 'CA',
        Mexico_City: 'MX',
        Sao_Paulo: 'BR',
        Buenos_Aires: 'AR',
        Santiago: 'CL',
        Lima: 'PE',
        Bogota: 'CO',
        Caracas: 'VE',
        Tokyo: 'JP',
        Seoul: 'KR',
        Beijing: 'CN',
        Shanghai: 'CN',
        Hong_Kong: 'HK',
        Singapore: 'SG',
        Bangkok: 'TH',
        Jakarta: 'ID',
        Manila: 'PH',
        Kuala_Lumpur: 'MY',
        Ho_Chi_Minh: 'VN',
        Hanoi: 'VN',
        Phnom_Penh: 'KH',
        Vientiane: 'LA',
        Yangon: 'MM',
        Dhaka: 'BD',
        Kathmandu: 'NP',
        Colombo: 'LK',
        Mumbai: 'IN',
        Delhi: 'IN',
        Kolkata: 'IN',
        Chennai: 'IN',
        Karachi: 'PK',
        Lahore: 'PK',
        Tehran: 'IR',
        Baghdad: 'IQ',
        Riyadh: 'SA',
        Jeddah: 'SA',
        Dubai: 'AE',
        Abu_Dhabi: 'AE',
        Doha: 'QA',
        Kuwait: 'KW',
        Muscat: 'OM',
        Sanaa: 'YE',
        Amman: 'JO',
        Beirut: 'LB',
        Damascus: 'SY',
        Jerusalem: 'IL',
        Cairo: 'EG',
        Alexandria: 'EG',
        Tripoli: 'LY',
        Tunis: 'TN',
        Algiers: 'DZ',
        Casablanca: 'MA',
        Rabat: 'MA',
        Dakar: 'SN',
        Lagos: 'NG',
        Nairobi: 'KE',
        Johannesburg: 'ZA',
        Cape_Town: 'ZA',
        Sydney: 'AU',
        Melbourne: 'AU',
        Brisbane: 'AU',
        Perth: 'AU',
        Adelaide: 'AU',
        Auckland: 'NZ',
        Wellington: 'NZ'
      }
      return timezoneToCountry[region] || null
    }
  } catch (error) {
    return null
  }
  return null
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
function getCountryCodeFromBrowser(): string | null {
  const langs = navigator.languages || [navigator.language]
  for (const locale of langs) {
    const parts = locale.split('-')
    if (parts.length > 1) {
      return parts[1].toUpperCase()
    }
  }
  return null
}
