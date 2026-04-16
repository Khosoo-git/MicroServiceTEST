#!/usr/bin/env bash
# =============================================================
#  test-traces.sh  —  Tempo distributed trace шалгах скрипт
#  Хэрэглээ: bash scripts/test-traces.sh
# =============================================================

set -e

GATEWAY="http://localhost:8084"
TEMPO="http://localhost:3200"
NEXT_API="http://localhost:3001"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}  TRACES — Tempo distributed trace шалгах${NC}"
echo -e "${CYAN}=================================================${NC}"

# 1. Tempo шалгах — /ready нь 503 буцаах тохиолдол бий, /api/search-ээр нотлох
echo -e "\n${YELLOW}[1/4] Tempo холболт шалгах...${NC}"
SEARCH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TEMPO/api/search?limit=1" 2>/dev/null || echo "000")
if [ "$SEARCH_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ Tempo ажиллаж байна (HTTP $SEARCH_STATUS)${NC}"
else
  READY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TEMPO/ready" 2>/dev/null || echo "000")
  echo -e "${RED}✗ Tempo /api/search: $SEARCH_STATUS | /ready: $READY_STATUS${NC}"
  echo -e "  docker compose logs tempo | tail -20"
  exit 1
fi

# 2. Trace үүсгэхийн тулд gateway-рүү хүсэлт илгээх
echo -e "\n${YELLOW}[2/4] Trace үүсгэхийн тулд хүсэлт илгээж байна...${NC}"
for i in $(seq 1 8); do
  curl -s "$GATEWAY/jobs"      > /dev/null
  curl -s "$GATEWAY/reviews"   > /dev/null
  curl -s "$GATEWAY/companies" > /dev/null
  sleep 0.3
done
echo -e "${GREEN}✓ Хүсэлт илгээлт дууслаа — OTLP экспорт хүлээж байна...${NC}"
sleep 3

# 3. Tempo-с шууд trace хайх
echo -e "\n${YELLOW}[3/4] Tempo-с шууд trace хайх...${NC}"
echo -e "${CYAN}--- Tempo /api/search ---${NC}"
SEARCH=$(curl -s "$TEMPO/api/search?limit=5")
echo "$SEARCH" | python3 -c "
import sys, json
d = json.load(sys.stdin)
traces = d.get('traces', [])
print(f'  Нийт {len(traces)} trace олдлоо')
for t in traces[:5]:
    tid  = t.get('traceID','')[:16]
    svc  = t.get('rootServiceName','—')
    name = t.get('rootTraceName','—')
    ms   = t.get('durationMs','?')
    print(f'  [{tid}...]  {svc}  →  {name}  ({ms} ms)')
" 2>/dev/null || echo "$SEARCH" | head -20

# 4. Next.js API-с trace унших + нэг trace-ийн дэлгэрэнгүй
echo -e "\n${YELLOW}[4/4] Next.js /api/traces шалгах...${NC}"
RESULT=$(curl -s "$NEXT_API/api/traces")
COUNT=$(echo "$RESULT" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('traces',[])))" 2>/dev/null || echo "?")
echo -e "${GREEN}✓ /api/traces-с $COUNT trace ирлээ${NC}"

FIRST_ID=$(echo "$RESULT" | python3 -c "
import sys, json
traces = json.load(sys.stdin).get('traces', [])
if traces:
    print(traces[0].get('traceID',''))
" 2>/dev/null || echo "")

if [ -n "$FIRST_ID" ]; then
  echo -e "\n${CYAN}--- Эхний trace дэлгэрэнгүй (ID: ${FIRST_ID:0:16}...) ---${NC}"
  curl -s "$TEMPO/api/traces/$FIRST_ID" | python3 -c "
import sys, json
d = json.load(sys.stdin)
batches = d.get('batches', [])
total_spans = sum(
    len(ss.get('spans', []))
    for b in batches
    for ss in b.get('scopeSpans', [])
)
print(f'  Span тоо: {total_spans}')
for b in batches[:4]:
    attrs = {a['key']: a['value'].get('stringValue','') for a in b.get('resource',{}).get('attributes',[])}
    print(f'  Service: {attrs.get(\"service.name\",\"—\")}')
" 2>/dev/null || echo "  (дэлгэрэнгүй татаж чадсангүй)"
fi

echo -e "\n${GREEN}=================================================${NC}"
echo -e "${GREEN}  TRACES шалгалт дууслаа ✓${NC}"
echo -e "${GREEN}  Tempo: http://localhost:3200${NC}"
echo -e "${GREEN}  Grafana Trace: http://localhost:3000/explore${NC}"
echo -e "${GREEN}  (datasource: Tempo → queryType: Search)${NC}"
echo -e "${GREEN}=================================================${NC}"
