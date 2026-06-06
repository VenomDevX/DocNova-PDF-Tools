#!/bin/bash
# quick-start.sh - Start both frontend and backend

echo "🚀 DocNova PDF Tools - Quick Start"
echo "=================================="
echo ""

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.11+"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js"
    exit 1
fi

echo "✓ Python found"
echo "✓ Node.js found"
echo ""

# Start backend in background
echo "📦 Starting Backend..."
cd backend
python app.py &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"
echo "Backend URL: http://localhost:5000"
echo ""

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✓ Backend is healthy"
else
    echo "⚠️  Backend might not be ready yet, waiting..."
    sleep 2
fi

echo ""
echo "🎨 Starting Frontend..."
cd ..
npm run dev

# Cleanup
trap "kill $BACKEND_PID" EXIT
