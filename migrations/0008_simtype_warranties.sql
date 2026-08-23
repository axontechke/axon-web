-- Migration 0008: Add simType column to products table
ALTER TABLE products ADD COLUMN simType TEXT DEFAULT NULL;
