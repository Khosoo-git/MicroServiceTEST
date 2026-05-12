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

    private String description;

    private String owner;

    private String metricsEndpoint = "/actuator/prometheus";

    private String logsPath;

    private Boolean metricsEnabled = true;

    private Boolean logsEnabled = true;

    private Boolean tracingEnabled = true;

    @Column(nullable = false)
    private LocalDateTime registeredAt;

    @PrePersist
    protected void onCreate() {
        registeredAt = LocalDateTime.now();
    }

    private LocalDateTime lastChecked;

    private String status = "UNKNOWN"; // HEALTHY, UNHEALTHY, DOWN, UNKNOWN

    private Double uptime = 0.0; // Uptime percentage
}
