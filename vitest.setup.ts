import { vi } from 'vitest'
import { cleanup } from '@testing-library/vue'
import { afterEach } from 'vitest'

// Mock global fetch
Object.defineProperty(globalThis, 'fetch', {
  value: vi.fn(),
  writable: true
})

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Setup global vi object for easier access in tests
globalThis.vi = vi
