#!/bin/bash

# PercyTech Backend AWS - Migration Script
# This script moves all files from backend-nestjs to root and cleans up

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "backend-nestjs" ]; then
    print_error "backend-nestjs directory not found! Make sure you're in the project root."
    exit 1
fi

print_status "Starting migration from backend-nestjs to root..."

# Create backup of current state
print_status "Creating backup..."
cp -r backend-nestjs backend-nestjs.backup
print_success "Backup created as backend-nestjs.backup"

# Move all files from backend-nestjs to root
print_status "Moving files from backend-nestjs to root..."

# Move source files
if [ -d "backend-nestjs/src" ]; then
    mv backend-nestjs/src .
    print_success "Moved src/"
fi

if [ -d "backend-nestjs/test" ]; then
    mv backend-nestjs/test .
    print_success "Moved test/"
fi

if [ -d "backend-nestjs/dist" ]; then
    mv backend-nestjs/dist .
    print_success "Moved dist/"
fi

# Move configuration files
if [ -f "backend-nestjs/tsconfig.json" ]; then
    mv backend-nestjs/tsconfig.json .
    print_success "Moved tsconfig.json"
fi

if [ -f "backend-nestjs/tsconfig.build.json" ]; then
    mv backend-nestjs/tsconfig.build.json .
    print_success "Moved tsconfig.build.json"
fi

if [ -f "backend-nestjs/nest-cli.json" ]; then
    mv backend-nestjs/nest-cli.json .
    print_success "Moved nest-cli.json"
fi

if [ -f "backend-nestjs/eslint.config.mjs" ]; then
    mv backend-nestjs/eslint.config.mjs .
    print_success "Moved eslint.config.mjs"
fi

if [ -f "backend-nestjs/.prettierrc" ]; then
    mv backend-nestjs/.prettierrc .
    print_success "Moved .prettierrc"
fi

# Move documentation and scripts
if [ -f "backend-nestjs/README.md" ]; then
    mv backend-nestjs/README.md backend-README.md
    print_success "Moved README.md to backend-README.md (to avoid conflict)"
fi

if [ -f "backend-nestjs/API_DOCUMENTATION.md" ]; then
    mv backend-nestjs/API_DOCUMENTATION.md .
    print_success "Moved API_DOCUMENTATION.md"
fi

if [ -f "backend-nestjs/IMPLEMENTATION_SUMMARY.md" ]; then
    mv backend-nestjs/IMPLEMENTATION_SUMMARY.md .
    print_success "Moved IMPLEMENTATION_SUMMARY.md"
fi

if [ -f "backend-nestjs/TERMINAL_MANAGEMENT.md" ]; then
    mv backend-nestjs/TERMINAL_MANAGEMENT.md .
    print_success "Moved TERMINAL_MANAGEMENT.md"
fi

if [ -f "backend-nestjs/test-api.js" ]; then
    mv backend-nestjs/test-api.js .
    print_success "Moved test-api.js"
fi

if [ -f "backend-nestjs/start-and-test.sh" ]; then
    mv backend-nestjs/start-and-test.sh .
    print_success "Moved start-and-test.sh"
fi

# Move environment file
if [ -f "backend-nestjs/env.development" ]; then
    mv backend-nestjs/env.development .
    print_success "Moved env.development"
fi

# Move node_modules (optional - can be reinstalled)
if [ -d "backend-nestjs/node_modules" ]; then
    print_warning "Found existing node_modules in backend-nestjs/"
    read -p "Do you want to move node_modules to root? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mv backend-nestjs/node_modules .
        print_success "Moved node_modules/"
    else
        print_status "Skipping node_modules (will be reinstalled)"
    fi
fi

# Move package-lock.json
if [ -f "backend-nestjs/package-lock.json" ]; then
    mv backend-nestjs/package-lock.json .
    print_success "Moved package-lock.json"
fi

# Remove the now-empty backend-nestjs directory
print_status "Cleaning up backend-nestjs directory..."
rm -rf backend-nestjs
print_success "Removed backend-nestjs directory"

# Make scripts executable
chmod +x run.sh
chmod +x start-and-test.sh

print_success "Migration completed successfully!"
print_status "Next steps:"
echo "  1. Run: npm install (if you didn't move node_modules)"
echo "  2. Run: ./run.sh setup"
echo "  3. Run: ./run.sh dev"
echo ""
print_warning "Note: If you encounter any issues, you can restore from backend-nestjs.backup"
