# Website Architecture - Incident Management System Platform

## System Overview

This document describes the overall architecture of the Incident Management System Platform, including frontend, backend, and infrastructure components.

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        B[Web Browser]
        M[Mobile Browser]
    end

    subgraph "Frontend Layer"
        NG[Nginx Reverse Proxy]
        UI[Dashboard UI - Next.js]
    end

    subgraph "API Layer"
        API[Service Registry API - Spring Boot]
        AUTH[Authentication Service]
    end

    subgraph "Observability Backend"
        P[Prometheus - Metrics]
        L[Loki - Logs]
        T[Tempo - Traces]
        A[Alertmanager]
    end

    subgraph "Data Storage"
        DB[(PostgreSQL)]
        TSDB[(Time-Series DB)]
        OBJ[(Object Storage)]
    end

    subgraph "Monitored Services"
        S1[Company Service]
        S2[Job Service]
        S3[Review Service]
        S4[Gateway]
    end

    B --> NG
    M --> NG
    NG --> UI
    UI --> API
    API --> AUTH
    API --> DB
    API --> P
    API --> L
    API --> T
    A --> API
    P --> TSDB
    L --> OBJ
    T --> OBJ
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
```

---

## Frontend Architecture

### **Technology Stack**

```
┌─────────────────────────────────────┐
│         Dashboard UI                │
│  Next.js 14 + React 18 + TypeScript │
├─────────────────────────────────────┤
│  Styling: Tailwind CSS              │
│  State: React Hooks                 │
│  Charts: Recharts                   │
│  Icons: Lucide React                │
└─────────────────────────────────────┘
```

### **Frontend Directory Structure**

```
observability-dashboard-ui/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page (Dashboard)
│   │   ├── services/
│   │   │   └── page.tsx            # Services page
│   │   ├── incidents/
│   │   │   └── page.tsx            # Incidents page
│   │   ├── logs/
│   │   │   └── page.tsx            # Logs page
│   │   ├── metrics/
│   │   │   └── page.tsx            # Metrics page
│   │   ├── traces/
│   │   │   └── page.tsx            # Traces page
│   │   ├── activity/
│   │   │   └── page.tsx            # Activity page
│   │   ├── settings/
│   │   │   └── page.tsx            # Settings page
│   │   └── help/
│   │       └── page.tsx            # Help page
│   ├── components/
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── TopBar.tsx              # Top navigation bar
│   │   ├── StatsCard.tsx           # Statistics card
│   │   ├── ServiceList.tsx         # Service list
│   │   ├── IncidentList.tsx        # Incident list
│   │   └── ActivityFeed.tsx        # Activity feed
│   ├── lib/
│   │   ├── api.ts                  # API client
│   │   └── utils.ts                # Utility functions
│   └── hooks/
│       ├── useServices.ts          # Services hook
│       ├── useIncidents.ts         # Incidents hook
│       └── useMetrics.ts           # Metrics hook
├── public/
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

### **Frontend Data Flow**

```mermaid
sequenceDiagram
    participant U as User
    participant C as React Component
    participant H as Custom Hook
    participant A as API Client
    participant S as Backend API

    U->>C: Interact with UI
    C->>H: Request data
    H->>A: Call API endpoint
    A->>S: HTTP Request
    S-->>A: JSON Response
    A-->>H: Data
    H->>H: Update state
    H-->>C: Return data
    C->>C: Re-render
    C-->>U: Display data
```

---

## Backend Architecture

### **Technology Stack**

```
┌─────────────────────────────────────┐
│      Service Registry API           │
│     Spring Boot 4 + Java 17         │
├─────────────────────────────────────┤
│  Persistence: Spring Data JPA       │
│  Database: PostgreSQL 15            │
│  Security: Spring Security + JWT    │
│  API Docs: OpenAPI/Swagger          │
└─────────────────────────────────────┘
```

### **Backend Directory Structure**

```
services/service-registry-api/
├── src/main/java/
│   └── com/registry/serviceregistryapi/
│       ├── ServiceRegistryApiApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   ├── CorsConfig.java
│       │   └── OpenApiConfig.java
│       ├── controller/
│       │   ├── ServiceController.java
│       │   ├── IncidentController.java
│       │   ├── AlertController.java
│       │   ├── ActivityController.java
│       │   └── ProxyController.java
│       ├── service/
│       │   ├── RegisteredServiceService.java
│       │   ├── IncidentService.java
│       │   ├── AlertService.java
│       │   └── ActivityService.java
│       ├── repository/
│       │   ├── RegisteredServiceRepository.java
│       │   ├── IncidentRepository.java
│       │   ├── AlertRepository.java
│       │   └── ActivityRepository.java
│       ├── model/
│       │   ├── RegisteredService.java
│       │   ├── Incident.java
│       │   ├── Alert.java
│       │   └── ActivityLog.java
│       └── dto/
│           ├── request/
│           │   └── RegisterServiceRequest.java
│           └── response/
│               └── ServiceResponse.java
├── src/main/resources/
│   ├── application.properties
│   └── application-docker.properties
├── pom.xml
└── Dockerfile
```

