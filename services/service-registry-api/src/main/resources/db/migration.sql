-- Schema upgrades for existing PostgreSQL databases (safe to re-run)

ALTER TABLE IF EXISTS registered_services ADD COLUMN IF NOT EXISTS monitoring_mode VARCHAR(64);
ALTER TABLE IF EXISTS registered_services ADD COLUMN IF NOT EXISTS target_url VARCHAR(2048);
ALTER TABLE IF EXISTS registered_services ADD COLUMN IF NOT EXISTS scheme VARCHAR(10);
ALTER TABLE IF EXISTS registered_services ADD COLUMN IF NOT EXISTS environment VARCHAR(64);

UPDATE registered_services
SET monitoring_mode = 'METRICS_SCRAPE'
WHERE monitoring_mode IS NULL;

UPDATE registered_services
SET monitoring_mode = 'HTTP_PROBE'
WHERE LOWER(service_type) = 'external';

UPDATE registered_services SET scheme = 'http' WHERE scheme IS NULL;
UPDATE registered_services SET environment = 'production' WHERE environment IS NULL;

ALTER TABLE registered_services ALTER COLUMN monitoring_mode SET DEFAULT 'METRICS_SCRAPE';

-- Incidents (production incident management)
CREATE TABLE IF NOT EXISTS incidents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    description TEXT,
    severity VARCHAR(32) NOT NULL DEFAULT 'warning',
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    service_name VARCHAR(255) NOT NULL,
    source_alert_id BIGINT,
    assignee VARCHAR(255),
    source VARCHAR(32) NOT NULL DEFAULT 'MANUAL',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_service ON incidents(service_name);
