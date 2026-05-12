# Activity Diagrams - Incident Management System Platform

## System Overview

This document describes the workflow and decision points for key processes in the MicroService Observability Platform.

---

## 1. Service Registration Activity

```mermaid
activityDiagram
    start
    :Navigate to Services page;
    :Click "Register Service";

    partition "User Input" {
        :Enter service name;
        :Select service type;
        :Enter host and port;
        :Enter description;
        :Select owner;
        :Enable monitoring options;
    }

    :Click "Register";

    partition "System Validation" {
        if (All required fields filled?) then (yes)
            if (Service name unique?) then (yes)
                :Save service to database;
                :Log activity;
                :Display success message;
                :Update service list;
            else (no - duplicate)
                :Show error "Service already exists";
                :Return to form;
            endif
        else (no - missing fields)
            :Show validation errors;
            :Return to form;
        endif
    }

    stop
```

---

## 2. Incident Lifecycle Activity

```mermaid
activityDiagram
    start

    partition "Detection" {
        if (Alert triggered?) then (yes)
            :Create incident automatically;
            :Link related alerts;
        else (no)
            if (User reports issue?) then (yes)
                :Create incident manually;
            else (no)
                :No action;
                stop
            endif
        endif
    }

    :Set status to OPEN;
    :Notify on-call operator;

    partition "Investigation" {
        :Operator acknowledges;
        :Set status to INVESTIGATING;
        :Review metrics;
        :Review logs;
        :Review traces;
        :Identify root cause;
    }

    partition "Resolution" {
        :Implement fix;
        :Verify resolution;
        :Set status to RESOLVED;
        :Document root cause;
        :Document resolution steps;
    }

    partition "Closure" {
        :Calculate MTTD;
        :Calculate MTTR;
        :Generate report;
        :Set status to CLOSED;
        :Notify stakeholders;
    }

    stop
```

---

## 3. Alert Evaluation Activity

```mermaid
activityDiagram
    start

    :Prometheus scrapes metrics;
    :Store in time-series database;

    partition "Rule Evaluation" {
        repeat :Evaluate each alert rule;
            :Get metric value;
            :Apply condition;
            if (Condition met?) then (yes)
                :Trigger alert;
                :Record trigger time;
            else (no)
                :Continue monitoring;
            endif
        repeat while (More rules?) is (yes)
    }

    partition "Alert Processing" {
        :Group related alerts;
        :Apply silencing rules;
        :Apply inhibition rules;

        if (Alert silenced?) then (yes)
            :Suppress notification;
        else (no)
            :Send to notification channels;
        endif
    }

    partition "Notification" {
        if (Channel = Email) then (Email)
            :Send email;
        elseif (Channel = Slack) then (Slack)
            :Post to Slack;
        elseif (Channel = Webhook) then (Webhook)
            :Call webhook;
        elseif (Channel = PagerDuty) then (PagerDuty)
            :Create PagerDuty incident;
        endif
    }

    stop
```

---

## 4. Log Collection Activity

```mermaid
activityDiagram
    start

    partition "Service" {
        :Generate log entry;
        :Write to log file;
    }

    note right: ⏱️ Logs written first,<br/>then collected by Alloy

    partition "Alloy Collector" {
        :Tail log file;
        :Detect new lines;
        :Parse log entry;
        :Add labels (service, level);
        :Batch entries;

        if (Batch full OR timeout?) then (yes)
            :Push to Loki;
        else (no)
            :Continue batching;
        endif
    }

    note right: ⏱️ ~1-5s delay<br/>for detection<br/>~5-10s to be queryable

    partition "Loki Storage" {
        :Receive log batch;
        :Extract labels;
        :Create index entry;
        :Compress log data;
        :Store in object storage;
    }

    stop

    note right: Continuous loop<br/>for each log file
```

---

## 5. Trace Collection Activity

```mermaid
activityDiagram
    start

    partition "Client Request" {
        :Receive HTTP request;
        :Extract trace context;
        if (Trace ID present?) then (yes)
            :Continue existing trace;
        else (no)
            :Create new trace;
            :Generate trace ID;
        endif
    }

    partition "Span Creation" {
        :Create span;
        :Set span attributes;
        :Record start time;
    }

    partition "Processing" {
        :Process request;
        if (Call downstream service?) then (yes)
            :Inject trace context;
            :Forward request;
            :Wait for response;
        endif
    }

    partition "Span Completion" {
        :Record end time;
        :Calculate duration;
        :Add tags;
        :Add logs;
        :End span;
    }

    partition "Export" {
        :Batch spans;
        if (Trace complete?) then (yes)
            :Export via OTLP;
            :Send to Tempo;
        else (no)
            :Wait for more spans;
        endif
    }

    note right: ⏱️ Traces exported<br/>after request completes<br/>or batch timeout

    stop
```

---

## 6. User Authentication Activity

```mermaid
activityDiagram
    start
    :User enters credentials;
    :Click "Login";

    partition "Authentication" {
        :Validate input format;
        :Query user database;

        if (User exists?) then (yes)
            :Verify password hash;

            if (Password correct?) then (yes)
                if (Account active?) then (yes)
                    :Generate JWT token;
                    :Include user roles;
                    :Create session;
                    :Log login activity;
                    :Redirect to dashboard;
                else (no - inactive)
                    :Show "Account disabled";
                    :Return to login;
                endif
            else (no - wrong password)
                :Show "Invalid credentials";
                :Return to login;
            endif
        else (no - user not found)
            :Show "Invalid credentials";
            :Return to login;
        endif
    }

    stop
```

---

## 7. Dashboard Data Loading Activity

