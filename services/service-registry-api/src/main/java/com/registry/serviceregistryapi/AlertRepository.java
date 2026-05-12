package com.registry.serviceregistryapi;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByStatusOrderByFiredAtDesc(String status);

    List<Alert> findBySeverityOrderByFiredAtDesc(String severity);

    List<Alert> findByServiceNameOrderByFiredAtDesc(String serviceName);

    @Query("SELECT a FROM Alert a WHERE a.status = 'FIRING' ORDER BY a.firedAt DESC")
    List<Alert> findActiveAlerts();

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.status = 'FIRING'")
    long countActiveAlerts();

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.severity = 'critical' AND a.status = 'FIRING'")
    long countCriticalAlerts();
}
