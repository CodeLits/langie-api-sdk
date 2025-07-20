# Table of Contents

## 📚 Documentation Structure

### 🚀 Getting Started

- [Getting Started](./getting-started.md)
  - Installation
  - Basic Setup
  - First Translation
  - Live Demo

### 🎯 Core Concepts

- [Vue.js Usage](./vue.md)
  - Composables
  - Translation Functions
  - Components
  - Best Practices

- [Components](./components.md)
  - `lt` - Translation Component
  - `LanguageSelect` - Language Picker
  - `InterfaceLanguageSelect` - Smart Language Detection
  - `SimpleLanguageSelect` - Minimal Picker

- [Composables](./composables.md)
  - `useLangie` - Main Composable
  - Translation Functions
  - Language Management
  - Caching

### 🔧 Framework Integration

- [Nuxt.js Integration](./nuxt.md)
  - SSR Support
  - Plugin Setup
  - Deployment
  - Performance

- [JavaScript Usage](./javascript.md)
  - Vanilla JS
  - React Integration
  - Node.js Usage
  - Browser Support

### 📖 Advanced Topics

- [Advanced Usage](./advanced-usage.md)
  - Performance Optimization
  - Caching Strategies
  - Batching
  - Error Handling

- [Best Practices](./best-practices.md)
  - Performance Optimization
  - Error Handling
  - SSR and Hydration
  - Security Guidelines
  - Testing Strategies

- [TypeScript Support](./typescript.md)
  - Type Definitions
  - Type Safety
  - Interfaces
  - Examples

- [Core API](./core-api.md)
  - Direct API Usage
  - Translation Functions
  - Language Management
  - Utilities

### 🔌 Backend & Integration

- [Backend Integration](./backend-integration.md)
  - API Requirements
  - Endpoints
  - Authentication
  - Rate Limiting

### 🛠️ Development

- [Contributing](./contributing.md)
  - Development Setup
  - Code Standards
  - Testing
  - Pull Requests

- [Compatibility Guide](../COMPATIBILITY.md)
  - Version Requirements
  - Browser Support
  - Migration Guide
  - Troubleshooting

## 📋 Quick Reference

### Translation Functions

```javascript
// Synchronous (immediate return)
l('Hello world', 'ui', 'en')

// Reactive (auto-updates)
lr('Welcome message', 'content', 'en')

// Component-based
<lt ctx="ui" orig="en">Hello world</lt>
```

### Language Selection

```vue
<!-- Manual selection -->
<LanguageSelect :languages="languages" v-model="selectedLang" />

<!-- Smart detection -->
<InterfaceLanguageSelect />

<!-- Minimal picker -->
<SimpleLanguageSelect :languages="languages" />
```

### Global Setup

```javascript
// Set global defaults
setLtDefaults({
  ctx: 'ui',
  orig: 'en'
})

// Register component globally
app.component('lt', lt)
```

## 🎯 Learning Paths

### Beginner

1. [Getting Started](./getting-started.md)
2. [Vue.js Usage](./vue.md)
3. [Components](./components.md)

### Intermediate

1. [Advanced Usage](./advanced-usage.md)
2. [TypeScript Support](./typescript.md)
3. [Backend Integration](./backend-integration.md)

### Advanced

1. [Core API](./core-api.md)
2. [Nuxt.js Integration](./nuxt.md)
3. [Contributing](./contributing.md)

## 🔍 Search Index

### Functions

- `l()` - Synchronous translation
- `lr()` - Reactive translation
- `setLanguage()` - Change language
- `fetchLanguages()` - Load languages
- `setLtDefaults()` - Global defaults

### Components

- `lt` - Translation component
- `LanguageSelect` - Language picker
- `InterfaceLanguageSelect` - Smart detection
- `SimpleLanguageSelect` - Minimal picker

### Composables

- `useLangie` - Main composable
- Translation functions
- Language management
- Caching utilities

### Configuration

- API key setup
- Language defaults
- Caching options
- SSR configuration
