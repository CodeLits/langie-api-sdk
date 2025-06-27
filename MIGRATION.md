# Migration Guide

## Migrating to v1.2.x

### Breaking Changes

None. Version 1.2.x is fully backward compatible with 1.1.x.

### New Features

- **Enhanced Icon Support**: Demo now uses professional SVG icons from Heroicons
- **Improved Component Exports**: `lt` component is now exported synchronously for better developer experience
- **Better TypeScript Support**: Enhanced type definitions for better IDE support

### Deprecations

None.

## Migrating from v1.1.x to v1.2.x

No code changes required. Simply update your package.json:

```bash
bun add langie-api-sdk@latest
```

## Migrating from v1.0.x to v1.1.x

### API Changes

- No breaking changes in the public API
- All existing code will continue to work without modifications

### Recommended Updates

If you were using direct imports from internal files, update to use the public API:

```typescript
// Before (not recommended)
import { lt } from 'langie-api-sdk/dist/components/lt.vue'

// After (recommended)
import { lt } from 'langie-api-sdk/components'
```

## Need Help?

If you encounter any issues during migration:

1. Check the [documentation](./docs/README.md)
2. Review the [examples](./examples/)
3. Open an issue on [GitHub](https://github.com/VivaProgress/langie-api-sdk/issues)
