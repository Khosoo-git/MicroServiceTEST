package com.apigateway.gateway;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Ingests JavaScript errors from third-party websites (embed snippet).
 * Events are written to application logs → Alloy/Promtail → Loki for search and dashboards.
 */
@RestController
@RequestMapping("/api/client-errors")
public class ClientErrorController {

	private static final Logger log = LoggerFactory.getLogger(ClientErrorController.class);
	private static final String LOKI_MARKER = "CLIENT_ERROR_JSON";

	private final ObjectMapper objectMapper;
	private final MeterRegistry meterRegistry;

	public ClientErrorController(ObjectMapper objectMapper, MeterRegistry meterRegistry) {
		this.objectMapper = objectMapper;
		this.meterRegistry = meterRegistry;
	}

	@PostMapping
	public ResponseEntity<Map<String, String>> ingest(
			@RequestBody ClientErrorReport body,
			HttpServletRequest request) {
		if (body.getMessage() == null || body.getMessage().isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("error", "message is required"));
		}

		String forwardedFor = request.getHeader("X-Forwarded-For");
		String remote = forwardedFor != null ? forwardedFor.split(",")[0].trim() : request.getRemoteAddr();

		Map<String, Object> envelope = new HashMap<>();
		envelope.put("marker", LOKI_MARKER);
		envelope.put("receivedAt", System.currentTimeMillis());
		envelope.put("clientIp", remote);
		envelope.put("payload", body);

		try {
			String json = objectMapper.writeValueAsString(envelope);
			log.warn("{} {}", LOKI_MARKER, json);
		} catch (JsonProcessingException e) {
			log.error("Failed to serialize client error", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "serialization failed"));
		}

		String site = body.getSiteKey() != null ? body.getSiteKey() : "unknown";
		meterRegistry.counter("browser.client.errors", "site_key", site).increment();

		return ResponseEntity.accepted().body(Map.of("status", "accepted"));
	}
}
