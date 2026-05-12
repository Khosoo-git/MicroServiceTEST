# Web Architecture - MicroService Observability Platform
## Built on Existing Demo Project

**Version:** 2.0
**Date:** May 2026
**Based on:** Existing Demo Project (Company, Job, Review, Gateway Services)

---

## Executive Summary

This document describes the web architecture for extending the existing MicroService demo project with a comprehensive observability platform. The architecture allows users to **register and monitor any system** (not just the demo services) through a unified web interface.

### Key Enhancement
**From:** Fixed monitoring of 4 demo services
**To:** Dynamic monitoring of **any user-registered system**

---

## 1. Current Architecture (As-Is)

### 1.1 Current State

```mermaid
graph TB
    subgraph "Existing Demo Services"
        S1[Company Service<br/>Port 8081]
        S2[Job Service<br/>Port 8082]
        S3[Review Service<br/>Port 8083]
        S4[Gateway<br/>Port 8084]
    end

    subgraph "Observability Stack"
        P[Prometheus<br/>Auto-scrapes services]
        L[Loki<br/>Collects logs via Alloy]
        T[Tempo<br/>Receives traces]
        G[Grafana<br/>Visualization]
    end

    S1 --> P
    S1 --> L
    S1 --> T
    S2 --> P
    S2 --> L
    S2 --> T
    S3 --> P
    S3 --> L
    S3 --> T
    S4 --> P
    S4 --> L
    S4 --> T

    P --> G
    L --> G
    T --> G

    style S1 fill:#4CAF50
    style S2 fill:#4CAF50
    style S3 fill:#4CAF50
    style S4 fill:#4CAF50
```

### 1.2 Current Limitations

| Limitation | Impact |
|------------|--------|
| **Fixed Services** | Only 4 demo services monitored |
| **Hardcoded Config** | Service endpoints in Prometheus config |
| **No User Interface** | No way to add new services |
| **Manual Configuration** | Requires YAML editing |
| **No Multi-Tenancy** | No user management |

---

## 2. Proposed Architecture (To-Be)

### 2.1 Enhanced Architecture

```mermaid
graph TB
    subgraph "User Layer"
        U[User/Admin]
        UI[Web Dashboard<br/>Port 3001]
    end

    subgraph "API Layer"
        API[Service Registry API<br/>Port 8085]
        AUTH[Authentication]
        REG[Service Registry]
    end

    subgraph "Existing Demo Services"
        S1[Company Service]
        S2[Job Service]
        S3[Review Service]
        S4[Gateway]
    end

    subgraph "User-Registered Services"
        US1[User Service 1<br/>Any Port]
        US2[User Service 2<br/>Any Port]
        US3[User Service N<br/>Any Port]
    end

    subgraph "Observability Stack"
        P[Prometheus<br/>Dynamic Scraping]
        L[Loki<br/>Dynamic Collection]
        T[Tempo<br/>Dynamic Traces]
        A[Alloy<br/>Dynamic Targets]
        G[Grafana<br/>Unified View]
    end

    subgraph "Data Storage"
        DB[(PostgreSQL<br/>Service Registry)]
        TSDB[(Prometheus TSDB)]
        LOGS[(Loki Storage)]
        TRACES[(Tempo Storage)]
    end

    U --> UI
    UI --> API
    API --> AUTH
    API --> REG
    API --> DB

    REG --> A
    A --> P
    A --> L
    A --> T

    S1 --> P
    S1 --> L
    S1 --> T
    S2 --> P
    S2 --> L
    S2 --> T
    S3 --> P
    S3 --> L
    S3 --> T
    S4 --> P
    S4 --> L
    S4 --> T

    US1 --> P
    US1 --> L
    US1 --> T
    US2 --> P
    US2 --> L
    US2 --> T
    US3 --> P
    US3 --> L
    US3 --> T

    P --> TSDB
    L --> LOGS
    T --> TRACES

    P --> G
    L --> G
    T --> G
    DB --> G

    style US1 fill:#2196F3
    style US2 fill:#2196F3
    style US3 fill:#2196F3
    style UI fill:#FF9800
    style API fill:#FF9800
    style A fill:#9C27B0
```

### 2.2 Key Enhancements

