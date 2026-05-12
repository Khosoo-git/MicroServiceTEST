#!/bin/bash

# Set all demo services as HEALTHY for testing

API="http://localhost:8085"

echo "Setting all services to HEALTHY..."
echo ""

# Recover demo services
for service in company job review gateway; do
    echo "Recovering $service..."
    curl -s -X POST "$API/api/admin/recover/$service" | python3 -m json.tool
    sleep 1
done

echo ""
echo "Checking health stats..."
echo ""
curl -s "$API/api/admin/health-stats" | python3 -m json.tool
