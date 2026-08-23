-- Migration 0008: Add simType column to products table
ALTER TABLE products ADD COLUMN simType TEXT DEFAULT NULL;
-- Note: warrantyPriceKsh is stored as JSON in the variants column, not a separate column
