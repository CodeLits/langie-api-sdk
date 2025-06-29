import { COLORS } from '../constants/colors'

/**
 * Sets CSS custom properties for the langie theme colors
 * This allows teleported components to access the same color constants
 */
export function setThemeColors(): void {
  const root = document.documentElement

  // Set flag border colors
  root.style.setProperty('--langie-flag-border', COLORS.border.flag)
  root.style.setProperty('--langie-flag-border-dark', COLORS.border.dark)

  // Set text colors
  root.style.setProperty('--langie-text-secondary', COLORS.text.secondary)
  root.style.setProperty('--langie-text-secondary-dark', COLORS.neutral.gray400)

  // Set primary colors
  root.style.setProperty('--langie-primary-blue', COLORS.primary.blue)
  root.style.setProperty('--langie-primary-blue-alpha-30', COLORS.primary.blueAlpha30)
  root.style.setProperty('--langie-primary-blue-alpha-50', COLORS.primary.blueAlpha50)
}

/**
 * Clears all langie theme CSS custom properties
 */
export function clearThemeColors(): void {
  const root = document.documentElement

  const properties = [
    '--langie-flag-border',
    '--langie-flag-border-dark',
    '--langie-text-secondary',
    '--langie-text-secondary-dark',
    '--langie-primary-blue',
    '--langie-primary-blue-alpha-30',
    '--langie-primary-blue-alpha-50'
  ]

  properties.forEach((prop) => root.style.removeProperty(prop))
}
