#!/bin/bash

# Quick Traces Fix Script
# This will rebuild services and enable traces

set -e

echo "======================================"
echo "  MicroService Traces - Quick Fix"
echo "======================================"
echo ""

echo "⏳ Stopping services..."
docker compose stop companyms jobms reviewms gateway-ms

echo "⏳ Removing old containers..."
docker compose rm -f companyms jobms reviewms gateway-ms

echo "⏳ Rebuilding services from source (this takes 10-15 minutes)..."
echo "   Building Company service..."
docker compose build companyms

echo "   Building Job service..."
docker compose build jobms

echo "   Building Review service..."
docker compose build reviewms

echo "   Building Gateway service..."
docker compose build gateway-ms

echo ""
echo "⏳ Starting services..."
docker compose up -d companyms jobms reviewms gateway-ms

echo ""
echo "⏳ Waiting for services to start (3 minutes)..."
sleep 180

echo ""
echo "⏳ Generating test traces..."
for i in {1..20}; do
  curl -s http://localhost:8081/api/companies > /dev/null
  curl -s http://localhost:8082/api/jobs > /dev/null
  curl -s http://localhost:8084/actuator/health > /dev/null
  echo "  Request $i/20 sent"
  sleep 1
done

echo ""
echo "⏳ Waiting for traces to appear in Tempo (30 seconds)..."
sleep 30

echo ""
echo "======================================"
echo "  Checking Traces..."
echo "======================================"

# Check if traces are in Tempo
TRACE_COUNT=$(curl -s "http://localhost:3200/api/search?start=$(($(date +%s) - 3600))&end=$(date +%s)" 2>&1 | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('traces', [])))" 2>/dev/null || echo "0")

echo ""
if [ "$TRACE_COUNT" -gt "0" ]; then
  echo "✅ SUCCESS! Found $TRACE_COUNT traces in Tempo!"
  echo ""
  echo "View traces at:"
  echo "  - Dashboard: http://localhost:3001/traces"
  echo "  - Grafana: http://localhost:3000 (Explore → Tempo)"
else
  echo "⚠️  No traces found yet."
  echo ""
  echo "Possible reasons:"
  echo "  1. Services still starting - wait 2 more minutes"
  echo "  2. Services need more requests - run the curl loop again"
  echo "  3. Check service logs: docker logs company"
  echo ""
  echo "Check Tempo directly:"
  echo "  curl 'http://localhost:3200/api/search?start=$(($(date +%s) - 3600))&end=$(date +%s)'"
fi

echo ""
echo "======================================"
