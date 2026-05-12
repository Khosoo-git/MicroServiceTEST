package com.registry.serviceregistryapi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AlertController {

    private final AlertService alertService;

    /**
     * Webhook endpoint for Alertmanager
     * Accepts Alertmanager webhook payload
     */
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> receiveAlertWebhook(@RequestBody Map<String, Object> payload) {
        log.info("Received alert webhook from Alertmanager");

        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> alerts = (List<Map<String, Object>>) payload.get("alerts");

            if (alerts == null) {
                log.warn("No alerts in webhook payload");
                return ResponseEntity.badRequest().body(Map.of("error", "No alerts in payload"));
            }

            for (Map<String, Object> alertData : alerts) {
                alertService.processAlertFromWebhook(alertData);
            }

            Map<String, String> response = new HashMap<>();
            response.put("status", "ok");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to process alert webhook", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Get all active (firing) alerts
     */
    @GetMapping
    public ResponseEntity<List<Alert>> getActiveAlerts() {
        return ResponseEntity.ok(alertService.getActiveAlerts());
    }

    /**
     * Get all alerts (including resolved)
     */
    @GetMapping("/all")
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    /**
     * Get alert history
     */
    @GetMapping("/history")
    public ResponseEntity<List<Alert>> getAlertHistory() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    /**
     * Acknowledge an alert
     */
    @PostMapping("/{alertId}/acknowledge")
    public ResponseEntity<Alert> acknowledgeAlert(
            @PathVariable Long alertId,
            @RequestHeader(value = "X-User", required = false, defaultValue = "system") String username) {
        try {
            Alert alert = alertService.acknowledgeAlert(alertId, username);
            return ResponseEntity.ok(alert);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get alert statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAlertStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("active", alertService.getActiveAlertsCount());
        stats.put("critical", alertService.getCriticalAlertsCount());
        return ResponseEntity.ok(stats);
    }
}
