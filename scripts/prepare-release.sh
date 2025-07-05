#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Preparing Vue Translator SDK for release...${NC}"

# Ensure we're in the right directory
cd "$(dirname "$0")/.."

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${RED}Error: There are uncommitted changes in the repository.${NC}"
  echo -e "${RED}Please commit or stash your changes before preparing a release.${NC}"
  exit 1
fi

# Run linting
echo -e "${GREEN}Running linter...${NC}"
npm run lint

# Run tests
echo -e "${GREEN}Running tests...${NC}"
npm run test

# Build the package
echo -e "${GREEN}Building package...${NC}"
npm run build

# Check if files exist in dist
if [[ ! -d "dist" || -z "$(ls -A dist)" ]]; then
  echo -e "${RED}Error: Build failed or dist directory is empty.${NC}"
  exit 1
fi

echo -e "${GREEN}Release preparation complete!${NC}"
echo -e "${YELLOW}Version: $(node -p "require('./package.json').version")${NC}"
echo -e "${YELLOW}Ready for GitHub Actions to publish to npm${NC}"
echo -e "${YELLOW}To create a release:${NC}"
echo -e "${YELLOW}1. Push changes to main branch${NC}"
echo -e "${YELLOW}2. Create a new release on GitHub with tag v$(node -p "require('./package.json').version")${NC}"
echo -e "${YELLOW}3. GitHub Actions will automatically publish to npm${NC}"
