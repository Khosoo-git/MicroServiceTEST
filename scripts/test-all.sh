#!/bin/bash

# =====================================================
# Observability Stack - BÜH TURSHILTYG NEGDESEN
# =====================================================
# Ashiglah: bash scripts/test-all.sh
# =====================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   OBSERVABILITY STACK — BÜH TURSHILTYG AJILLUUH      ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. Metrics test
echo -e "${YELLOW}[1/4] METRICS — Prometheus metrics shalгах${NC}"
echo "──────────────────────────────────────────────────────────"
bash scripts/test-metrics.sh
echo ""

# 2. Logs test
echo -e "${YELLOW}[2/4] LOGS — Loki logs shalгах${NC}"
echo "──────────────────────────────────────────────────────────"
bash scripts/test-logs.sh
echo ""

# 3. Traces test
echo -e "${YELLOW}[3/4] TRACES — Tempo traces shalгах${NC}"
echo "──────────────────────────────────────────────────────────"
bash scripts/test-traces.sh
echo ""

# 4. Client Errors test
echo -e "${YELLOW}[4/4] CLIENT ERRORS — Browser errors shalгах${NC}"
echo "──────────────────────────────────────────────────────────"
bash scripts/test-client-error.sh
echo ""

# ============================================
# DÜN HARUULAH
# ============================================
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║              TURSHILTYG DUUSLAA ✓                     ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}Dashboard:${NC} http://localhost:3001"
echo -e "${GREEN}Grafana:${NC}   http://localhost:3000 (admin/admin)"
echo ""
echo -e "${YELLOW}Daraah command-uudiig ashiglaj bolno:${NC}"
echo "  curl http://localhost:8084/jobs       # Metrics & Traces үүсгэх"
echo "  curl http://localhost:8084/companies  # Metrics & Traces үүсгэх"
echo "  bash scripts/test-client-error.sh     # Client errors илгээх"
echo ""
