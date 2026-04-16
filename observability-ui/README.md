## Observability UI

This UI is a lightweight control plane that proxies metrics/logs/traces APIs and links out to Grafana for deep analysis.

### Run

```bash
npm install
npm run dev
```

Default UI URL: `http://localhost:3001`

### Required env vars

Use project root `.env` (or set in your shell):

- `PROMETHEUS_URL` (default `http://localhost:9090`)
- `LOKI_URL` (default `http://localhost:3100`)
- `TEMPO_URL` (default `http://localhost:3200`)
- `NEXT_PUBLIC_GRAFANA_URL` (default `http://localhost:3000`)
- `NEXT_PUBLIC_GRAFANA_DASHBOARD_UID` (default `ms-observability-overview`)

### Integration model

- UI uses `/api/metrics`, `/api/logs`, `/api/traces` as backend-for-frontend routes.
- Grafana remains the source of truth for dashboards/explore.
- UI provides quick triage and direct links to Grafana Explore.
