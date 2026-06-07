package com.registry.serviceregistryapi;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateIncidentRequest {

    @NotBlank
    private String title;

    private String description;

    private String severity = "warning";

    @NotBlank
    private String serviceName;

    private String assignee;

    private Long sourceAlertId;
}
