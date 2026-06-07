package com.registry.serviceregistryapi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public Incident create(CreateIncidentRequest request, String source) {
        Incident incident = new Incident();
        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setSeverity(request.getSeverity() != null ? request.getSeverity() : "warning");
        incident.setStatus("OPEN");
        incident.setServiceName(request.getServiceName());
        incident.setAssignee(request.getAssignee());
        incident.setSourceAlertId(request.getSourceAlertId());
        incident.setSource(source != null ? source : "MANUAL");

        Incident saved = incidentRepository.save(incident);
        logActivity("INCIDENT_CREATED", saved, "Incident opened: " + saved.getTitle());
        return saved;
    }

    @Transactional
    public Incident createFromAlert(Alert alert) {
        var existing = incidentRepository.findActiveIncidents().stream()
                .filter(i -> i.getServiceName().equals(alert.getServiceName()))
                .filter(i -> i.getTitle() != null && i.getTitle().startsWith(alert.getAlertName()))
                .findFirst();
        if (existing.isPresent()) {
            return existing.get();
        }

        CreateIncidentRequest req = new CreateIncidentRequest();
        req.setTitle(alert.getAlertName() + " – " + alert.getServiceName());
        req.setDescription(alert.getSummary() != null ? alert.getSummary() : alert.getDescription());
        req.setSeverity(alert.getSeverity());
        req.setServiceName(alert.getServiceName());
        req.setSourceAlertId(alert.getId());
        return create(req, "ALERT");
    }

    @Transactional
    public Incident update(Long id, UpdateIncidentRequest request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        if (request.getTitle() != null) {
            incident.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            incident.setDescription(request.getDescription());
        }
        if (request.getSeverity() != null) {
            incident.setSeverity(request.getSeverity());
        }
        if (request.getAssignee() != null) {
            incident.setAssignee(request.getAssignee());
        }
        if (request.getStatus() != null) {
            String status = request.getStatus().toUpperCase();
            incident.setStatus(status);
            if ("RESOLVED".equals(status) || "CLOSED".equals(status)) {
                incident.setResolvedAt(LocalDateTime.now());
            }
        }

        Incident saved = incidentRepository.save(incident);
        logActivity("INCIDENT_UPDATED", saved, "Incident updated: " + saved.getStatus());
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        incidentRepository.delete(incident);
        logActivity("INCIDENT_DELETED", incident, "Incident deleted: " + incident.getTitle());
    }

    public List<Incident> getAll() {
        return incidentRepository.findAll();
    }

    public List<Incident> getActive() {
        return incidentRepository.findActiveIncidents();
    }

    public Incident getById(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
    }

    public long countActive() {
        return incidentRepository.countByStatusIn(List.of("OPEN", "INVESTIGATING"));
    }

    private void logActivity(String action, Incident incident, String description) {
        ActivityLog activity = new ActivityLog();
        activity.setAction(action);
        activity.setServiceName(incident.getServiceName());
        activity.setServiceType("incident");
        activity.setDescription(description);
        activity.setUser("system");
        activityLogRepository.save(activity);
    }
}
