-- Migration 0012: Add top-level warranties column to products table
-- Stores product-level warranty plans: [{id, name, duration, priceKsh}, ...]
-- Previously warranties only existed inside storageVariants — now they live at product level too
ALTER TABLE products ADD COLUMN warranties TEXT DEFAULT '[]';
