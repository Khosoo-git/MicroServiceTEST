# Use Case Diagram - Incident Management System Platform

## System Overview

This document describes the use cases for the Incident Management System Platform with Incident Management.

---

## Use Case Diagram

```mermaid
usecaseDiagram
    actor "Administrator" as Admin
    actor "Operator" as Operator
    actor "Developer" as Developer
    actor "Manager" as Manager

    package "Service Management" {
        usecase "Register Service" as UC001
        usecase "View Services" as UC002
        usecase "Update Service" as UC003
        usecase "Delete Service" as UC004
    }

    package "Monitoring" {
        usecase "View Metrics Dashboard" as UC010
        usecase "Search Logs" as UC011
        usecase "View Traces" as UC012
        usecase "Correlate Data" as UC013
    }

    package "Incident Management" {
        usecase "Detect Incident" as UC020
        usecase "Create Incident" as UC021
        usecase "Update Incident" as UC022
        usecase "Resolve Incident" as UC023
        usecase "Generate Report" as UC024
    }

    package "Alerting" {
        usecase "Configure Alert" as UC030
        usecase "Receive Alert" as UC031
        usecase "Acknowledge Alert" as UC032
    }

    package "Activity & Audit" {
        usecase "View Activity Feed" as UC040
        usecase "Export Logs" as UC041
    }

    Admin --> UC001
    Admin --> UC002
    Admin --> UC003
    Admin --> UC004
    Admin --> UC030

    Operator --> UC002
    Operator --> UC010
    Operator --> UC011
    Operator --> UC012
    Operator --> UC020
    Operator --> UC021
    Operator --> UC022
    Operator --> UC023
    Operator --> UC031
    Operator --> UC032
    Operator --> UC040

    Developer --> UC002
    Developer --> UC010
    Developer --> UC011
    Developer --> UC012
    Developer --> UC013

    Manager --> UC002
    Manager --> UC010
    Manager --> UC024
    Manager --> UC040
    Manager --> UC041

    UC020 ..> UC021 : extends
    UC022 ..> UC023 : includes
    UC031 ..> UC032 : includes
```

---

## Use Case Descriptions

### **UC-001: Register Service**

**Actor:** Administrator

**Description:** Register a new microservice for monitoring

**Preconditions:**
- User is authenticated
- User has administrator role

**Main Flow:**
1. Navigate to Services page
2. Click "Register Service"
3. Enter service details (name, type, port, host, owner)
4. Enable monitoring options (metrics, logs, traces)
5. Click "Register"
6. System validates input
7. System saves service
8. System logs activity
9. Service appears in list

**Postconditions:**
- Service registered and monitored
- Activity logged

---

### **UC-002: View Services**

**Actor:** Administrator, Operator, Developer, Manager

**Description:** View all registered services with their status

**Preconditions:**
- User is authenticated

**Main Flow:**
1. Navigate to Services page
2. System displays service list
3. Each service shows:
   - Name and type
   - Host and port
   - Health status (color-coded)
   - Uptime percentage
   - Monitoring status (metrics/logs/traces)
4. User can click service for details

**Postconditions:**
- User views service information

---

### **UC-010: View Metrics Dashboard**

**Actor:** Operator, Developer, Manager

**Description:** View real-time metrics from services

**Preconditions:**
- User is authenticated
- Services are sending metrics

**Main Flow:**
1. Navigate to Metrics page or Dashboard
2. Select time range (1h, 6h, 24h, 7d, 30d)
3. Select services to view
4. System displays metrics:
   - Request rate
   - Error rate
   - Response time
   - JVM metrics (memory, threads, GC)
5. Dashboard auto-refreshes every 30 seconds

**Postconditions:**
- User views current metrics

---

### **UC-011: Search Logs**

**Actor:** Operator, Developer

**Description:** Search and filter logs from all services

**Preconditions:**
- User is authenticated
- Logs are being collected

**Main Flow:**
1. Navigate to Logs page
2. Enter search query (full-text or LogQL)
3. Apply filters:
   - Service name
   - Log level (ERROR, WARN, INFO, DEBUG)
   - Time range
4. Click "Search"
5. System displays matching logs
6. User can click log entry for details

**Alternative Flow:**
- 3a. Search by trace ID
  - Enter trace ID
  - System shows all related logs

**Postconditions:**
- User finds relevant logs

---

### **UC-012: View Traces**

**Actor:** Operator, Developer

**Description:** View distributed traces for requests

**Preconditions:**
- User is authenticated
- Services are instrumented with OpenTelemetry

**Main Flow:**
1. Navigate to Traces page
2. Search traces by:
   - Service name
   - Operation name
   - Duration range
   - Tags/attributes
3. System displays trace list
4. User clicks trace
5. System displays trace details:
   - Timeline view
   - Span hierarchy
   - Duration per span
   - Tags and logs per span
   - Service dependency graph

**Postconditions:**
- User understands request flow

---

### **UC-013: Correlate Data**

**Actor:** Developer

**Description:** Correlate metrics, logs, and traces

**Preconditions:**
- User is authenticated
- All three pillars are collecting data

**Main Flow:**
1. Navigate to Dashboard
2. Select time range
3. View correlated view:
   - Metrics show spike
   - Click on metric
   - System shows related logs
   - System shows related traces
4. User investigates root cause

**Postconditions:**
- User identifies issue across pillars

---

### **UC-020: Detect Incident**

**Actor:** System (Automatic), Operator

**Description:** Automatically detect incidents from alerts

**Preconditions:**
- Alert rules configured
- Monitoring active

**Main Flow:**
1. Alert rule condition met
2. Alertmanager triggers alert
3. System creates incident automatically
4. System links related metrics/logs/traces
5. System notifies on-call operator
6. Incident appears in incident list

