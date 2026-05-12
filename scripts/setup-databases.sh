#!/bin/bash

# =====================================================
# Database Setup Script for MicroServiceTEST
# Creates all required PostgreSQL databases
# =====================================================

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}MicroServiceTEST - Database Setup${NC}"
echo -e "${GREEN}=====================================${NC}"

# Check if PostgreSQL is running
if ! docker ps | grep -q postgres; then
    echo -e "${YELLOW}PostgreSQL container not running. Starting it...${NC}"
    docker compose up -d postgres
    sleep 5
fi

# List of databases to create
DATABASES=("company" "job" "review")

echo -e "${YELLOW}Creating databases...${NC}"

for db in "${DATABASES[@]}"; do
    echo -n "Creating database: $db... "
    
    # Check if database already exists
    if docker exec postgres psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$db"; then
        echo -e "${YELLOW}already exists${NC}"
    else
        docker exec postgres psql -U postgres -c "CREATE DATABASE $db;" > /dev/null 2>&1
        echo -e "${GREEN}created successfully${NC}"
    fi
done

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Database setup complete!${NC}"
echo -e "${GREEN}=====================================${NC}"

echo ""
echo -e "Available databases:"
docker exec postgres psql -U postgres -l

echo ""
echo -e "${YELLOW}To add a new service database:${NC}"
echo "  docker exec -it postgres psql -U postgres -c \"CREATE DATABASE your_service_db;\""
