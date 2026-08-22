-- Migration 0006: Add colorCodes column to products
-- Stores hex color codes per color option: { "Obsidian": "#1a1a1a", "Pearl": "#f5f5f7" }

ALTER TABLE products ADD COLUMN colorCodes TEXT DEFAULT '{}';