```mermaid
activityDiagram
    start
    :User opens dashboard;

    partition "Parallel Data Loading" {
        fork
            :Fetch service list;
            :Fetch active incidents;
            :Fetch recent alerts;
            :Fetch metrics summary;
        endfork
    }

    :Aggregate data;

    if (All data loaded?) then (yes)
        :Render dashboard;
        :Display health status;
        :Display incident count;
        :Display alert list;
    else (partial failure)
        :Render available data;
        :Show error for failed components;
    endif

    :Start auto-refresh timer;

    partition "Auto-Refresh" {
        repeat :Wait 30 seconds;
            :Refresh data;
            :Update display;
        repeat while (Dashboard open?) is (yes)
    }

    stop
```

---

## 8. Incident Report Generation Activity

```mermaid
activityDiagram
    start
    :User selects incident;
    :Select report format;
    :Click "Generate Report";

    partition "Data Collection" {
        :Query incident details;
        :Query incident updates;
        :Query related alerts;
        :Query activity log;
        :Calculate MTTD;
        :Calculate MTTR;
    }

    partition "Report Assembly" {
        :Create report structure;
        :Add incident summary;
        :Add timeline;
        :Add metrics;
        :Add root cause;
        :Add resolution;
        :Add recommendations;
    }

    partition "Format Conversion" {
        if (Format = PDF) then (PDF)
            :Apply PDF template;
            :Generate PDF;
        elseif (Format = Markdown) then (Markdown)
            :Apply Markdown template;
            :Generate Markdown;
        endif
    }

    :Store report;
    :Generate download link;
    :Display download link;

    if (User clicks download?) then (yes)
        :Serve file;
    else (no)
        :Wait for download;
    endif

    stop
```

---

## 9. Alert Acknowledgment Activity

```mermaid
activityDiagram
    start
    :Operator receives alert;
    :Open alert details;

    if (Already acknowledged?) then (yes)
        :Show "Already acknowledged";
        stop
    else (no)
        :Click "Acknowledge";

        partition "Processing" {
            :Update alert status;
            :Record acknowledgment time;
            :Record acknowledging user;
            :Pause escalation;
            :Notify team;
        }

        :Display confirmation;
        :Update alert list;
    endif

    stop
```

---

## 10. Search and Filter Activity

```mermaid
activityDiagram
    start
    :User opens search page;
    :Enter search query;

    partition "Filter Application" {
        :Select service filter;
        :Select time range;
        :Select log level filter;
        :Select additional filters;
    }

    :Click "Search";

    partition "Query Processing" {
        :Validate query syntax;
        :Build query expression;
        :Apply filters;
        :Execute query;

        if (Results found?) then (yes)
            :Format results;
            :Highlight matches;
            :Sort by relevance/time;
            :Display results;

            if (More results?) then (yes)
                :Show pagination;
            else (no)
                :Show "End of results";
            endif
        else (no)
            :Show "No results found";
            :Suggest query modifications;
        endif
    }

    if (User exports results?) then (yes)
        :Format for export;
        :Generate file;
        :Download file;
    else (no)
        :Keep results displayed;
    endif

    stop
```

---

## 11. Service Health Check Activity

```mermaid
activityDiagram
    start

    partition "Health Check" {
        fork
            :Check metrics endpoint;
            :Check logs recent;
            :Check traces recent;
        endfork
    }

    partition "Status Determination" {
        if (All healthy?) then (yes)
            :Set status = HEALTHY;
            :Set color = GREEN;
        elseif (Some degraded?) then (some)
            :Set status = DEGRADED;
            :Set color = YELLOW;
        else (all failed)
            :Set status = UNHEALTHY;
            :Set color = RED;
        endif
    }

    :Update service status;
    :Update uptime calculation;

    if (Status changed?) then (yes)
        :Log status change;
        if (Became unhealthy?) then (yes)
            :Trigger health alert;
        endif
    else (no)
        :Continue monitoring;
    endif

    :Wait for next check;

    stop

    note right: Runs every<br/>60 seconds
```

---

## 12. Data Retention Activity

```mermaid
activityDiagram
    start

    :Scheduled job runs daily;

    partition "Retention Check" {
        :Get retention policies;

        fork
            :Check metrics age;
            :Check logs age;
            :Check traces age;
        endfork
    }

    partition "Data Deletion" {
        if (Metrics > 30 days?) then (yes)
            :Delete old metrics;
            :Update storage stats;
        else (no)
            :Keep metrics;
        endif

        if (Logs > 7 days?) then (yes)
            :Delete old logs;
            :Update storage stats;
        else (no)
            :Keep logs;
        endif

        if (Traces > 7 days?) then (yes)
            :Delete old traces;
            :Update storage stats;
        else (no)
            :Keep traces;
        endif
    }

    :Log retention activity;
    :Send storage report;

    stop

    note right: Runs daily<br/>at midnight
```

---

## Swimlane Legend

| Swimlane | Description |
|----------|-------------|
| **User Input** | Actions performed by the user |
| **System Validation** | System validation logic |
| **Detection** | Incident detection logic |
| **Investigation** | Incident investigation steps |
| **Resolution** | Incident resolution steps |
| **Service** | Monitored microservice |
| **Alloy Collector** | Log collection component |
| **Loki Storage** | Log storage component |
| **Processing** | Request processing logic |
| **Export** | Data export logic |
| **Authentication** | Authentication logic |
| **Parallel Data Loading** | Concurrent data fetching |
| **Format Conversion** | Report format conversion |
| **Query Processing** | Search query processing |
| **Health Check** | Health monitoring logic |
| **Retention Check** | Data retention logic |
| **Data Deletion** | Data deletion logic |

---

## Document Information

| Field | Value |
|-------|-------|
| **Document** | Activity Diagrams |
| **Version** | 1.0 |
| **Date** | May 2026 |
| **Author** | [Your Name] |

---

**End of Activity Diagrams Document**
