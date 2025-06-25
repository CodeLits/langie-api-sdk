/**
 * Core translation functions
 */
import type {
	TranslateRequestBody,
	TranslateServiceResponse,
	TranslatorLanguage,
	TranslatorOptions
} from './types'

const DEFAULT_TRANSLATOR_HOST = 'http://localhost:8081'

/**
 * Translates a batch of texts
 *
 * @param translations Array of translation requests
 * @param options Configuration options
 * @returns Array of translated texts
 */
export async function translateBatch(
	translations: TranslateRequestBody[] = [],
	options: TranslatorOptions = {}
): Promise<TranslateServiceResponse[]> {
	try {
		console.debug('[translator-sdk] translateBatch called', {
			count: translations.length,
			sample: translations.slice(0, 3).map((t) => ({
				text: t.text?.slice?.(0, 30) ?? '',
				from: t.from_lang,
				to: t.to_lang
			})),
			opts: { ...options }
		})
	} catch (_) {
		// Ignore logging errors – never block translation
	}

	if (!Array.isArray(translations) || translations.length === 0) {
		throw new Error('translations must be a non-empty array')
	}

	const translatorHost = options.translatorHost || DEFAULT_TRANSLATOR_HOST
	const apiKey = options.apiKey || process.env.TRANSLATOR_API_KEY

	// Partition translations: identical language pairs can be returned as-is
	const serviceTranslations: TranslateRequestBody[] = []
	const indexMap: number[] = []

	translations.forEach((tr, idx) => {
		const from = (tr.from_lang || '').toLowerCase()
		const to = (tr.to_lang || '').toLowerCase()
		if (from === to) return // no need to translate
		serviceTranslations.push(tr)
		indexMap.push(idx)
	})

	let serviceResults: TranslateServiceResponse[] = []
	if (serviceTranslations.length > 0) {
		console.debug('[translator-sdk] Sending request to translator', {
			host: translatorHost,
			apiKeySnippet: apiKey ? `${apiKey.slice(0, 4)}…${apiKey.slice(-4)}` : 'none',
			batchCount: serviceTranslations.length
		})

		try {
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

			const resp = await fetch(`${translatorHost}/api/translate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(apiKey ? { Authorization: `Bearer ${apiKey}`, 'X-Api-Key': apiKey } : {})
				},
				body: JSON.stringify({ translations: serviceTranslations }),
				signal: controller.signal
			})

			clearTimeout(timeoutId)

			console.debug('[translator-sdk] Translator response status', resp.status)

			if (!resp.ok) {
				// Attempt to read body for additional diagnostics (may fail if already consumed)
				let bodyText = ''
				try {
					bodyText = await resp.text()
				} catch {
					// ignore
				}
				console.error('[translator-sdk] Translator error response', {
					status: resp.status,
					statusText: resp.statusText,
					body: bodyText.slice(0, 500)
				})
				throw new Error(`Translator service error: ${resp.status} ${resp.statusText}`)
			}

			let parsed: any
			try {
				parsed = await resp.clone().json()
			} catch (jsonErr) {
				console.error('[translator-sdk] Failed to parse JSON response', jsonErr)
				parsed = null
			}

			if (parsed) {
				console.debug(
					'[translator-sdk] Translator response sample',
					JSON.stringify(parsed).slice(0, 500)
				)
			}

			const data = parsed || {}
			serviceResults = Array.isArray(data.translations)
				? data.translations
				: data.t
					? [{ text: serviceTranslations[0].text, translated: data.t }]
					: []
		} catch (error: any) {
			if (error.name === 'AbortError') {
				const message = `[translator-sdk] Translator request to ${translatorHost} timed out after 5 seconds.`
				console.error(message)
				throw new Error(message)
			}
			const message = `[translator-sdk] Failed to connect to translator at ${translatorHost}. Is the service running?`
			console.error(message, error)
			throw new Error(message)
		}
	}

	// Assemble final results in original order
	const final = translations.map((tr, idx) => {
		const from = (tr.from_lang || '').toLowerCase()
		const to = (tr.to_lang || '').toLowerCase()
		if (from === to) return { text: tr.text, translated: tr.text }

		const svcIdx = indexMap.indexOf(idx)
		if (svcIdx !== -1)
			return (serviceResults[svcIdx] as any) || { text: tr.text, translated: tr.text }
		return { text: tr.text, translated: tr.text }
	})

	return final as TranslateServiceResponse[]
}

/**
 * Fetches available languages from the translation service
 *
 * @param options Configuration options
 * @returns Array of available languages
 */
export async function fetchAvailableLanguages(
	options: TranslatorOptions = {}
): Promise<TranslatorLanguage[]> {
	const translatorHost = options.translatorHost || DEFAULT_TRANSLATOR_HOST
	const apiKey = options.apiKey || process.env.TRANSLATOR_API_KEY
	const minPop =
		options.minPopularity !== undefined
			? Number(options.minPopularity)
			: Number.parseFloat(process.env.MIN_LANGUAGE_POPULARITY || '0.1')

	const queryParams = []
	if (options.country) queryParams.push(`country=${encodeURIComponent(options.country)}`)
	if (options.region) queryParams.push(`region=${encodeURIComponent(options.region)}`)
	const queryStr = queryParams.length ? `?${queryParams.join('&')}` : ''

	const resp = await fetch(`${translatorHost}/api/languages${queryStr}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			...(apiKey ? { Authorization: `Bearer ${apiKey}`, 'X-Api-Key': apiKey } : {})
		}
	})

	if (!resp.ok) throw new Error(`Translator languages error: ${resp.status}`)

	const data = await resp.json()
	const languages = Array.isArray(data) ? data : data.languages || []

	return languages.filter((lang: TranslatorLanguage) => {
		if (lang.popularity === undefined || lang.popularity === null) return true
		return Number(lang.popularity) >= minPop
	})
}
