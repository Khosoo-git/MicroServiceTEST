package com.registry.serviceregistryapi;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @GetMapping
    public ResponseEntity<List<Incident>> getAll(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        if (activeOnly) {
            return ResponseEntity.ok(incidentService.getActive());
        }
        return ResponseEntity.ok(incidentService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getById(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> stats() {
        return ResponseEntity.ok(Map.of("active", incidentService.countActive()));
    }

    @PostMapping
    public ResponseEntity<Incident> create(@Valid @RequestBody CreateIncidentRequest request) {
        return ResponseEntity.ok(incidentService.create(request, "MANUAL"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Incident> update(
            @PathVariable Long id,
            @RequestBody UpdateIncidentRequest request) {
        return ResponseEntity.ok(incidentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        incidentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
