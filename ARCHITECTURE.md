# MicroService Observatory Platform - Architecture Diagram

## System Overview

```mermaid
flowchart TB
    subgraph User Layer
        User[("User 👤")]
        Browser[("Browser 🌐")]
    end

    subgraph "Entry Point"
        Nginx["Nginx Reverse Proxy<br/>Ports: 80/443<br/>SSL, Auth, Rate Limiting"]
    end

    subgraph "Dashboard & API Layer"
        Dashboard[("Dashboard UI<br/>Port: 3001<br/>Next.js/React")]
        RegistryAPI[("Service Registry API<br/>Port: 8085<br/>Spring Boot")]
    end

    subgraph "Service Discovery & Config"
        Eureka[("Eureka Server<br/>Port: 8761<br/>Service Discovery")]
        ConfigServer[("Config Server<br/>Port: 8080<br/>Centralized Config")]
    end

    subgraph "Business Microservices"
        CompanyMS[("Company Service<br/>Port: 8081")]
        JobMS[("Job Service<br/>Port: 8082")]
        ReviewMS[("Review Service<br/>Port: 8083")]
        GatewayMS[("Gateway Service<br/>Port: 8084")]
    end

    subgraph "Data Layer"
        PostgreSQL[("PostgreSQL<br/>Port: 5432<br/>Observability DB")]
        PGAdmin[("PGAdmin<br/>Port: 5050")]
    end

    subgraph "Observability Stack"
        Prometheus[("Prometheus<br/>Port: 9090<br/>Metrics Collection")]
        Loki[("Loki<br/>Port: 3100<br/>Log Aggregation")]
        Tempo[("Tempo<br/>Port: 3200/4317/4318<br/>Distributed Tracing")]
        Alloy[("Grafana Alloy<br/>Port: 1234<br/>Log Collector")]
        Grafana[("Grafana<br/>Port: 3000<br/>Visualization")]
        Alertmanager[("Alertmanager<br/>Port: 9093<br/>Alert Routing")]
    end

    subgraph "Log Storage"
        LogFiles[("Log Files<br/>/logs/*.log<br/>Company, Job, Review, Gateway")]
    end

    User --> Browser
    Browser -->|HTTP/HTTPS| Nginx
    Nginx -->|Route /| Dashboard
    Nginx -->|Route /api/| RegistryAPI
    Nginx -->|Route /prometheus/| Prometheus
    Nginx -->|Route /loki/| Loki
    Nginx -->|Route /tempo/| Tempo
    Nginx -->|Route /grafana/| Grafana

    Dashboard -->|REST API| RegistryAPI
    Dashboard -->|LocalStorage Fallback| Browser

    RegistryAPI -->|JDBC| PostgreSQL
    RegistryAPI -->|Register/Update| Eureka
    RegistryAPI -->|Fetch Config| ConfigServer
    RegistryAPI -->|Auto-Update Config| Prometheus
    RegistryAPI -->|Auto-Update Config| Alloy

    CompanyMS -->|Register| Eureka
    JobMS -->|Register| Eureka
    ReviewMS -->|Register| Eureka
    GatewayMS -->|Register| Eureka

    CompanyMS -->|Fetch Config| ConfigServer
    JobMS -->|Fetch Config| ConfigServer
    ReviewMS -->|Fetch Config| ConfigServer
    GatewayMS -->|Fetch Config| ConfigServer

    CompanyMS -->|JDBC| PostgreSQL
    JobMS -->|JDBC| PostgreSQL
    ReviewMS -->|JDBC| PostgreSQL
    GatewayMS -->|JDBC| PostgreSQL

    CompanyMS -->|Write Logs| LogFiles
    JobMS -->|Write Logs| LogFiles
    ReviewMS -->|Write Logs| LogFiles
    GatewayMS -->|Write Logs| LogFiles

    CompanyMS -->|OTLP Traces| Tempo
    JobMS -->|OTLP Traces| Tempo
    ReviewMS -->|OTLP Traces| Tempo
    GatewayMS -->|OTLP Traces| Tempo

    Alloy -->|Read Logs| LogFiles
    Alloy -->|Forward| Loki

    Prometheus -->|Scrape /actuator/prometheus| CompanyMS
    Prometheus -->|Scrape /actuator/prometheus| JobMS
    Prometheus -->|Scrape /actuator/prometheus| ReviewMS
    Prometheus -->|Scrape /actuator/prometheus| GatewayMS

    Grafana -->|Query Metrics| Prometheus
    Grafana -->|Query Logs| Loki
    Grafana -->|Query Traces| Tempo

    style Nginx fill:#4CAF50,color:#fff
    style Dashboard fill:#2196F3,color:#fff
    style RegistryAPI fill:#FF9800,color:#fff
    style Grafana fill:#F46800,color:#fff
    style PostgreSQL fill:#336791,color:#fff
```

