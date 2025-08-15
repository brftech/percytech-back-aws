#!/bin/bash

echo "🚀 Starting SMS B2B SaaS Platform Development Server..."

# Start the development server in the background
npm run start:dev &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 10

echo "🧪 Testing API endpoints..."
node test-api.js

echo "🛑 Stopping server..."
kill $SERVER_PID

echo "✅ Done!"
