#!/bin/bash

# ============================================
# Service Health Testing Script
# Simulate failures and test monitoring
# ============================================

API_BASE="http://localhost:8085"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  Service Health Testing Tool${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Function to show current health stats
show_stats() {
    echo -e "${YELLOW}Current Service Health Stats:${NC}"
    echo ""
    curl -s ${API_BASE}/api/admin/health-stats | python3 -m json.tool 2>/dev/null || \
    curl -s ${API_BASE}/api/admin/health-stats
    echo ""
}

# Function to simulate failure
simulate_failure() {
    local service=$1
    local permanent=${2:-false}
    
    echo -e "${RED}Simulating failure for: ${service}${NC}"
    if [ "$permanent" = "true" ]; then
        curl -s -X POST "${API_BASE}/api/admin/simulate-failure/${service}?permanent=true" | python3 -m json.tool
    else
        curl -s -X POST "${API_BASE}/api/admin/simulate-failure/${service}?permanent=false" | python3 -m json.tool
    fi
    echo ""
}

# Function to recover service
recover_service() {
    local service=$1
    echo -e "${GREEN}Recovering service: ${service}${NC}"
    curl -s -X POST "${API_BASE}/api/admin/recover/${service}" | python3 -m json.tool
    echo ""
}

# Function to reset all stats
reset_stats() {
    echo -e "${YELLOW}Resetting all service stats...${NC}"
    curl -s -X POST "${API_BASE}/api/admin/reset-stats" | python3 -m json.tool
    echo ""
}

# Show menu
show_menu() {
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${BLUE}  Testing Options:${NC}"
    echo -e "${BLUE}=============================================${NC}"
    echo "1. Show current health stats"
    echo "2. Simulate temporary failure (Company MS)"
    echo "3. Simulate permanent failure (Company MS)"
    echo "4. Simulate failure (Job MS)"
    echo "5. Simulate failure (Review MS)"
    echo "6. Recover Company MS"
    echo "7. Recover Job MS"
    echo "8. Recover Review MS"
    echo "9. Recover ALL services"
    echo "10. Reset ALL stats"
    echo "11. Test service endpoints directly"
    echo "0. Exit"
    echo -e "${BLUE}=============================================${NC}"
    echo ""
}

# Test service endpoints directly
test_endpoints() {
    echo -e "${YELLOW}Testing service endpoints directly:${NC}"
    echo ""
    
    echo -e "Company MS (8081):"
    curl -s -o /dev/null -w "  Status: %{http_code}, Time: %{time_total}s\n" http://localhost:8081/actuator/health || echo "  ❌ UNREACHABLE"
    
    echo -e "Job MS (8082):"
    curl -s -o /dev/null -w "  Status: %{http_code}, Time: %{time_total}s\n" http://localhost:8082/actuator/health || echo "  ❌ UNREACHABLE"
    
    echo -e "Review MS (8083):"
    curl -s -o /dev/null -w "  Status: %{http_code}, Time: %{time_total}s\n" http://localhost:8083/actuator/health || echo "  ❌ UNREACHABLE"
    
    echo -e "Gateway (8084):"
    curl -s -o /dev/null -w "  Status: %{http_code}, Time: %{time_total}s\n" http://localhost:8084/actuator/health || echo "  ❌ UNREACHABLE"
    
    echo ""
}

# Main loop
while true; do
    show_menu
    read -p "Select option: " choice
    
    case $choice in
        1)
            show_stats
            ;;
        2)
            simulate_failure "Company Service" false
            ;;
        3)
            simulate_failure "Company Service" true
            ;;
        4)
            simulate_failure "Job Service" false
            ;;
        5)
            simulate_failure "Review Service" false
            ;;
        6)
            recover_service "Company Service"
            ;;
        7)
            recover_service "Job Service"
            ;;
        8)
            recover_service "Review Service"
            ;;
        9)
            recover_service "Company Service"
            recover_service "Job Service"
            recover_service "Review Service"
            ;;
        10)
            reset_stats
            ;;
        11)
            test_endpoints
            ;;
        0)
            echo -e "${GREEN}Exiting...${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