## Service Registration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Dashboard UI
    participant API as Registry API
    participant DB as PostgreSQL
    participant P as Prometheus
    participant A as Alloy
    participant E as Eureka

    U->>UI: Click "Register Service"
    UI->>U: Show Registration Form
    U->>UI: Fill Service Details
    UI->>API: POST /api/services
    API->>DB: Save Service Metadata
    API->>E: Register Service Instance
    API->>P: Update prometheus.yml<br/>Add scrape target
    API->>A: Update config.alloy<br/>Add log file path
    P-->>API: Config Reloaded ✓
    A-->>API: Config Reloaded ✓
    API-->>UI: Service Created ✓
    UI-->>U: Show Success Message
    UI->>UI: Refresh Service List

    Note over P,A: ⏱️ Metrics & Traces<br/>collected on next<br/>scrape cycle (15-30s)

    loop Metrics Collection (every 15s)
        P->>P: Scrape /actuator/prometheus
        P->>P: Store in TSDB
    end

    loop Log Collection (continuous)
        A->>A: Tail log files
        A->>A: Forward to Loki
    end

    loop Trace Collection (on demand)
        A->>A: Receive OTLP spans
        A->>A: Forward to Tempo
    end
```

## Data Flow - Metrics

```mermaid
flowchart LR
    subgraph "Microservices"
        MS1[Company Service]
        MS2[Job Service]
        MS3[Review Service]
        MS4[Gateway Service]
    end

    subgraph "Metrics Collection"
        Actuator1[/actuator/prometheus/]
        Actuator2[/actuator/prometheus/]
        Actuator3[/actuator/prometheus/]
        Actuator4[/actuator/prometheus/]
    end

    subgraph "Storage & Visualization"
        Prometheus[(Prometheus<br/>TSDB)]
        Grafana[(Grafana<br/>Dashboards)]
    end

    MS1 -->|Expose Metrics| Actuator1
    MS2 -->|Expose Metrics| Actuator2
    MS3 -->|Expose Metrics| Actuator3
    MS4 -->|Expose Metrics| Actuator4

    Actuator1 -->|HTTP GET| Prometheus
    Actuator2 -->|HTTP GET| Prometheus
    Actuator3 -->|HTTP GET| Prometheus
    Actuator4 -->|HTTP GET| Prometheus

    Prometheus -->|PromQL| Grafana
