#!/bin/bash

# ============================================
# Production Deployment Quick Start Script
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  Production Deployment - Quick Start${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Check if SSL certificates exist
if [ ! -f "nginx/ssl/fullchain.pem" ] || [ ! -f "nginx/ssl/privkey.pem" ]; then
    echo -e "${YELLOW}⚠️  SSL certificates not found. Generating...${NC}"
    cd nginx && ./generate-ssl.sh && cd ..
    echo -e "${GREEN}✓ SSL certificates generated${NC}"
    echo ""
else
    echo -e "${GREEN}✓ SSL certificates found${NC}"
    echo ""
fi

# Check if htpasswd exists
if [ ! -f "nginx/.htpasswd" ]; then
    echo -e "${YELLOW}⚠️  htpasswd file not found. Generating...${NC}"
    echo -e "${YELLOW}Enter credentials for admin user:${NC}"
    read -p "Username (default: admin): " USERNAME
    USERNAME=${USERNAME:-admin}
    read -s -p "Password (default: admin123): " PASSWORD
    PASSWORD=${PASSWORD:-admin123}
    echo ""
    cd nginx && ./generate-htpasswd.sh $USERNAME $PASSWORD && cd ..
    echo -e "${GREEN}✓ Authentication configured${NC}"
    echo ""
else
    echo -e "${GREEN}✓ Authentication file found${NC}"
    echo ""
fi

# Build and start services
echo -e "${YELLOW}📦 Building and starting services...${NC}"
echo ""

docker compose -f docker-compose.production.yml up -d --build

echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}  ✓ Deployment Complete!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready (30 seconds)...${NC}"
sleep 30

# Check service health
echo ""
echo -e "${BLUE}Service Status:${NC}"
echo ""

docker compose -f docker-compose.production.yml ps

echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  Access Your Monitoring Platform${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""
echo -e "  ${GREEN}✓${NC} Dashboard:     https://localhost/"
echo -e "  ${GREEN}✓${NC} API:           https://localhost/api/"
echo -e "  ${GREEN}✓${NC} Prometheus:    https://localhost/prometheus/"
echo -e "  ${GREEN}✓${NC} Loki:          https://localhost/loki/"
echo -e "  ${GREEN}✓${NC} Tempo:         https://localhost/tempo/"
echo -e "  ${GREEN}✓${NC} Grafana:       https://localhost/grafana/"
echo -e "  ${GREEN}✓${NC} Health Check:  https://localhost/health"
echo ""
echo -e "${YELLOW}Login Credentials:${NC}"
echo -e "  Username: ${USERNAME:-admin}"
echo -e "  Password: ${PASSWORD:-admin123}"
echo ""
echo -e "${RED}⚠️  IMPORTANT: Change default password!${NC}"
echo -e "  ./nginx/generate-htpasswd.sh admin YOUR_SECURE_PASSWORD"
echo ""
echo -e "${YELLOW}View Logs:${NC}"
echo -e "  docker compose -f docker-compose.production.yml logs -f"
echo ""
echo -e "${YELLOW}Stop Services:${NC}"
echo -e "  docker compose -f docker-compose.production.yml down"
echo ""
echo -e "${BLUE}=============================================${NC}"
echo ""
