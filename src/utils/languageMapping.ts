/**
 * Language mapping utilities for browser language detection
 */

/**
 * Maps browser language codes to supported language codes
 * Only includes mappings where the browser code differs from the target code
 */
export const BROWSER_LANGUAGE_MAP: Record<string, string> = {
	// Chinese variants
	'zh': 'zh-cn', // Chinese (Simplified)

	// Serbian variants
	'sr': 'sr-latn', // Serbian (default to Latin)
	'me': 'sr-latn', // Montenegrin
	'sh': 'sr-latn', // Serbo-Croatian

	// Kazakh variants
	'kaz': 'kk', // Kazakh (browser 'kaz' or 'kk' → 'kk')
	'kk': 'kk',
};

/**
 * Detects browser language and maps it to a supported language code
 * @returns Supported language code or 'en' as fallback
 */
export function detectBrowserLanguage(): string {
	if (typeof navigator === 'undefined') {
		return 'en';
	}

	const locale = navigator.languages?.[0] || navigator.language || '';
	const browserCode = locale.split('-')[0];

	// Check if we have a mapping for this browser code
	const mappedLanguage = BROWSER_LANGUAGE_MAP[browserCode];

	if (mappedLanguage) {
		return mappedLanguage;
	}

	return browserCode || 'en';
} 