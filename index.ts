import { h, defineAsyncComponent } from 'vue'
import type {
	TranslateRequestBody,
	TranslateServiceResponse,
	TranslatorLanguage
} from './types'

// Simple translation SDK for apps
// Provides translateBatch and fetchAvailableLanguages helpers.

const DEFAULT_TRANSLATOR_HOST =
	(process.env.TRANSLATOR_HOST as string) || 'http://localhost:8081'

export async function translateBatch(
	translations: TranslateRequestBody[] = [],
	options: { translatorHost?: string; apiKey?: string } = {}
): Promise<TranslateServiceResponse[]> {
	// Added verbose logging to trace translation issues (e.g. poor French ↔︎ other language results)
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

	return final as any
}

export async function fetchAvailableLanguages(options: {
	translatorHost?: string
	apiKey?: string
	minPopularity?: number | string
	country?: string
	region?: string
} = {}): Promise<TranslatorLanguage[]> {
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

export * from './useTranslator'

// -----------------------------------------------------------------------------
// Client-side helper exports (only included in browser bundle)

// NOTE: The composable lives in the application layer (~/composables), but
// having a re-export here makes it possible to consume it via the SDK package
// (e.g. `import { useTranslator } from '@langer/translator-sdk'`).

export { useTranslator } from './useTranslator'

// Lightweight wrapper component for client-side usage. During SSR we cannot
// import `.vue` files, so we expose a stub to avoid errors. On the client we
// lazy-load the actual component.

export const LanguageSelect =
	typeof window === 'undefined'
		? { name: 'LanguageSelect', render: () => h('div') }
		: defineAsyncComponent(() => import('./components/LanguageSelect.vue'))

// Lightweight <t> translation component
export const T =
	typeof window === 'undefined'
		? { name: 'T', render: () => h('span') }
		: defineAsyncComponent(() => import('./components/T.vue'))
