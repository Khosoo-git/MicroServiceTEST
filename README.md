# MicroService Observatory Platform

> **Production-ready observability platform** with dynamic service registration, comprehensive monitoring, and incident management.

[![Status](https://img.shields.io/badge/status-production--ready-green)]()
[![Version](https://img.shields.io/badge/version-2.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-yellow)]()

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Java 17+ (for running services locally)
- 4GB+ RAM available
- Ports: 3000-3002, 5050, 5432, 8080-8085, 8761, 9090, 3100, 3200

### Start All Services

```bash
docker compose up -d
```

⏱️ **Wait 60 seconds** for all services to initialize before accessing.

### Access Points

| Service | URL | Credentials | Description |
|---------|-----|-------------|-------------|
| **Dashboard UI** | http://localhost:3002 | — | Service registration & management |
| **Nginx Proxy** | http://localhost:80 | — | Unified entry point (all services) |
| **Service Registry API** | http://localhost:8085 | — | Backend API |
| **Grafana** | http://localhost:3000 | `admin` / `admin` | Unified observability dashboards |
| **Prometheus** | http://localhost:9090 | — | Metrics collection & querying |
| **Alertmanager** | http://localhost:9093 | — | Alert routing & notifications |
| **Loki** | http://localhost:3100 | — | Log aggregation |
| **Tempo** | http://localhost:3200 | — | Distributed tracing |
| **pgAdmin** | http://localhost:5050 | `pgadmin4@pgadmin.org` / `admin` | Database management |
| **Eureka** | http://localhost:8761 | — | Service discovery |
| **Config Server** | http://localhost:8080 | — | Centralized configuration |

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Architecture Overview](#-architecture-overview)
- [Services](#-services)
- [Key Features](#-features)
- [Service Registration](#-service-registration)
- [Observability Data Flow](#-observability-data-flow)
- [Common Commands](#-common-commands)
- [Database](#-database)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Documentation](#-documentation)

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Access Layer                        │
│         ┌─────────────────────────────────────────┐             │
│         │     Nginx Reverse Proxy (:80/:443)      │             │
│         │     Unified Entry Point for All         │             │
│         └────────────────┬────────────────────────┘             │
└─────────────────────────┼───────────────────────────────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
┌──────────┐      ┌──────────┐      ┌──────────────────────┐
│Dashboard │      │ Grafana  │      │ Prometheus / Loki    │
│  :3002   │      │  :3000   │      │ :9090 / :3100        │
└──────────┘      └──────────┘      └──────────────────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Observability Stack                          │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐   │
│  │  Grafana    │──│  Alloy   │──│   Loki   │  │   Tempo    │   │
│  │  Dashboards │  │Collector │  │  Logs    │  │   Traces   │   │
│  └─────────────┘  └──────────┘  └──────────┘  └────────────┘   │
│         │                │              │             │         │
│         └────────────────┴──────────────┴─────────────┘         │
│                          │                                      │
│         ┌────────────────▼──────────┐                          │
│         │      Prometheus           │                          │
│         │    Metrics Collection     │                          │
│         └────────────┬──────────────┘                          │
│                      │                                         │
│         ┌────────────▼──────────────┐                          │
│         │    Alertmanager (:9093)   │                          │
│         │    Alert Routing          │                          │
│         └───────────────────────────┘                          │
└──────────────────────┼──────────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────────┐
│                  Microservices Layer                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Company  │ │   Job    │ │  Review  │ │ Gateway  │          │
│  │  :8081   │ │  :8082   │ │  :8083   │ │  :8084   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│       │             │             │             │              │
│       └─────────────┴──────────────┴─────────────┘              │
│                          │                                      │
│         ┌────────────────┴──────────────┐                      │
│         │  Eureka (:8761) + Config      │                      │
│         │  Service Discovery & Config   │                      │
│         └────────────────┬──────────────┘                      │
│                          │                                      │
│         ┌────────────────▼──────────────┐                      │
│         │  Service Registry API (:8085) │                      │
│         │  Registration & Management    │                      │
│         └───────────────────────────────┘                      │
└──────────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────────┐
│                   Data Layer                                    │
│         ┌─────────────┴──────┐                                  │
│         │   PostgreSQL       │  pgAdmin (:5050)                 │
│         │      :5432         │  Database Management             │
│         │  Service Registry  │                                  │
│         └────────────────────┘                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Services

### Demo Microservices (Pre-configured)

| Service | Port | Description | Health Endpoint |
|---------|------|-------------|-----------------|
| Company MS | 8081 | Company management microservice | `/actuator/health` |
| Job MS | 8082 | Job management microservice | `/actuator/health` |
| Review MS | 8083 | Review management microservice | `/actuator/health` |
| Gateway | 8084 | API Gateway with routing | `/actuator/health` |
| Config Server | 8080 | Centralized configuration server | `/actuator/health` |
| Eureka | 8761 | Service discovery server | — |

### Observability Stack

| Service | Port | Protocol | Description |
|---------|------|----------|-------------|
| **Grafana** | 3000 | HTTP | Unified dashboards for metrics, logs, traces |
| **Prometheus** | 9090 | HTTP | Time-series metrics collection (scrapes every 15s) |
| **Alertmanager** | 9093 | HTTP | Alert routing and notification (Slack, Email, PagerDuty) |
| **Loki** | 3100 | HTTP | Log aggregation (batched push from Alloy) |
| **Tempo** | 3200 | OTLP | Distributed trace storage |
| **Alloy** | 1234 | — | Unified telemetry collector (tails logs, forwards to Loki) |

### Infrastructure

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Primary database for service registry |
| pgAdmin | 5050 | Web-based PostgreSQL management UI |

### Dashboard & API

| Service | Port | Description |
|---------|------|-------------|
| Dashboard UI | 3002 | React-based web dashboard for service management |
| Service Registry API | 8085 | Spring Boot API for service registration & config |

---

## ✨ Features

### Service Management
- ✅ **Dynamic Service Registration** — Register any service via web UI or API
- ✅ **Multi-Type Support** — Web apps, microservices, APIs, databases, workers
- ✅ **Health Monitoring** — Real-time health status with color-coded indicators
- ✅ **Uptime Tracking** — Automatic uptime calculation per service
- ✅ **Selective Monitoring** — Enable/disable metrics, logs, or traces per service

### Observability
- ✅ **Prometheus Integration** — Auto-scrapes `/actuator/prometheus` endpoints
- ✅ **Loki Log Collection** — Collects logs from `/logs/*.log` via Alloy
- ✅ **Tempo Tracing** — Distributed tracing via OpenTelemetry (OTLP)
- ✅ **Grafana Dashboards** — Unified visualization for all three pillars
- ✅ **Dynamic Discovery** — New services automatically added to collectors

### Database & Persistence
- ✅ **PostgreSQL** — Persistent storage for service registry
- ✅ **Multiple Schemas** — Separate schemas per microservice
- ✅ **pgAdmin** — Web-based database management

### Developer Experience
- ✅ **RESTful API** — Full CRUD API for service management
- ✅ **Web Dashboard** — Intuitive UI for non-technical users
- ✅ **Activity Logging** — Audit trail for all operations
- ✅ **Auto-Configuration** — Prometheus & Alloy configs updated automatically

---

## 📝 Service Registration

### Via Web Dashboard

1. Open http://localhost:3002
2. Click **"Register Service"**
3. Fill in the form:
   - **Service Name**: Unique identifier (e.g., `payment-service`)
   - **Service Type**: `web`, `microservice`, `api`, `database`, etc.
   - **Host**: Container name (Docker) or `localhost` (local)
   - **Port**: Service port
   - **Owner**: Team or individual responsible
   - **Monitoring**: Enable metrics, logs, and/or traces
4. Click **"Register"**

### Via API

```bash
curl -X POST http://localhost:8085/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "my-service",
    "serviceType": "microservice",
    "host": "localhost",
    "port": 8080,
    "metricsEnabled": true,
    "logsEnabled": true,
    "tracingEnabled": true,
    "owner": "My Team"
  }'
```

### ⏱️ Data Collection Timing

| Data Type | Collection Start | Available in Grafana |
|-----------|------------------|----------------------|
| **Metrics** | After next scrape cycle (~15s) | ~15-30 seconds |
| **Logs** | After config reload | ~5-10 seconds |
| **Traces** | On next request | ~1-2 seconds after request |

> **Note:** Data doesn't appear immediately after registration. Wait for the collection cycles to complete.

---

## 🔄 Observability Data Flow

### Metrics Flow
```
Service → /actuator/prometheus → Prometheus (scrape every 15s) → TSDB → Grafana
```

### Logs Flow
```
Service → /logs/*.log → Alloy (tail files) → Loki (batched push) → Grafana
```

### Traces Flow
```
Service → OTLP spans → Tempo → Grafana
```

---

## 🛠 Common Commands

### Docker Compose

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f service-registry-api
docker compose logs -f dashboard-ui
docker compose logs -f company

# Check service status
docker compose ps

# Rebuild and restart
docker compose up -d --build

# Restart a specific service
docker compose restart prometheus

# Remove all containers and volumes
docker compose down -v
```

### Nginx Reverse Proxy

Nginx provides a unified entry point for all services (optional but recommended):

```bash
# Access all services through Nginx
http://localhost/          → Dashboard UI
http://localhost/grafana/  → Grafana
http://localhost/prometheus/ → Prometheus
http://localhost/loki/     → Loki
http://localhost/tempo/    → Tempo
http://localhost/api/      → Service Registry API

# Test Nginx configuration
docker compose exec nginx nginx -t

# View Nginx logs
docker compose logs -f nginx
```

**Why use Nginx locally?**
- ✅ Test with production-like routing
- ✅ Single domain for all services
- ✅ SSL/TLS termination (if configured)
- ✅ Rate limiting and authentication
- ✅ Load balancing preparation

### Alertmanager

Alertmanager handles alert routing and notifications:

```bash
# Access Alertmanager UI
http://localhost:9093

# View Alertmanager logs
docker compose logs -f alertmanager

# Test Alertmanager configuration
docker compose exec alertmanager amtool check-config /etc/alertmanager/alertmanager.yml
```

**Why use Alertmanager locally?**
- ✅ Test alert rules during development
- ✅ Configure notification channels (Slack, Email, PagerDuty)
- ✅ Learn alert grouping and inhibition
- ✅ Get notified of issues during testing
- ✅ Match production alerting setup

### Service Registration

```bash
# Register demo services
bash register-demo-services.sh

# Test API endpoint
curl http://localhost:8085/api/services

# Register a single service
curl -X POST http://localhost:8085/api/services \
  -H "Content-Type: application/json" \
  -d '{"serviceName":"test","serviceType":"web","host":"localhost","port":8080,"owner":"Test"}'
```

### Testing

```bash
# Test demo microservices
curl http://localhost:8081/api/companies
curl http://localhost:8082/api/jobs
curl http://localhost:8083/api/reviews

# Test gateway routing
curl http://localhost:8084/services/companyms/api/companies

# Test Service Registry API
curl http://localhost:8085/api/services

# Test observability endpoints
curl http://localhost:9090/api/v1/targets  # Prometheus targets
curl http://localhost:3100/loki/api/v1/labels  # Loki labels
```

---

## 🗄 Database

### Connection Details

| Parameter | Value |
|-----------|-------|
| **Host** | `localhost:5432` (or `postgres` from Docker) |
| **Username** | `postgres` |
| **Password** | `1234` |
| **Databases** | `observability`, `company`, `job`, `review`, `gateway` |

### Using pgAdmin

1. Open http://localhost:5050
2. Login: `pgadmin4@pgadmin.org` / `admin`
3. Right-click **Servers** → **Register** → **Server**
4. Connection settings:
   - **Host**: `postgres` (from Docker) or `localhost:5432`
   - **Port**: `5432`
   - **Username**: `postgres`
   - **Password**: `1234`

---

## 🧪 Testing

### Health Check Script

```bash
# Test all service health endpoints
bash test-health-monitoring.sh
```

### API Testing

```bash
# Test API endpoints
bash test-api.sh
```

### Manual Testing

```bash
# Verify Prometheus is scraping services
curl -s http://localhost:9090/api/v1/targets | python3 -m json.tool

# Verify Loki is receiving logs
curl -s http://localhost:3100/loki/api/v1/labels | python3 -m json.tool

# Verify Service Registry API
curl -s http://localhost:8085/api/services | python3 -m json.tool
```

---

## 🔍 Troubleshooting

### Services Not Starting

```bash
# Check Docker logs
docker compose logs -f

# Verify ports are not in use
lsof -i :3000
lsof -i :3002
lsof -i :5432
lsof -i :8085
```

### Database Connection Errors

```bash
# Restart PostgreSQL
docker compose restart postgres

# Check database logs
docker compose logs -f postgres
```

### API Not Responding

```bash
# Check API status
docker compose ps service-registry-api

# Restart API service
docker compose restart service-registry-api

# View API logs
docker compose logs -f service-registry-api
```

### Metrics Not Appearing

1. **Check service is exposing metrics endpoint:**
   ```bash
   curl http://<service-host>:<port>/actuator/prometheus
   ```

2. **Verify Prometheus targets:**
   - Open http://localhost:9090/targets
   - Check if service shows as "UP"

3. **Wait for scrape cycle:**
   - Metrics appear after ~15-30 seconds

### Logs Not Appearing

1. **Verify log files exist:**
   ```bash
   ls -la logs/
   ```

2. **Check Alloy status:**
   ```bash
   docker compose logs -f alloy
   ```

3. **Wait for log collection:**
   - Logs appear after ~5-10 seconds

### Dashboard Not Loading

```bash
# Restart dashboard
docker compose restart dashboard-ui

# Check dashboard logs
docker compose logs -f dashboard-ui

# Verify API is accessible from dashboard
docker compose exec dashboard-ui curl http://service-registry-api:8085/api/services
```

### Nginx Issues

```bash
# Test Nginx configuration
docker compose exec nginx nginx -t

# View Nginx logs
docker compose logs -f nginx

# Restart Nginx
docker compose restart nginx

# Check if ports 80/443 are in use
lsof -i :80
lsof -i :443
```

### Alertmanager Issues

```bash
# Check Alertmanager status
docker compose ps alertmanager

# View Alertmanager logs
docker compose logs -f alertmanager

# Test alert configuration
docker compose exec alertmanager amtool check-config /etc/alertmanager/alertmanager.yml

# Restart Alertmanager
docker compose restart alertmanager
```

### Clean Restart

```bash
# Stop and remove everything
docker compose down -v

# Remove log files
rm -rf logs/*.log

# Start fresh
docker compose up -d
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file — quick start and reference |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Detailed architecture diagrams |
| [QUICK_START.md](QUICK_START.md) | Service registration guide |
| [REQUIREMENTS.md](REQUIREMENTS.md) | Requirements specification |
| [PRODUCTION_GUIDE.md](PRODUCTION_GUIDE.md) | Production deployment guide |
| `docs/` | UML diagrams (sequence, activity, class, use case) |

---

## 🎯 Next Steps

1. **Register Your First Service**
   - Follow the [Service Registration](#-service-registration) guide
   - Or run `bash register-demo-services.sh` for demo services

2. **Explore Grafana Dashboards**
   - Open http://localhost:3000
   - Browse pre-built dashboards
   - Create custom panels

3. **Set Up Alerts**
   - Configure alert rules in Prometheus
   - Set up notification channels

4. **Deploy to Production**
   - Follow the [Production Guide](PRODUCTION_GUIDE.md)

---

## 🤝 Support

- **Issues**: Open an issue on GitHub
- **Documentation**: See [docs/](docs/) folder
- **API Reference**: http://localhost:8085/api/services

---

**Built with** ❤️ **for observability**

*Version 2.0 — May 2026*
