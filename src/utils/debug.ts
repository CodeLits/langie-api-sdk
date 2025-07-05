export function devDebug(...args: unknown[]) {
  if (import.meta.env && import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug(...args)
  }
}
