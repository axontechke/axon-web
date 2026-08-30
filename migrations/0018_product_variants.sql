-- Migration 0006: Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  storage TEXT NOT NULL,
  color TEXT NOT NULL,
  priceKsh INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(productId, storage, color)
);

-- Indexes for quick look‑ups
CREATE INDEX IF NOT EXISTS idx_pv_product ON product_variants(productId);
CREATE INDEX IF NOT EXISTS idx_pv_lookup ON product_variants(productId, storage, color);
