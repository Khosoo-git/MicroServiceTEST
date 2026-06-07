package com.registry.serviceregistryapi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;
    private final ActivityLogRepository activityLogRepository;
    private final IncidentService incidentService;

    /**
     * Process alert from Alertmanager webhook
     */
    @SuppressWarnings("unchecked")
    @Transactional
    public void processAlertFromWebhook(Map<String, Object> alertData) {
        try {
            log.info("Processing alert: {}", alertData);

            Map<String, String> labels = (Map<String, String>) alertData.get("labels");
            Map<String, String> annotations = (Map<String, String>) alertData.get("annotations");
            String status = (String) alertData.get("status");

            String alertName = labels.get("alertname");
            String severity = labels.get("severity");
            String serviceName = labels.get("service");
            String instance = labels.get("instance");
            String summary = annotations != null ? annotations.get("summary") : "";
            String description = annotations != null ? annotations.get("description") : "";

            if ("firing".equals(status)) {
                createAlert(alertName, severity, serviceName, instance, summary, description);
            } else if ("resolved".equals(status)) {
                resolveAlert(alertName, serviceName, instance);
            }

            log.info("Processed alert: {} - {}", alertName, status);
        } catch (Exception e) {
            log.error("Failed to process alert from webhook", e);
        }
    }

    @Transactional
    public void createAlert(String alertName, String severity, String serviceName,
            String instance, String summary, String description) {
        // Check if similar alert already exists
        List<Alert> existing = alertRepository.findActiveAlerts();
        for (Alert existingAlert : existing) {
            if (existingAlert.getAlertName().equals(alertName) &&
                    (existingAlert.getServiceName().equals(serviceName) || serviceName == null)) {
                log.debug("Alert already exists: {} - {}", alertName, serviceName);
                return;
            }
        }

        // Create new alert
        Alert alert = new Alert();
        alert.setAlertName(alertName);
        alert.setSeverity(severity != null ? severity : "warning");
        alert.setStatus("FIRING");
        alert.setServiceName(serviceName != null ? serviceName : "unknown");
        alert.setInstance(instance);
        alert.setSummary(summary);
        alert.setDescription(description);

        alert = alertRepository.save(alert);

        if ("critical".equalsIgnoreCase(severity)) {
            try {
                incidentService.createFromAlert(alert);
            } catch (Exception e) {
                log.warn("Failed to auto-create incident for alert {}: {}", alertName, e.getMessage());
            }
        }

        // Log activity
        ActivityLog activity = new ActivityLog();
        activity.setAction("ALERT_FIRED");
        activity.setServiceName(serviceName != null ? serviceName : "unknown");
        activity.setDescription(String.format("Alert '%s' fired: %s", alertName, summary));
        activity.setDetails(String.format("Severity: %s, Instance: %s", severity, instance));
        activityLogRepository.save(activity);

        log.info("Created new alert: {} - {} ({})", alertName, serviceName, severity);
    }

    @Transactional
    public void resolveAlert(String alertName, String serviceName, String instance) {
        List<Alert> alerts = alertRepository.findActiveAlerts();
        for (Alert alert : alerts) {
            if (alert.getAlertName().equals(alertName) &&
                    (alert.getServiceName().equals(serviceName) || serviceName == null)) {
                alert.setStatus("RESOLVED");
                alert.setResolvedAt(LocalDateTime.now());
                alertRepository.save(alert);

                // Log activity
                ActivityLog activity = new ActivityLog();
                activity.setAction("ALERT_RESOLVED");
                activity.setServiceName(alert.getServiceName());
                activity.setDescription(String.format("Alert '%s' resolved", alertName));
                long duration = System.currentTimeMillis()
                        - alert.getFiredAt().atZone(java.time.ZoneOffset.UTC).toInstant().toEpochMilli();
                activity.setDetails(String.format("Duration: %d ms", duration));
                activityLogRepository.save(activity);

                log.info("Resolved alert: {} - {}", alertName, serviceName);
                break;
            }
        }
    }

    @Transactional
    public Alert acknowledgeAlert(Long alertId, String username) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        alert.setStatus("ACKNOWLEDGED");
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setAcknowledgedBy(username);
        Alert saved = alertRepository.save(alert);

        // Log activity
        ActivityLog activity = new ActivityLog();
        activity.setAction("ALERT_ACKNOWLEDGED");
        activity.setServiceName(alert.getServiceName());
        activity.setDescription(String.format("Alert '%s' acknowledged by %s", alert.getAlertName(), username));
        activity.setUser(username);
        activityLogRepository.save(activity);

        return saved;
    }

    public List<Alert> getActiveAlerts() {
        return alertRepository.findActiveAlerts();
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public long getActiveAlertsCount() {
        return alertRepository.countActiveAlerts();
    }

    public long getCriticalAlertsCount() {
        return alertRepository.countCriticalAlerts();
    }
}
