# Contributing to Langie API SDK

Thank you for your interest in contributing to Langie API SDK! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development:
   ```bash
   npm run dev
   ```

## Project Structure

```
langie-api-sdk/
├── dist/                # Build output
├── docs/                # Documentation files
├── examples/            # Usage examples
├── scripts/             # Shell scripts
├── src/                 # Source code
│   ├── components/      # Vue components
│   ├── __tests__/       # Component tests
│   ├── core.spec.ts     # Core API tests
│   ├── useTranslator.spec.ts # Composable tests
│   ├── ...
├── .github/             # GitHub Actions workflows
├── LICENSE              # License file
├── package.json         # Package manifest
├── tsconfig.json        # TypeScript configuration
├── tsup.config.ts       # Build configuration
└── vitest.config.ts     # Test configuration
```

## Development Workflow

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure they follow the coding standards:

   ```bash
   npm run lint
   npm run format
   ```

3. Write tests for your changes:

   ```bash
   npm run test
   ```

4. Build the package to ensure it works:

   ```bash
   npm run build
   ```

5. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   git commit -m "feat: add new feature"
   ```

6. Push your branch and create a pull request.

## Pull Request Guidelines

- Include tests for any new functionality.
- Update documentation as needed.
- Keep your PR focused on a single topic.
- Maintain clean commit history.
- Follow the PR template.

## Coding Standards

- Follow the ESLint and Prettier configurations.
- Write meaningful commit messages.
- Add appropriate JSDoc comments.
- Maintain backward compatibility when possible.

## Testing

Run tests with:

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test -- --coverage
```

## Building

Build the package with:

```bash
npm run build
```

## License

By contributing, you agree that your contributions will be licensed under the project's [Apache 2.0 License](LICENSE).
