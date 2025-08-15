#!/bin/bash

# PercyTech Backend AWS - Runner Script
# Run from root directory: ./run.sh [command]

set -e

# No longer needed since we're moving everything to root

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if required files exist
check_requirements() {
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in current directory!"
        exit 1
    fi
    
    if [ ! -d "src" ]; then
        print_error "src directory not found! Make sure you're in the correct directory."
        exit 1
    fi
}

# Function to setup environment
setup_env() {
    print_status "Setting up environment..."
    
    if [ ! -f ".env" ]; then
        if [ -f "env.development" ]; then
            cp "env.development" ".env"
            print_success "Created .env from env.development"
        elif [ -f "env.development.example" ]; then
            cp "env.development.example" ".env"
            print_success "Created .env from env.development.example"
        else
            print_warning "No .env file found. Please create one manually."
        fi
    else
        print_status ".env file already exists"
    fi
}

# Function to install dependencies
install() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Function to start Docker services
docker_up() {
    print_status "Starting Docker services..."
    docker compose up -d
    print_success "Docker services started"
}

# Function to stop Docker services
docker_down() {
    print_status "Stopping Docker services..."
    docker compose down
    print_success "Docker services stopped"
}

# Function to show Docker logs
docker_logs() {
    print_status "Showing Docker logs..."
    docker compose logs -f
}

# Function to start development server
start_dev() {
    print_status "Starting development server..."
    npm run start:dev
}

# Function to build the application
build() {
    print_status "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Function to run tests
test() {
    print_status "Running tests..."
    npm run test
}

# Function to run linting
lint() {
    print_status "Running linting..."
    npm run lint
}

# Function to setup everything
setup() {
    print_status "Setting up PercyTech Backend AWS..."
    check_requirements
    setup_env
    install
    docker_up
    print_success "Setup complete! Run './run.sh dev' to start development"
}

# Function to start development environment
dev() {
    print_status "Starting development environment..."
    check_requirements
    setup_env
    docker_up
    start_dev
}

# Function to show help
show_help() {
    echo "PercyTech Backend AWS - Runner Script"
    echo ""
    echo "Usage: ./run.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Complete setup (install deps, start docker, setup env)"
    echo "  install   - Install backend dependencies"
    echo "  docker:up - Start Docker services (MySQL, Redis, etc.)"
    echo "  docker:down - Stop Docker services"
    echo "  docker:logs - Show Docker logs"
    echo "  dev       - Start development environment (docker + dev server)"
    echo "  start:dev - Start development server only"
    echo "  build     - Build the application"
    echo "  test      - Run tests"
    echo "  lint      - Run linting"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./run.sh setup     # First time setup"
    echo "  ./run.sh dev       # Start development"
    echo "  ./run.sh docker:up # Just start database"
}

# Main script logic
case "${1:-help}" in
    "setup")
        setup
        ;;
    "install")
        check_requirements
        install
        ;;
    "docker:up")
        docker_up
        ;;
    "docker:down")
        docker_down
        ;;
    "docker:logs")
        docker_logs
        ;;
    "dev")
        dev
        ;;
    "start:dev")
        check_requirements
        setup_env
        start_dev
        ;;
    "build")
        check_requirements
        build
        ;;
    "test")
        check_requirements
        test
        ;;
    "lint")
        check_requirements
        lint
        ;;
    "help"|*)
        show_help
        ;;
esac
