# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.7.2] - 2024-07-05

### Fixed

- **Translation Caching Bug**: Fixed critical issue where UI translations were not appearing despite being cached correctly
  - Fixed cache selection logic in `lr` function to use `uiTranslations` when context is `undefined` or `'ui'`
  - Fixed cache selection logic in `onBatchComplete` to consistently use `uiTranslations` for UI context
  - Fixed cache selection logic in `fetchAndCacheBatch` to match the caching logic
  - Fixed cache selection logic in `l` function for consistency
  - All cache selection logic now uses `(context === 'ui' || !context) ? uiTranslations : translations`

### Changed

- **Enhanced Debugging**: Added comprehensive logging to track translation caching and retrieval
  - Added detailed logging in `onBatchComplete` to show cache contents and keys
  - Added detailed logging in `lr` function to track cache lookups
  - Added logging in `l` function for consistency
  - Improved debugging visibility for translation flow

### Technical

- **Cache Consistency**: Ensured all translation functions use the same cache selection logic
  - `l`, `lr`, `onBatchComplete`, and `fetchAndCacheBatch` now use consistent cache selection
  - Fixed the root cause where UI components weren't finding cached translations
  - Improved reactive translation updates in Vue components

## [1.7.1] - 2024-07-05

### Changed

- **Version bump**: Preparing for next release

## [1.7.0] - 2024-07-05

### Added

- **Limit Monitoring**: Automatic detection and blocking when usage limits are exceeded
- **Enhanced ServiceStatus Component**: Shows usage limits with color-coded indicators and reset time
- **Smart Limit Blocking**: Prevents translation requests when `used >= limit`
- **Usage Limit Messages**: Clear error messages with reset time information
- **Visual Indicators**: Red/yellow color coding for usage levels (80%+ and 100%)

### Changed

- **Batching Optimization**: Improved global context support to reduce payload size
- **ServiceStatus Component**: Enhanced with better limit detection and user feedback
- **Demo App**: Added comprehensive limit monitoring and blocking functionality
- **Logging Optimization**: Streamlined logs for production while keeping essential error reporting

### Fixed

- **Batching System**: Fixed context duplication in batch requests
- **Test Coverage**: Updated tests to support new global context format
- **TypeScript Errors**: Fixed all linter warnings and improved type safety

## [1.6.0] - 2025-01-18 - TIMEZONE LIBRARY MIGRATION

### 🔄 Changed

- **Timezone Library Migration**: Replaced `country-timezone` with `countries-and-timezones`
  - **Size Reduction**: 7x smaller dependency (316KB vs 2.3MB)
  - **Better Accuracy**: Uses official IANA timezone database
  - **TypeScript Support**: Built-in TypeScript types (no custom declarations needed)
  - **Popular Library**: 310k+ weekly downloads, actively maintained
  - **Simpler API**: `ct.getCountryForTimezone(timezone)` returns `{id, name}` object

### 🗑️ Removed

- **Manual Timezone Mapping**: Removed `src/utils/timezoneToCountry.ts` (106 lines of manual code)
- **Custom Type Declarations**: Removed `src/types/country-timezone.d.ts` (no longer needed)
- **Old Dependency**: Removed `country-timezone` package dependency

### 🛠️ Fixed

- **Vite Cache Issues**: Cleared Vite cache in demo app after library migration
- **Import Compatibility**: Updated imports to use new library structure
- **Build System**: Ensured clean builds with new dependency

### 📚 Documentation

- **Updated Dependencies Section**: Added information about `countries-and-timezones` library
- **Migration Notes**: Documented the benefits of the new library choice

### 🎯 Technical Benefits

- **Reduced Bundle Size**: Smaller dependency footprint
- **Better Maintainability**: No custom timezone mapping code to maintain
- **Improved Accuracy**: Official IANA timezone database ensures correctness
- **Future-Proof**: Actively maintained library with regular updates

### 📦 Migration Impact

```typescript
// Before (106 lines of manual code):
const timezoneToCountry: Record<string, string> = {
  London: 'GB',
  Paris: 'FR'
  // ... 100+ lines
}

// After (1 line with library):
const country = ct.getCountryForTimezone(timezone)
return country?.id || null
```

## [1.4.6] - 2025-01-18 - BROWSER LANGUAGE DETECTION & API CONFIGURATION

### 🚀 Added

- **API Configuration Props**: `InterfaceLanguageSelect` now accepts translator configuration
  - New `translatorHost` prop for custom translator API endpoints
  - New `apiKey` prop for API authentication
  - Dynamic configuration passed to `useLangie` composable
  - Allows per-component API configuration flexibility

### 🛠️ Fixed

- **Browser Language Detection**: Fixed automatic browser language detection with custom languages
  - Now properly detects and sets browser language when `languages` prop is provided
  - Smart language matching supports both exact (`en`) and locale (`en-US`) formats
  - Enhanced language priority system: Saved Language → Browser Language → No Selection
  - Validates that detected languages exist in the provided language list

### 🔧 Enhanced

