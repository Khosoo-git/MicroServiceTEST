package com.registry.serviceregistryapi;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterServiceRequest {

    @NotBlank(message = "Service name is required")
    private String serviceName;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    @NotNull(message = "Port is required")
    private Integer port;

    private String host = "localhost";

    /** HTTP_PROBE | METRICS_SCRAPE | OTLP_PUSH (optional – auto-detected from type) */
    private String monitoringMode;

    /** e.g. https://status.netflix.com – for internet / SaaS monitoring */
    private String targetUrl;

    private String scheme = "http";

    private String environment = "production";

    private String description;

    private String owner;

    private String metricsEndpoint;

    private String healthCheckEndpoint;

    private Boolean metricsEnabled = true;

    private Boolean logsEnabled = true;

    private Boolean tracingEnabled = true;
}
