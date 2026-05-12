# Sequence Diagrams - Incident Management System Platform

## System Overview

This document describes the sequence of interactions for key use cases in the Incident Management System Platform.

---

## 1. Register Service Sequence

```mermaid
sequenceDiagram
    participant U as User (Admin)
    participant UI as Dashboard UI
    participant API as Service Registry API
    participant DB as Database
    participant AL as Activity Logger

    U->>UI: Navigate to Services
    UI->>API: GET /api/services
    API->>DB: Query services
    DB-->>API: Service list
    API-->>UI: Services JSON
    UI-->>U: Display services

    U->>UI: Click "Register Service"
    UI->>U: Show registration form

    U->>UI: Fill form & submit
    UI->>API: POST /api/services {data}
    API->>API: Validate input
    API->>DB: INSERT service
    DB-->>API: Service ID
    API->>AL: Log activity
    AL->>DB: INSERT activity_log
    AL-->>API: Success
    API-->>UI: Service registered
    UI-->>U: Success message

    Note over API,DB: Transaction ensures<br/>service and activity<br/>are both saved
```

---

## 2. Collect Metrics Sequence

```mermaid
sequenceDiagram
    participant S as Microservice
    participant P as Prometheus
    participant G as Grafana
    participant U as User

    Note over S: Service starts<br/>exposes /actuator/prometheus

    loop Every 15 seconds
        P->>S: GET /actuator/prometheus
        S-->>P: Metrics data
        P->>P: Store in TSDB
    end

    Note over P: ⏱️ Metrics appear in Grafana<br/>after first successful scrape<br/>(~15-30s after registration)

    U->>G: Open dashboard
    G->>P: Query metrics (PromQL)
    P-->>G: Metrics data
    G->>G: Render graphs
    G-->>U: Display dashboard

    Note over P,S: Pull-based model<br/>Prometheus scrapes<br/>services periodically
```

---

## 3. Collect Logs Sequence

```mermaid
sequenceDiagram
    participant S as Microservice
    participant A as Alloy
    participant L as Loki
    participant G as Grafana
    participant U as User

    Note over S: Service writes<br/>to log file

    S->>S: Write to /logs/service.log

    Note over A: ⏱️ Alloy detects new logs<br/>after write completes<br/>(~1-5s delay)

    loop Continuous
        A->>S: Tail log file
        S-->>A: New log lines
        A->>A: Add labels
        A->>L: POST /loki/api/v1/push
        L->>L: Store logs
    end

    Note over L: ⏱️ Logs queryable in Grafana<br/>after batch pushed to Loki<br/>(~5-10s after write)

    U->>G: Open logs view
    U->>G: Enter search query
    G->>L: Query logs (LogQL)
    L-->>G: Log entries
    G->>G: Format logs
    G-->>U: Display logs

    Note over A,S: Alloy tails files<br/>and pushes to Loki<br/>in batches
```

---

## 4. Collect Traces Sequence

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as Gateway
    participant S as Service
    participant O as OpenTelemetry
    participant T as Tempo
    participant G as Grafana
    participant U as User

    Note over C: Request starts<br/>trace context

    C->>GW: HTTP Request
    GW->>O: Start trace
    O->>O: Create span (gateway)
    GW->>S: Forward request
    S->>O: Create span (service)
    S->>S: Process request
    S-->>GW: Response
    O->>O: End span
    O->>O: Batch spans

    Note over O: ⏱️ Traces exported<br/>after request completes<br/>or batch timeout

    O->>T: Export trace (OTLP)
    T->>T: Store trace

    Note over T: ⏱️ Traces available<br/>in Grafana ~1-2s<br/>after export

    U->>G: Open traces view
    U->>G: Search traces
    G->>T: Query traces
    T-->>G: Trace data
    G->>G: Render trace view
    G-->>U: Display trace

    Note over O,T: Traces exported<br/>asynchronously via<br/>OTLP protocol
```

---

## 5. Detect and Create Incident Sequence

```mermaid
sequenceDiagram
    participant P as Prometheus
    participant AM as Alertmanager
    participant API as Service Registry API
    participant DB as Database
    participant N as Notification
    participant O as Operator

    P->>P: Evaluate alert rules
    P->>AM: Alert fired

    AM->>AM: Group alerts
    AM->>API: POST /api/alerts/webhook
    API->>API: Create incident
    API->>DB: INSERT incident
    API->>DB: INSERT activity_log

    par Notify Team
        AM->>N: Send Slack
        AM->>N: Send Email
        AM->>N: Call PagerDuty
    end

    N-->>O: Receive notification
    O->>API: GET /api/incidents
    API->>DB: Query incidents
    DB-->>API: Incident list
    API-->>O: Incidents

    Note over AM,API: Webhook creates<br/>incident automatically<br/>from alert
```

---

## 6. Update Incident Sequence

```mermaid
sequenceDiagram
    participant O as Operator
    participant UI as Dashboard UI
    participant API as Service Registry API
    participant DB as Database
    participant T as Team

    O->>UI: Open incident
    UI->>API: GET /api/incidents/{id}
    API->>DB: Query incident
    DB-->>API: Incident data
    API-->>UI: Incident details
    UI-->>O: Display incident

    O->>UI: Update status & add notes
    UI->>API: PUT /api/incidents/{id}
    API->>DB: UPDATE incident
    API->>DB: INSERT incident_update
    API->>DB: INSERT activity_log

    par Notify Team
        API->>T: Send Slack
        API->>T: Send Email
    end

    API-->>UI: Update success
    UI-->>O: Confirmation

    Note over API,DB: All updates in<br/>single transaction<br/>for consistency
