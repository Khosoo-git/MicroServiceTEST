#!/bin/bash

# =====================================================
# Quick Start - Dashboard UI
# =====================================================

echo "======================================"
echo "  Dashboard UI - Quick Start"
echo "======================================"
echo ""

# Check if running in Docker mode or local mode
if [ "$1" == "docker" ]; then
    echo "Starting with Docker..."
    echo ""
    cd /Users/tab/Documents/MicroServiceTEST
    docker compose -f docker-compose.observability.yml up -d observability-dashboard-ui service-registry-api
    
    echo ""
    echo "Waiting for services to start..."
    sleep 10
    
    echo ""
    echo "✅ Dashboard UI is running at:"
    echo "   http://localhost:3001"
    echo ""
    echo "✅ Service Registry API is running at:"
    echo "   http://localhost:8085"
    echo ""
    echo "View logs: docker compose -f docker-compose.observability.yml logs -f"
    echo "Stop: docker compose -f docker-compose.observability.yml down"
    
elif [ "$1" == "local" ]; then
    echo "Starting local development server..."
    echo ""
    cd /Users/tab/Documents/MicroServiceTEST/observability-dashboard-ui
    
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    echo ""
    echo "Starting Next.js dev server..."
    npm run dev &
    
    sleep 5
    
    echo ""
    echo "✅ Dashboard UI is running at:"
    echo "   http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop"
    
else
    echo "Usage: ./start-dashboard.sh [docker|local]"
    echo ""
    echo "Options:"
    echo "  docker  - Start with Docker (port 3001)"
    echo "  local   - Start local dev server (port 3000)"
    echo ""
    echo "Example:"
    echo "  ./start-dashboard.sh docker"
fi

echo ""
