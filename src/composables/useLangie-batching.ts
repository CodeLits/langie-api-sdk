import type { TranslateServiceResponse } from '../types'
import { devDebug } from '../utils/debug'
import {
  API_FIELD_TEXT,
  API_FIELD_FROM,
  API_FIELD_TO,
  API_FIELD_CTX,
  API_FIELD_TRANSLATIONS
} from '../constants'

export interface BatchingOptions {
  initialBatchDelay?: number
  followupBatchDelay?: number
  maxBatchSize?: number
}

export interface BatchRequest {
  [API_FIELD_TEXT]: string
  [API_FIELD_CTX]: string
  [API_FIELD_FROM]: string
  [API_FIELD_TO]: string
  cacheKey: string
  __explicitToLang?: boolean
}

export class TranslationBatching {
  private pendingRequests = new Set<string>()
  private queueMap = new Map<
    string,
    Map<string, { [API_FIELD_TEXT]: string; [API_FIELD_CTX]: string; __explicitToLang?: boolean }>
  >()
  private flushTimeout: NodeJS.Timeout | null = null
  private queuedThisTick = new Set<string>()
  private clearQueuedThisTickScheduled = false

  constructor(
    private options: BatchingOptions = {},
    private translatorHost: string,
    private currentLanguage: () => string,
    private onBatchComplete: (results: TranslateServiceResponse[], requests: BatchRequest[]) => void
  ) {}

  private get initialBatchDelay() {
    return this.options.initialBatchDelay ?? 100
  }

  private get followupBatchDelay() {
    return this.options.followupBatchDelay ?? 25
  }

  private get maxBatchSize() {
    return this.options.maxBatchSize ?? 50
  }

  private scheduleClearQueuedThisTick() {
    if (this.clearQueuedThisTickScheduled) return
    this.clearQueuedThisTickScheduled = true
    queueMicrotask(() => {
      this.queuedThisTick.clear()
      this.clearQueuedThisTickScheduled = false
    })
  }

