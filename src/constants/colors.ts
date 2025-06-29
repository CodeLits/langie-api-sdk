// Color constants for the langie-api-sdk
// These colors are used across components for consistent theming

export const COLORS = {
  // Primary colors
  primary: {
    blue: '#3b82f6',
    blueLight: '#60a5fa',
    blueDark: '#2563eb',
    blueAlpha30: '#3b82f630',
    blueAlpha50: '#3b82f650'
  },

  // Neutral colors
  neutral: {
    white: '#fff',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827'
  },

  // Border colors
  border: {
    light: '#d1d5db',
    dark: '#4b5563',
    flag: '#eee'
  },

  // Text colors
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    placeholder: '#9ca3af',
    inverse: '#f9fafb'
  }
} as const

// Theme-specific color mappings
export const THEME_COLORS = {
  light: {
    background: COLORS.neutral.white,
    backgroundDisabled: COLORS.neutral.gray100,
    border: COLORS.border.light,
    placeholder: COLORS.text.placeholder,
    ring: COLORS.primary.blueAlpha30,
    optionPointed: COLORS.neutral.gray100,
    optionPointedText: COLORS.text.primary,
    optionSelected: COLORS.primary.blue,
    optionSelectedText: COLORS.neutral.white,
    dropdownBackground: COLORS.neutral.white,
    dropdownBorder: COLORS.border.light,
    tagBackground: COLORS.primary.blue
  },
  dark: {
    background: COLORS.neutral.gray800,
    backgroundDisabled: COLORS.neutral.gray700,
    border: COLORS.border.dark,
    placeholder: COLORS.text.placeholder,
    ring: COLORS.primary.blueAlpha50,
    optionPointed: COLORS.neutral.gray700,
    optionPointedText: COLORS.neutral.gray50,
    optionSelected: COLORS.primary.blue,
    optionSelectedText: COLORS.neutral.white,
    dropdownBackground: COLORS.neutral.gray800,
    dropdownBorder: COLORS.border.dark,
    dropdownText: COLORS.neutral.gray50,
    tagBackground: COLORS.primary.blue
  }
} as const

// CSS variable names for easy reference
export const CSS_VARS = {
  // Multiselect variables
  multiselect: {
    bg: '--ms-bg',
    bgDisabled: '--ms-bg-disabled',
    borderColor: '--ms-border-color',
    placeholderColor: '--ms-placeholder-color',
    ringColor: '--ms-ring-color',
    optionBgPointed: '--ms-option-bg-pointed',
    optionColorPointed: '--ms-option-color-pointed',
    optionBgSelected: '--ms-option-bg-selected',
    optionColorSelected: '--ms-option-color-selected',
    dropdownBg: '--ms-dropdown-bg',
    dropdownBorderColor: '--ms-dropdown-border-color',
    dropdownColor: '--ms-dropdown-color',
    tagBg: '--ms-tag-bg'
  }
} as const
