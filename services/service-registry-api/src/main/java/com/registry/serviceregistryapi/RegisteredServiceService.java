package com.registry.serviceregistryapi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegisteredServiceService {

    private final RegisteredServiceRepository repository;
    private final ObservabilityConfigService configService;
    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public RegisteredService registerService(RegisterServiceRequest request) {
        if (repository.existsByServiceName(request.getServiceName())) {
            throw new RuntimeException("Service with name '" + request.getServiceName() + "' already exists");
        }

        RegisteredService service = new RegisteredService();
        service.setServiceName(request.getServiceName());
        service.setServiceType(request.getServiceType());
        service.setPort(request.getPort());
        service.setHost(request.getHost());
        service.setDescription(request.getDescription());
        service.setOwner(request.getOwner());
        service.setMetricsEnabled(request.getMetricsEnabled());
        service.setLogsEnabled(request.getLogsEnabled());
        service.setTracingEnabled(request.getTracingEnabled());

        // Set default endpoints
        if (request.getMetricsEnabled()) {
            service.setMetricsEndpoint("/actuator/prometheus");
        }
        if (request.getLogsEnabled()) {
            service.setLogsPath("/logs/" + request.getServiceName().toLowerCase() + ".log");
        }

        RegisteredService saved = repository.save(service);

        // Log activity
        ActivityLog activity = new ActivityLog();
        activity.setAction("SERVICE_REGISTERED");
        activity.setServiceName(saved.getServiceName());
        activity.setServiceType(saved.getServiceType());
        activity.setDescription("Service registered: " + saved.getServiceName());
        activity.setUser("admin");
        activity.setDetails("Host: " + saved.getHost() + ", Port: " + saved.getPort());
        activityLogRepository.save(activity);

        // Update observability configs
        configService.updateAllConfigs();

        log.info("Registered new service: {} (type: {}, port: {})",
                saved.getServiceName(), saved.getServiceType(), saved.getPort());

        return saved;
    }

    @Transactional
    public void removeService(Long id) {
        RegisteredService service = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));

        String serviceName = service.getServiceName();

        repository.deleteById(id);

        // Log activity
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
}
