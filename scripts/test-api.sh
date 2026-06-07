#!/bin/bash

echo "======================================"
echo "  Testing Service Registry API"
echo "======================================"
echo ""

# Test 1: Check if API is running
echo "Test 1: Checking API health..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8085/api/services)

if [ "$response" == "200" ]; then
    echo "✅ API is running (HTTP $response)"
elif [ "$response" == "000" ]; then
    echo "❌ API is not running (HTTP $response)"
    echo ""
    echo "Starting Service Registry API..."
    cd /Users/tab/Documents/MicroServiceTEST
    docker compose up -d service-registry-api
    sleep 10
    echo "Retrying..."
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8085/api/services)
    if [ "$response" == "200" ]; then
        echo "✅ API is now running (HTTP $response)"
    else
        echo "❌ Still not accessible. Check logs:"
        docker compose logs service-registry-api
        exit 1
    fi
else
    echo "⚠️ API returned HTTP $response"
fi

echo ""

# Test 2: List registered services
echo "Test 2: Listing registered services..."
curl -s http://localhost:8085/api/services | jq '.' 2>/dev/null || curl -s http://localhost:8085/api/services

echo ""
echo ""
echo "======================================"
echo "  Dashboard UI"
echo "======================================"
echo ""
echo "Open in browser: http://localhost:3001"
echo ""
echo "If you see 403 error:"
echo "  1. Make sure Service Registry API is running"
echo "  2. Check CORS is enabled"
echo "  3. Try: curl http://localhost:8085/api/services"
echo ""
