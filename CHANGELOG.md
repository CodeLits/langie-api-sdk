# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.9.19] - 2024-12-19

### Changed

- **Package Manager**: Migrated from Bun to pnpm
  - Updated all scripts, documentation, and CI/CD workflows
  - Replaced bun.lock with pnpm-lock.yaml
  - Updated GitHub Actions to use pnpm instead of Bun
  - Updated Netlify deployment configuration
  - Updated development documentation and scripts

### Technical

- **CI/CD**: Updated GitHub Actions workflows to use pnpm
- **Deployment**: Updated Netlify configuration for pnpm
- **Documentation**: Updated all documentation to use pnpm commands
- **Scripts**: Updated test and demo scripts to use pnpm

## [1.9.18] - 2024-12-19

### Fixed

- **Cache Preservation**: Removed unnecessary cache clearing when switching languages
  - Cache is now preserved for each language to improve performance
  - Translations are loaded from cache when returning to previously used language
  - Only pending requests are cancelled to prevent race conditions

### Enhanced

- **Performance**: Improved language switching performance
  - No more unnecessary cache clearing on language change
  - Faster switching back to previously used languages
  - Better user experience with instant translations from cache

## [1.9.17] - 2024-12-19

### Fixed

- **Race Condition in Language Switching**: Fixed issue where translations from previous language could override current language
  - Added language validation to prevent outdated translations from being cached
  - Clear pending requests when language changes to prevent race conditions
  - Enhanced debug logging to track language mismatches

### Enhanced

- **Language Change Handling**: Improved language switching reliability
  - Translations are now validated against current language before caching
  - Pending requests are cancelled when language changes
  - Better cleanup of translation queues on language switch

### Technical

- **Race Condition Prevention**: Added checks to ensure translations match current language
- **Request Management**: Improved cleanup of pending translation requests
- **Debug Support**: Enhanced logging for language validation and request cancellation

## [1.9.16] - 2024-12-19

### Enhanced

- **Cache Optimization**: Skip caching when translation equals original text
  - Prevents unnecessary cache entries for identical translations
  - Reduces cache size and potential conflicts
  - Added debug logging for skipped identical translations

### Technical

- **Cache Efficiency**: Improved cache management by avoiding redundant entries
- **Debug Support**: Enhanced logging to track when translations are skipped

## [1.9.15] - 2024-12-19

### Fixed

- **Translation Context Conflicts**: Fixed issue where translations could appear on wrong elements
  - Improved context handling to use original request context instead of response context
  - Fixed context fallback logic to respect explicitly provided contexts
  - Enhanced cache key generation to prevent translation conflicts
  - Added debug logging to track translation caching operations

### Enhanced

- **Context Handling**: Improved context resolution logic
  - Explicitly provided contexts are now properly respected
  - Global defaults are only used when context is not explicitly provided
  - Better separation between UI and content translations

### Technical

- **Cache Key Generation**: More robust cache key generation prevents conflicts
- **Debug Support**: Added comprehensive logging for translation caching
- **Request Tracking**: Better tracking of original request context through translation pipeline

## [1.9.14] - 2024-12-19

### Changed

- **Languages Cache TTL**: Reduced TTL for languages cache from 30 days to 7 days
  - Languages list now expires after 7 days instead of 30 days
  - More frequent updates ensure users get the latest language list
  - Balances performance with data freshness

### Documentation

- **Updated Core API**: Updated documentation to reflect new 7-day TTL for languages
- **Consistent TTL**: Both translations and languages now use 7-day TTL

## [1.9.13] - 2024-12-19

### Fixed

- **Languages Cache Loading**: Fixed issue where cached languages weren't properly loaded on initialization
  - Improved cache loading logic to check for cached languages regardless of availableLanguages state
  - Added comprehensive debug logging to track cache loading and saving operations
  - Enhanced cache loading to work correctly in all initialization scenarios
  - Fixed race condition where cache could be overwritten during initialization

### Enhanced

- **Debug Logging**: Added detailed debug information for cache operations
  - Cache loading status is now logged with language count
  - Cache saving status is logged with success/failure indication
  - fetchLanguages calls are logged with cache state information
  - Better visibility into cache behavior for debugging

### Technical

