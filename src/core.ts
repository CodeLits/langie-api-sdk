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
  // const startTime = Date.now()

  // try {
  //   console.debug('[translator-sdk] translateBatch called', {
  //     count: translations.length,
  //     sample: translations.slice(0, 3).map((t) => ({
  //       text: t.text?.slice?.(0, 30) ?? '',
  //       from: t.from_lang,
  //       to: t.to_lang
  //     })),
  //     opts: { ...options }
  //   })
  // } catch (_) {
  //   // Ignore logging errors – never block translation
  // }

  if (!Array.isArray(translations) || translations.length === 0) {
    // console.error('[translator-sdk] Invalid translations input:', { translations })
    throw new Error('translations must be a non-empty array')
  }

  const translatorHost = options.translatorHost || DEFAULT_TRANSLATOR_HOST
  const apiKey = options.apiKey || process.env.TRANSLATOR_API_KEY

  // console.debug('[translator-sdk] Configuration', {
  //   translatorHost,
  //   hasApiKey: !!apiKey,
  //   apiKeyLength: apiKey?.length || 0
  // })

  // Partition translations: identical language pairs can be returned as-is
  const serviceTranslations: TranslateRequestBody[] = []
  const indexMap: number[] = []

  translations.forEach((tr, idx) => {
    const from = (tr.from_lang || '').toLowerCase()
    const to = (tr.to_lang || '').toLowerCase()
    if (from === to) {
      // console.debug('[translator-sdk] Skipping translation (same language)', { from, to, text: tr.text?.slice(0, 20) })
      return // no need to translate
    }
    serviceTranslations.push(tr)
    indexMap.push(idx)
  })

  // console.debug('[translator-sdk] Translation partitioning', {
  //   total: translations.length,
  //   needsTranslation: serviceTranslations.length,
  //   skipped: translations.length - serviceTranslations.length
  // })

  let serviceResults: TranslateServiceResponse[] = []
  if (serviceTranslations.length > 0) {
    // const requestStartTime = Date.now()
    // console.debug('[translator-sdk] Sending request to translator', {
    //   host: translatorHost,
    //   apiKeySnippet: apiKey ? `${apiKey.slice(0, 4)}…${apiKey.slice(-4)}` : 'none',
    //   batchCount: serviceTranslations.length,
    //   requestSize: JSON.stringify({ translations: serviceTranslations }).length
    // })

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

      const resp = await fetch(`${translatorHost}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}`, 'X-Api-Key': apiKey } : {})
        },
        body: JSON.stringify({ translations: serviceTranslations }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      // const requestDuration = Date.now() - requestStartTime

      // console.debug('[translator-sdk] Translator response received', {
      //   status: resp.status,
      //   statusText: resp.statusText,
      //   duration: `${requestDuration}ms`,
      //   contentType: resp.headers.get('content-type'),
      //   contentLength: resp.headers.get('content-length')
      // })

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
          // url: `${translatorHost}/translate`,
          // duration: `${requestDuration}ms`
        })
        throw new Error(`Translator service error: ${resp.status} ${resp.statusText}`)
      }

      let parsed: { translations?: TranslateServiceResponse[]; t?: string } | null
      try {
        parsed = await resp.clone().json()
        // console.debug('[translator-sdk] Response parsed successfully', {
        //   hasTranslations: !!parsed?.translations,
        //   translationCount: parsed?.translations?.length || 0,
        //   hasLegacyT: !!parsed?.t
        // })
      } catch (jsonErr) {
        console.error('[translator-sdk] Failed to parse JSON response', {
          error: jsonErr,
          status: resp.status,
          responseText: await resp.text().catch(() => 'unreadable')
        })
        parsed = null
      }

      // if (parsed) {
      //   console.debug(
      //     '[translator-sdk] Translator response sample',
      //     JSON.stringify(parsed).slice(0, 500)
      //   )
      // }

      const data = parsed || {}
      serviceResults = Array.isArray(data.translations)
        ? data.translations
        : data.t
          ? [{ text: serviceTranslations[0].text, translated: data.t }]
          : []

      // console.debug('[translator-sdk] Service results processed', {
      //   resultCount: serviceResults.length,
      //   expectedCount: serviceTranslations.length
      // })
    } catch (error: unknown) {
      // const totalDuration = Date.now() - startTime
      if (error instanceof Error && error.name === 'AbortError') {
        const message = `[translator-sdk] Translator request to ${translatorHost} timed out after 5 seconds.`
        // console.error(message, { totalDuration: `${totalDuration}ms` })
        console.error(message)
        throw new Error(message)
      }
      const message = `[translator-sdk] Failed to connect to translator at ${translatorHost}. Is the service running?`
      // console.error(message, { error, totalDuration: `${totalDuration}ms` })
      console.error(message, { error })
      throw new Error(message)
    }
  }

  // Assemble final results in original order
  const final = translations.map((tr, idx) => {
    const from = (tr.from_lang || '').toLowerCase()
    const to = (tr.to_lang || '').toLowerCase()
    if (from === to) return { text: tr.text, translated: tr.text }

    const svcIdx = indexMap.indexOf(idx)
    if (svcIdx !== -1) return serviceResults[svcIdx] || { text: tr.text, translated: tr.text }
    return { text: tr.text, translated: tr.text }
  })

  // const totalDuration = Date.now() - startTime
  // console.debug('[translator-sdk] translateBatch completed', {
  //   totalDuration: `${totalDuration}ms`,
  //   resultCount: final.length,
  //   successCount: final.filter(r => r.translated && r.translated !== r.text).length
  // })

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
  // const startTime = Date.now()

  // console.debug('[translator-sdk] fetchAvailableLanguages called', { options })

  const translatorHost = options.translatorHost || DEFAULT_TRANSLATOR_HOST
  const apiKey = options.apiKey || process.env.TRANSLATOR_API_KEY
  const minPop =
    options.minPopularity !== undefined
      ? Number(options.minPopularity)
      : Number.parseFloat(process.env.MIN_LANGUAGE_POPULARITY || '0.1')

  // console.debug('[translator-sdk] Languages request config', {
  //   translatorHost,
  //   hasApiKey: !!apiKey,
  //   minPopularity: minPop,
  //   country: options.country,
  //   region: options.region
  // })

  const queryParams = []
  if (options.country) queryParams.push(`country=${encodeURIComponent(options.country)}`)
  if (options.region) queryParams.push(`region=${encodeURIComponent(options.region)}`)
  const queryStr = queryParams.length ? `?${queryParams.join('&')}` : ''

  const requestUrl = `${translatorHost}/languages${queryStr}`
  // console.debug('[translator-sdk] Making languages request', { url: requestUrl })

  try {
    const resp = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}`, 'X-Api-Key': apiKey } : {})
      }
    })

    // const requestDuration = Date.now() - startTime

    // console.debug('[translator-sdk] Languages response received', {
    //   status: resp.status,
    //   statusText: resp.statusText,
    //   duration: `${requestDuration}ms`,
    //   contentType: resp.headers.get('content-type'),
    //   contentLength: resp.headers.get('content-length')
    // })

    if (!resp.ok) {
      // console.error('[translator-sdk] Languages request failed', {
      //   status: resp.status,
      //   statusText: resp.statusText,
      //   url: requestUrl,
      //   duration: `${requestDuration}ms`
      // })
      throw new Error(`Translator languages error: ${resp.status}`)
    }

    const data = await resp.json()
    // console.debug('[translator-sdk] Languages data received', {
    //   isArray: Array.isArray(data),
    //   hasLanguages: !!data.languages,
    //   rawCount: Array.isArray(data) ? data.length : data.languages?.length || 0
    // })

    const languages = Array.isArray(data) ? data : data.languages || []

    const filtered = languages.filter((lang: TranslatorLanguage) => {
      if (lang.popularity === undefined || lang.popularity === null) return true
      return Number(lang.popularity) >= minPop
    })

    // const totalDuration = Date.now() - startTime
    // console.debug('[translator-sdk] fetchAvailableLanguages completed', {
    //   totalDuration: `${totalDuration}ms`,
    //   originalCount: languages.length,
    //   filteredCount: filtered.length,
    //   filteredOut: languages.length - filtered.length
    // })

    return filtered
  } catch (error) {
    // const totalDuration = Date.now() - startTime
    console.error('[translator-sdk] Languages fetch error', {
      error
      // url: requestUrl,
      // totalDuration: `${totalDuration}ms`
    })
    throw error
  }
}
