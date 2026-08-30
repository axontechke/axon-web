-- Migration 0021: hasVariants toggle + product-level stock
-- Adds a boolean to control whether a product uses the storage/SIM variant matrix.
-- When OFF, the product is a single SKU with optional storage, SIM type, and stock at product level.

ALTER TABLE products ADD COLUMN hasVariants INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;

-- Backfill: products with existing storageVariants should have hasVariants = 1
UPDATE products SET hasVariants = 1 WHERE storageVariants IS NOT NULL AND storageVariants != '[]' AND storageVariants != '';
