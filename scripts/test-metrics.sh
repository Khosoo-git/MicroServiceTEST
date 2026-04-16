#!/usr/bin/env bash
# =============================================================
#  test-metrics.sh  —  Prometheus HTTP metric шалгах скрипт
#  Хэрэглээ: bash scripts/test-metrics.sh
# =============================================================

set -e

GATEWAY="http://localhost:8084"
PROMETHEUS="http://localhost:9090"
NEXT_API="http://localhost:3001"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}  METRICS — Prometheus HTTP ачаалал шалгах${NC}"
echo -e "${CYAN}=================================================${NC}"

# 1. Gateway-рүү HTTP load илгээх
echo -e "\n${YELLOW}[1/3] Gateway-рүү HTTP хүсэлт илгээж байна (30 удаа)...${NC}"
for i in $(seq 1 30); do
  curl -s "$GATEWAY/jobs"      > /dev/null
  curl -s "$GATEWAY/reviews"   > /dev/null
  curl -s "$GATEWAY/companies" > /dev/null
  sleep 0.2
done
echo -e "${GREEN}✓ HTTP load илгээлт дууслаа${NC}"

# 2. Prometheus шууд шалгах
echo -e "\n${YELLOW}[2/3] Prometheus-с шууд metric унших...${NC}"
echo -e "${CYAN}--- Prometheus /api/v1/query (up) ---${NC}"
curl -s "$PROMETHEUS/api/v1/query?query=up" | python3 -m json.tool 2>/dev/null | head -40 || \
  curl -s "$PROMETHEUS/api/v1/query?query=up"

# 3. Next.js API-с metric унших
echo -e "\n${YELLOW}[3/3] Next.js /api/metrics endpoint шалгах...${NC}"
RESULT=$(curl -s "$NEXT_API/api/metrics")
COUNT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',{}).get('result',[])))" 2>/dev/null || echo "0")
echo -e "${GREEN}✓ Нийт $COUNT HTTP зам олдлоо${NC}"

echo -e "\n${CYAN}--- Зам бүрийн req/s ---${NC}"
echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
results = d.get('data', {}).get('result', [])
if not results:
    print('  Мэдээлэл алга — сервисүүд ажиллаж байгаа эсэхийг шалгана уу')
else:
    for r in sorted(results, key=lambda x: float(x['value'][1] or 0), reverse=True):
        uri = r['metric'].get('uri', '—')
        rate = float(r['value'][1])
        print(f'  {rate:.4f} req/s  →  {uri}')
" 2>/dev/null || echo "$RESULT" | head -20

echo -e "\n${GREEN}=================================================${NC}"
echo -e "${GREEN}  METRICS шалгалт дууслаа ✓${NC}"
echo -e "${GREEN}  Grafana: http://localhost:3000${NC}"
echo -e "${GREEN}  Prometheus: http://localhost:9090${NC}"
echo -e "${GREEN}=================================================${NC}"
