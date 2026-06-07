package com.registry.serviceregistryapi;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByStatusInOrderByCreatedAtDesc(List<String> statuses);

    @Query("SELECT i FROM Incident i WHERE i.status IN ('OPEN', 'INVESTIGATING') ORDER BY i.createdAt DESC")
    List<Incident> findActiveIncidents();

    Optional<Incident> findFirstByServiceNameAndStatusInAndSourceAlertId(
            String serviceName, List<String> statuses, Long sourceAlertId);

    long countByStatusIn(List<String> statuses);
}
