#!/usr/bin/env bash
# =============================================================
#  test-client-errors.sh  —  Browser/client error шалгах скрипт
#  Хэрэглээ: bash scripts/test-client-errors.sh
# =============================================================

set -e

GATEWAY="http://localhost:8084"
NEXT_API="http://localhost:3001"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}  CLIENT ERRORS — Хөтөчийн алдаа шалгах${NC}"
echo -e "${CYAN}=================================================${NC}"

# 1. Өөр өөр төрлийн алдаа илгээх
echo -e "\n${YELLOW}[1/3] Туршилтын алдааны мэдээлэл илгээж байна...${NC}"

# TypeError
echo -n "  TypeError... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$GATEWAY/api/client-errors" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "TypeError: Cannot read properties of undefined (reading '\''map'\'')",
    "pageUrl": "https://example.com/jobs",
    "siteKey": "example-site",
    "stack": "TypeError: Cannot read properties of undefined\n  at JobList.render (/app/src/pages/jobs.jsx:42:17)\n  at processChild (/node_modules/react-dom/cjs/react-dom.development.js:3990:14)"
  }')
[ "$STATUS" = "200" ] || [ "$STATUS" = "201" ] || [ "$STATUS" = "202" ] || [ "$STATUS" = "204" ] \
  && echo -e "${GREEN}✓ ($STATUS)${NC}" || echo -e "${RED}✗ ($STATUS)${NC}"

# ReferenceError
echo -n "  ReferenceError... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$GATEWAY/api/client-errors" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "ReferenceError: analytics is not defined",
    "pageUrl": "https://example.com/dashboard",
    "siteKey": "example-site",
    "stack": "ReferenceError: analytics is not defined\n  at trackPageView (/app/src/utils/analytics.js:10:3)"
  }')
[ "$STATUS" = "200" ] || [ "$STATUS" = "201" ] || [ "$STATUS" = "202" ] || [ "$STATUS" = "204" ] \
  && echo -e "${GREEN}✓ ($STATUS)${NC}" || echo -e "${RED}✗ ($STATUS)${NC}"

# Network error
echo -n "  Network error... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$GATEWAY/api/client-errors" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Failed to fetch: NetworkError when attempting to fetch resource",
    "pageUrl": "https://localhost:8082/companies",
    "siteKey": "example-site",
    "stack": "Error: Failed to fetch\n  at fetch (<anonymous>)\n  at fetchCompanies (/app/src/api/company.js:28:12)"
  }')
[ "$STATUS" = "200" ] || [ "$STATUS" = "201" ] || [ "$STATUS" = "202" ] || [ "$STATUS" = "204" ] \
  && echo -e "${GREEN}✓ ($STATUS)${NC}" || echo -e "${RED}✗ ($STATUS)${NC}"

# Unhandled promise rejection
echo -n "  UnhandledRejection... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$GATEWAY/api/client-errors" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "UnhandledPromiseRejection: Promise rejected with reason: 401 Unauthorized",
    "pageUrl": "https://example.com/profile",
    "siteKey": "example-site",
    "stack": "UnhandledPromiseRejectionWarning: Error: 401 Unauthorized\n  at handleResponse (/app/src/api/auth.js:55:9)"
  }')
[ "$STATUS" = "200" ] || [ "$STATUS" = "201" ] || [ "$STATUS" = "202" ] || [ "$STATUS" = "204" ] \
  && echo -e "${GREEN}✓ ($STATUS)${NC}" || echo -e "${RED}✗ ($STATUS)${NC}"

echo -e "${GREEN}✓ Бүх туршилтын алдаа илгээлт дууслаа${NC}"

# 2. Loki flush хүлээх
echo -e "\n${YELLOW}[2/3] Loki flush хүлээж байна (4 сек)...${NC}"
sleep 4

# 3. Next.js API-с уншиж шалгах
echo -e "\n${YELLOW}[3/3] Next.js /api/client-errors шалгах...${NC}"
RESULT=$(curl -s "$NEXT_API/api/client-errors")
COUNT=$(echo "$RESULT" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('entries',[])))" 2>/dev/null || echo "?")
echo -e "${GREEN}✓ /api/client-errors-с $COUNT бичлэг ирлээ${NC}"

echo -e "\n${CYAN}--- Сүүлийн 4 алдаа ---${NC}"
echo "$RESULT" | python3 -c "
import sys, json
entries = json.load(sys.stdin).get('entries', [])
for raw in entries[-4:]:
    try:
        e = json.loads(raw)
        print(f'  [{e.get(\"siteKey\",\"?\")}] {e.get(\"pageUrl\",\"?\")}')
        print(f'    → {e.get(\"message\",raw)[:100]}')
    except Exception:
        print(f'  {raw[:120]}')
" 2>/dev/null || echo "$RESULT" | head -20

echo -e "\n${GREEN}=================================================${NC}"
echo -e "${GREEN}  CLIENT ERRORS шалгалт дууслаа ✓${NC}"
echo -e "${GREEN}  Dashboard: http://localhost:3001${NC}"
echo -e "${GREEN}  Grafana Explore: http://localhost:3000/explore${NC}"
echo -e "${GREEN}=================================================${NC}"
