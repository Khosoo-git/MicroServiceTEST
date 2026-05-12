#!/bin/bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  MicroService Observatory Platform${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

cd /Users/tab/Documents/MicroServiceTEST

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Build and start
echo -e "${YELLOW}Building and starting all services...${NC}"
echo -e "${YELLOW}This may take a few minutes on first run...${NC}"
docker compose up -d --build

echo ""
echo -e "${GREEN}Waiting for services to start (45 seconds)...${NC}"
sleep 45

echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  ✓ Platform Ready!${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""
echo -e "  ${GREEN}✓${NC} Dashboard:      http://localhost:3002"
echo -e "  ${GREEN}✓${NC} API:            http://localhost:8085"
echo -e "  ${GREEN}✓${NC} Eureka:         http://localhost:8761"
echo -e "  ${GREEN}✓${NC} Config Server:  http://localhost:8080"
echo -e "  ${GREEN}✓${NC} Gateway:        http://localhost:8084"
echo -e "  ${GREEN}✓${NC} Company MS:     http://localhost:8081"
echo -e "  ${GREEN}✓${NC} Job MS:         http://localhost:8082"
echo -e "  ${GREEN}✓${NC} Review MS:      http://localhost:8083"
echo -e "  ${GREEN}✓${NC} Grafana:        http://localhost:3000 (admin/admin)"
echo -e "  ${GREEN}✓${NC} Prometheus:     http://localhost:9090"
echo -e "  ${GREEN}✓${NC} Loki:           http://localhost:3100"
echo -e "  ${GREEN}✓${NC} Tempo:          http://localhost:3200"
echo ""
echo -e "${YELLOW}Demo Services Ready for Testing!${NC}"
echo -e "  - Company Service (8081)"
echo -e "  - Job Service (8082)"
echo -e "  - Review Service (8083)"
echo -e "  - Gateway (8084)"
echo ""
echo -e "${YELLOW}View Logs:${NC}"
echo -e "  docker compose logs -f"
echo ""
echo -e "${YELLOW}Stop:${NC}"
echo -e "  docker compose down"
echo ""
