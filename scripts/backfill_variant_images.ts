// Backfill missing product_variant_images rows for phone products
// Usage: node scripts/backfill_variant_images.ts
import { execSync } from "child_process";

function runQuery(sql: string): any[] {
  const cmd = `wrangler d1 execute axon-tech-db --remote --command "${sql}"`;
  const out = execSync(cmd, { encoding: "utf8" });
  const match = out.match(/\[\s*{[\s\S]*}\s*\]/);
  if (!match) throw new Error("Failed to parse D1 output");
  return JSON.parse(match[0])[0].results;
}

// 1️⃣ Get phone products without any variant images
const missingProducts = runQuery(
  `SELECT p.id FROM products p WHERE p.category='Phones' AND NOT EXISTS (SELECT 1 FROM product_variant_images vi WHERE vi.productId = p.id);`
);
console.log("Missing products count:", missingProducts.length);

if (missingProducts.length === 0) {
  console.log("All phone products already have variant images. Exiting.");
  process.exit(0);
}

// 2️⃣ Get reference variant rows from iPhone 17 Pro Max
const referenceRows = runQuery(
  `SELECT storage, color, imageUrl, sortOrder FROM product_variant_images WHERE productId='product-1787537325944-7453';`
);

// 3️⃣ Build INSERT statements for each missing product
let inserts: string[] = [];
const now = new Date().toISOString().replace(' ', 'T').slice(0, 19).replace('T', ' ');
let counter = 1;
for (const prod of missingProducts) {
  const productId = prod.id;
  for (const ref of referenceRows) {
    const newId = `pvi-${Date.now()}-${counter}`;
    counter++;
    const sql = `INSERT INTO product_variant_images (id, productId, storage, color, imageUrl, sortOrder, createdAt) VALUES ('${newId}', '${productId}', '${ref.storage}', '${ref.color}', '${ref.imageUrl.replace(/'/g, "''")}', ${ref.sortOrder || 0}, '${now}');`;
    inserts.push(sql);
  }
}

// 4️⃣ Execute each insert individually to avoid command-line length limits
for (let i = 0; i < inserts.length; i++) {
  console.log(`Inserting ${i + 1}/${inserts.length}`);
  runQuery(inserts[i]);
}
console.log(`Inserted ${inserts.length} variant image rows.`);
