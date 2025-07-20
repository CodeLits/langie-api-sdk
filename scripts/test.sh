#!/bin/bash

# Test runner script for langie-api-sdk
# Usage: ./scripts/test.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Running tests for langie-api-sdk${NC}"

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed. Please install pnpm first.${NC}"
    exit 1
fi

# Parse command line arguments
WATCH=false
COVERAGE=false
SPECIFIC_TEST=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -w|--watch)
            WATCH=true
            shift
            ;;
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        -f|--file)
            SPECIFIC_TEST="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -w, --watch      Run tests in watch mode"
            echo "  -c, --coverage   Run tests with coverage report"
            echo "  -f, --file FILE  Run specific test file"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Build the command
CMD="pnpm test"

if [ "$WATCH" = true ]; then
    CMD="pnpm test:watch"
    echo -e "${YELLOW}📺 Running tests in watch mode...${NC}"
elif [ "$COVERAGE" = true ]; then
    CMD="$CMD --coverage"
    echo -e "${YELLOW}📊 Running tests with coverage...${NC}"
elif [ -n "$SPECIFIC_TEST" ]; then
    CMD="$CMD $SPECIFIC_TEST"
    echo -e "${YELLOW}🎯 Running specific test: $SPECIFIC_TEST${NC}"
else
    echo -e "${YELLOW}🚀 Running all tests...${NC}"
fi

# Run the tests
echo "Executing: $CMD"
echo ""

if eval "$CMD"; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo ""
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi 