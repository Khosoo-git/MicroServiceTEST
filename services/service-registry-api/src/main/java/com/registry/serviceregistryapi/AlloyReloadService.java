package com.registry.serviceregistryapi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlloyReloadService {

    private final WebClient.Builder webClientBuilder;

    @Value("${observability.alloy.reload-url:http://alloy:1234/-/reload}")
    private String reloadUrl;

    public void reload() {
        try {
            webClientBuilder.build()
                    .post()
                    .uri(reloadUrl)
                    .retrieve()
                    .toBodilessEntity()
                    .block(Duration.ofSeconds(10));
            log.info("Alloy configuration reloaded successfully");
        } catch (Exception e) {
            log.warn("Alloy reload failed (dynamic config was written; restart alloy container if needed): {}",
                    e.getMessage());
        }
    }
}
