# Contributing to Langie API SDK

Thank you for your interest in contributing to Langie API SDK! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start development:
   ```bash
   cd examples/demo && bun run dev
   ```

## Project Structure

```
langie-api-sdk/
├── dist/                # Build output
├── docs/                # Documentation files
├── examples/            # Usage examples and demo
│   └── demo/           # Live demo application
├── scripts/             # Build and utility scripts
├── src/                 # Source code
│   ├── components/      # Vue components
│   ├── utils/          # Utility functions
│   ├── __tests__/       # Tests
│   ├── language-aliases.ts # Language alias definitions
│   ├── search-utils.ts  # Search functionality
│   ├── core.ts         # Core API functions
│   ├── useTranslator.ts # Vue composable
│   └── ...
├── .github/             # GitHub Actions workflows
├── netlify.toml         # Netlify deployment config
├── package.json         # Package manifest
├── tsconfig.json        # TypeScript configuration
├── tsup.config.ts       # Build configuration
└── vitest.setup.ts      # Test setup
```

## Development Workflow

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure they follow the coding standards:

   ```bash
   bun run lint
   bun run format
   ```

3. Write tests for your changes:

   ```bash
   bun run test
   ```

4. Test the demo application:

   ```bash
   cd examples/demo
   bun install
   bun run dev
   ```

5. Build the package to ensure it works:

   ```bash
   bun run build
   ```

6. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   git commit -m "feat: add new feature"
   ```

7. Push your branch and create a pull request.

## Pull Request Guidelines

- Include tests for any new functionality.
- Update documentation as needed.
- Keep your PR focused on a single topic.
- Maintain clean commit history.
- Follow the PR template.
- Test your changes in the demo application.

## Coding Standards

- Follow the ESLint and Prettier configurations.
- Write meaningful commit messages.
- Add appropriate JSDoc comments.
- Maintain backward compatibility when possible.
- Use TypeScript for type safety.
- Follow Vue 3 Composition API patterns.

## Testing

Run tests with:

```bash
# Run all tests
bun run test

# Watch mode
bun run test:watch

# Coverage
bun run test -- --coverage
```

## Building

Build the package with:

```bash
bun run build
```

This creates:

- `dist/` - Built package files
- Type definitions
- Source maps

## Demo Application

The demo application (`examples/demo/`) showcases all SDK features:

- Language selection with search
- Real-time translation
- Theme switching
- Responsive design

To work on the demo:

```bash
cd examples/demo
bun install
bun run dev
```

## Documentation

Documentation is in the `docs/` folder:

- Update relevant docs when adding features
- Follow the existing structure
- Use clear examples
- Test code snippets

## Language Aliases

When adding language support:

1. Update `src/language-aliases.ts`
2. Add appropriate aliases and suggestions
3. Test search functionality
4. Consider regional variations

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag
4. Push to trigger CI/CD

## Getting Help

- Check existing issues and discussions
- Join our community discussions
- Ask questions in pull requests

## License

By contributing, you agree that your contributions will be licensed under the project's [Apache 2.0 License](LICENSE).
