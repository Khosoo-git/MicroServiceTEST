#!/bin/bash

# ============================================
# Complete Health Monitoring Test Script
# Tests: Healthy → Down → Recovery → Uptime
# ============================================

API="http://localhost:8085"
DASHBOARD="http://localhost:3002/services"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  Health Monitoring Test Suite${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Function to check current status
check_status() {
    echo -e "${YELLOW}Current Health Status:${NC}"
    curl -s "$API/api/admin/health-stats" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for name, stats in data.get('services', {}).items():
    status = stats.get('status', 'UNKNOWN')
    uptime = stats.get('uptimePercentage', 0)
    response = stats.get('lastResponseTime', 0)
    color = '\033[0;32m✓' if status == 'HEALTHY' else '\033[0;31m✗'
    print(f'{color} {name:15} Status: {status:10} Uptime: {uptime:5.1f}% Response: {response}ms\033[0m')
" 2>/dev/null || echo "Failed to fetch status"
    echo ""
}

# Test 1: Stop a service
test_stop_service() {
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${BLUE}  TEST 1: Stop Service (Simulate Crash)${NC}"
    echo -e "${BLUE}=============================================${NC}"
    echo ""
    echo -e "${YELLOW}Stopping company service...${NC}"
    docker stop company
    
    echo ""
    echo -e "${YELLOW}Waiting for health checker to detect (20 seconds)...${NC}"
    for i in {20..1}; do
        printf "\r%d seconds remaining..." $i
        sleep 1
    done
    echo ""
    
    echo ""
    echo -e "${RED}Expected Result:${NC}"
    echo "  - Company status: UNHEALTHY or DOWN"
    echo "  - Uptime: Should drop"
    echo ""
    check_status
    
    echo -e "${YELLOW}Press Enter to continue to Test 2...${NC}"
    read
}

# Test 2: Restart service
test_restart_service() {
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${BLUE}  TEST 2: Restart Service (Recovery)${NC}"
    echo -e "${BLUE}=============================================${NC}"
    echo ""
    echo -e "${YELLOW}Starting company service...${NC}"
    docker start company
    
    echo ""
    echo -e "${YELLOW}Waiting for service to recover (30 seconds)...${NC}"
    for i in {30..1}; do
        printf "\r%d seconds remaining..." $i
        sleep 1
    done
    echo ""
    
    echo ""
    echo -e "${GREEN}Expected Result:${NC}"
    echo "  - Company status: HEALTHY"
    echo "  - Uptime: Should recover (but not 100% due to downtime)"
    echo ""
    check_status
    
    echo -e "${YELLOW}Press Enter to continue to Test 3...${NC}"
    read
}

# Test 3: Check uptime calculation
test_uptime_calculation() {
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${BLUE}  TEST 3: Verify Uptime Calculation${NC}"
    echo -e "${BLUE}=============================================${NC}"
    echo ""
    
    curl -s "$API/api/admin/health-stats" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('Detailed Health Statistics:')
print('')
for name, stats in data.get('services', {}).items():
    print(f'\033[0;34m{name}:\033[0m')
    print(f'  Status: {stats.get(\"status\", \"N/A\")}')
    print(f'  Uptime: {stats.get(\"uptimePercentage\", 0):.1f}%')
    print(f'  Total Checks: {stats.get(\"totalChecks\", 0)}')
    print(f'  Successful: {stats.get(\"successfulChecks\", 0)}')
    print(f'  Failed: {stats.get(\"totalChecks\", 0) - stats.get(\"successfulChecks\", 0)}')
    print(f'  Response Time: {stats.get(\"lastResponseTime\", 0)}ms')
    print('')
" 2>/dev/null
    
    echo -e "${YELLOW}Press Enter to continue to Test 4...${NC}"
    read
}

# Test 4: Rapid failure/recovery cycle
test_rapid_cycle() {
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${BLUE}  TEST 4: Rapid Failure/Recovery Cycle${NC}"
    echo -e "${BLUE}=============================================${NC}"
    echo ""
    
    echo -e "${YELLOW}Stopping job service...${NC}"
    docker stop job
    sleep 5
    
    echo -e "${YELLOW}Starting job service...${NC}"
    docker start job
    
    echo ""
    echo -e "${YELLOW}Waiting for recovery (20 seconds)...${NC}"
    for i in {20..1}; do
        printf "\r%d seconds remaining..." $i
        sleep 1
    done
    echo ""
    
    echo ""
    echo -e "${GREEN}Expected Result:${NC}"
    echo "  - Job should show some failed checks"
    echo "  - Uptime should be less than 100%"
    echo ""
    check_status
    
    echo -e "${YELLOW}Press Enter to continue to Test 5...${NC}"
    read
}

# Test 5: View dashboard
test_dashboard() {
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${BLUE}  TEST 5: View Dashboard${NC}"
    echo -e "${BLUE}=============================================${NC}"
    echo ""
    echo -e "${GREEN}Open your browser to:${NC}"
    echo ""
    echo -e "  ${BLUE}$DASHBOARD${NC}"
    echo ""
    echo "You should see:"
    echo "  ✓ All services listed"
    echo "  ✓ Status badges (GREEN = HEALTHY, RED = UNHEALTHY)"
    echo "  ✓ Uptime percentages"
    echo "  ✓ Response times"
    echo "  ✓ Auto-refresh every 10 seconds"
    echo ""
    echo -e "${YELLOW}When ready, press Enter to cleanup...${NC}"
    read
}

# Cleanup
cleanup() {
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${BLUE}  Cleaning Up${NC}"
    echo -e "${BLUE}=============================================${NC}"
    echo ""
    
    echo -e "${YELLOW}Ensuring all services are running...${NC}"
    docker start company job review gateway 2>/dev/null
    
    echo ""
    echo -e "${YELLOW}Waiting for all services to be healthy (30 seconds)...${NC}"
    for i in {30..1}; do
        printf "\r%d seconds remaining..." $i
        sleep 1
    done
    echo ""
    
    echo ""
    check_status
    
    echo -e "${GREEN}✓ Test suite complete!${NC}"
    echo ""
}

# Main menu
show_menu() {
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${BLUE}  Select Test:${NC}"
    echo -e "${BLUE}=============================================${NC}"
    echo "1. Run ALL tests automatically"
    echo "2. Test 1: Stop Service (Simulate Crash)"
    echo "3. Test 2: Restart Service (Recovery)"
    echo "4. Test 3: Check Uptime Calculation"
    echo "5. Test 4: Rapid Failure/Recovery Cycle"
    echo "6. Test 5: View Dashboard"
    echo "7. Check Current Status"
    echo "0. Exit"
    echo -e "${BLUE}=============================================${NC}"
    echo ""
}

# Run all tests
run_all_tests() {
    test_stop_service
    test_restart_service
    test_uptime_calculation
    test_rapid_cycle
    test_dashboard
    cleanup
}

# Main loop
while true; do
    show_menu
    read -p "Enter choice: " choice
    
    case $choice in
        1)
            run_all_tests
            ;;
        2)
            test_stop_service
            ;;
        3)
            test_restart_service
            ;;
        4)
            test_uptime_calculation
            ;;
        5)
            test_rapid_cycle
            ;;
        6)
            test_dashboard
            ;;
        7)
            check_status
            echo "Press Enter to continue..."
            read
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
done
