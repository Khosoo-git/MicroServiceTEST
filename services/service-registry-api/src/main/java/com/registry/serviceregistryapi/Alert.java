package com.registry.serviceregistryapi;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String alertName;

    @Column(nullable = false)
    private String severity; // critical, warning, info

    @Column(nullable = false)
    private String status = "FIRING"; // FIRING, RESOLVED, ACKNOWLEDGED

    @Column(nullable = false)
    private String serviceName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column
    private String instance;

    @ElementCollection
    @CollectionTable(name = "alert_labels", joinColumns = @JoinColumn(name = "alert_id"))
    @Column(name = "label_value")
    @MapKeyColumn(name = "label_key")
    private Map<String, String> labels;

    @Column(nullable = false)
    private LocalDateTime firedAt;

    private LocalDateTime resolvedAt;

    private LocalDateTime acknowledgedAt;

    @Column(columnDefinition = "TEXT")
    private String resolvedBy;

    @Column(columnDefinition = "TEXT")
    private String acknowledgedBy;

    @PrePersist
    protected void onCreate() {
        firedAt = LocalDateTime.now();
    }
}
