-- Migration 0003: Add colorImages column to products
-- Stores per-color product image URLs: { "Teal": "https://...", "Silver": "https://..." }

ALTER TABLE products ADD COLUMN colorImages TEXT DEFAULT '{}';
