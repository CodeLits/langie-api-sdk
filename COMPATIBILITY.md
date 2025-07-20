# Compatibility Guide

This document outlines the compatibility requirements and supported versions for Langie API SDK.

## Node.js Support

- **Minimum**: Node.js 18.0.0 (LTS)
- **Recommended**: Node.js 18.20.8 or higher
- **Latest**: Node.js 22.x (LTS)

### Why Node.js 18?

Node.js 18 is the oldest LTS version that provides:

- ES2020+ support
- Modern JavaScript features
- Stable performance
- Long-term support until April 2025

## Vue.js Support

- **Minimum**: Vue 3.2.0
- **Recommended**: Vue 3.4.0 or higher
- **Latest**: Vue 3.5.x

### Why Vue 3.2.0?

Vue 3.2.0 introduced essential Composition API macros:

- `defineProps` - for component props
- `defineEmits` - for component events
- These are required for our Vue components

### Vue 3.0.0 Limitations

Vue 3.0.0 lacks:

- `defineProps` and `defineEmits` macros
- Some Composition API optimizations
- Modern reactivity improvements

## Nuxt.js Support

- **Minimum**: Nuxt 3.0.0
- **Recommended**: Nuxt 3.8.0 or higher
- **Latest**: Nuxt 3.17.x

### Why Nuxt 3.0.0?

Nuxt 3.0.0 provides:

- Vue 3.2.0+ compatibility
- SSR/SSG support
- Modern build system
- TypeScript support

## Browser Support

- **Minimum**: ES2020+ compatible browsers
- **Recommended**: Modern browsers with ES2022+ support

### Supported Browsers

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Package Manager Support

- **pnpm**: Recommended (used in development)
- **npm**: Supported
- **yarn**: Supported

## Framework Integration

### Vue.js

```bash
npm install langie-api-sdk
# or
pnpm add langie-api-sdk
```

### Nuxt.js

```bash
npm install langie-api-sdk
# or
pnpm add langie-api-sdk
```

### Vanilla JavaScript

```bash
npm install langie-api-sdk
# or
pnpm add langie-api-sdk
```

## TypeScript Support

- **Minimum**: TypeScript 5.0.0
- **Recommended**: TypeScript 5.8.0 or higher
- Full type definitions included

## Testing

The SDK is tested against:

- Node.js 18.20.8
- Vue 3.2.0, 3.4.0, 3.5.0
- Nuxt 3.0.0, 3.8.0, 3.17.0
- TypeScript 5.0.0, 5.8.0

## Migration Guide

### From Vue 2

This SDK is Vue 3 only. For Vue 2 projects, consider:

- Upgrading to Vue 3
- Using alternative translation libraries

### From Vue 3.0.x

Upgrade to Vue 3.2.0+ to use this SDK:

```bash
npm install vue@^3.2.0
# or
pnpm add vue@^3.2.0
```

### From Nuxt 2

Upgrade to Nuxt 3:

```bash
npx nuxi@latest init my-project
```

## Troubleshooting

### Common Issues

1. **"defineProps is not defined"**
   - Ensure Vue version is 3.2.0 or higher
   - Check that you're using `<script setup>`

2. **"import.meta is not available"**
   - Ensure Node.js version is 18.0.0 or higher
   - Use ESM modules

3. **SSR hydration mismatches**
   - Common in Nuxt applications
   - Use the `lt` component with proper SSR handling

### Getting Help

- Check the [documentation](./docs/)
- Review [examples](./examples/)
- Open an issue on GitHub
