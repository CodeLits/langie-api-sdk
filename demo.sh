#!/bin/bash

# Langie API SDK Demo Launcher
# This script starts the demo application in development mode.
# It relies on Vite to handle source files directly for hot-reloading.

set -e

echo "🚀 Starting Langie API SDK Demo..."
echo

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the langie-api-sdk root directory"
    exit 1
fi

# In dev mode, we no longer need to build the package first.
# Vite will resolve dependencies from the source files.
# echo "📦 Building package..."
# pnpm run build

# Navigate to demo directory
cd examples/demo

# Install demo dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing demo dependencies..."
    pnpm install
fi

# Check if API server is running
echo "🔍 Checking API server..."
if curl -s -f http://localhost:8081/v1/languages > /dev/null 2>&1; then
    echo "✅ API server is running at localhost:8081"
else
    echo "⚠️  Warning: API server not detected at localhost:8081"
    echo "   Make sure your translation API server is running before testing translations"
fi

echo
echo "🎉 Starting demo app..."
echo "   URL: http://localhost:5175"
echo "   Press Ctrl+C to stop"
echo

# Start the demo server
pnpm run dev 