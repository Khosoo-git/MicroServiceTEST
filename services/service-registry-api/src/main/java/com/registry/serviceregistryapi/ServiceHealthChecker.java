package com.registry.serviceregistryapi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceHealthChecker {

    private static final String USER_AGENT =
            "Mozilla/5.0 (compatible; MicroServiceTEST-Monitor/1.0; +health-check)";

    private final RegisteredServiceRepository repository;
    private final WebClient.Builder webClientBuilder;
    private final MonitoringModeResolver monitoringModeResolver;
    private final TargetUrlBuilder targetUrlBuilder;

    private static final java.util.concurrent.ConcurrentHashMap<Long, ServiceStats> serviceStats =
            new java.util.concurrent.ConcurrentHashMap<>();

    @Scheduled(fixedRate = 10000)
    public void checkAllServices() {
        for (RegisteredService service : repository.findAll()) {
            checkServiceHealth(service);
        }
    }

    /**
     * One-off probe test (used by admin API before register).
     */
    public ProbeTestResult probeUrl(String url) {
        long start = System.currentTimeMillis();
        try {
            Boolean ok = webClientBuilder.build()
                    .get()
                    .uri(url)
                    .header(HttpHeaders.USER_AGENT, USER_AGENT)
                    .exchangeToMono(response -> {
                        int code = response.statusCode().value();
                        boolean reachable = isReachableStatus(code, true);
                        return response.releaseBody().thenReturn(reachable);
                    })
                    .block(Duration.ofSeconds(15));

            long ms = System.currentTimeMillis() - start;
            return new ProbeTestResult(url, Boolean.TRUE.equals(ok), ms, null);
        } catch (Exception e) {
            return new ProbeTestResult(url, false, System.currentTimeMillis() - start, e.getMessage());
        }
    }

    private void checkServiceHealth(RegisteredService service) {
        String url = targetUrlBuilder.buildHealthUrl(service);
        boolean httpProbe = monitoringModeResolver.isHttpProbe(service);
        long start = System.currentTimeMillis();

        try {
            Boolean healthy = webClientBuilder.build()
                    .get()
                    .uri(url)
                    .header(HttpHeaders.USER_AGENT, USER_AGENT)
                    .exchangeToMono(response -> {
                        int code = response.statusCode().value();
                        boolean reachable = isReachableStatus(code, httpProbe);
                        if (!reachable) {
                            log.debug("Health check {} returned HTTP {}", service.getServiceName(), code);
                        }
                        return response.releaseBody().thenReturn(reachable);
                    })
                    .block(Duration.ofSeconds(httpProbe ? 15 : 8));

            updateServiceStatus(service, Boolean.TRUE.equals(healthy), System.currentTimeMillis() - start);
        } catch (Exception e) {
            log.debug("Health check failed for {} ({}): {}", service.getServiceName(), url, e.getMessage());
            if (monitoringModeResolver.isOtlpPush(service)) {
                service.setStatus("UNKNOWN");
                service.setLastChecked(LocalDateTime.now());
                repository.save(service);
            } else {
                updateServiceStatus(service, false, System.currentTimeMillis() - start);
            }
        }
    }

    /**
     * HTTP_PROBE: any response &lt; 500 means the host is reachable (403/401 still OK).
     * Internal scrape: only 2xx counts as healthy.
     */
    private boolean isReachableStatus(int statusCode, boolean httpProbe) {
        if (httpProbe) {
            return statusCode > 0 && statusCode < 500;
        }
        return statusCode >= 200 && statusCode < 300;
    }

    private void updateServiceStatus(RegisteredService service, boolean healthy, long responseTime) {
        ServiceStats stats = serviceStats.computeIfAbsent(service.getId(), k -> new ServiceStats(service.getId()));
        stats.totalChecks++;
        stats.lastResponseTime = responseTime;
        if (healthy) {
            stats.successfulChecks++;
        }
        service.setStatus(healthy ? "HEALTHY" : "UNHEALTHY");
        service.setUptime(stats.totalChecks > 0
                ? (stats.successfulChecks * 100.0 / stats.totalChecks) : 0.0);
        service.setLastChecked(LocalDateTime.now());
        repository.save(service);
    }

    public ServiceStats getServiceStats(Long serviceId) {
        return serviceStats.get(serviceId);
    }

    public record ProbeTestResult(String url, boolean reachable, long responseTimeMs, String error) {
    }

    public static class ServiceStats {
        public Long serviceId;
        public long lastResponseTime;
        public long totalChecks;
        public long successfulChecks;
        public ServiceStats(Long serviceId) {
            this.serviceId = serviceId;
        }
        public double getUptimePercentage() {
            return totalChecks > 0 ? (successfulChecks * 100.0 / totalChecks) : 0.0;
        }
    }
}
