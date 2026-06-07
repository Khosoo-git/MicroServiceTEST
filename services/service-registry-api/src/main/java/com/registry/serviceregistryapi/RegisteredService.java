package com.registry.serviceregistryapi;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "registered_services")
@Data
@NoArgsConstructor
public class RegisteredService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Service name is required")
    @Column(unique = true, nullable = false)
    private String serviceName;

    @NotBlank(message = "Service type is required")
    @Column(nullable = false)
    private String serviceType; // web, application, system, mobile-api, etc.

    @NotNull(message = "Port is required")
    @Column(nullable = false)
    private Integer port;

    @Column(nullable = false)
    private String host = "localhost";

    /** HTTP_PROBE | METRICS_SCRAPE | OTLP_PUSH */
    @Column(nullable = false, columnDefinition = "varchar(64) default 'METRICS_SCRAPE'")
    private String monitoringMode = MonitoringMode.METRICS_SCRAPE;

    /** Full URL for HTTP_PROBE, e.g. https://api.stripe.comx/health */
    @Column(length = 2048)
    private String targetUrl;

    /** http or https for METRICS_SCRAPE */
    @Column(length = 10)
    private String scheme = "http";

    private String environment = "production";

    private String description;

    private String owner;

    private String metricsEndpoint = "/actuator/prometheus";

    private String healthCheckEndpoint = "/actuator/health";

    private String logsPath;

    private Boolean metricsEnabled = true;

    private Boolean logsEnabled = true;

    private Boolean tracingEnabled = true;

    @Column(nullable = false)
    private LocalDateTime registeredAt;

    @PrePersist
    protected void onCreate() {
        registeredAt = LocalDateTime.now();
        if (monitoringMode == null || monitoringMode.isBlank()) {
            monitoringMode = MonitoringMode.METRICS_SCRAPE;
        }
        if (scheme == null || scheme.isBlank()) {
            scheme = "http";
        }
        if (environment == null || environment.isBlank()) {
            environment = "production";
        }
    }

    private LocalDateTime lastChecked;

    private String status = "UNKNOWN"; // HEALTHY, UNHEALTHY, DOWN, UNKNOWN

    private Double uptime = 0.0; // Uptime percentage
}