### **Backend API Endpoints**

```
┌────────────────────────────────────────────────────────┐
│                    API Endpoints                        │
├────────────────────────────────────────────────────────┤
│  Services                                              │
│  ├── GET    /api/services           # List services   │
│  ├── POST   /api/services           # Register        │
│  ├── GET    /api/services/:id       # Get service     │
│  ├── PUT    /api/services/:id       # Update          │
│  └── DELETE /api/services/:id       # Delete          │
├────────────────────────────────────────────────────────┤
│  Incidents                                             │
│  ├── GET    /api/incidents          # List incidents  │
│  ├── POST   /api/incidents          # Create          │
│  ├── PUT    /api/incidents/:id      # Update          │
│  └── POST   /api/incidents/:id/report # Generate      │
├────────────────────────────────────────────────────────┤
│  Alerts                                                │
│  ├── GET    /api/alerts            # List alerts      │
│  ├── POST   /api/alerts/webhook    # Webhook          │
│  ├── GET    /api/alerts/rules      # List rules       │
│  └── POST   /api/alerts/rules      # Create rule      │
├────────────────────────────────────────────────────────┤
│  Proxy                                                 │
│  ├── GET    /api/proxy/loki        # Loki proxy       │
│  └── GET    /api/proxy/tempo       # Tempo proxy      │
├────────────────────────────────────────────────────────┤
│  Activity                                              │
│  ├── GET    /api/activities        # List activities  │
│  └── POST   /api/activities        # Log activity     │
└────────────────────────────────────────────────────────┘
```

---

## Observability Backend

### **Prometheus (Metrics)**

```yaml
# Architecture
┌──────────────┐
│  Scrapers    │
│  (15s interval)│
└──────┬───────┘
│
▼
┌──────────────┐
│  Prometheus  │
│   Server     │
└──────┬───────┘
│
▼
┌──────────────┐
│   Time-Series│
│   Database   │
└──────────────┘
```

**Configuration:**

- Scrape interval: 15 seconds
- Retention: 30 days
- Storage: Local filesystem
- Query: PromQL

---

### **Loki (Logs)**

```yaml
# Architecture
┌──────────────┐
│   Alloy      │
│  (Collector) │
└──────┬───────┘
│
▼
┌──────────────┐
│     Loki     │
│   Aggregator │
└──────┬───────┘
│
▼
┌──────────────┐
│  Object Store│
│  (Logs)      │
└──────────────┘
```

**Configuration:**

- Collection: File tailing
- Retention: 7 days
- Storage: Compressed chunks
- Query: LogQL

---

### **Tempo (Traces)**

```yaml
# Architecture
┌──────────────┐
│ OpenTelemetry│
│   Exporters  │
└──────┬───────┘
│
▼
┌──────────────┐
│     Tempo    │
│   Receiver   │
└──────┬───────┘
│
▼
┌──────────────┐
│  Object Store│
│  (Traces)    │
└──────────────┘
```

**Configuration:**

- Protocol: OTLP (HTTP/gRPC)
- Retention: 7 days
- Storage: Local backend
- Query: TraceQL

---

## Infrastructure Architecture

### **Docker Compose Deployment**

```yaml
# Single Server Deployment
┌─────────────────────────────────────────┐
│           Docker Host                   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Docker Network             │   │
│  │                                 │   │
│  │  ┌──────────┐  ┌──────────    │   │
│  │  │ Frontend │  │  Nginx   │    │   │
│  │  │   :3000  │  │  :80     │    │   │
│  │  └──────────┘  └──────────    │   │
│  │                                 │   │
│  │  ┌──────────┐  ┌──────────┐    │   │
│  │  │   API    │  │   Auth   │    │   │
│  │  │  :8085   │  │          │    │   │
│  │  └──────────  └──────────┘    │   │
│  │                                 │   │
│  │  ┌──────────┐  ┌──────────┐    │   │
│  │  │Prometheus│  │  Grafana │    │   │
│  │  │  :9090   │  │  :3000   │    │   │
│  │  └──────────┘  └──────────    │   │
│  │                                 │   │
│  │  ┌──────────┐  ┌──────────┐    │   │
│  │  │   Loki   │  │  Tempo   │    │   │
│  │  │  :3100   │  │  :3200   │    │   │
│  │  └──────────┘  └──────────    │   │
│  │                                 │   │
│  │  ┌──────────┐  ┌──────────┐    │   │
│  │  │PostgreSQL│  │ Alertmgr │    │   │
│  │  │  :5432   │  │  :9093   │    │   │
│  │  └──────────  └──────────┘    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Security Architecture

### **Authentication Flow**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant J as JWT

    U->>F: Enter credentials
    F->>B: POST /api/auth/login
    B->>DB: Query user
    DB-->>B: User data
    B->>B: Verify password
    B->>J: Generate token
    J-->>B: JWT token
    B->>DB: Log activity
    B-->>F: Return token
    F->>F: Store token
    F-->>U: Redirect to dashboard

    Note over F,B: All subsequent requests<br/>include JWT in<br/>Authorization header
```

