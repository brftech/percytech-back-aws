#!/bin/bash

# 🚀 PercyTech Modern Platform - Development Setup Script

echo "🚀 Setting up PercyTech Modern Platform development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

echo "📁 Working directory: $(pwd)"

# Start Docker services
echo "🐳 Starting Docker services..."
docker compose up -d

# Wait a moment for services to start
echo "⏳ Waiting for services to start..."
sleep 5

# Check service status
echo "📊 Service status:"
docker compose ps

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "🌐 Available services:"
echo "   • Frontend: http://localhost:3000 (npm run dev in frontend/)"
echo "   • MySQL: localhost:3306"
echo "   • Redis: localhost:6379"
echo "   • MinIO: http://localhost:9000"
echo "   • Adminer: http://localhost:8080"
echo "   • Redis Commander: http://localhost:8081"
echo ""
echo "📚 Next steps:"
echo "   1. cd frontend && npm run dev"
echo "   2. Open http://localhost:3000 in your browser"
echo ""
echo "🛑 To stop services: docker compose down"
