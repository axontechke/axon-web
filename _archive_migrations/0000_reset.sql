-- 0000_reset.sql – wipe the entire DB (run ONLY on the remote DB)
DROP TABLE IF EXISTS product_variant_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS config;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions;