  private flushQueues = async () => {
    const allRequests: BatchRequest[] = []
    for (const [batchKey, map] of Array.from(this.queueMap.entries())) {
      if (!map || map.size === 0) {
        this.queueMap.delete(batchKey)
        continue
      }
      const [from, to] = batchKey.split('|')
      for (const [cacheKey, item] of map.entries()) {
        allRequests.push({
          [API_FIELD_TEXT]: item[API_FIELD_TEXT],
          [API_FIELD_CTX]: item[API_FIELD_CTX],
          [API_FIELD_FROM]: from,
          [API_FIELD_TO]: to,
          cacheKey,
          __explicitToLang: item.__explicitToLang
        })
      }
      this.queueMap.delete(batchKey)
    }

    if (allRequests.length > 0) {
      // Only log if there are more than 1 request to reduce noise
      // devDebug('[TranslationBatching] Sending batch:', allRequests.length, 'translation items')
      devDebug(
        '[TranslationBatching] Sending batch:',
        allRequests.length,
        'translation items',
        allRequests
      )

      // Split large batches into smaller chunks
      const chunks = this.chunkArray(allRequests, this.maxBatchSize)

      for (const chunk of chunks) {
        try {
          await this.fetchAndCacheBatchMixed(chunk)
        } catch (error) {
          devDebug('[TranslationBatching] Batch translation error:', error)
          chunk.forEach((req) => this.pendingRequests.delete(req.cacheKey))
        }
      }
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private scheduleFlush = () => {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
    }
    const delay = this.queueMap.size === 1 ? this.initialBatchDelay : this.followupBatchDelay
    // devDebug('[TranslationBatching] Scheduling flush in', delay, 'ms')
    devDebug(
      '[TranslationBatching] Scheduling flush in',
      delay,
      'ms',
      Array.from(this.queueMap.entries())
    )
    this.flushTimeout = setTimeout(() => {
      this.flushQueues()
      this.flushTimeout = null
    }, delay)
  }

  public queueTranslation(
    text: string,
    ctx: string,
    from: string,
    to: string,
    cacheKey: string,
    explicitToLang?: boolean
  ) {
    if (this.pendingRequests.has(cacheKey) || this.queuedThisTick.has(cacheKey)) {
      // devDebug('[TranslationBatching] Skipping duplicate:', cacheKey)
      devDebug('[TranslationBatching] Skipping duplicate:', cacheKey)
      return
    }

    this.queuedThisTick.add(cacheKey)
    this.scheduleClearQueuedThisTick()
    this.pendingRequests.add(cacheKey)

    const batchKey = `${from}|${to}`
    if (!this.queueMap.has(batchKey)) {
      this.queueMap.set(batchKey, new Map())
    }

    this.queueMap.get(batchKey)!.set(cacheKey, {
      [API_FIELD_TEXT]: text,
      [API_FIELD_CTX]: ctx,
      __explicitToLang: explicitToLang
    })
    // devDebug('[TranslationBatching] Queued translation:', { text, ctx, from, to, cacheKey, batchKey })
    devDebug('[TranslationBatching] Queued translation:', {
      text,
      ctx,
      from,
      to,
      cacheKey,
      batchKey,
      explicitToLang
    })
    this.scheduleFlush()
  }

  private async fetchAndCacheBatchMixed(requests: BatchRequest[]) {
    const grouped: { [key: string]: BatchRequest[] } = {}
    requests.forEach((req) => {
      const key = `${req.from}|${req.to}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(req)
    })

    const allResults: TranslateServiceResponse[] = []
    const allRequests: BatchRequest[] = []
    for (const [langPair, batchRequests] of Object.entries(grouped)) {
      const [from, to] = langPair.split('|')

      try {
        // Check if all requests have the same context
        const contexts = [...new Set(batchRequests.map((req) => req[API_FIELD_CTX]))]
        const useGlobalContext = contexts.length === 1 && contexts[0] === 'ui'

        // devDebug('[TranslationBatching] Sending batch for', langPair, 'with', batchRequests.length, 'items')
        devDebug(
          '[TranslationBatching] Sending batch for',
          langPair,
          'with',
          batchRequests.length,
          'items',
          batchRequests
        )

        const response = await fetch(`${this.translatorHost}/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            translations: batchRequests.map((req) => ({
              [API_FIELD_TEXT]: req[API_FIELD_TEXT],
              ...(useGlobalContext ? {} : { [API_FIELD_CTX]: req[API_FIELD_CTX] })
            })),
            [API_FIELD_FROM]: from,
            [API_FIELD_TO]: to,
            ...(useGlobalContext ? { [API_FIELD_CTX]: 'ui' } : {})
          })
        })

        if (!response.ok) {
          devDebug(
            '[TranslationBatching] Translation request failed:',
            response.status,
            response.statusText
          )
          throw new Error(`Translation request failed: ${response.status}`)
        }

        const result = await response.json()

        // Handle error responses in the result
        if (result[API_FIELD_TRANSLATIONS]) {
          result[API_FIELD_TRANSLATIONS].forEach((translation: any, index: number) => {
            if (translation.error) {
              const originalText = batchRequests[index]?.[API_FIELD_TEXT]
              devDebug(
                '[TranslationBatching] Translation error for',
                originalText,
                ':',
                translation.error
              )
            }
          })
        }

        allResults.push(result)
        allRequests.push(...batchRequests)

        // Clear pending requests for this batch
        batchRequests.forEach((req) => {
          this.pendingRequests.delete(req.cacheKey)
        })
      } catch (error) {
        devDebug('[TranslationBatching] Batch request failed for', langPair, ':', error)

        // Clear pending requests for failed batch
        batchRequests.forEach((req) => {
          this.pendingRequests.delete(req.cacheKey)
        })

        // Re-throw to be handled by the caller
        throw error
      }
    }

    this.onBatchComplete(allResults, allRequests)
  }

  public clearPending(cacheKey: string) {
    this.pendingRequests.delete(cacheKey)
  }

  public clearAllPending() {
    this.pendingRequests.clear()
  }

  public cleanup() {
    this.clearAllPending()
    this.queueMap.clear()
    this.queuedThisTick.clear()
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
      this.flushTimeout = null
    }
    this.clearQueuedThisTickScheduled = false
  }

  public getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      queuedBatches: this.queueMap.size,
      queuedThisTick: this.queuedThisTick.size,
      hasFlushTimeout: !!this.flushTimeout
    }
  }
}
