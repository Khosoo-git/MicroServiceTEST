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

    private String description;

    private String owner;

    private Boolean metricsEnabled = true;

    private Boolean logsEnabled = true;

    private Boolean tracingEnabled = true;
}