- **Cache Logic**: Improved cache loading condition to be more robust
- **Debug Support**: Enhanced debugging capabilities for cache-related issues
- **Performance**: Better cache utilization reduces unnecessary API calls

## [1.9.12] - 2024-12-19

### Added

- **Intelligent Cache Management**: Added comprehensive cache management system with TTL and size limits
  - **TTL Support**: Cache items now have configurable time-to-live (translations: 7 days, languages: 30 days)
  - **Size Limits**: Automatic cache size management (max 2MB, 1000 items) to prevent localStorage overflow
  - **LRU Eviction**: Oldest items are automatically removed when limits are exceeded
  - **Automatic Cleanup**: Expired items are automatically removed on cache access
  - **Cache Statistics**: Added `getCacheStats()` function to monitor cache usage

### Enhanced

- **Cache Utilities**: Added comprehensive cache management API
  - `cacheManager` - Main cache manager instance with configurable options
  - `setCache(key, data, ttl?)` - Set cache item with optional TTL
  - `getCache(key)` - Get cache item (automatically handles expiration)
  - `removeCache(key)` - Remove specific cache item
  - `clearCache(pattern?)` - Clear cache items (all or by pattern)
  - `getCacheStats()` - Get cache statistics (size, items, limits)

### Technical

- **Cache Architecture**: Replaced direct localStorage access with intelligent cache manager
- **Error Handling**: Improved error handling for corrupted cache items
- **Performance**: Automatic cleanup reduces localStorage bloat
- **Memory Management**: Prevents localStorage quota exceeded errors

## [1.9.11] - 2024-12-19

### Fixed

- **Languages Cache Loading**: Fixed issue where cached languages weren't loaded on initialization
  - Added automatic loading of cached languages from localStorage on SDK initialization
  - Languages list is now properly restored from cache after page reload
  - Eliminates unnecessary API calls for `/languages` endpoint on page reload
  - Improved performance by avoiding repeated language list requests

### Technical

- **Cache Initialization**: Added localStorage loading logic in `useLangieCore` initialization
- **Cache Preservation**: Language cache is preserved when clearing translation cache
- **Performance**: Reduced API calls by properly utilizing cached language data

## [1.9.10] - 2024-12-19

### Fixed

- **Translation Updates on Language Change**: Fixed issue where translations weren't updating when switching languages
  - Changed localStorage structure to store translations separately for each language
  - Translations now properly update when switching between languages
  - Cached translations are preserved for each language individually
  - Fixed logic to load correct translations for current language from localStorage

### Technical

- **Cache Structure**: Changed from flat cache to language-specific cache structure
  - localStorage now stores: `{ "en": {...}, "es": {...}, "fr": {...} }`
  - Each language has its own translation cache
  - Proper loading of language-specific translations on language change

## [1.9.9] - 2024-12-19

### Changed

- **Persistent Translation Caching by Language**: Improved localStorage caching to preserve translations across language switches
  - Translations are now preserved in localStorage when switching between languages
  - When switching back to a previously used language, cached translations are immediately available
  - Only memory cache is cleared on language change, localStorage cache is preserved
  - Eliminates repeated API calls when switching between languages

### Added

- **Languages Cache**: Added localStorage caching for available languages list
  - Languages list is now cached in localStorage (`langie_languages_cache`)
  - Reduces API calls for `/languages` endpoint
  - Improves initial load performance

### Technical

- **Cache Strategy**: Changed from clearing all caches on language switch to preserving localStorage cache
- **Memory Management**: Only memory cache is cleared on language change, localStorage cache is reloaded
- **Performance**: Eliminates redundant API calls when switching between previously used languages

## [1.9.8] - 2024-12-19

### Added

- **Persistent Translation Caching**: Added localStorage caching for translations between page reloads
  - Translations are now automatically saved to localStorage when received from the API
  - Cached translations are loaded on SDK initialization
  - Separate caches for UI translations (`langie_ui_translations_cache`) and content translations (`langie_translations_cache`)
  - Automatic cache clearing when language changes or during cleanup
  - Improved user experience by avoiding repeated API calls for the same translations

### Technical

