package com.registry.serviceregistryapi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ObservabilityConfigService {

    @Value("${observability.config_dir:/observability}")
    private String observabilityConfigDir;

    private final RegisteredServiceRepository repository;

    public void updateAllConfigs() {
        try {
            updatePrometheusConfig();
            updateAlloyConfig();
            log.info("Updated all observability configurations");
        } catch (Exception e) {
            log.warn("Config update failed (this is OK for development): {}", e.getMessage());
            // Don't throw - config update is optional
        }
    }

    public void updatePrometheusConfig() {
        try {
            List<RegisteredService> services = repository.findAll().stream()
                    .filter(RegisteredService::getMetricsEnabled)
                    .collect(Collectors.toList());

            StringBuilder sb = new StringBuilder();
            sb.append("- targets:\n");

            for (RegisteredService service : services) {
                sb.append("    - \"").append(service.getHost())
                  .append(":").append(service.getPort()).append("\"\n");
            }

            Path prometheusPath = Paths.get(observabilityConfigDir, "prometheus/user-services.yml");
            Files.writeString(prometheusPath, sb.toString());

            log.info("Updated Prometheus config with {} user services", services.size());

        } catch (IOException e) {
            log.error("Failed to update Prometheus config", e);
            throw new RuntimeException("Failed to update Prometheus config", e);
        }
    }

    public void updateAlloyConfig() {
        try {
            List<RegisteredService> services = repository.findAll().stream()
                    .filter(RegisteredService::getLogsEnabled)
                    .collect(Collectors.toList());

            StringBuilder sb = new StringBuilder();
            sb.append("// Read log files from /logs folder\n");
            sb.append("loki.source.file \"logs\" {\n");
            sb.append("  targets = [\n");

            // Built-in services
            sb.append("    { __path__ = \"/logs/company.log\", job = \"company\" },\n");
            sb.append("    { __path__ = \"/logs/job.log\", job = \"job\" },\n");
            sb.append("    { __path__ = \"/logs/review.log\", job = \"review\" },\n");
            sb.append("    { __path__ = \"/logs/gateway.log\", job = \"gateway\" },\n");

            // User-registered services
            for (RegisteredService service : services) {
                String logFile = "/logs/" + service.getServiceName().toLowerCase() + ".log";
                String jobName = service.getServiceName().toLowerCase().replaceAll("[^a-z0-9]", "_");
                sb.append("    { __path__ = \"").append(logFile)
                  .append("\", job = \"").append(jobName).append("\" },\n");
            }

            // Remove trailing comma and close
            String content = sb.toString();
            if (content.endsWith(",\n")) {
                content = content.substring(0, content.length() - 2) + "\n";
            }
            content += "  ]\n";
            content += "  forward_to = [loki.write.lokiwrite.receiver]\n";
            content += "}\n\n";

            content += "// Write logs to Loki\n";
            content += "loki.write \"lokiwrite\" {\n";
            content += "  endpoint {\n";
            content += "    url = \"http://loki:3100/loki/api/v1/push\"\n";
            content += "    tenant_id = \"fake\"\n";
            content += "  }\n";
            content += "}\n";

            Path alloyPath = Paths.get(observabilityConfigDir, "alloy/config.alloy");
            Files.writeString(alloyPath, content);

            log.info("Updated Alloy config with {} user services", services.size());

        } catch (IOException e) {
            log.error("Failed to update Alloy config", e);
            throw new RuntimeException("Failed to update Alloy config", e);
        }
    }
}
