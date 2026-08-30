-- Migration 0020: Globalize color names — strip iPhone prefix, deduplicate
--
-- The global_colors table previously had entries like "iPhone 11 Black", "iPhone 17 Cosmic Orange".
-- Colors should be global (not tied to a phone series). This migration:
--   1. Updates all global_colors names to remove the "iPhone XX " prefix
--   2. Removes duplicate color rows (same stripped name) keeping the canonical row
--   3. Updates product JSON columns (storageVariants, variantImages, colorImages, colorCodes, colors, variants)
--   4. Updates orders JSON column (items[].color)
--   5. Updates product_variants table (color column)
--   6. Updates product_variant_images table (color column)

-- STEP 1: Update global_colors names — strip prefix
UPDATE global_colors SET name = REPLACE(name, 'iPhone 18 ', '') WHERE name LIKE 'iPhone 18 %';
UPDATE global_colors SET name = REPLACE(name, 'iPhone 17 ', '') WHERE name LIKE 'iPhone 17 %';
UPDATE global_colors SET name = REPLACE(name, 'iPhone 16 ', '') WHERE name LIKE 'iPhone 16 %';
UPDATE global_colors SET name = REPLACE(name, 'iPhone 15 ', '') WHERE name LIKE 'iPhone 15 %';
UPDATE global_colors SET name = REPLACE(name, 'iPhone 14 ', '') WHERE name LIKE 'iPhone 14 %';
UPDATE global_colors SET name = REPLACE(name, 'iPhone 13 ', '') WHERE name LIKE 'iPhone 13 %';
UPDATE global_colors SET name = REPLACE(name, 'iPhone 12 ', '') WHERE name LIKE 'iPhone 12 %';
UPDATE global_colors SET name = REPLACE(name, 'iPhone 11 ', '') WHERE name LIKE 'iPhone 11 %';

-- STEP 2: Remove duplicate colors — keep canonical row per stripped name
-- Canonical row = generic id (col-black, col-white, col-teal) or first iPhone-series row (col-11-*)
-- Merge strategy: product refs use color name, so duplicate names are already consistent.
-- Just remove the extra global_colors rows.

-- Black: keep col-black, remove col-11-black, col-12-black, col-15-black, col-16-black, col-17-black
DELETE FROM global_colors WHERE id IN ('col-11-black','col-12-black','col-15-black','col-16-black','col-17-black');
-- White: keep col-white, remove col-11-white, col-12-white, col-16-white, col-17-white
DELETE FROM global_colors WHERE id IN ('col-11-white','col-12-white','col-16-white','col-17-white');
-- Green: keep col-11-green, remove col-12-green, col-13-green, col-15-green
DELETE FROM global_colors WHERE id IN ('col-12-green','col-13-green','col-15-green');
-- Purple: keep col-11-purple, remove col-12-purple, col-14-purple
DELETE FROM global_colors WHERE id IN ('col-12-purple','col-14-purple');
-- Yellow: keep col-11-yellow, remove col-14-yellow, col-15-yellow
DELETE FROM global_colors WHERE id IN ('col-14-yellow','col-15-yellow');
-- Product RED: keep col-11-red, remove col-12-red, col-13-red, col-14-red
DELETE FROM global_colors WHERE id IN ('col-12-red','col-13-red','col-14-red');
-- Blue: keep col-12-blue, remove col-13-blue, col-14-blue, col-15-blue
DELETE FROM global_colors WHERE id IN ('col-13-blue','col-14-blue','col-15-blue');
-- Midnight: keep col-13-midnight, remove col-14-midnight
DELETE FROM global_colors WHERE id = 'col-14-midnight';
-- Starlight: keep col-13-starlight, remove col-14-starlight
DELETE FROM global_colors WHERE id = 'col-14-starlight';
-- Pink: keep col-13-pink, remove col-15-pink, col-16-pink
DELETE FROM global_colors WHERE id IN ('col-15-pink','col-16-pink');
-- Teal: keep col-teal, remove col-16-teal
DELETE FROM global_colors WHERE id = 'col-16-teal';