```

## Data Flow - Logs

```mermaid
flowchart LR
    subgraph "Microservices"
        MS1[Company Service]
        MS2[Job Service]
        MS3[Review Service]
        MS4[Gateway Service]
        US1[User-Registered Service]
    end

    subgraph "Log Files"
        LF1[/logs/company.log/]
        LF2[/logs/job.log/]
        LF3[/logs/review.log/]
        LF4[/logs/gateway.log/]
        LF5[/logs/user-service.log/]
    end

    subgraph "Log Pipeline"
        Alloy[Grafana Alloy<br/>Log Collector]
        Loki[(Loki<br/>Log Storage)]
        Grafana[(Grafana<br/>LogQL)]
    end

    MS1 -->|Write| LF1
    MS2 -->|Write| LF2
    MS3 -->|Write| LF3
    MS4 -->|Write| LF4
    US1 -->|Write| LF5

    LF1 -->|Read| Alloy
    LF2 -->|Read| Alloy
    LF3 -->|Read| Alloy
    LF4 -->|Read| Alloy
    LF5 -->|Read| Alloy

    Note over Alloy: ⏱️ Alloy tails logs<br/>after service<br/>writes them

    Alloy -->|Push (batch)| Loki
    Loki -->|Query| Grafana
```

## Data Flow - Traces

```mermaid
flowchart LR
    subgraph "Microservices"
        MS1[Company Service<br/>OTel Agent]
        MS2[Job Service<br/>OTel Agent]
        MS3[Review Service<br/>OTel Agent]
        MS4[Gateway Service<br/>OTel Agent]
        US1[User-Registered Service<br/>OTel Agent]
    end

    subgraph "Trace Collection"
        Tempo[(Tempo<br/>Trace Storage)]
        Grafana[(Grafana<br/>Trace Visualization)]
    end

    MS1 -->|OTLP /v1/traces| Tempo
    MS2 -->|OTLP /v1/traces| Tempo
    MS3 -->|OTLP /v1/traces| Tempo
    MS4 -->|OTLP /v1/traces| Tempo
    US1 -->|OTLP /v1/traces| Tempo

    Note over MS1: ⏱️ Traces sent<br/>after requests<br/>complete

    Tempo -->|Search/View| Grafana
```

## Network Architecture

```mermaid
flowchart TB
    subgraph "External Network"
        User[("User 👤")]
    end

    subgraph "Docker Networks"
        subgraph "microservice-network"
            RegistryAPI[Service Registry API]
            CompanyMS[Company Service]
            JobMS[Job Service]
            ReviewMS[Review Service]
            GatewayMS[Gateway Service]
            Eureka[Eureka Server]
            ConfigServer[Config Server]
            Prometheus[Prometheus]
            Alloy[Grafana Alloy]
            Tempo[Tempo]
            Grafana[Grafana]
        end

        subgraph "postgres-network"
            PostgreSQL[PostgreSQL]
            PGAdmin[PGAdmin]
        end

        subgraph "observability-network"
            Loki[Loki]
            Alertmanager[Alertmanager]
        end
    end

    User -->|Port 80/443| Nginx
    Nginx -->|microservice-network| RegistryAPI
    Nginx -->|microservice-network| Grafana
    Nginx -->|microservice-network| Prometheus

    RegistryAPI -->|postgres-network| PostgreSQL
    CompanyMS -->|postgres-network| PostgreSQL
    JobMS -->|postgres-network| PostgreSQL
    ReviewMS -->|postgres-network| PostgreSQL
    GatewayMS -->|postgres-network| PostgreSQL

    style microservice-network fill:#e3f2fd
    style postgres-network fill:#fff3e0
    style observability-network fill:#f3e5f5
```

## Component Details

### Service Registry API

```mermaid
classDiagram
    class RegisteredService {
        +Long id
        +String serviceName
        +String serviceType
        +Integer port
        +String host
        +String description
        +String owner
        +Boolean metricsEnabled
        +Boolean logsEnabled
        +Boolean tracingEnabled
        +LocalDateTime registeredAt
        +LocalDateTime updatedAt
    }

    class RegisteredServiceRepository {
        +List~RegisteredService~ findAll()
        +Optional~RegisteredService~ findById(Long id)
        +RegisteredService save(RegisteredService service)
        +void deleteById(Long id)
        +List~RegisteredService~ findByServiceType(String type)
    }

    class RegisteredServiceController {
        +List~RegisteredService~ getAllServices()
        +RegisteredService getServiceById(Long id)
        +RegisteredService registerService(RegisterServiceRequest req)
        +void deleteService(Long id)
        +void refreshConfigs()
    }

    class ObservabilityConfigService {
        +void updatePrometheusConfig(List~RegisteredService~ services)
        +void updateAlloyConfig(List~RegisteredService~ services)
        +void reloadPrometheusConfig()
        +void reloadAlloyConfig()
    }

    RegisteredServiceController --> RegisteredService
    RegisteredServiceController --> RegisteredServiceRepository
    RegisteredServiceController --> ObservabilityConfigService
    ObservabilityConfigService --> RegisteredService
