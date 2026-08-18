-- Migration 0005: Product Variants + Multi-Image Support
-- Stores per-storage+color variant prices and optional images per combination

-- 1. Add variants JSON column to products (stores VariantMap: { "512GB": { "Blue,Silver": 210000 } })
ALTER TABLE products ADD COLUMN variants TEXT DEFAULT '{}';

-- 2. Product variant images: multiple images per (productId, storage, color) combination
CREATE TABLE IF NOT EXISTS product_variant_images (
  id TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  storage TEXT DEFAULT '',       -- e.g. "128GB", "256GB", or "" for base product
  color TEXT DEFAULT '',         -- e.g. "Obsidian", "Pearl", or "" for base product
  imageUrl TEXT NOT NULL,
  sortOrder INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Index for fast lookups by product+storage+color
CREATE INDEX IF NOT EXISTS idx_pvi_product ON product_variant_images(productId);
CREATE INDEX IF NOT EXISTS idx_pvi_lookup ON product_variant_images(productId, storage, color);
