-- Migration 0010: Add storageVariants column to products table
-- Used for per-storage-per-SIM-type variants with their own colors, warranties, and prices
ALTER TABLE products ADD COLUMN storageVariants TEXT DEFAULT '[]';
