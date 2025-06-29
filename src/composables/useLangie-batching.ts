import type { BatchRequest } from './types'

export interface BatchingOptions {
  initialBatchDelay?: number
  followupBatchDelay?: number
}

export class TranslationBatching {
  private pendingRequests = new Set<string>()
  private queueMap = new Map<string, Map<string, { text: string; context: string }>>()
  private flushTimeout: NodeJS.Timeout | null = null
  private queuedThisTick = new Set<string>()
  private clearQueuedThisTickScheduled = false

  constructor(
    private options: BatchingOptions = {},
    private translatorHost: string,
    private currentLanguage: () => string,
    private onBatchComplete: (results: any[]) => void
  ) {}

  private get initialBatchDelay() {
    return this.options.initialBatchDelay ?? 600
  }

  private get followupBatchDelay() {
    return this.options.followupBatchDelay ?? 100
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
      const [fromLang, toLang] = batchKey.split('|')
      for (const [cacheKey, item] of map.entries()) {
        allRequests.push({
          text: item.text,
          context: item.context,
          fromLang,
          toLang,
          cacheKey
        })
      }
      this.queueMap.delete(batchKey)
    }

    if (allRequests.length > 0) {
      console.debug('[TranslationBatching] Sending batch:', allRequests.length, 'requests')
      try {
        await this.fetchAndCacheBatchMixed(allRequests)
      } catch (error) {
        console.error('[TranslationBatching] Batch translation error:', error)
        allRequests.forEach((req) => this.pendingRequests.delete(req.cacheKey))
      }
    }
  }

  private scheduleFlush = () => {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
    }
    const delay = this.queueMap.size === 1 ? this.initialBatchDelay : this.followupBatchDelay
    this.flushTimeout = setTimeout(() => {
      this.flushQueues()
      this.flushTimeout = null
    }, delay)
  }

  public queueTranslation(
    text: string,
    context: string,
    fromLang: string,
    toLang: string,
    cacheKey: string
  ) {
    if (this.pendingRequests.has(cacheKey) || this.queuedThisTick.has(cacheKey)) {
      return
    }

    this.queuedThisTick.add(cacheKey)
    this.scheduleClearQueuedThisTick()
    this.pendingRequests.add(cacheKey)

    const batchKey = `${fromLang}|${toLang}`
    if (!this.queueMap.has(batchKey)) {
      this.queueMap.set(batchKey, new Map())
    }

    this.queueMap.get(batchKey)!.set(cacheKey, { text, context })
    this.scheduleFlush()
  }

  private async fetchAndCacheBatchMixed(requests: BatchRequest[]) {
    const grouped: { [key: string]: BatchRequest[] } = {}
    requests.forEach((req) => {
      const key = `${req.fromLang}|${req.toLang}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(req)
    })

    const allResults: any[] = []
    for (const [langPair, batchRequests] of Object.entries(grouped)) {
      const [fromLang, toLang] = langPair.split('|')

      const response = await fetch(`${this.translatorHost}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          translations: batchRequests.map((req) => ({
            text: req.text,
            context: req.context
          })),
          from_lang: fromLang,
          to_lang: toLang
        })
      })

      if (!response.ok) {
        console.error(
          '[TranslationBatching] Translation request failed:',
          response.status,
          response.statusText
        )
        throw new Error(`Translation request failed: ${response.status}`)
      }

      const result = await response.json()
      allResults.push(result)

      // Clear pending requests for this batch
      batchRequests.forEach((req) => {
        this.pendingRequests.delete(req.cacheKey)
      })
    }

    this.onBatchComplete(allResults)
  }

  public clearPending(cacheKey: string) {
    this.pendingRequests.delete(cacheKey)
  }

  public clearAllPending() {
    this.pendingRequests.clear()
  }
}
