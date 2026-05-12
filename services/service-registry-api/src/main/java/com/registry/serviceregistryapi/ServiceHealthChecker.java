package com.registry.serviceregistryapi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceHealthChecker {

    private final RegisteredServiceRepository repository;
    private final WebClient.Builder webClientBuilder;

    // Cache for uptime tracking
    private static final ConcurrentHashMap<Long, ServiceStats> serviceStats = new ConcurrentHashMap<>();

    @Scheduled(fixedRate = 10000) // Check every 10 seconds
    public void checkAllServices() {
        log.debug("Checking health of all registered services...");

        List<RegisteredService> services = repository.findAll();

        for (RegisteredService service : services) {
            checkServiceHealth(service);
        }
    }

    private void checkServiceHealth(RegisteredService service) {
        // Skip health check for services that don't have health endpoints
        // Mark as HEALTHY by default (optimistic approach)
        String baseUrl = "http://" + service.getHost() + ":" + service.getPort();
        long startTime = System.currentTimeMillis();

        // Try root endpoint first (most services have this)
        try {
            String response = webClientBuilder.build()
                .get()
                .uri(baseUrl + "/")
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofSeconds(2));

            long responseTime = System.currentTimeMillis() - startTime;
            updateServiceStatus(service, "HEALTHY", responseTime, true);
            log.info("✓ Service {} is HEALTHY ({}ms)", service.getServiceName(), responseTime);
            return;

        } catch (Exception e) {
            // Root endpoint failed, try actuator
        }

        // Try actuator health
        try {
            String response = webClientBuilder.build()
                .get()
                .uri(baseUrl + "/actuator/health")
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofSeconds(2));

            long responseTime = System.currentTimeMillis() - startTime;
            updateServiceStatus(service, "HEALTHY", responseTime, true);
            log.info("✓ Service {} is HEALTHY via /actuator/health ({}ms)", service.getServiceName(), responseTime);
            return;

        } catch (Exception e) {
            // Both failed - mark as UNHEALTHY but don't update uptime (keep previous)
            log.warn("⚠ Service {} health check failed - marking as UNHEALTHY", service.getServiceName());

            // Just update status, don't reset uptime
            service.setStatus("UNHEALTHY");
            service.setLastChecked(LocalDateTime.now());
            repository.save(service);
        }
    }

    private void updateServiceStatus(RegisteredService service, String status, long responseTime, boolean isHealthy) {
        Long serviceId = service.getId();

        // Get or create stats
        ServiceStats stats = serviceStats.computeIfAbsent(serviceId,
            k -> new ServiceStats(serviceId));

        // Update stats
        stats.lastCheck = LocalDateTime.now();
        stats.lastResponseTime = responseTime;
        stats.totalChecks++;

        if (isHealthy) {
            stats.successfulChecks++;
            service.setStatus("HEALTHY");
        } else {
            service.setStatus("UNHEALTHY");
        }

        // Calculate uptime percentage
        double uptime = stats.totalChecks > 0
            ? (stats.successfulChecks * 100.0 / stats.totalChecks)
            : 0.0;

        service.setUptime(uptime);

        // Save to database
        repository.save(service);
    }

    // Get real-time stats for a service
    public ServiceStats getServiceStats(Long serviceId) {
        return serviceStats.get(serviceId);
    }

    // Static class to hold service statistics
    public static class ServiceStats {
        public Long serviceId;
        public LocalDateTime lastCheck;
        public long lastResponseTime;
        public long totalChecks;
        public long successfulChecks;

        public ServiceStats(Long serviceId) {
            this.serviceId = serviceId;
            this.lastCheck = LocalDateTime.now();
            this.lastResponseTime = 0;
            this.totalChecks = 0;
            this.successfulChecks = 0;
        }

        public double getUptimePercentage() {
            return totalChecks > 0 ? (successfulChecks * 100.0 / totalChecks) : 0.0;
        }

        public double getAverageResponseTime() {
            return lastResponseTime; // Simplified - would track all response times in production
        }
    }
}
