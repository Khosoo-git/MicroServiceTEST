package com.registry.serviceregistryapi;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RegisteredServiceController {

    private final RegisteredServiceService service;
    private final ObservabilityConfigService configService;

    @PostMapping
    public ResponseEntity<RegisteredService> registerService(
            @Valid @RequestBody RegisterServiceRequest request) {
        RegisteredService registered = service.registerService(request);
        return ResponseEntity.created(
                URI.create("/api/services/" + registered.getId())
        ).body(registered);
    }

    @GetMapping
    public ResponseEntity<List<RegisteredService>> getAllServices() {
        return ResponseEntity.ok(service.getAllServices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegisteredService> getService(@PathVariable Long id) {
        return ResponseEntity.ok(service.getService(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeService(@PathVariable Long id) {
        service.removeService(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh-configs")
    public ResponseEntity<Void> refreshConfigs() {
        configService.updateAllConfigs();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getServiceTypes() {
        return ResponseEntity.ok(List.of(
                "web", "application", "system", 
                "mobile-api", "backend", "worker", "other"
        ));
    }
}
