#!/bin/bash

# Register demo services in the database

API="http://localhost:8085"

echo "Registering demo services..."
echo ""

# Register Company Service
echo "Registering Company Service..."
curl -s -X POST "$API/api/services" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "company",
    "serviceType": "microservice",
    "host": "company",
    "port": 8081,
    "metricsEnabled": true,
    "logsEnabled": true,
    "tracingEnabled": true,
    "owner": "Demo Team"
  }' | python3 -m json.tool

echo ""

# Register Job Service
echo "Registering Job Service..."
curl -s -X POST "$API/api/services" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "job",
    "serviceType": "microservice",
    "host": "job",
    "port": 8082,
    "metricsEnabled": true,
    "logsEnabled": true,
    "tracingEnabled": true,
    "owner": "Demo Team"
  }' | python3 -m json.tool

echo ""

# Register Review Service
echo "Registering Review Service..."
curl -s -X POST "$API/api/services" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "review",
    "serviceType": "microservice",
    "host": "review",
    "port": 8083,
    "metricsEnabled": true,
    "logsEnabled": true,
    "tracingEnabled": true,
    "owner": "Demo Team"
  }' | python3 -m json.tool

echo ""

# Register Gateway
echo "Registering Gateway..."
curl -s -X POST "$API/api/services" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "gateway",
    "serviceType": "api",
    "host": "gateway",
    "port": 8084,
    "metricsEnabled": true,
    "logsEnabled": true,
    "tracingEnabled": true,
    "owner": "Demo Team"
  }' | python3 -m json.tool

echo ""
echo "All demo services registered!"
echo ""
echo "Current services:"
curl -s "$API/api/services" | python3 -m json.tool
