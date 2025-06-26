/**
 * Utility to detect if we're running in a client-only environment
 * Particularly useful for SSR frameworks like Nuxt
 */

export function isClientOnly(): boolean {
  return typeof window !== 'undefined'
}

export function isNuxtEnvironment(): boolean {
  // Check for Nuxt on client-side
  if (typeof window !== 'undefined') {
    return !!(window as any).__NUXT__
  }

  // Check for Nuxt on server-side
  if (typeof process !== 'undefined') {
    return (
      !!(process.env as any).NUXT_SSR_BASE ||
      !!(process.env as any).NUXT_PUBLIC_BASE_URL ||
      !!(process.env as any).NUXT_ENV_CURRENT_ENV
    )
  }

  return false
}

export function shouldUseClientOnly(): boolean {
  return isNuxtEnvironment()
}
