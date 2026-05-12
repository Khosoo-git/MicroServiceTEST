package com.registry.serviceregistryapi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/proxy")
@RequiredArgsConstructor
@Slf4j
public class ProxyController {

    private final WebClient.Builder webClientBuilder;

    /**
     * Proxy requests to Loki to avoid CORS issues
     */
    @GetMapping("/loki")
    public ResponseEntity<String> proxyLoki(
            @RequestParam String filename,
            @RequestParam Long start,
            @RequestParam Long end,
            @RequestParam(defaultValue = "100") Integer limit) {
        try {
            log.info("Proxying Loki request: filename={}, start={}, end={}", filename, start, end);

            // Extract service name from filename for job label
            // e.g., "/logs/company.log" -> job="company"
            // e.g., "company.log" -> job="company"
            String logFilename = filename;
            if (!logFilename.startsWith("/logs/")) {
                logFilename = "/logs/" + logFilename;
            }

            // Extract job name from filename
            String jobName = logFilename
                    .replace("/logs/", "")
                    .replace(".log", "");

            // Build Loki query using job label (as defined in Alloy config)
            String query = String.format("{job=\"%s\"}", jobName);
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);

            // Build full Loki URL
            String url = String.format(
                    "http://loki:3100/loki/api/v1/query_range?query=%s&start=%d&end=%d&limit=%d",
                    encodedQuery, start, end, limit);

            log.debug("Fetching from: {}", url);

            // Proxy the request and return as string
            String response = webClientBuilder.build()
                    .get()
                    .uri(URI.create(url))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.debug("Loki response: {}", response);

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .header("Access-Control-Allow-Origin", "*")
                    .body(response);
        } catch (Exception e) {
            log.error("Failed to proxy Loki request", e);
            return ResponseEntity.internalServerError()
                    .header("Access-Control-Allow-Origin", "*")
                    .body("{\"error\": \"Failed to proxy Loki request: " + e.getMessage() + "\"}");
        }
    }

    /**
     * Proxy requests to Tempo to avoid CORS issues
     */
    @GetMapping("/tempo")
    public ResponseEntity<String> proxyTempo(
            @RequestParam(required = false) String service,
            @RequestParam(required = false, defaultValue = "20") Integer limit) {
        try {
            log.info("Proxying Tempo request: service={}", service);

            long now = System.currentTimeMillis() / 1000;
            long start = now - 7200; // 2 hours ago

            StringBuilder url = new StringBuilder(
                    String.format("http://tempo:3200/api/search?start=%d&end=%d&limit=%d", start, now, limit));

            if (service != null && !service.isEmpty()) {
                url.append("&service=").append(URLEncoder.encode(service, StandardCharsets.UTF_8));
            }

            log.debug("Fetching from: {}", url);

            // Proxy the request and return as string
            String response = webClientBuilder.build()
                    .get()
                    .uri(URI.create(url.toString()))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.debug("Tempo response: {}", response);

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .header("Access-Control-Allow-Origin", "*")
                    .body(response);
        } catch (Exception e) {
            log.error("Failed to proxy Tempo request", e);
            return ResponseEntity.internalServerError()
                    .header("Access-Control-Allow-Origin", "*")
                    .body("{\"error\": \"Failed to proxy Tempo request: " + e.getMessage() + "\"}");
        }
    }
}