**Postconditions:**
- Incident created
- Team notified

---

### **UC-021: Create Incident**

**Actor:** Operator

**Description:** Manually create incident

**Preconditions:**
- User is authenticated
- User has operator role

**Main Flow:**
1. Navigate to Incidents page
2. Click "New Incident"
3. Enter incident details:
   - Title
   - Description
   - Severity (Critical, High, Medium, Low)
   - Affected service
   - Assignee
4. Click "Create"
5. System saves incident
6. System notifies team
7. Incident appears in list

**Postconditions:**
- Incident created
- Team notified

---

### **UC-022: Update Incident**

**Actor:** Operator

**Description:** Update incident status and add notes

**Preconditions:**
- Incident exists
- User is authenticated

**Main Flow:**
1. Open incident details
2. Click "Update Status"
3. Select new status:
   - Open → Investigating → Resolved → Closed
4. Add update notes (required)
5. Click "Save"
6. System saves update
7. System notifies team
8. Timeline updated

**Postconditions:**
- Incident status updated
- Team notified
- Audit trail updated

---

### **UC-023: Resolve Incident**

**Actor:** Operator

**Description:** Resolve and close incident

**Preconditions:**
- Incident is in "Investigating" or "Resolved" status
- Root cause identified
- Fix implemented

**Main Flow:**
1. Open incident details
2. Click "Resolve"
3. Enter resolution notes:
   - Root cause
   - Resolution steps
   - Prevention measures
4. Click "Resolve Incident"
5. System updates status to "Resolved"
6. System calculates MTTD and MTTR
7. System generates incident report
8. Team notified

**Postconditions:**
- Incident resolved
- Report generated
- Metrics updated

---

### **UC-024: Generate Report**

**Actor:** Manager

**Description:** Generate incident reports

**Preconditions:**
- User is authenticated
- User has manager role
- Incidents exist in system

**Main Flow:**
1. Navigate to Reports page
2. Select report type:
   - Single incident
   - Date range
   - Service-specific
3. Select format (PDF, Markdown)
4. Click "Generate"
5. System generates report with:
   - Incident timeline
   - MTTD and MTTR metrics
   - Root cause summary
   - Prevention recommendations
6. User downloads or shares report

**Postconditions:**
- Report generated
- Stakeholders informed

---

### **UC-030: Configure Alert**

**Actor:** Administrator

**Description:** Configure alert rules

**Preconditions:**
- User is authenticated
- User has administrator role

**Main Flow:**
1. Navigate to Alerting page
2. Click "Create Alert Rule"
3. Select data source (metrics or logs)
4. Define condition:
   - Threshold (e.g., error rate > 5%)
   - Rate of change
   - Absence of data
5. Configure notification channel:
   - Email
   - Slack
   - Webhook
6. Test alert rule
7. Save alert rule

**Postconditions:**
- Alert rule active
- Notifications configured

---

### **UC-031: Receive Alert**

**Actor:** Operator

**Description:** Receive and view alert notifications

**Preconditions:**
- Alert rules configured
- User is on-call

**Main Flow:**
1. Alert condition met
2. System sends notification:
   - Email
   - Slack message
   - Push notification
3. Notification includes:
   - Alert name and severity
   - Affected service
   - Current value
   - Link to dashboard
4. User clicks link
5. System opens relevant dashboard

**Postconditions:**
- User aware of incident
- Investigation begins

---

### **UC-032: Acknowledge Alert**

**Actor:** Operator

**Description:** Acknowledge alert to stop escalation

**Preconditions:**
- Alert received
- User is authenticated

**Main Flow:**
1. Open alert notification
2. Click "Acknowledge"
3. System marks alert as acknowledged
4. System records who acknowledged
5. System pauses escalation
6. Team notified of acknowledgment

**Postconditions:**
- Alert acknowledged
- Escalation paused

---

### **UC-040: View Activity Feed**

**Actor:** Operator, Manager

**Description:** View system activity feed

**Preconditions:**
- User is authenticated

**Main Flow:**
1. Navigate to Activity page
2. System displays activity feed:
   - Service registrations
   - Configuration changes
   - Incident updates
   - Alert acknowledgments
   - User logins
3. User can filter by:
   - User
   - Action type
   - Date range
4. User can export to CSV

**Postconditions:**
- User views audit trail

---

### **UC-041: Export Logs**

**Actor:** Manager

**Description:** Export logs for compliance or analysis

**Preconditions:**
- User is authenticated
- User has manager role
- Logs exist in system

**Main Flow:**
1. Navigate to Logs page
2. Define export criteria:
   - Time range
   - Services
   - Log levels
   - Search query
3. Select format (CSV, JSON)
4. Click "Export"
5. System generates export file
6. User downloads file

**Postconditions:**
- Logs exported
- File downloaded

---

## Actor Descriptions

| Actor | Description | Responsibilities |
|-------|-------------|------------------|
| **Administrator** | System administrator | Configure services, alerts, users |
| **Operator** | On-call operator | Monitor system, respond to incidents |
| **Developer** | Service developer | Debug issues, view traces and logs |
| **Manager** | Team manager | View reports, analyze trends |

---

## Relationship Types

| Symbol | Type | Description |
|--------|------|-------------|
| `-->` | Association | Actor interacts with use case |
| `..>` | Include | Base use case includes another |
| `..>` | Extend | Use case extends another conditionally |

---

## Document Information

| Field | Value |
|-------|-------|
| **Document** | Use Case Diagram |
| **Version** | 1.0 |
| **Date** | May 2026 |
| **Author** | [Your Name] |

---

**End of Use Case Diagram Document**