| Feature | Before | After |
|---------|--------|-------|
| **Service Registration** | Manual YAML | Web UI + API |
| **Service Count** | Fixed (4) | Unlimited |
| **Configuration** | Static files | Dynamic database |
| **User Access** | None | Role-based access |
| **Target Discovery** | Static | Dynamic (Alloy) |
| **Multi-Tenancy** | No | Yes |

---

## 3. Web Application Architecture

### 3.1 Frontend Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[Next.js 14 Application]
        RC[React Components]
        HK[Custom Hooks]
    end

    subgraph "State Management"
        LS[Local State<br/>React Hooks]
        QS[Server State<br/>React Query]
        LS2[Local Storage<br/>User Preferences]
    end

    subgraph "API Integration"
        AC[API Client<br/>Axios]
        AUTH[Auth Interceptor]
        ERR[Error Handler]
    end

    UI --> RC
    RC --> HK
    HK --> QS
    HK --> LS
    HK --> AC
    AC --> AUTH
    AC --> ERR

    style UI fill:#61DAFB
    style AC fill:#4CAF50
```

### 3.2 Frontend Pages

```
┌─────────────────────────────────────────────────────────┐
│                  Dashboard Pages                         │
├─────────────────────────────────────────────────────────┤
│  / (Home)              │ System Overview Dashboard      │
│  /services             │ Service Registration & List    │
│  /services/:id         │ Service Details                │
│  /services/register    │ Register New Service           │
│  /incidents            │ Incident Management            │
│  /incidents/:id        │ Incident Details               │
│  /metrics              │ Metrics Explorer               │
│  /logs                 │ Log Search & View              │
│  /traces               │ Trace Explorer                 │
│  /activity             │ Activity Feed                  │
│  /alerts               │ Alert Configuration            │
│  /settings             │ System Settings                │
│  /help                 │ Documentation & Help           │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Component Hierarchy

```
App
├── Layout
│   ├── Sidebar
│   │   ├── Navigation
│   │   └── Service Quick Links
│   └── TopBar
│       ├── User Menu
│       ├── Notifications
│       └── Search
├── Pages
│   ├── Dashboard
│   │   ├── StatsCards
│   │   ├── ServiceHealthMap
│   │   ├── ActiveIncidents
│   │   └── RecentAlerts
│   ├── Services
│   │   ├── ServiceList
│   │   ├── ServiceCard
│   │   ├── ServiceFilter
│   │   └── RegisterServiceModal
│   ├── Incidents
│   │   ├── IncidentList
│   │   ├── IncidentTimeline
│   │   └── IncidentForm
│   └── Observability
│       ├── MetricsPanel
│       ├── LogsPanel
│       └── TracesPanel
└── Shared
    ├── Charts
    ├── Tables
    └── Forms
```

---

## 4. Backend API Architecture

### 4.1 API Layer Design

```mermaid
graph TB
    subgraph "API Gateway"
        NG[Nginx Reverse Proxy]
    end

    subgraph "API Services"
        SRA[Service Registry API<br/>Port 8085]
        OA[Observability API<br/>Proxy to P/L/T]
        AA[Auth API<br/>JWT Management]
    end

    subgraph "Business Logic"
        SS[Service Service]
        IS[Incident Service]
        AS[Alert Service]
        AUS[Activity Service]
    end

    subgraph "Data Access"
        SR[Service Repository]
        IR[Incident Repository]
        AR[Alert Repository]
        AUR[Activity Repository]
    end

    subgraph "External Services"
        P[Prometheus API]
        L[Loki API]
        T[Tempo API]
        DB[(PostgreSQL)]
    end

    NG --> SRA
    NG --> OA
    NG --> AA

    SRA --> SS
    SRA --> IS
    SRA --> AS
    SRA --> AUS

    SS --> SR
    IS --> IR
    AS --> AR
    AUS --> AUR

    SR --> DB
    IR --> DB
    AR --> DB
    AUR --> DB

    OA --> P
    OA --> L
    OA --> T

    style SRA fill:#4CAF50
    style OA fill:#2196F3
    style AA fill:#FF9800
```

### 4.2 REST API Endpoints

