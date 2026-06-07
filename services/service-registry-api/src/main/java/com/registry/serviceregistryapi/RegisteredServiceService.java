package com.registry.serviceregistryapi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegisteredServiceService {

    private final RegisteredServiceRepository repository;
    private final ObservabilityConfigService configService;
    private final ActivityLogRepository activityLogRepository;
    private final MonitoringModeResolver monitoringModeResolver;

    @Transactional
    public RegisteredService registerService(RegisterServiceRequest request) {
        if (repository.existsByServiceName(request.getServiceName())) {
            throw new ServiceAlreadyExistsException(request.getServiceName());
        }

        String mode = monitoringModeResolver.resolve(request);

        RegisteredService service = new RegisteredService();
        service.setServiceName(request.getServiceName());
        service.setServiceType(request.getServiceType());
        service.setPort(resolvePort(request, mode));
        service.setHost(normalizeHost(request.getHost(), mode));
        service.setMonitoringMode(mode);
        service.setTargetUrl(request.getTargetUrl());
        service.setScheme(resolveScheme(request, mode));
        service.setEnvironment(request.getEnvironment() != null ? request.getEnvironment() : "production");
        service.setDescription(request.getDescription());
        service.setOwner(request.getOwner());

        applyMonitoringFlags(service, request, mode);

        RegisteredService saved = repository.save(service);

        ActivityLog activity = new ActivityLog();
        activity.setAction("SERVICE_REGISTERED");
        activity.setServiceName(saved.getServiceName());
        activity.setServiceType(saved.getServiceType());
        activity.setDescription("Service registered: " + saved.getServiceName() + " [" + mode + "]");
        activity.setUser("admin");
        activity.setDetails("Host: " + saved.getHost() + ", mode: " + mode
                + (saved.getTargetUrl() != null ? ", url: " + saved.getTargetUrl() : ""));
        activityLogRepository.save(activity);

        configService.updateAllConfigs();

        log.info("Registered service: {} mode={} host={}", saved.getServiceName(), mode, saved.getHost());
        return saved;
    }

    @Transactional
    public void removeService(Long id) {
        RegisteredService service = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));

        String serviceName = service.getServiceName();
        repository.deleteById(id);

        ActivityLog activity = new ActivityLog();
        activity.setAction("SERVICE_DELETED");
        activity.setServiceName(serviceName);
        activity.setServiceType(service.getServiceType());
        activity.setDescription("Service deleted: " + serviceName);
        activity.setUser("admin");
        activityLogRepository.save(activity);

        configService.updateAllConfigs();
        log.info("Deleted service: {}", serviceName);
    }

    public List<RegisteredService> getAllServices() {
        return repository.findAll();
    }

    public RegisteredService getService(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
    }

    private void applyMonitoringFlags(RegisteredService service, RegisterServiceRequest request, String mode) {
        if (MonitoringMode.HTTP_PROBE.equals(mode)) {
            service.setMetricsEnabled(false);
            service.setLogsEnabled(false);
            service.setTracingEnabled(false);
            service.setHealthCheckEndpoint("/");
            return;
        }

        if (MonitoringMode.OTLP_PUSH.equals(mode)) {
            service.setMetricsEnabled(false);
            service.setLogsEnabled(Boolean.TRUE.equals(request.getLogsEnabled()));
            service.setTracingEnabled(true);
            if (Boolean.TRUE.equals(request.getLogsEnabled())) {
                service.setLogsPath("/logs/" + request.getServiceName().toLowerCase() + ".log");
            }
            return;
        }

        service.setMetricsEnabled(request.getMetricsEnabled() != null ? request.getMetricsEnabled() : true);
        service.setLogsEnabled(request.getLogsEnabled() != null ? request.getLogsEnabled() : true);
        service.setTracingEnabled(request.getTracingEnabled() != null ? request.getTracingEnabled() : true);

        if (Boolean.TRUE.equals(service.getMetricsEnabled())) {
            service.setMetricsEndpoint(
                    request.getMetricsEndpoint() != null ? request.getMetricsEndpoint() : "/actuator/prometheus");
        }
        service.setHealthCheckEndpoint(
                request.getHealthCheckEndpoint() != null ? request.getHealthCheckEndpoint() : "/actuator/health");
        if (Boolean.TRUE.equals(service.getLogsEnabled())) {
            service.setLogsPath("/logs/" + request.getServiceName().toLowerCase() + ".log");
        }
    }

    private int resolvePort(RegisterServiceRequest request, String mode) {
        if (request.getPort() != null) {
            return request.getPort();
        }
        if (MonitoringMode.HTTP_PROBE.equals(mode)) {
            if (request.getTargetUrl() != null && request.getTargetUrl().startsWith("http://")) {
                return 80;
            }
            return 443;
        }
        return 8080;
    }

    private String normalizeHost(String host, String mode) {
        if (host == null || host.isBlank()) {
            if (MonitoringMode.HTTP_PROBE.equals(mode)) {
                throw new RuntimeException("Host or target URL is required");
            }
            return "localhost";
        }
        return host.trim();
    }

    private String resolveScheme(RegisterServiceRequest request, String mode) {
        if (request.getScheme() != null && !request.getScheme().isBlank()) {
            return request.getScheme().toLowerCase();
        }
        if (MonitoringMode.HTTP_PROBE.equals(mode)) {
            if (request.getTargetUrl() != null && request.getTargetUrl().startsWith("http://")) {
                return "http";
            }
            return "https";
        }
        Integer port = request.getPort();
        return (port != null && port == 443) ? "https" : "http";
    }
}
