# Langie API SDK Demo

🚀 **Live Demo: [https://langie-demo.netlify.app/](https://langie-demo.netlify.app/)**

This demo application showcases all the capabilities of the Langie API SDK in a browser environment.

## How to Run Locally

### Using Bun (Recommended)

```bash
# From project root
./demo.sh
```

This will start the development server at http://localhost:5174

### Manual Setup

```bash
cd examples/demo
bun install
bun run dev
```

### Using Node.js

```bash
cd examples/demo
npm install
npm run dev
```

### Production Build

```bash
cd examples/demo
bun run build
bun run preview
```

## Demo Features

- **Full-featured translator** with real API (https://api.langie.uk/v1/)
- **Interface language selection** with search and country flags
- **184+ languages** including rare languages (Kazakh, Uzbek, Tatar, etc.)
- **Smart language search** with aliases and synonyms
- **Language swapping** with one click
- **Dark/light theme** with automatic system preference detection
- **Responsive design** for mobile devices
- **Settings persistence** in localStorage
- **API status indicator** and error handling

## Test Phrases

Try translating these phrases using the real API:

- "Hello, how are you today?"
- "Welcome to our application"
- "Good morning, have a great day!"
- "The weather is beautiful today"
- "Thank you for using our service"

All translations are performed through the production API with support for 184+ languages.

## Demo Architecture

The demo application automatically detects the environment:

- **Development** (`bun run dev`): uses `http://localhost:8081/v1`
- **Production** (Netlify): uses `https://api.langie.uk/v1/`

This allows developers to test with a local API while users experience the production version.
