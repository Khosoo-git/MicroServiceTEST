package com.registry.serviceregistryapi;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action; // SERVICE_REGISTERED, SERVICE_DELETED, SERVICE_UPDATED, ALERT_FIRED, ALERT_RESOLVED

    @Column(nullable = false)
    private String serviceName;

    private String serviceType;

    private String description;

    @Column(name = "app_user")
    private String user; // "admin", "system", etc.

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    private String details; // JSON or additional info
}
