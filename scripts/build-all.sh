#!/bin/bash

# ============================================
# Build All Services Script
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  Building MicroService Observatory${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

cd /Users/tab/Documents/MicroServiceTEST

# Build Service Registry API
echo -e "${YELLOW}Building Service Registry API...${NC}"
cd services/service-registry-api
mvn clean package -DskipTests -q
echo -e "${GREEN}✓ Service Registry API built${NC}"
echo ""

cd ../..

# Build Dashboard UI
echo -e "${YELLOW}Building Dashboard UI...${NC}"
cd observability-dashboard-ui
npm run build
echo -e "${GREEN}✓ Dashboard UI built${NC}"
echo ""

cd ../..

echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}  ✓ All Services Built Successfully!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo -e "${YELLOW}Now you can start services:${NC}"
echo "  docker compose up -d"
echo ""
