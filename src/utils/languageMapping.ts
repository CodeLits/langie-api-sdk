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

	console.log('[LangieSDK] Browser language detection:', {
		languages: navigator.languages,
		language: navigator.language,
		locale,
		browserCode
	});

	// Check if we have a mapping for this browser code
	const mappedLanguage = BROWSER_LANGUAGE_MAP[browserCode];

	if (mappedLanguage) {
		console.log('[LangieSDK] Mapped browser language:', browserCode, '→', mappedLanguage);
		return mappedLanguage;
	}

	console.log('[LangieSDK] No mapping found for browser language:', browserCode, '→ using fallback: en');
	return 'en';
} 