- **Cache Management**: Added `loadCachedTranslations()` and `saveCachedTranslations()` functions
- **Cache Keys**: Uses `langie_translations_cache` and `langie_ui_translations_cache` localStorage keys
- **Error Handling**: Graceful fallback if localStorage is unavailable or corrupted
- **Test Support**: Updated test cleanup to clear localStorage translation caches

## [1.9.7] - 2024-12-19

### Fixed

- **TypeScript Definitions**: Added missing `lr` function to TypeScript definitions
  - Fixed `src/index.d.ts` to include `lr` function type definition
  - Improved TypeScript support for reactive translation function
  - Better IDE autocomplete and type checking for `lr` function

## [1.9.6] - 2024-12-19

### Fixed

- **Import Error**: Fixed incorrect import of `setLtDefaults` from components instead of main SDK
  - Updated demo application to import `setLtDefaults` from `'langie-api-sdk'` instead of `'langie-api-sdk/components'`
  - Fixed module resolution error that prevented demo from loading

### Documentation

- **Improved Component Descriptions**: Enhanced component comparison section in demo
  - Simplified and clarified component usage descriptions
  - Updated LanguageSelect description to "Smart name/code search, flags, autocomplete"
  - Updated SimpleLanguageSelect description to "Perfect for device integration"
  - Removed "Basic" from SimpleLanguageSelect features to improve professional appearance
  - Enhanced features description to "Perfect device integration, HTML select, no dependencies"

## [1.9.5] - 2024-12-19

### Changed

- **Global Defaults for All Functions**: Extended global defaults to work with all SDK functions
  - `l()` function now uses global defaults for `ctx` and `orig` parameters
  - `lr()` function now uses global defaults for `ctx` and `orig` parameters
  - `translateBatch()` function now uses global defaults for `ctx` parameter
  - `fetchAndCacheBatch()` function now uses global defaults for `ctx` parameter
  - All batching and caching logic now respects global defaults

### Enhanced

- **Consistent Behavior**: All translation functions now follow the same priority order
  - Priority: Function parameters > Global defaults > SDK defaults
  - `ctx` defaults to `'ui'` across all functions if not specified
  - `orig` defaults to empty string across all functions if not specified

### Documentation

- **Updated README**: Renamed section to "Global Translation Defaults" and added function examples
- **Updated Components Guide**: Clarified that defaults apply to all functions and components
- **Enhanced Examples**: Added examples showing how functions use global defaults

### Technical

- **Core Functions**: Updated `translateBatch` in core.ts to use global defaults
- **Batching Logic**: Updated all batching and caching logic to respect global defaults
- **Consistent API**: Unified default behavior across all translation functions

## [1.9.4] - 2024-12-19

### Added

- **Global lt Component Defaults**: Added ability to set global defaults for `lt` component
  - New `setLtDefaults()` and `getLtDefaults()` functions for managing global defaults
  - Simplified component usage: `<lt>Cancel</lt>` instead of `<lt ctx="ui" orig="en">Cancel</lt>`
  - Global defaults can be overridden by component props
  - Priority: Component props > Global defaults > SDK defaults

### Changed

- **lt Component Behavior**: Updated default behavior for `orig` prop
  - `ctx` defaults to `'ui'` if not specified
  - `orig` defaults to empty string if not specified
  - Component now uses global defaults when props are not provided

### Documentation

- **Enhanced README**: Added Global lt Component Defaults section with examples
- **Updated Components Guide**: Added comprehensive documentation for global defaults
- **Demo Application**: Updated to demonstrate global defaults functionality

### Technical

- **Component Logic**: Updated `lt` component to use global defaults from `useLangie`
- **API Enhancement**: Added global defaults management functions to SDK exports
- **TypeScript Support**: Added proper type definitions for new functions

## [1.9.3] - 2024-12-19

### Added

- **TypeScript Definitions**: Added `src/*.d.ts` files to npm package for better TypeScript support
  - TypeScript definitions are now included in the published package
  - Improved IDE support and type checking for consumers
  - Better development experience with full type information

### Technical

- **Package Distribution**: Enhanced npm package to include source TypeScript definitions
- **Type Safety**: Improved TypeScript support for all exported components and functions

## [1.9.2] - 2024-12-19

### Added

