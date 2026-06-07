package com.registry.serviceregistryapi;

import org.springframework.stereotype.Component;

@Component
public class MonitoringModeResolver {

    public String resolve(RegisterServiceRequest request) {
        if (request.getMonitoringMode() != null && !request.getMonitoringMode().isBlank()) {
            return request.getMonitoringMode().toUpperCase();
        }

        String type = request.getServiceType() != null ? request.getServiceType().toLowerCase() : "";

        if ("external".equals(type)) {
            return MonitoringMode.HTTP_PROBE;
        }

        if (request.getTargetUrl() != null && !request.getTargetUrl().isBlank()) {
            return MonitoringMode.HTTP_PROBE;
        }

        if (Boolean.FALSE.equals(request.getMetricsEnabled())) {
            if ("cloud".equals(type) || "api".equals(type) || "web".equals(type)) {
                return MonitoringMode.HTTP_PROBE;
            }
        }

        if (Boolean.TRUE.equals(request.getTracingEnabled())
                && !Boolean.TRUE.equals(request.getMetricsEnabled())
                && !Boolean.TRUE.equals(request.getLogsEnabled())) {
            return MonitoringMode.OTLP_PUSH;
        }

        return MonitoringMode.METRICS_SCRAPE;
    }

    public boolean isHttpProbe(RegisteredService service) {
        return MonitoringMode.HTTP_PROBE.equalsIgnoreCase(service.getMonitoringMode());
    }

    public boolean isMetricsScrape(RegisteredService service) {
        return MonitoringMode.METRICS_SCRAPE.equalsIgnoreCase(service.getMonitoringMode());
    }

    public boolean isOtlpPush(RegisteredService service) {
        return MonitoringMode.OTLP_PUSH.equalsIgnoreCase(service.getMonitoringMode());
    }
}
