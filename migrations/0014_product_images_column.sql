-- Migration 0014: Add images column to products
-- Stores product-level image URLs as a JSON array: ["url1", "url2", ...]
ALTER TABLE products ADD COLUMN images TEXT DEFAULT '[]';
