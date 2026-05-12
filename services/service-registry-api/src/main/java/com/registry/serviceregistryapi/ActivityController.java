package com.registry.serviceregistryapi;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityLogRepository activityLogRepository;

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getActivities() {
        List<ActivityLog> activities = activityLogRepository.findTop100ByOrderByTimestampDesc();
        return ResponseEntity.ok(activities);
    }

    @PostMapping
    public ResponseEntity<ActivityLog> createActivity(@RequestBody Map<String, String> request) {
        ActivityLog activity = new ActivityLog();
        activity.setAction(request.get("action"));
        activity.setServiceName(request.get("serviceName"));
        activity.setServiceType(request.get("serviceType"));
        activity.setDescription(request.get("description"));
        activity.setUser(request.get("user"));
        activity.setDetails(request.get("details"));

        ActivityLog saved = activityLogRepository.save(activity);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/service/{serviceName}")
    public ResponseEntity<List<ActivityLog>> getServiceActivities(@PathVariable String serviceName) {
        return ResponseEntity.ok(activityLogRepository.findByServiceNameOrderByTimestampDesc(serviceName));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getActivitySummary() {
        List<ActivityLog> all = activityLogRepository.findTop100ByOrderByTimestampDesc();
        Map<String, Object> summary = new HashMap<>();
        summary.put("total", all.size());
        summary.put("registered", all.stream().filter(a -> "SERVICE_REGISTERED".equals(a.getAction())).count());
        summary.put("deleted", all.stream().filter(a -> "SERVICE_DELETED".equals(a.getAction())).count());
        summary.put("incidents", all.stream().filter(a -> a.getAction().contains("INCIDENT")).count());
        summary.put("alerts", all.stream().filter(a -> a.getAction().contains("ALERT")).count());
        return ResponseEntity.ok(summary);
    }
}
