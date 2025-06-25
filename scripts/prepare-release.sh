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

# Create a temporary package.json for npm pack
echo -e "${GREEN}Creating temporary package.json for npm pack...${NC}"
node -e "
  const pkg = require('./package.json');
  const { scripts, devDependencies, ...rest } = pkg;
  rest.main = 'index.js';
  rest.module = 'index.mjs';
  rest.types = 'index.d.ts';
  console.log(JSON.stringify(rest, null, 2));
" > dist/package.json

# Copy README and LICENSE
echo -e "${GREEN}Copying README, LICENSE, and other documentation...${NC}"
cp README.md dist/
cp LICENSE dist/
cp MIGRATION.md dist/ 2>/dev/null || :

# Create a tarball
echo -e "${GREEN}Creating npm tarball...${NC}"
cd dist
npm pack
cd ..

# Move the tarball to the root
mv dist/*.tgz ./

echo -e "${GREEN}Release preparation complete!${NC}"
echo -e "${YELLOW}Tarball created: $(ls *.tgz)${NC}"
echo -e "${YELLOW}To publish, run: npm publish $(ls *.tgz) --access public${NC}"
