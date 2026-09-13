-- Remove backfilled iPhone URLs from product images
-- Stored format: ["url1","url2"] with literal backslash-quotes

-- apple-17-pro-max-itb: all 3 are backfilled, clear entirely
UPDATE products SET images = '[]' WHERE id = 'apple-17-pro-max-itb';

-- product-1787537325944-7453: all 3 are backfilled, clear entirely
UPDATE products SET images = '[]' WHERE id = 'product-1787537325944-7453';

-- samsung-fold-7: remove 3 backfilled from middle/end
UPDATE products SET images = REPLACE(images, ',"https://res.cloudinary.com/ekyn0dyx/image/upload/v1787270173/appple-iphone-17-pro-max-cosmic-orange-official-image.webp"', '') WHERE id = 'samsung-fold-7';
UPDATE products SET images = REPLACE(images, ',"https://res.cloudinary.com/ekyn0dyx/image/upload/v1787269477/iphone-17-pro-max-silver.jpg"', '') WHERE id = 'samsung-fold-7';
UPDATE products SET images = REPLACE(images, ',"https://res.cloudinary.com/ekyn0dyx/image/upload/v1787270400/iphone-17-blue.webp"', '') WHERE id = 'samsung-fold-7';

-- samsung-s26-ultra: remove 3 backfilled from middle/end
UPDATE products SET images = REPLACE(images, ',"https://res.cloudinary.com/ekyn0dyx/image/upload/v1787269477/iphone-17-pro-max-silver.jpg"', '') WHERE id = 'samsung-s26-ultra';
UPDATE products SET images = REPLACE(images, ',"https://res.cloudinary.com/ekyn0dyx/image/upload/v1787270173/appple-iphone-17-pro-max-cosmic-orange-official-image.webp"', '') WHERE id = 'samsung-s26-ultra';
UPDATE products SET images = REPLACE(images, ',"https://res.cloudinary.com/ekyn0dyx/image/upload/v1787270400/iphone-17-blue.webp"', '') WHERE id = 'samsung-s26-ultra';
