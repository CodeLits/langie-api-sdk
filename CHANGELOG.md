# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2025-01-18 - PERFORMANCE OPTIMIZATION RELEASE

### 🚀 Performance Improvements

- **Reduced Batching Delays**: Lowered default batching timings for faster translations
  - Initial batch delay: 600ms → 100ms
  - Subsequent batch delay: 100ms → 25ms
  - Configurable via `batchDelay` and `subsequentBatchDelay` options
- **Singleton Pattern**: Implemented shared batching queue across all `useLangie` instances
  - Eliminates duplicate API calls from multiple component instances
  - Reduces network overhead and improves performance
- **Optimized Language Processing**: Reduced unnecessary re-processing of languages
  - Improved watchers in `LanguageSelect` to only trigger on meaningful changes
  - Better caching logic in `fetchLanguages` to prevent redundant API calls

### 🔧 Fixed

- **Translation Caching**: Fixed caching logic to handle different API response formats
- **Component Loading**: Resolved infinite loading issue in `LanguageSelect` components
- **Debug Output**: Cleaned up excessive console logging for better development experience
- **Code Organization**: Split large files (>400 lines) into focused modules
  - Separated `useLangie.ts` into core and batching composables
  - Refactored language aliases into regional files with index

### 🧹 Code Cleanup

- **Removed Unused Dependencies**: Eliminated `client-only` package and related utilities
- **Unused Code Removal**: Cleaned up unused exports and files throughout codebase
- **Debug Logging**: Streamlined debug output to reduce console noise
- **File Structure**: Improved code organization and maintainability

### 📚 Documentation

- Updated batching timing documentation with new default values
- Added performance optimization notes in README
- Clarified debug message terminology ("translation items" vs "requests")

## [1.4.0] - 2025-01-18 - NEW COMPONENT RELEASE

### ✨ Added

- **InterfaceLanguageSelect Component**: Smart interface language selector with automatic API integration
  - Automatically fetches languages from API using `useLangie` composable
  - Browser language detection on first load
  - Persistent language selection with localStorage
  - Auto-excludes currently selected language from dropdown
  - Built using composition pattern over `LanguageSelect` (clean architecture)
- **Component Architecture**: Elegant composition-based design instead of code duplication
- **Documentation**: Complete documentation for new component with usage examples
- **Demo Integration**: InterfaceLanguageSelect showcased in demo application

### 🔧 Changed

- **Component Exports**: Added `InterfaceLanguageSelect` to main package exports
- **Demo App**: Replaced manual `LanguageSelect` with automatic `InterfaceLanguageSelect`
- **Type Definitions**: Added proper TypeScript support for new component

### 📚 Documentation

- Added `InterfaceLanguageSelect` to components documentation
- Updated README.md with new component usage
- Added comparison guide: when to use which language selector
- Included examples in demo application

### 🏗️ Technical Details

- **Composition over Inheritance**: `InterfaceLanguageSelect` wraps `LanguageSelect` instead of duplicating code
- **Minimal Footprint**: ~50 lines vs 300+ lines (no code duplication)
- **Auto-sync**: Automatically syncs with global application state

## [1.3.0] - 2025-01-15 - STABILITY RELEASE

### 🔧 Fixed

- **BREAKING**: Stabilized CSS import paths - always use `langie-api-sdk/dist/index.css`
- **Package Exports**: Added proper exports field for all CSS files with backwards compatibility
- **Flag Styling**: Teleport styles now included in main bundle by default
- **Documentation**: Clear CSS import instructions and migration guide

### 📦 Package Exports

Only one stable import path:

```js
// Only working path
import 'langie-api-sdk/dist/index.css'
```

### 🎨 CSS Changes

- Flag styling now works out of the box (no additional imports needed)
- Teleport styles included in main `dist/index.css`
- Separate `dist/teleport.css` still available for minimal imports

### 📚 Documentation

- Added clear CSS import guide
- Documented all breaking changes
- Added migration instructions between versions

## [1.2.9] - 2025-01-XX

### Added

- Separate `dist/teleport.css` build output
- Updated README with teleport.css import instructions

### Changed

- tsup config now builds teleport.css as separate entry

## [1.2.8] - 2025-01-XX

### Changed

- Removed auto-import of teleport.css from main bundle
- teleport.css available for manual import only

## [1.2.7] - 2025-01-XX

### Added

- Global teleport CSS imported by default
- New `src/styles/teleport.css` with flag & option rules

## [1.2.6] - 2025-01-XX

### Fixed

- Scoped CSS for Multiselect teleport elements using :deep() selectors
- Correct translate direction in demo (was swapped from/to params)

## [1.2.5] - 2025-01-XX

### Fixed

- LanguageSelect visibility issue (was showing skeleton loader indefinitely)
- Better UX messages for empty language lists

## [1.2.4] - 2025-01-XX

### Fixed

- Component resolution issues
- TypeScript declarations for components export
- Improved documentation

## [1.2.3] - 2025-01-XX

### Fixed

- lt component export issues
- Improved icons and enhanced demo

---

## Migration Guide

### From 1.2.x to 1.3.0

**CSS Imports** - Use stable path:

```js
// ✅ Recommended (stable)
import 'langie-api-sdk/dist/index.css'
```

**Flag Styling** - Now works automatically:

```js
// ✅ 1.3.0+ (flags work out of the box)
import { LanguageSelect } from 'langie-api-sdk'
import 'langie-api-sdk/dist/index.css'
```

### Breaking Changes Summary

- **1.2.6→1.2.7**: Added teleport.css auto-import
- **1.2.7→1.2.8**: Removed teleport.css auto-import
- **1.2.8→1.2.9**: Added separate teleport.css build
- **1.2.9→1.3.0**: Stabilized all CSS paths with backwards compatibility
