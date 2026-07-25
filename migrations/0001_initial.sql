PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  card_json TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  published_at TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_venues_source_id ON venues(source_id);
CREATE INDEX IF NOT EXISTS idx_venues_updated_at ON venues(updated_at DESC);

CREATE TABLE IF NOT EXISTS ingestion_deliveries (
  delivery_id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  raw_payload TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  venue_id TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  error_message TEXT,
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_deliveries_status ON ingestion_deliveries(status, received_at DESC);

CREATE TABLE IF NOT EXISTS failure_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  delivery_id TEXT,
  source TEXT NOT NULL,
  raw_payload TEXT NOT NULL,
  error_code TEXT NOT NULL,
  error_message TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_failures_open ON failure_logs(resolved_at, created_at DESC);

CREATE TABLE IF NOT EXISTS correction_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venue_id TEXT NOT NULL,
  message TEXT NOT NULL,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_corrections_venue ON correction_requests(venue_id, created_at DESC);
