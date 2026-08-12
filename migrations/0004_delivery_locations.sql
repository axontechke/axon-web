-- Migration 0004: Add locations field to delivery_methods
-- Stores covered regions as JSON array: ["Kenya", "Uganda", "Tanzania", "East Africa"]

ALTER TABLE delivery_methods ADD COLUMN locations TEXT DEFAULT '[]';