```yaml
# Service Registration API
/api/services:
  get:
    summary: List all registered services
    parameters:
      - type: String (filter by type)
      - status: String (filter by status)
  post:
    summary: Register new service
    body:
      serviceName: String
      serviceType: Enum
      host: String
      port: Integer
      metricsEnabled: Boolean
      logsEnabled: Boolean
      tracingEnabled: Boolean

/api/services/{id}:
  get:
    summary: Get service details
  put:
    summary: Update service
  delete:
    summary: Delete service

/api/services/{id}/health:
  get:
    summary: Get service health status

/api/services/{id}/metrics:
  get:
    summary: Get service metrics

# Incident Management API
/api/incidents:
  get:
    summary: List incidents
  post:
    summary: Create incident

/api/incidents/{id}:
  put:
    summary: Update incident status

# Observability Proxy API
/api/proxy/prometheus:
  get:
    summary: Proxy to Prometheus

/api/proxy/loki:
  get:
    summary: Proxy to Loki

/api/proxy/tempo:
  get:
    summary: Proxy to Tempo
```

---

## 5. Dynamic Service Discovery

### 5.1 Service Discovery Architecture

```mermaid
graph TB
    subgraph "Service Registry"
        DB[(PostgreSQL<br/>registered_services)]
        API[Registry API]
    end

    subgraph "Target Discovery"
        SD[Service Discovery<br/>Component]
        FC[File Config<br/>Generator]
    end

    subgraph "Collectors"
        P[Prometheus<br/>Scrape Config]
        A[Alloy<br/>Log Targets]
        T[Tempo<br/>Trace Receivers]
    end

    DB --> SD
    SD --> FC
    FC --> P
    FC --> A
    FC --> T

    style DB fill:#4CAF50
    style SD fill:#FF9800
    style FC fill:#2196F3
```

### 5.2 Dynamic Configuration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Dashboard
    participant API as Registry API
    participant DB as Database
    participant SD as Service Discovery
    participant FC as File Config
    participant P as Prometheus
    participant A as Alloy

    U->>UI: Register Service
    UI->>API: POST /api/services
    API->>DB: INSERT service
    DB-->>API: Service ID

    API->>SD: Notify change
    SD->>FC: Regenerate configs
    FC->>P: Update scrape_config
    FC->>A: Update targets

    P->>P: Reload config
    A->>A: Reload targets

    Note over P,A: ⏱️ Data collection starts<br/>after config reload<br/>(metrics: 15-30s,<br/>logs: 5-10s,<br/>traces: on request)

    loop Metrics Collection (every 15s)
        P->>P: Scrape /actuator/prometheus
        P->>P: Store in TSDB
    end

    loop Log Collection (continuous)
        A->>A: Tail log files
        A->>A: Forward to Loki
    end

    Note over P,A: ⏱️ First data appears<br/>in Grafana after<br/>initial collection cycle

    P-->>U: Metrics available
    A-->>U: Logs available

    Note over P,A: Config reload<br/>happens automatically<br/>every 60 seconds
```

### 5.3 Generated Configuration

**Prometheus Scrape Config (Auto-Generated):**

```yaml
# Auto-generated by Service Discovery
# Do not edit manually

scrape_configs:
  # Static demo services
  - job_name: 'company'
    static_configs:
      - targets: ['company:8081']

  - job_name: 'job'
    static_configs:
      - targets: ['job:8082']

  # Dynamic user-registered services
  - job_name: 'user-services'
    file_sd_configs:
      - files:
          - '/etc/prometheus/targets/user-services.json'
        refresh_interval: 60s
```

**Generated Targets File (`user-services.json`):**

```json
[
  {
    "targets": ["user-service-1:8080"],
    "labels": {
      "service": "user-service-1",
      "type": "microservice",
      "owner": "Team A"
    }
  },
  {
    "targets": ["user-service-2:9000"],
    "labels": {
      "service": "user-service-2",
      "type": "api",
      "owner": "Team B"
    }
  }
]
```

---

## 6. User Management & Multi-Tenancy

### 6.1 User Role Architecture

```mermaid
graph TB
    subgraph "User Roles"
        A[Admin]
        O[Operator]
        D[Developer]
        M[Manager]
        V[Viewer]
    end

    subgraph "Permissions"
        S1[Service Management]
        S2[Incident Management]
        S3[Alert Configuration]
        S4[View Dashboards]
        S5[Generate Reports]
        S6[User Management]
    end

    A --> S1
    A --> S2
    A --> S3
    A --> S4
    A --> S5
    A --> S6

    O --> S2
    O --> S3
    O --> S4
    O --> S5

    D --> S1
    D --> S2
    D --> S4

    M --> S4
    M --> S5

    V --> S4

    style A fill:#F44336
    style O fill:#FF9800
    style D fill:#2196F3
    style M fill:#9C27B0
    style V fill:#4CAF50
