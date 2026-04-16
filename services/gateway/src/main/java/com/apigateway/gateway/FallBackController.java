package com.apigateway.gateway;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/fallback")
public class FallBackController {

    @GetMapping("/jobs")
    public ResponseEntity<String> jobServiceFallback() {
        // This is the shield! It instantly returns this instead of crashing.
        String errorMessage = "🛡️ GATEWAY SHIELD ACTIVATED: The Job Service is currently overloaded or down. Please try again in a few seconds.";
        
        return new ResponseEntity<>(errorMessage, HttpStatus.SERVICE_UNAVAILABLE);
    }
}