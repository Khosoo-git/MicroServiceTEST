package com.registry.serviceregistryapi;

import lombok.Data;

@Data
public class UpdateIncidentRequest {

    private String title;
    private String description;
    private String severity;
    private String status;
    private String assignee;
}