```

### 6.2 Permission Matrix

| Permission | Admin | Operator | Developer | Manager | Viewer |
|------------|-------|----------|-----------|---------|--------|
| Register Services | ✅ | ❌ | ✅ | ❌ | ❌ |
| Update Services | ✅ | ❌ | ✅ | ❌ | ❌ |
| Delete Services | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Incidents | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update Incidents | ✅ | ✅ | ✅ | ❌ | ❌ |
| Configure Alerts | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Dashboards | ✅ | ✅ | ✅ | ✅ | ✅ |
| Generate Reports | ✅ | ✅ | ❌ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 7. Security Architecture

### 7.1 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant API as Backend API
    participant AUTH as Auth Service
    participant DB as Database

    U->>UI: Enter credentials
    UI->>API: POST /api/auth/login
    API->>AUTH: Validate credentials
    AUTH->>DB: Query user
    DB-->>AUTH: User data
    AUTH->>AUTH: Verify password
    AUTH->>AUTH: Generate JWT
    AUTH-->>API: JWT token
    API-->>UI: Token + User info
    UI->>UI: Store token
    UI-->>U: Redirect to dashboard

    Note over UI,API: All subsequent requests<br/>include JWT in<br/>Authorization header
```

### 7.2 Security Layers

```
┌─────────────────────────────────────────┐
│          Security Architecture          │
├─────────────────────────────────────────┤
│  Layer 1: Network Security              │
│  - HTTPS/TLS                            │
│  - Firewall rules                       │
│  - Network segmentation                 │
├─────────────────────────────────────────┤
│  Layer 2: Application Security          │
│  - JWT Authentication                   │
│  - Role-Based Access Control            │
│  - Input validation                     │
│  - SQL injection prevention             │
├─────────────────────────────────────────┤
│  Layer 3: Data Security                 │
│  - Password hashing (BCrypt)            │
│  - Encrypted connections                │
│  - Audit logging                        │
├─────────────────────────────────────────┤
│  Layer 4: Observability Security        │
│  - Service authentication               │
│  - Metric/Log filtering                 │
│  - Multi-tenancy isolation              │
└─────────────────────────────────────────┘
```

---

## 8. Deployment Architecture

### 8.1 Docker Compose Deployment

```yaml
version: '3.8'

services:
  # Web Application
  dashboard-ui:
    build: ./observability-dashboard-ui
    ports:
      - "3001:3000"
    environment:
      - API_URL=http://service-registry-api:8085

  # API Layer
  service-registry-api:
    build: ./services/service-registry-api
    ports:
      - "8085:8085"
    depends_on:
      - postgres

  # Existing Demo Services
  company:
    image: xoco0508/companyms:latest
    ports:
      - "8081:8081"

  job:
    image: xoco0508/jobms:latest
    ports:
      - "8082:8082"

  review:
    image: xoco0508/reviewms:latest
    ports:
      - "8083:8083"

  gateway:
    image: xoco0508/gateway-ms:latest
    ports:
      - "8084:8084"

  # Observability Stack
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"

  tempo:
    image: grafana/tempo:latest
    ports:
      - "3200:3200"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"

  # Database
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_PASSWORD=observability
```

### 8.2 Production Deployment (Kubernetes)

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Ingress Layer"
            ING[Nginx Ingress]
        end

        subgraph "Application Tier"
            UI[Dashboard UI<br/>Deployment<br/>3 replicas]
            API[Service Registry API<br/>Deployment<br/>3 replicas]
        end

        subgraph "Observability Tier"
            PROM[Prometheus<br/>StatefulSet]
            LOKI[Loki<br/>StatefulSet]
            TEMPO[Tempo<br/>StatefulSet]
            GRAF[Grafana<br/>Deployment]
        end

        subgraph "Data Tier"
            PG[PostgreSQL<br/>StatefulSet<br/>HA]
        end

        subgraph "Service Discovery"
            SD[Service Discovery<br/>Sidecar]
        end

        ING --> UI
        ING --> API
        ING --> GRAF

        UI --> API
        API --> SD
        SD --> PROM
        SD --> LOKI
        SD --> TEMPO

        API --> PG
        PROM --> PG
        GRAF --> PG

        style UI fill:#61DAFB
        style API fill:#4CAF50
        style SD fill:#FF9800
