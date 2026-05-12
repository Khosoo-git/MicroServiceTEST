package com.registry.serviceregistryapi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final ServiceHealthChecker healthChecker;
    private final RegisteredServiceRepository repository;

    /**
     * Get real-time health stats for all services
     */
    @GetMapping("/health-stats")
    public ResponseEntity<Map<String, Object>> getHealthStats() {
        Map<String, Object> response = new HashMap<>();
        
        var services = repository.findAll();
        var stats = new HashMap<>();
        
        for (var service : services) {
            var serviceStats = healthChecker.getServiceStats(service.getId());
            if (serviceStats != null) {
                var serviceData = new HashMap<>();
                serviceData.put("status", service.getStatus());
                serviceData.put("uptime", service.getUptime());
                serviceData.put("lastResponseTime", serviceStats.lastResponseTime);
                serviceData.put("totalChecks", serviceStats.totalChecks);
                serviceData.put("successfulChecks", serviceStats.successfulChecks);
                serviceData.put("uptimePercentage", serviceStats.getUptimePercentage());
                stats.put(service.getServiceName(), serviceData);
            }
        }
        
        response.put("services", stats);
        response.put("timestamp", java.time.LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Simulate service failure (for testing)
     */
    @PostMapping("/simulate-failure/{serviceName}")
    public ResponseEntity<Map<String, String>> simulateFailure(
            @PathVariable String serviceName,
            @RequestParam(defaultValue = "false") boolean permanent) {
        
        Map<String, String> response = new HashMap<>();
        
        var serviceOpt = repository.findByServiceName(serviceName);
        if (serviceOpt.isPresent()) {
            var service = serviceOpt.get();
            
            if (permanent) {
                // Mark service as permanently down
                service.setStatus("DOWN");
                service.setUptime(0.0);
                repository.save(service);
                response.put("message", "Service " + serviceName + " marked as DOWN permanently");
                log.warn("⚠️ SIMULATED PERMANENT FAILURE for service: {}", serviceName);
            } else {
                // Just log a temporary failure (next health check will recover)
                response.put("message", "Will simulate temporary failure for: " + serviceName);
                log.warn("⚠️ SIMULATED TEMPORARY FAILURE for service: {} (will recover on next check)", serviceName);
            }
        } else {
            response.put("message", "Service not found: " + serviceName);
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Recover a failed service (for testing)
     */
    @PostMapping("/recover/{serviceName}")
    public ResponseEntity<Map<String, String>> recoverService(
            @PathVariable String serviceName) {
        
        Map<String, String> response = new HashMap<>();
        
        var serviceOpt = repository.findByServiceName(serviceName);
        if (serviceOpt.isPresent()) {
            var service = serviceOpt.get();
            service.setStatus("HEALTHY");
            repository.save(service);
            response.put("message", "Service " + serviceName + " marked as HEALTHY");
            log.info("✅ SERVICE RECOVERED: {}", serviceName);
        } else {
            response.put("message", "Service not found: " + serviceName);
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Reset all stats (for testing)
     */
    @PostMapping("/reset-stats")
    public ResponseEntity<Map<String, String>> resetStats() {
        Map<String, String> response = new HashMap<>();
        
        var services = repository.findAll();
        for (var service : services) {
            service.setStatus("UNKNOWN");
            service.setUptime(0.0);
            repository.save(service);
        }
        
        response.put("message", "All service stats reset");
        log.info("🔄 All service stats reset");
        
        return ResponseEntity.ok(response);
    }
}
