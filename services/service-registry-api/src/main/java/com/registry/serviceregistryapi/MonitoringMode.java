package com.registry.serviceregistryapi;

/**
 * How a registered system is observed in production.
 * <ul>
 *   <li>HTTP_PROBE – any public URL/API (blackbox), no agent on target host</li>
 *   <li>METRICS_SCRAPE – Prometheus endpoint reachable from Alloy (private IP, DNS, Docker)</li>
 *   <li>OTLP_PUSH – app pushes telemetry to Alloy (firewall-friendly)</li>
 * </ul>
 */
public final class MonitoringMode {

    public static final String HTTP_PROBE = "HTTP_PROBE";
    public static final String METRICS_SCRAPE = "METRICS_SCRAPE";
    public static final String OTLP_PUSH = "OTLP_PUSH";

    private MonitoringMode() {
    }
}
