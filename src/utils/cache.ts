interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum size in bytes
  maxItems?: number // Maximum number of items
}

const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days
const DEFAULT_MAX_SIZE = 2 * 1024 * 1024 // 2MB
const DEFAULT_MAX_ITEMS = 1000

export class CacheManager {
  private options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || DEFAULT_TTL,
      maxSize: options.maxSize || DEFAULT_MAX_SIZE,
      maxItems: options.maxItems || DEFAULT_MAX_ITEMS
    }
  }

  set<T>(key: string, data: T, ttl?: number): boolean {
    if (typeof window === 'undefined') return false

    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.options.ttl
      }

      const serialized = JSON.stringify(item)
      const size = new Blob([serialized]).size

      // Check if adding this item would exceed max size
      if (size > this.options.maxSize) {
        console.warn(`[CacheManager] Item size ${size} exceeds max size ${this.options.maxSize}`)
        return false
      }

      // Clean up expired items and check total size
      this.cleanup()

      // Check if we have space after cleanup
      const currentSize = this.getCurrentSize()
      if (currentSize + size > this.options.maxSize) {
        console.warn(`[CacheManager] Cache would exceed max size after adding item`)
        return false
      }

      localStorage.setItem(key, serialized)
      return true
    } catch (error) {
      console.warn(`[CacheManager] Failed to set cache item ${key}:`, error)
      return false
    }
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null

    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const cacheItem: CacheItem<T> = JSON.parse(item)
      const now = Date.now()

      // Check if item is expired
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        localStorage.removeItem(key)
        return null
      }

      return cacheItem.data
    } catch (error) {
      console.warn(`[CacheManager] Failed to get cache item ${key}:`, error)
      localStorage.removeItem(key) // Remove corrupted item
      return null
    }
  }

  remove(key: string): boolean {
    if (typeof window === 'undefined') return false

    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`[CacheManager] Failed to remove cache item ${key}:`, error)
      return false
    }
  }

  clear(pattern?: string): void {
    if (typeof window === 'undefined') return

    try {
      if (pattern) {
        // Remove items matching pattern
        Object.keys(localStorage).forEach((key) => {
          if (key.includes(pattern)) {
            localStorage.removeItem(key)
          }
        })
      } else {
        // Remove all langie cache items
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('langie_')) {
            localStorage.removeItem(key)
          }
        })
      }
    } catch (error) {
      console.warn('[CacheManager] Failed to clear cache:', error)
    }
  }

  private cleanup(): void {
    if (typeof window === 'undefined') return

    try {
      const now = Date.now()
      const items: Array<{ key: string; size: number; timestamp: number }> = []

      // Collect all langie cache items with their sizes and timestamps
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('langie_')) {
          try {
            const item = localStorage.getItem(key)
            if (item) {
              const cacheItem: CacheItem<any> = JSON.parse(item)
              const size = new Blob([item]).size

              // Remove expired items
              if (now - cacheItem.timestamp > cacheItem.ttl) {
                localStorage.removeItem(key)
                return
              }

              items.push({
                key,
                size,
                timestamp: cacheItem.timestamp
              })
            }
          } catch (error) {
            // Remove corrupted items
            localStorage.removeItem(key)
          }
        }
      })

      // Sort by timestamp (oldest first)
      items.sort((a, b) => a.timestamp - b.timestamp)

      // Remove oldest items if we exceed max items
      while (items.length > this.options.maxItems) {
        const oldest = items.shift()
        if (oldest) {
          localStorage.removeItem(oldest.key)
        }
      }

      // Remove oldest items if we exceed max size
      let totalSize = items.reduce((sum, item) => sum + item.size, 0)
      while (totalSize > this.options.maxSize && items.length > 0) {
        const oldest = items.shift()
        if (oldest) {
          localStorage.removeItem(oldest.key)
          totalSize -= oldest.size
        }
      }
    } catch (error) {
      console.warn('[CacheManager] Failed to cleanup cache:', error)
    }
  }

  private getCurrentSize(): number {
    if (typeof window === 'undefined') return 0

    try {
      let totalSize = 0
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('langie_')) {
          const item = localStorage.getItem(key)
          if (item) {
            totalSize += new Blob([item]).size
          }
        }
      })
      return totalSize
    } catch (error) {
      console.warn('[CacheManager] Failed to calculate cache size:', error)
      return 0
    }
  }

  getStats(): { size: number; items: number; maxSize: number; maxItems: number } {
    if (typeof window === 'undefined') {
      return { size: 0, items: 0, maxSize: this.options.maxSize, maxItems: this.options.maxItems }
    }

    try {
      let totalSize = 0
      let itemCount = 0

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('langie_')) {
          const item = localStorage.getItem(key)
          if (item) {
            totalSize += new Blob([item]).size
            itemCount++
          }
        }
      })

      return {
        size: totalSize,
        items: itemCount,
        maxSize: this.options.maxSize,
        maxItems: this.options.maxItems
      }
    } catch (error) {
      console.warn('[CacheManager] Failed to get cache stats:', error)
      return { size: 0, items: 0, maxSize: this.options.maxSize, maxItems: this.options.maxItems }
    }
  }
}

// Default cache manager instance
export const cacheManager = new CacheManager()

// Convenience functions
export const setCache = <T>(key: string, data: T, ttl?: number): boolean => {
  return cacheManager.set(key, data, ttl)
}

export const getCache = <T>(key: string): T | null => {
  return cacheManager.get<T>(key)
}

export const removeCache = (key: string): boolean => {
  return cacheManager.remove(key)
}

export const clearCache = (pattern?: string): void => {
  return cacheManager.clear(pattern)
}

export const getCacheStats = () => {
  return cacheManager.getStats()
}
