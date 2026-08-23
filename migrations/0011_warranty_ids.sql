-- Migration 0011: Warranty pool — storageVariants now use warrantyIds instead of embedded warranty objects
--
-- Existing storageVariants JSON in DB has "warranties": [{id, name, duration, priceKsh}, ...]
-- This renames the field to "warrantyIds" in the JSON. The frontend normalization
-- (handleOpenEditProduct) further converts full warranty objects to ID strings on next load,
-- and the new UI writes warrantyIds: ["id1", "id2"] on save.

UPDATE products
SET storageVariants = REPLACE(storageVariants, '"warranties"', '"warrantyIds"')
WHERE storageVariants LIKE '%warranties%';