### **Authorization Model**

```
┌─────────────────────────────────────────┐
│           Role-Based Access Control     │
├─────────────────────────────────────────┤
│  ADMIN     │ Full access                │
│  OPERATOR  │ Incident management        │
│  DEVELOPER │ Service debugging          │
│  MANAGER   │ Reports & analytics        │
│  VIEWER    │ Read-only access           │
└─────────────────────────────────────────┘
```

---

## Data Flow Architecture

### **Metrics Data Flow**

```
Service → Actuator → Prometheus → TSDB → Grafana
                              ↓
                          Alertmanager
                              ↓
                         Notification
```

### **Logs Data Flow**

```
Service → Log File → Alloy → Loki → Storage → Grafana
```

### **Traces Data Flow**

```
Service → OpenTelemetry → Tempo → Storage → Grafana
```

---

## Scalability Architecture

### **Horizontal Scaling**

```mermaid
graph LR
    subgraph "Load Balancer"
        LB[Nginx]
    end

    subgraph "Frontend Tier"
        F1[Frontend 1]
        F2[Frontend 2]
        F3[Frontend 3]
    end

    subgraph "API Tier"
        A1[API 1]
        A2[API 2]
        A3[API 3]
    end

    subgraph "Database"
        DB[(PostgreSQL Primary)]
        DB2[(PostgreSQL Replica)]
    end

    LB --> F1
    LB --> F2
    LB --> F3
    F1 --> A1
    F2 --> A2
    F3 --> A3
    A1 --> DB
    A2 --> DB
    A3 --> DB
    DB -.Replication.-> DB2
```

---

## Deployment Architecture

### **Production Deployment**

```
┌──────────────────────────────────────────────────┐
│              Cloud Provider                       │
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │         Kubernetes Cluster             │     │
│  │                                        │     │
│  │  ┌──────────────┐  ┌──────────────┐   │     │
│  │  │   Frontend   │  │     API      │   │     │
│  │  │  Deployment  │  │  Deployment  │   │     │
│  │  │  (3 pods)    │  │   (3 pods)   │   │     │
│  │  └──────────────┘  └──────────────┘   │     │
│  │                                        │     │
│  │  ┌──────────────┐  ┌──────────────┐   │     │
│  │  │  Prometheus  │  │    Loki      │   │     │
│  │  │  StatefulSet │  │ StatefulSet  │   │     │
│  │  └──────────────┘  └──────────────┘   │     │
│  │                                        │     │
│  │  ┌──────────────┐  ┌──────────────┐   │     │
│  │  │    Tempo     │  │  PostgreSQL  │   │     │
│  │  │ StatefulSet  │  │ StatefulSet  │   │     │
│  │  └──────────────┘  └──────────────┘   │     │
│  └────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

---

## Monitoring Architecture

### **Self-Monitoring**

```
┌─────────────────────────────────────────┐
│         Platform Monitoring             │
├─────────────────────────────────────────┤
│  Infrastructure:                        │
│  - CPU, Memory, Disk usage              │
│  - Network I/O                          │
│  - Container health                     │
├─────────────────────────────────────────┤
│  Application:                           │
│  - Request rate                         │
│  - Error rate                           │
│  - Response time                        │
│  - Database connections                 │
├─────────────────────────────────────────┤
│  Business:                              │
│  - Active users                         │
│  - Incidents created                    │
│  - MTTD / MTTR                          │
└─────────────────────────────────────────┘
```

---

## Document Information

| Field        | Value                |
| ------------ | -------------------- |
| **Document** | Website Architecture |
| **Version**  | 1.0                  |
| **Date**     | May 2026             |
| **Author**   | [Your Name]          |

---

**End of Website Architecture Document**