```

---

## 7. Search Logs Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Dashboard UI
    participant API as Service Registry API
    participant L as Loki
    participant S as Storage

    U->>UI: Open logs page
    UI->>U: Show search interface

    U->>UI: Enter query & filters
    UI->>API: GET /api/proxy/loki?query={q}
    API->>L: GET /loki/api/v1/query_range
    L->>S: Query index
    S-->>L: Matching streams
    L->>S: Fetch log data
    S-->>L: Log entries
    L-->>API: Query response
    API-->>UI: Formatted logs
    UI-->>U: Display logs

    Note over L,S: Loki indexes only<br/>labels, stores raw<br/>logs for efficiency
```

---

## 8. View Trace Details Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Dashboard UI
    participant API as Service Registry API
    participant T as Tempo
    participant S as Storage

    U->>UI: Open traces page
    UI->>API: GET /api/proxy/tempo/search
    API->>T: GET /api/search
    T->>S: Query traces
    S-->>T: Trace IDs
    T-->>API: Search results
    API-->>UI: Trace list
    UI-->>U: Display list

    U->>UI: Click trace
    UI->>API: GET /api/proxy/tempo/trace/{id}
    API->>T: GET /api/traces/{id}
    T->>S: Fetch trace data
    S-->>T: Trace with spans
    T-->>API: Trace JSON
    API-->>UI: Trace data
    UI->>UI: Render trace view
    UI-->>U: Display trace timeline

    Note over T,S: Tempo stores traces<br/>in object storage<br/>without indexing
```

---

## 9. Correlate Data Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Dashboard UI
    participant API as Service Registry API
    participant P as Prometheus
    participant L as Loki
    participant T as Tempo

    U->>UI: Open unified dashboard
    UI->>U: Show metrics, logs, traces

    U->>UI: Select time range
    UI->>API: GET metrics for range
    API->>P: Query Prometheus
    P-->>API: Metrics data
    API-->>UI: Metrics

    U->>UI: Click on metric spike
    UI->>API: GET logs for time range
    API->>L: Query Loki
    L-->>API: Logs
    API-->>UI: Logs

    U->>UI: Click on log with traceId
    UI->>API: GET trace by ID
    API->>T: Query Tempo
    T-->>API: Trace
    API-->>UI: Trace
    UI-->>U: Show correlated view

    Note over UI,U: All three pillars<br/>correlated by<br/>time and trace ID
```

---

## 10. Generate Incident Report Sequence

```mermaid
sequenceDiagram
    participant M as Manager
    participant UI as Dashboard UI
    participant API as Service Registry API
    participant DB as Database
    participant R as Report Generator

    M->>UI: Open reports page
    UI->>M: Show report options

    M->>UI: Select incident & format
    UI->>API: POST /api/incidents/{id}/report
    API->>DB: Query incident
    DB-->>API: Incident data
    API->>DB: Query updates
    DB-->>API: Updates
    API->>DB: Query metrics
    DB-->>API: MTTD/MTTR
    API->>R: Generate report
    R->>R: Format PDF/Markdown
    R-->>API: Report file
    API-->>UI: Report URL
    UI-->>M: Download link

    M->>UI: Download report
    UI-->>M: Report file

    Note over API,R: Report includes<br/>timeline, metrics,<br/>and recommendations
```

---

## 11. Configure Alert Rule Sequence

```mermaid
sequenceDiagram
    participant A as Admin
    participant UI as Dashboard UI
    participant API as Service Registry API
    participant DB as Database
    participant P as Prometheus

    A->>UI: Open alerting page
    UI->>A: Show alert list

    A->>UI: Click "Create Alert"
    UI->>A: Show form

    A->>UI: Fill alert configuration
    UI->>API: POST /api/alerts/rules
    API->>API: Validate configuration
    API->>DB: INSERT alert_rule
    DB-->>API: Rule ID
    API->>P: POST /api/v1/rules
    P->>P: Reload rules
    P-->>API: Success
    API-->>UI: Rule created
    UI-->>A: Confirmation

    Note over API,P: Alert rule synced<br/>to Prometheus<br/>for evaluation
```

---

## 12. User Authentication Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Dashboard UI
    participant API as Service Registry API
    participant DB as Database
    participant S as Session Store

    U->>UI: Enter credentials
    UI->>API: POST /api/auth/login
    API->>DB: Query user
    DB-->>API: User data
    API->>API: Verify password
    API->>S: Create session
    S-->>API: Session token
    API->>DB: Log login activity
    API-->>UI: Token
    UI->>UI: Store token
    UI-->>U: Redirect to dashboard

    Note over API,S: JWT token generated<br/>with user roles<br/>for authorization
```

---

## Actor Definitions

| Actor | Description |
|-------|-------------|
| **User (Admin/Operator/Developer/Manager)** | Human user of the system |
| **Dashboard UI** | React/Next.js frontend |
| **Service Registry API** | Spring Boot backend API |
| **Database** | PostgreSQL database |
| **Activity Logger** | Activity logging service |
| **Microservice** | Monitored microservice |
| **Prometheus** | Metrics storage |
| **Alloy** | Log collector |
| **Loki** | Log storage |
| **Tempo** | Trace storage |
| **OpenTelemetry** | Tracing SDK |
| **Alertmanager** | Alert routing |
| **Notification** | Notification service |
| **Report Generator** | Report generation service |
| **Session Store** | Session/token storage |

---

## Document Information

| Field | Value |
|-------|-------|
| **Document** | Sequence Diagrams |
| **Version** | 1.0 |
| **Date** | May 2026 |
| **Author** | [Your Name] |

---

**End of Sequence Diagrams Document**