```

---

## 9. User Journey

### 9.1 Registering a New Service

```mermaid
journey
    title User Journey: Register and Monitor New Service
    section Registration
      Navigate to Services: 5: User
      Click Register Service: 5: User
      Fill Service Details: 4: User
      Submit Form: 5: User
      See Success Message: 5: User
    section Configuration
      Service Added to Registry: 5: System
      Config Generated: 5: System
      Prometheus Updated: 5: System
      Alloy Updated: 5: System
    section Monitoring
      Metrics Appear: 5: User
      Logs Appear: 5: User
      Traces Appear: 5: User
      Dashboard Updated: 5: User
```

### 9.2 Responding to an Incident

```mermaid
journey
    title User Journey: Incident Response
    section Detection
      Receive Alert: 5: Operator
      Open Dashboard: 5: Operator
      View Incident: 5: Operator
    section Investigation
      Check Metrics: 5: Operator
      Search Logs: 5: Operator
      View Traces: 5: Operator
      Identify Root Cause: 5: Operator
    section Resolution
      Update Status: 5: Operator
      Add Notes: 5: Operator
      Implement Fix: 5: Operator
      Verify Resolution: 5: Operator
      Close Incident: 5: Operator
```

---

## 10. Scalability Considerations

### 10.1 Horizontal Scaling

| Component | Scaling Strategy | Max Replicas |
|-----------|-----------------|--------------|
| Dashboard UI | Stateless, load balanced | 10+ |
| Service Registry API | Stateless, load balanced | 10+ |
| Prometheus | Sharded by service | 5+ |
| Loki | Distributed indexing | 10+ |
| Tempo | Distributed storage | 10+ |
| PostgreSQL | Read replicas | 5+ |

### 10.2 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard Load Time | < 3 seconds | Page load |
| API Response Time | < 500ms | 95th percentile |
| Service Registration | < 5 seconds | End-to-end |
| Config Propagation | < 60 seconds | DB to collector |
| Metrics Freshness | < 30 seconds | Scrape to display |
| Log Availability | < 10 seconds | Write to queryable |

---

## 11. Integration Points

### 11.1 External Integrations

```
┌─────────────────────────────────────────┐
│         External Integration Points     │
├─────────────────────────────────────────┤
│  Notification Channels:                 │
│  ├── Slack Webhooks                     │
│  ├── Email (SMTP)                       │
│  ├── PagerDuty API                      │
│  └── Microsoft Teams                    │
├─────────────────────────────────────────┤
│  Authentication Providers:              │
│  ├── LDAP/Active Directory              │
│  ├── OAuth2 (Google, GitHub)            │
│  └── SAML 2.0                           │
├─────────────────────────────────────────┤
│  Service Discovery:                     │
│  ├── Kubernetes API                     │
│  ├── Consul                             │
│  ├── etcd                               │
│  └── AWS Service Discovery              │
├─────────────────────────────────────────┤
│  Data Export:                           │
│  ├── Prometheus Remote Write            │
│  ├── S3/GCS for logs                    │
│  └── Webhook for alerts                 │
└─────────────────────────────────────────┘
```

---

## 12. Migration from Existing Demo

### 12.1 Migration Steps

```mermaid
graph LR
    A[Current State<br/>4 Demo Services] --> B[Step 1<br/>Deploy Registry API]
    B --> C[Step 2<br/>Deploy Web Dashboard]
    C --> D[Step 3<br/>Migrate Demo Services]
    D --> E[Step 4<br/>Enable Dynamic Discovery]
    E --> F[Target State<br/>Unlimited Services]

    style A fill:#FFEB3B
    style F fill:#4CAF50
```

### 12.2 Backward Compatibility

| Feature | Before | After | Compatible |
|---------|--------|-------|------------|
| Demo Services | Hardcoded | Registered | ✅ Yes |
| Prometheus Config | Static | Dynamic + Static | ✅ Yes |
| Grafana Dashboards | Manual | Auto-generated | ✅ Yes |
| Alert Rules | YAML | UI + YAML | ✅ Yes |

---

## Document Information

| Field | Value |
|-------|-------|
| **Document** | Web Architecture |
| **Version** | 2.0 |
| **Based On** | Existing Demo Project |
| **Date** | May 2026 |
| **Author** | [Your Name] |

---

**End of Web Architecture Document**
