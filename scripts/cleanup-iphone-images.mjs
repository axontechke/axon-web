/**
 * Remove backfilled iPhone image URLs from product.images arrays.
 * Uses the live API to fetch and update each product.
 */
const API = 'https://website.axontech254.workers.dev';

const IPHONE_URLS = new Set([
  'https://res.cloudinary.com/ekyn0dyx/image/upload/v1787270173/appple-iphone-17-pro-max-cosmic-orange-official-image.webp',
  'https://res.cloudinary.com/ekyn0dyx/image/upload/v1787270400/iphone-17-blue.webp',
  'https://res.cloudinary.com/ekyn0dyx/image/upload/v1787269477/iphone-17-pro-max-silver.jpg',
]);

async function main() {
  // Fetch all products
  const res = await fetch(`${API}/api/products`);
  const products = await res.json();
  
  let cleaned = 0;
  for (const p of products) {
    if (p.category !== 'Phones' || !p.images?.length) continue;
    
    const original = [...p.images];
    const filtered = p.images.filter(url => !IPHONE_URLS.has(url));
    
    if (filtered.length !== original.length) {
      // Update via admin API (needs auth - use direct DB approach instead)
      console.log(`${p.id}: ${original.length} -> ${filtered.length} images`);
      cleaned++;
    }
  }
  
  console.log(`\n${cleaned} products need cleaning`);
}

main().catch(console.error);
