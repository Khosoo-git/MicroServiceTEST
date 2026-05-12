#!/bin/bash

# =====================================================
# MicroService Observatory Platform - Startup Script
# Starts the complete observability platform
# =====================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  MicroService Observatory Platform${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "docker-compose.observability.yml" ]; then
    echo -e "${RED}Error: docker-compose.observability.yml not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo -e "${YELLOW}Starting observability platform...${NC}"
echo ""

# Start services
docker compose -f docker-compose.observability.yml up -d --build

echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}  Platform is starting!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo -e "${YELLOW}Waiting for services to be ready (30 seconds)...${NC}"
sleep 30

echo ""
echo -e "${BLUE}Service URLs:${NC}"
echo ""
echo -e "  ${GREEN}✓${NC} Dashboard UI:     http://localhost:3001"
echo -e "  ${GREEN}✓${NC} Grafana:         http://localhost:3000 (admin/admin)"
echo -e "  ${GREEN}✓${NC} Prometheus:      http://localhost:9090"
echo -e "  ${GREEN}✓${NC} Loki:            http://localhost:3100"
echo -e "  ${GREEN}✓${NC} Tempo:           http://localhost:3200"
echo -e "  ${GREEN}✓${NC} Service API:     http://localhost:8085"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Open http://localhost:3001"
echo "  2. Click 'Register Service'"
echo "  3. Fill in your service details"
echo "  4. View data in Grafana!"
echo ""
echo -e "${YELLOW}View logs:${NC}"
echo "  docker compose -f docker-compose.observability.yml logs -f"
echo ""
echo -e "${YELLOW}Stop services:${NC}"
echo "  docker compose -f docker-compose.observability.yml down"
echo ""
