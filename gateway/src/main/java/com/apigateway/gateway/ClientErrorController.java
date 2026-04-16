package com.apigateway.gateway;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ClientErrorController {

    private static final Logger log = LoggerFactory.getLogger(ClientErrorController.class);

    @PostMapping("/client-errors")
    public ResponseEntity<Map<String, Object>> receiveClientError(@RequestBody Map<String, String> errorData) {
        // Add timestamp and metadata
        Map<String, Object> enrichedError = new HashMap<>();
        enrichedError.put("receivedAt", Instant.now().toString());
        enrichedError.put("message", errorData.get("message"));
        enrichedError.put("pageUrl", errorData.get("pageUrl"));
        enrichedError.put("siteKey", errorData.get("siteKey"));
        enrichedError.put("stack", errorData.get("stack"));
        
        // Log as JSON for Loki parsing
        String jsonLog = "CLIENT_ERROR_JSON " + enrichedError.toString();
        log.info(jsonLog);
        
        return ResponseEntity.accepted().body(enrichedError);
    }
}
