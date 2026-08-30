// scripts/seed-db.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the CSV price list
const csvPath = path.resolve(__dirname, '..', 'AXON TECH WEB PRICE LIST(AUGUST 2026).csv');
const dbPath = path.resolve(process.cwd(), 'db.json');

// Helper to slugify product names for IDs
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

// Simple CSV parser – handles commas inside quotes
function parseCsv(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  const rows: string[][] = [];
  for (const line of lines) {
    const cols: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === ',' && !inQuotes) {
        cols.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());
    rows.push(cols);
  }
  return rows;
}

function extractColors(name: string): string[] {
  const match = name.match(/\(([^)]+)\)/);
  if (!match) return [];
  return match[1]
    .split(/[\/,&]+/)
    .map(c => c.trim())
    .filter(Boolean);
}

function extractStorage(name: string): string | null {
  // Look for patterns like '1tb', '512gb', etc.
  const m = name.toLowerCase().match(/(\d+\s*tb|\d+\s*gb)/);
  return m ? m[0].replace(/\s+/g, '') : null;
}

function buildProduct(item: string, priceStr: string) {
  const priceKsh = Number(priceStr.replace(/[^0-9]/g, '')) || 0;
  const name = item.replace(/"/g, '').trim();
  const id = slugify(name);
  const brand = name.toLowerCase().includes('iphone') ? 'Apple' : name.toLowerCase().includes('samsung') ? 'Samsung' : 'Unknown';
  const category = 'Phones';
  const colors = extractColors(name);
  const storage = extractStorage(name);
  const storages = storage ? [storage.toUpperCase()] : [];

  const variant = {
    storage: storage ? storage.toUpperCase() : 'DEFAULT',
    color: colors.length ? colors[0] : 'DEFAULT',
    priceKsh,
    stock: 10,
  };

  return {
    id,
    name,
    price: priceKsh / 1000,
    priceKsh,
    description: `${name} – imported from price list.`,
    category,
    brand,
    image: '',
    colors,
    storages,
    rating: 4.5,
    reviewsCount: 0,
    inStock: true,
    isNew: false,
    isBestSeller: false,
    specifications: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    baseName: '',
    variants: [variant],
    colorImages: {},
    colorCodes: {},
    storageVariants: [variant],
    warranties: [],
    images: [],
    variantImages: {},
  };
}

function main() {
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCsv(csvContent);
  // The CSV contains two side‑by‑side tables: ITEM,PRICE,,ITEM,PRICE
  const products: any[] = [];
  for (const row of rows) {
    if (row[0] && row[1]) {
      products.push(buildProduct(row[0], row[1]));
    }
    if (row[3] && row[4]) {
      products.push(buildProduct(row[3], row[4]));
    }
  }

  const dbPath = path.resolve(process.cwd(), 'db.json');
  let db: any = {};
  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }
  db.products = products;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Seeded ${products.length} products into db.json`);
}

main();