- **Global Component Registration**: Users can now register `lt` component globally for easier usage
  - Added global registration examples in README and documentation
  - Updated Vue.js documentation with global component setup
  - Updated Nuxt.js documentation with plugin-based global registration
  - Updated components documentation with global registration guide
  - Demo application now uses global component registration
  - Added tests for global component registration functionality

### Documentation

- **Enhanced README**: Added Global Component Registration section with examples
- **Updated Vue.js Guide**: Added global component registration and usage examples
- **Updated Nuxt.js Guide**: Added plugin-based global component registration
- **Updated Components Guide**: Added comprehensive global registration documentation
- **Demo Application**: Updated to demonstrate global component registration

### Technical

- **Component Registration**: Simplified component usage across applications
- **Better Developer Experience**: Reduced need for repeated imports in templates
- **Consistent API**: Global registration works across Vue.js and Nuxt.js applications

## [1.9.1] - 2024-12-19

### Fixed

- **Type Safety**: Fixed linter warnings by introducing explicit types for global singleton instance
- **Code Quality**: Removed `any` types and improved type safety across the SDK
- **Production Ready**: All tests pass and code is clean for production release

## [1.9.0] - 2024-12-19

### Changed

- **BREAKING**: Unified API field naming across frontend, backend, and SDK
- **BREAKING**: Replaced legacy field mappings with consistent API constants
- **BREAKING**: All API requests now use `t`, `from`, `to`, `ctx`, `translations` fields
- **BREAKING**: Removed support for old field names (`text`, `from_lang`, `to_lang`, `context`)
- **BREAKING**: Updated all types to use computed property syntax with API constants
- **BREAKING**: Changed function parameters from `context` to `ctx` for consistency

### Added

- New API field constants: `API_FIELD_TEXT`, `API_FIELD_FROM`, `API_FIELD_TO`, `API_FIELD_CTX`, `API_FIELD_TRANSLATIONS`
- Exported API constants from main package for external usage
- Consistent field naming across all SDK components

### Fixed

- Fixed API request format to use correct field names
- Removed duplicate field mappings and legacy code
- Updated demo application to use new API format
- Fixed all test mocks to use consistent field names

### Technical

- Refactored core translation logic to use API constants
- Updated batching system to use unified field names
- Improved type safety with computed property syntax
- Cleaned up all hardcoded string literals

## [1.8.0] - 2024-12-19

### Added

- **Comprehensive Documentation**: Complete documentation overhaul with framework-specific guides
  - Vue.js usage guide with composables, components, and best practices
  - Nuxt.js integration guide with SSR support and deployment
  - JavaScript usage guide for vanilla JS, React, and Node.js
  - TypeScript support guide with full type definitions
  - Advanced usage patterns and optimization techniques
  - Backend integration guide with API specifications

### Changed

- **Clean README Structure**: Removed duplicate information and organized documentation
  - Single, clean Quick Start example in README
  - Complete documentation index with 11 detailed guides
  - Removed framework-specific examples from README (moved to individual docs)
  - Removed detailed API documentation from README (moved to appropriate docs)
  - Removed backend requirements details (moved to backend-integration.md)
  - Removed installation sections from framework-specific docs to avoid duplication

### Documentation

- **11 New Documentation Files**:
  - `docs/getting-started.md` - Installation and basic setup
  - `docs/vue.md` - Vue composables, components, and best practices
  - `docs/nuxt.md` - SSR support, plugins, and deployment
  - `docs/javascript.md` - Vanilla JS, React, and Node.js integration
  - `docs/components.md` - Ready-to-use Vue components
  - `docs/composables.md` - Vue composables and reactive state
  - `docs/core-api.md` - Core translation functions
  - `docs/advanced-usage.md` - Complex patterns and optimization
  - `docs/backend-integration.md` - API requirements and setup
  - `docs/typescript.md` - TypeScript integration guide
  - `docs/contributing.md` - Development and contribution guidelines

### Production Ready

- **Clean Documentation Structure**: No duplicate information across files
- **Framework-Specific Guides**: Tailored documentation for each framework
- **Complete API Reference**: Detailed function and component documentation
- **Best Practices**: Performance optimization and error handling guides
- **TypeScript Support**: Full type definitions and usage examples

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
