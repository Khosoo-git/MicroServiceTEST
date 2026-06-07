package com.registry.serviceregistryapi;

import org.springframework.stereotype.Component;

@Component
public class TargetUrlBuilder {

    public String buildProbeUrl(RegisteredService service) {
        if (service.getTargetUrl() != null && !service.getTargetUrl().isBlank()) {
            return normalizeUrl(service.getTargetUrl());
        }
        return buildFromHostPort(service.getHost(), service.getPort(), service.getScheme());
    }

    public String buildHealthUrl(RegisteredService service) {
        if (isHttpProbe(service)) {
            String probe = buildProbeUrl(service);
            if (service.getHealthCheckEndpoint() != null
                    && !service.getHealthCheckEndpoint().isBlank()
                    && !"/".equals(service.getHealthCheckEndpoint())
                    && !"/actuator/health".equals(service.getHealthCheckEndpoint())) {
                return appendPath(probe, service.getHealthCheckEndpoint());
            }
            return probe;
        }

        String scheme = schemeOrDefault(service.getScheme(), service.getPort());
        String base = scheme + "://" + stripScheme(service.getHost()) + ":" + service.getPort();
        String path = service.getHealthCheckEndpoint() != null ? service.getHealthCheckEndpoint() : "/actuator/health";
        return base + path;
    }

    public String buildMetricsTarget(RegisteredService service) {
        String scheme = schemeOrDefault(service.getScheme(), service.getPort());
        return stripScheme(service.getHost()) + ":" + service.getPort();
    }

    private boolean isHttpProbe(RegisteredService service) {
        return MonitoringMode.HTTP_PROBE.equalsIgnoreCase(service.getMonitoringMode());
    }

    private String buildFromHostPort(String host, Integer port, String scheme) {
        String h = stripScheme(host);
        if (host.startsWith("http://") || host.startsWith("https://")) {
            if (port != null && port != 80 && port != 443) {
                return host + ":" + port;
            }
            return host;
        }
        String s = schemeOrDefault(scheme, port);
        if (port == null || port == 80 || port == 443) {
            return s + "://" + h;
        }
        return s + "://" + h + ":" + port;
    }

    private String schemeOrDefault(String scheme, Integer port) {
        if (scheme != null && !scheme.isBlank()) {
            return scheme.toLowerCase();
        }
        return (port != null && port == 443) ? "https" : "http";
    }

    private String stripScheme(String host) {
        if (host.startsWith("https://")) {
            return host.substring(8);
        }
        if (host.startsWith("http://")) {
            return host.substring(7);
        }
        return host;
    }

    private String normalizeUrl(String url) {
        String trimmed = url.trim();
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            return "https://" + trimmed;
        }
        return trimmed;
    }

    private String appendPath(String base, String path) {
        if (path.startsWith("/")) {
            int schemeEnd = base.indexOf("://");
            if (schemeEnd > 0) {
                String rest = base.substring(schemeEnd + 3);
                int slash = rest.indexOf('/');
                if (slash >= 0) {
                    base = base.substring(0, schemeEnd + 3 + slash);
                }
            }
            return base.replaceAll("/$", "") + path;
        }
        return base + "/" + path;
    }
}