- **Language Selection Logic**: Improved initialization and fallback handling
  - Reactive watching of `languages` prop changes
  - Automatic browser language detection for both API and custom language lists
  - Non-intrusive language setting (only when no current language exists)
  - Better validation of saved languages against current language list

### 🧪 Test Coverage

- **6 New Test Cases**: Comprehensive testing for browser language detection
  - Browser language detection with custom languages (multiple scenarios)
  - Saved language priority validation
  - Fallback behavior when saved language doesn't exist
  - Edge cases for unavailable browser languages
  - Non-intrusive behavior with existing language selections

### 📚 Documentation

- **Updated Component Docs**: Added Language Selection Priority section
- **Enhanced Examples**: Better explanation of language source priority
- **API Configuration**: Documentation for new translator configuration props

### 🎯 Usage Examples

```vue
<!-- With custom API configuration -->
<InterfaceLanguageSelect
  :languages="backendLanguages"
  translator-host="https://api.example.com"
  api-key="your-api-key"
/>

<!-- Browser language auto-detection works with custom languages -->
<InterfaceLanguageSelect :languages="customLanguages" />
```

## [1.4.5] - 2025-01-18 - TEST COVERAGE ENHANCEMENT

### 🧪 Added

- **LanguageSelect Component Tests**: Comprehensive test suite for LanguageSelect component
  - Test coverage for current language filtering functionality
  - Verification that selected language is properly removed from dropdown options
  - Dynamic selection change testing with proper filtering updates
  - Edge case handling for empty language arrays
  - Full TypeScript type safety in test implementations

### 🔧 Technical Improvements

- **Test Infrastructure**: Enhanced testing setup with proper mocking
  - Mock implementations for `@vueform/multiselect` and `fuse.js` dependencies
  - Vue component testing using `@vue/test-utils`
  - Async component update handling with proper `$nextTick()` usage
- **Type Safety**: Fixed all TypeScript warnings in test files
  - Proper type casting using `unknown` intermediate type
  - Full type safety without compromising test functionality

### 📊 Test Results

- **4 Test Cases Added**: All passing with comprehensive coverage
  - ✅ Current language filtering verification
  - ✅ No selection state handling
  - ✅ Dynamic selection change behavior
  - ✅ Empty language array edge case
- **Quality Assurance**: All tests pass, no linting errors, full TypeScript compliance

### 🎯 Verification

The tests confirm that `LanguageSelect` component correctly implements the filtering logic to remove the currently selected language from dropdown options, ensuring users don't see duplicate selections.

## [1.4.4] - 2025-01-18 - BACKEND LANGUAGE SUPPORT

### ✨ Added

- **Backend Language Support**: `InterfaceLanguageSelect` now accepts languages list as prop
  - New `languages` prop allows passing languages from your backend
  - Falls back to automatic API fetching when no languages provided
  - Maintains backward compatibility with existing usage
  - Priority system: backend languages > API languages

### 🔧 Enhanced

- **Flexible Language Sources**: Component now supports multiple language data sources
  - Use your own backend language list when available
  - Automatic fallback to translation API languages
  - No breaking changes to existing implementations

### 📚 Documentation

- **Updated Component Docs**: Added comprehensive documentation for new `languages` prop
  - Usage examples with backend integration
  - Language source priority explanation
  - Code examples for both approaches
- **New Examples**: Added backend language integration examples

### 🏗️ Technical Details

- **Smart Fallback**: `effectiveLanguages` computed property handles language source priority
- **Type Safety**: Full TypeScript support for new prop with proper typing
- **Performance**: No additional API calls when languages provided via prop

## [1.4.3] - 2025-01-18 - BUILD & TYPE SAFETY IMPROVEMENTS

### 🛠️ Fixed

- **Build System**: Fixed Vue component export issues in TypeScript declarations
- **Import Resolution**: Resolved demo app import errors for Vue components (`lt`, `LanguageSelect`, etc.)
- **Type Safety**: Replaced all `any` types with proper TypeScript types throughout codebase
- **Manual Declarations**: Created manual TypeScript declaration file to avoid Vue component compilation issues
- **Package Configuration**: Updated package.json to use manual declarations for better compatibility

### 🔧 Technical Improvements

- **Lint Cleanup**: Eliminated all TypeScript `any` type warnings
- **Build Stability**: Disabled automatic TypeScript declarations to prevent Vue component issues
- **Import Compatibility**: Components can now be imported from main index file as expected
- **Type Definitions**: Comprehensive manual TypeScript declarations for all exports

### 📦 Package Changes

- **Manual Declarations**: `src/index.d.ts` provides full TypeScript support
- **Build Output**: Clean builds without Vue component declaration conflicts
- **Export Structure**: Maintained backward compatibility while fixing import issues

## [1.4.2] - 2025-01-18 - PATCH & TEST IMPROVEMENTS

### 🛠️ Fixed

- Improved batching deduplication logic to further reduce duplicate translation requests
- Added robust singleton reset for test isolation
- Added and fixed batching tests for reliability
- Improved debug logging for translation and batching system
- Updated test setup for better compatibility

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

## [1.0.0] - 2024-01-XX
