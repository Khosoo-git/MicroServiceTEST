#!/usr/bin/env bash
# =============================================================
#  test-logs.sh  —  Loki log шалгах скрипт
#  Хэрэглээ: bash scripts/test-logs.sh
# =============================================================

set -e

GATEWAY="http://localhost:8084"
LOKI="http://localhost:3100"
NEXT_API="http://localhost:3001"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}  LOGS — Loki серверийн лог шалгах${NC}"
echo -e "${CYAN}=================================================${NC}"

# 1. Loki эрүүл байгаа эсэх шалгах
echo -e "\n${YELLOW}[1/4] Loki холболт шалгах...${NC}"
if curl -s "$LOKI/ready" | grep -q "ready"; then
  echo -e "${GREEN}✓ Loki ажиллаж байна${NC}"
else
  echo -e "${RED}✗ Loki холбогдохгүй байна ($LOKI)${NC}"
  exit 1
fi

# 2. Log үүсгэхийн тулд gateway-рүү хүсэлт илгээх
echo -e "\n${YELLOW}[2/4] Log бичүүлэхийн тулд хүсэлт илгээж байна...${NC}"
for i in $(seq 1 5); do
  curl -s "$GATEWAY/jobs"      > /dev/null
  curl -s "$GATEWAY/reviews"   > /dev/null
  curl -s "$GATEWAY/companies" > /dev/null
done
echo -e "${GREEN}✓ Хүсэлт илгээлт дууслаа${NC}"

# 3. Loki-с шууд лог унших (macOS + Linux хоёуланд ажиллах)
echo -e "\n${YELLOW}[3/4] Loki-с шууд лог унших...${NC}"

# macOS (date -v) болон Linux (date -d) хоёуланд тохирох
NOW=$(date +%s)
START="${NOW}000000000"
# 5 минут өмнөх → 300 секунд хасна
FIVE_MIN_AGO=$((NOW - 300))
START="${FIVE_MIN_AGO}000000000"
END="${NOW}000000000"

echo -e "${CYAN}--- Сүүлийн 5 минутын лог (Loki шууд) ---${NC}"
curl -s -G "$LOKI/loki/api/v1/query_range" \
  --data-urlencode 'query={job=~"company|job|review|gateway"}' \
  --data-urlencode "start=$START" \
  --data-urlencode "end=$END" \
  --data-urlencode "limit=10" | python3 -c "
import sys, json
d = json.load(sys.stdin)
results = d.get('data', {}).get('result', [])
total = sum(len(r.get('values', [])) for r in results)
print(f'  Нийт {total} мөр олдлоо ({len(results)} stream)')
for r in results:
    vals = r.get('values', [])
    for _, line in vals[-2:]:
        print(f'  {line[:120]}')
" 2>/dev/null || echo "  (python3 алга — raw JSON харуулна)"

# 4. Next.js API-с лог унших
echo -e "\n${YELLOW}[4/4] Next.js /api/logs шалгах...${NC}"
RESULT=$(curl -s "$NEXT_API/api/logs")
COUNT=$(echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
vals = [v for r in d.get('data',{}).get('result',[]) for v in r.get('values',[])]
print(len(vals))
" 2>/dev/null || echo "?")

echo -e "${GREEN}✓ /api/logs-с $COUNT мөр ирлээ${NC}"

echo -e "\n${CYAN}--- Сүүлийн 5 мөр ---${NC}"
echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
vals = [v[1] for r in d.get('data',{}).get('result',[]) for v in r.get('values',[])]
for line in vals[-5:]:
    print('  ' + line[:120])
" 2>/dev/null || true

# Log түвшний тойм
echo -e "\n${CYAN}--- Log түвшний тойм ---${NC}"
echo "$RESULT" | python3 -c "
import sys, json, re
d = json.load(sys.stdin)
vals = [v[1] for r in d.get('data',{}).get('result',[]) for v in r.get('values',[])]
counts = {}
for line in vals:
    m = re.search(r'\b(TRACE|DEBUG|INFO|WARN|ERROR)\b', line)
    lvl = m.group(1) if m else 'UNKNOWN'
    counts[lvl] = counts.get(lvl, 0) + 1
for lvl in ['ERROR','WARN','INFO','DEBUG','TRACE','UNKNOWN']:
    if lvl in counts:
        print(f'  {lvl:8s}: {counts[lvl]}')
" 2>/dev/null || true

echo -e "\n${GREEN}=================================================${NC}"
echo -e "${GREEN}  LOGS шалгалт дууслаа ✓${NC}"
echo -e "${GREEN}  Loki: http://localhost:3100${NC}"
echo -e "${GREEN}  Grafana Explore: http://localhost:3000/explore${NC}"
echo -e "${GREEN}=================================================${NC}"
