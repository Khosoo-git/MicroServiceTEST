# MicroService Observatory Dashboard - Setup Guide

## 🚀 How to Run the Dashboard

### Option 1: With Docker (Recommended)

**Port: http://localhost:3001**

```bash
# Start the complete platform
cd /Users/tab/Documents/MicroServiceTEST
docker compose -f docker-compose.observability.yml up -d --build

# Dashboard will be available at:
http://localhost:3001
```

### Option 2: Local Development

**Port: http://localhost:3000**

```bash
# Install dependencies
cd /Users/tab/Documents/MicroServiceTEST/observability-dashboard-ui
npm install

# Run development server
npm run dev

# Dashboard will be available at:
http://localhost:3000
```

### Option 3: Local Production Build

**Port: http://localhost:3000**

```bash
cd /Users/tab/Documents/MicroServiceTEST/observability-dashboard-ui

# Build
npm run build

# Start production server
npm start
```

---

## 🔧 Port Configuration

### Docker (docker-compose.observability.yml)

```yaml
observability-dashboard-ui:
  ports:
    - "3001:3000"  # Host:Container
```

- **Host port:** 3001 (what you access in browser)
- **Container port:** 3000 (Next.js default)

### Local Development (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8085
```

- Dashboard connects to Service Registry API at port 8085

---

## ✅ Correct URLs

| Service | URL | Port |
|---------|-----|------|
| **Dashboard UI** (Docker) | http://localhost:3001 | 3001 |
| **Dashboard UI** (Local) | http://localhost:3000 | 3000 |
| **Service Registry API** | http://localhost:8085 | 8085 |
| **Your Web Service** | http://localhost:8086 | 8086 |

---

## 🔍 Troubleshooting

### Dashboard not loading at port 3001

1. Check if Docker container is running:
```bash
docker compose -f docker-compose.observability.yml ps
```

2. View logs:
```bash
docker compose -f docker-compose.observability.yml logs observability-dashboard-ui
```

3. Restart the service:
```bash
docker compose -f docker-compose.observability.yml restart observability-dashboard-ui
```

### Dashboard not loading at port 3000 (local)

1. Make sure dev server is running:
```bash
cd observability-dashboard-ui
npm run dev
```

2. Check for port conflicts:
```bash
lsof -i :3000
```

3. Use a different port:
```bash
PORT=3002 npm run dev
# Then access http://localhost:3002
```

---

## 📝 Summary

- **Docker:** Use http://localhost:3001
- **Local dev:** Use http://localhost:3000
- **Port 8086:** This is for YOUR registered services, not the dashboard!
