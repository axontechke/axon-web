-- Migration 0019: Global SIM Types Library
-- Allows admins to CRUD SIM types used across storageVariants.
-- Keeps website generic for phones, tablets, laptops, watches, routers etc.
CREATE TABLE IF NOT EXISTS global_sim_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,        -- Display name e.g. "Physical SIM", "eSIM", "Dual SIM"
  code TEXT NOT NULL DEFAULT '', -- Stored value e.g. "physical", "esim", "both" — used in storageVariants.simType
  description TEXT NOT NULL DEFAULT ''
);

-- Seed initial SIM types (backward compatible with existing products)
INSERT OR IGNORE INTO global_sim_types (id, name, code, description) VALUES
('sim-physical', 'Physical SIM', 'physical', 'Traditional nano/micro SIM card'),
('sim-esim', 'eSIM', 'esim', 'Embedded digital SIM'),
('sim-both', 'Dual SIM (Physical + eSIM)', 'both', 'Supports both physical and eSIM'),
('sim-none', 'No SIM / WiFi Only', 'none', 'WiFi-only devices like tablets or laptops'),
('sim-dual-physical', 'Dual Physical SIM', 'dual-physical', 'Two physical SIM slots');