-- STEP 3: Update product JSON columns — strip iPhone prefix from color names
UPDATE products SET
  storageVariants = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    storageVariants,
    '"iPhone 18 ', '"'),
    '"iPhone 17 ', '"'),
    '"iPhone 16 ', '"'),
    '"iPhone 15 ', '"'),
    '"iPhone 14 ', '"'),
    '"iPhone 13 ', '"'),
    '"iPhone 12 ', '"'),
    '"iPhone 11 ', '"');

UPDATE products SET
  colorImages = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    colorImages,
    '"iPhone 18 ', '"'),
    '"iPhone 17 ', '"'),
    '"iPhone 16 ', '"'),
    '"iPhone 15 ', '"'),
    '"iPhone 14 ', '"'),
    '"iPhone 13 ', '"'),
    '"iPhone 12 ', '"'),
    '"iPhone 11 ', '"');

UPDATE products SET
  colorCodes = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    colorCodes,
    '"iPhone 18 ', '"'),
    '"iPhone 17 ', '"'),
    '"iPhone 16 ', '"'),
    '"iPhone 15 ', '"'),
    '"iPhone 14 ', '"'),
    '"iPhone 13 ', '"'),
    '"iPhone 12 ', '"'),
    '"iPhone 11 ', '"');

-- variantImages keys: "storage|iPhone XX Color" -> "storage|Color"
UPDATE products SET
  variantImages = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    variantImages,
    '|iPhone 18 ', '|'),
    '|iPhone 17 ', '|'),
    '|iPhone 16 ', '|'),
    '|iPhone 15 ', '|'),
    '|iPhone 14 ', '|'),
    '|iPhone 13 ', '|'),
    '|iPhone 12 ', '|'),
    '|iPhone 11 ', '|');

-- colors array (legacy): "iPhone XX Color" -> "Color"
UPDATE products SET
  colors = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    colors,
    'iPhone 18 ', ''),
    'iPhone 17 ', ''),
    'iPhone 16 ', ''),
    'iPhone 15 ', ''),
    'iPhone 14 ', ''),
    'iPhone 13 ', ''),
    'iPhone 12 ', ''),
    'iPhone 11 ', '');

-- variants array (legacy JSON): strip prefix from color values
UPDATE products SET
  variants = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    variants,
    '"iPhone 18 ', '"'),
    '"iPhone 17 ', '"'),
    '"iPhone 16 ', '"'),
    '"iPhone 15 ', '"'),
    '"iPhone 14 ', '"'),
    '"iPhone 13 ', '"'),
    '"iPhone 12 ', '"'),
    '"iPhone 11 ', '"');

-- STEP 4: Update orders JSON (items[].color)
UPDATE orders SET
  items = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    items,
    'iPhone 18 ', ''),
    'iPhone 17 ', ''),
    'iPhone 16 ', ''),
    'iPhone 15 ', ''),
    'iPhone 14 ', ''),
    'iPhone 13 ', ''),
    'iPhone 12 ', ''),
    'iPhone 11 ', '');

-- STEP 5: Update product_variants table (if populated)
UPDATE product_variants SET
  color = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    color,
    'iPhone 18 ', ''),
    'iPhone 17 ', ''),
    'iPhone 16 ', ''),
    'iPhone 15 ', ''),
    'iPhone 14 ', ''),
    'iPhone 13 ', ''),
    'iPhone 12 ', ''),
    'iPhone 11 ', '');

-- STEP 6: Update product_variant_images table (if populated)
UPDATE product_variant_images SET
  color = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    color,
    'iPhone 18 ', ''),
    'iPhone 17 ', ''),
    'iPhone 16 ', ''),
    'iPhone 15 ', ''),
    'iPhone 14 ', ''),
    'iPhone 13 ', ''),
    'iPhone 12 ', ''),
    'iPhone 11 ', '');