```

### Dashboard UI Architecture

```mermaid
flowchart TB
    subgraph "Frontend Layers"
        Pages["Pages<br/>page.tsx"]
        Components["Components<br/>Sidebar, TopBar, Cards"]
        API["API Client<br/>api.ts"]
        State["State Management<br/>LocalStorage + React Hooks"]
    end

    subgraph "Pages"
        Home["/ - Dashboard Home"]
        Services["/services - Service Management"]
        Incidents["/incidents - Incident Tracking"]
        Activity["/activity - Activity Feed"]
        Settings["/settings - Configuration"]
    end

    subgraph "Components"
        Sidebar["Sidebar Navigation"]
        TopBar["Top Bar"]
        StatsCard["Statistics Cards"]
        ServiceList["Service List"]
        RegisterModal["Register Service Modal"]
        ActivityFeed["Activity Feed"]
    end

    Pages --> Components
    Pages --> API
    Components --> State
    API --> State

    Home --> StatsCard
    Services --> ServiceList
    Services --> RegisterModal
    Incidents --> ServiceList
    Activity --> ActivityFeed
```

## Deployment Architecture

```mermaid
flowchart TB
    subgraph "Host Machine"
        subgraph "Docker Containers"
            Nginx["Nginx Proxy<br/>Port: 80/443"]
            Dashboard["Dashboard UI<br/>Port: 3001"]
            RegistryAPI["Registry API<br/>Port: 8085"]
            CompanyMS["Company Service<br/>Port: 8081"]
            JobMS["Job Service<br/>Port: 8082"]
            ReviewMS["Review Service<br/>Port: 8083"]
            GatewayMS["Gateway Service<br/>Port: 8084"]
            Eureka["Eureka Server<br/>Port: 8761"]
            ConfigServer["Config Server<br/>Port: 8080"]
            PostgreSQL["PostgreSQL<br/>Port: 5432"]
            Prometheus["Prometheus<br/>Port: 9090"]
            Loki["Loki<br/>Port: 3100"]
            Tempo["Tempo<br/>Port: 3200"]
            Grafana["Grafana<br/>Port: 3000"]
            Alloy["Grafana Alloy<br/>Port: 1234"]
            Alertmanager["Alertmanager<br/>Port: 9093"]
        end

        subgraph "Host Volumes"
            Logs["/logs/*.log"]
            Configs["Observability Configs"]
            SSL["SSL Certificates"]
            Data["Database Volumes"]
        end
    end

    Nginx -.->|Mount| SSL
    Alloy -.->|Mount| Logs
    Prometheus -.->|Mount| Configs
    Loki -.->|Mount| Configs
    Tempo -.->|Mount| Configs
    PostgreSQL -.->|Mount| Data
```

## Technology Stack

```mermaid
mindmap
  root((MicroService<br/>Observability))
    Frontend
      Next.js 14
      React 18
      TypeScript
      TailwindCSS
    Backend
      Spring Boot 3
      Java 17
      Spring Data JPA
      PostgreSQL Driver
    Observability
      Prometheus
      Grafana
      Loki
      Tempo
      Alloy
    Infrastructure
      Docker
      Docker Compose
      Nginx
      SSL/TLS
    Monitoring
      OpenTelemetry
      OTLP Protocol
      Actuator Endpoints
      Log4j2
```
