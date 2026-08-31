/**
 * Import and group phone products from price list xlsx into D1 via wrangler.
 * Run: node scripts/import-products.mjs
 */

import XLSX from 'xlsx';
import { execSync } from 'child_process';

const KES_TO_USD = 130;
const DB_NAME = 'axon-tech-db';

const wb = XLSX.readFile("AXON TECH WEB PRICE LIST(AUGUST 2026).xlsx");
const sheet = wb.Sheets[wb.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const IMAGES = {
  Apple:   'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
  Samsung: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
  Google:  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
  OnePlus: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
  Nothing: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  Other:   '',
};

function parseRows() {
  const items = [];
  let section = '';
  for (const row of raw) {
    const [col0, col1, , col3, col4] = row;
    const itemA = col0?.toString().trim() || '';
    const itemB = col3?.toString().trim() || '';
    const priceA = typeof col1 === 'number' ? col1 : null;
    const priceB = typeof col4 === 'number' ? col4 : null;

    if (itemA === 'APPLE') { section = 'Apple'; continue; }
    else if (itemA === 'SAMSUNG') { section = 'Samsung'; continue; }
    else if (itemA === 'GOOGLE PIXEL') { section = 'Google'; continue; }
    else if (itemA === 'ONE PLUS') { section = 'OnePlus'; continue; }
    else if (itemA === 'NOTHING GLOBAL' || itemB === 'NOTHING GLOBAL') { section = 'Nothing'; continue; }

    if (itemA === 'ITEM' || itemB === 'ITEM') continue;
    if (itemA.includes('WARRANTY') || itemB.includes('WARRANTY')) continue;
    if (!itemA && !itemB) continue;

    if (itemA && priceA) items.push({ name: itemA, price: priceA, section });
    if (itemB && priceB) items.push({ name: itemB, price: priceB, section });
  }
  return items;
}

function extractMeta(name) {
  const original = name.toUpperCase();

  let brand = 'Other';
  if (/APPLE|iPhone/i.test(original)) brand = 'Apple';
  else if (/SAMSUNG|GALAXY|S26|S25|S24|FOLD|A0[5-9]|A1[0-9]|A2[0-9]/i.test(original)) brand = 'Samsung';
  else if (/PIXEL/i.test(original)) brand = 'Google';
  else if (/ONE\s*PLUS|ONEPLUS/i.test(original)) brand = 'OnePlus';
  else if (/NOTHING/i.test(original)) brand = 'Nothing';

  let storage = null;
  const tbMatch = name.match(/\b(\d+)\s*TB\b/i);
  if (tbMatch) storage = `${tbMatch[1]}TB`;
  else {
    const gbMatch = name.match(/\b(\d+)\s*GB\b/i);
    if (gbMatch) storage = `${gbMatch[1]}GB`;
  }

  const ramMatch = name.match(/(\d+)\s*[\/]\s*(\d+)\s*GB/i) || name.match(/(\d+)\s*GB\s*RAM/i);
  const ram = ramMatch ? `${ramMatch[1]}GB` : null;

  const colorMap = {
    ORANGE: 'Orange', BLUE: 'Blue', SILVER: 'Silver', BLACK: 'Black', BLK: 'Black',
    GREEN: 'Green', WHITE: 'White', GRAY: 'Gray', GREY: 'Gray', TEAL: 'Teal',
    COPPER: 'Copper', CHARCOAL: 'Charcoal', CORAL: 'Coral', LAVENDER: 'Lavender',
    SAGE: 'Sage', OBSIDIAN: 'Obsidian', PEARL: 'Pearl', EMERALD: 'Emerald',
    TITANIUM: 'Titanium', CYAN: 'Cyan', YELLOW: 'Yellow', PINK: 'Pink',
    PURPLE: 'Purple', MIDNIGHT: 'Midnight', STARLIGHT: 'Starlight',
    COSMIC: 'Cosmic', NATURAL: 'Natural', DESERT: 'Desert', COBALT: 'Cobalt',
  };
  const colors = [];
  for (const key of Object.keys(colorMap)) {
    if (original.includes(key)) colors.push(colorMap[key]);
  }

  return { brand, storage: storage || 'Standard', ram, colors: [...new Set(colors)] };
}

function buildBaseName(name, brand) {
  let n = name
    .replace(/APPLE\s*/gi, '').replace(/SAMSUNG\s*/gi, '').replace(/GALAXY\s*/gi, '')
    .replace(/GOOGLE\s*/gi, '').replace(/PIXEL\s*/gi, 'Pixel ')
    .replace(/ONE\s*PLUS\s*/gi, 'OnePlus ').replace(/ONEPLUS\s*/gi, 'OnePlus ')
    .replace(/NOTHING\s*/gi, 'Nothing ')
    .replace(/\biPhone\b/gi, 'iPhone')
    .replace(/Pro\s*Max/gi, 'Pro Max').replace(/Pro\s*max/gi, 'Pro Max')
    .replace(/Pro\s+/gi, 'Pro ').replace(/Air\s+/gi, 'Air ')
    .replace(/\d+\s*TB\b/gi, '').replace(/\d+\s*GB\b/gi, '')
    .replace(/RAM/gi, '').replace(/\//g, ' ')
    .replace(/\([^)]*\)/g, '').replace(/（[^)]*）/g, '')
    .replace(/\s+/g, ' ').trim()
    .replace(/^[\s\-.:]+|[\s\-.:]+$/g, '');
  return n || name;
}

function groupItems(items) {
  const groups = new Map();
  for (const item of items) {
    const { brand, storage, ram, colors } = extractMeta(item.name);
    const baseName = buildBaseName(item.name, brand);
    const key = `${brand}::${baseName}`;
    if (!groups.has(key)) groups.set(key, { brand, baseName, variants: [] });
    groups.get(key).variants.push({ storage, ram, colors: colors.length > 0 ? colors : ['Default'], priceKsh: item.price });
  }
  return groups;
}

function buildProducts(groups) {
  const products = [];
  for (const [, group] of groups) {
    const storageMap = new Map();
    let minKsh = Infinity, maxKsh = 0;

    for (const v of group.variants) {
      if (!storageMap.has(v.storage)) storageMap.set(v.storage, new Map());
      const ck = v.colors.sort().join(',');
      if (!storageMap.get(v.storage).has(ck)) storageMap.get(v.storage).set(ck, v.priceKsh);
      minKsh = Math.min(minKsh, v.priceKsh);
      maxKsh = Math.max(maxKsh, v.priceKsh);
    }

    const variants = {};
    for (const [sk, cm] of storageMap) {
      const obj = {};
      for (const [ck, p] of cm) obj[ck] = p;
      variants[sk] = obj;
    }

    const basePriceKsh = minKsh - 1; // -1 KSH psychological
    const basePriceUsd = Math.floor(minKsh / KES_TO_USD) + 0.99; // .99 cents

    const slug = group.baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 40);
    const id = `${group.brand.toLowerCase()}-${slug}`.replace(/-+/g, '-');

    products.push({
      id, name: group.baseName, brand: group.brand, category: 'Phones',
      priceKsh: basePriceKsh, price: parseFloat(basePriceUsd.toFixed(2)),
      description: `${group.brand} ${group.baseName}. Best price in Kenya. Official warranty.`,
      image: IMAGES[group.brand] || IMAGES.Apple,
      colors: [...new Set(group.variants.flatMap(v => v.colors))],
      storages: Array.from(storageMap.keys()),
      rating: 4.5, reviewsCount: 10, inStock: true,
      specifications: { 'Source': 'AXON TECH Price List August 2026', 'Price Range': `KSh ${minKsh.toLocaleString()} - ${maxKsh.toLocaleString()}` },
      variants,
    });
  }
  return products;
}

// Escape single quotes for SQLite
function sqlStr(val) {
  if (val === null || val === undefined) return 'NULL';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

// JSON-encode and store as SQL string literal
function sqlJson(val) {
  return "'" + JSON.stringify(val).replace(/'/g, "''") + "'";
}

function runSql(sql) {
  try {
    const out = execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command="${sql.replace(/"/g, '\\"')}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return out;
  } catch (e) {
    return e.stdout || e.message;
  }
}

async function run() {
  const items = parseRows();
  console.log(`Parsed ${items.length} entries`);
  const groups = groupItems(items);
  console.log(`Grouped into ${groups.size} base models\n`);

  const products = buildProducts(groups);

  for (const p of products) {
    console.log(`[${p.brand}] ${p.name} — storages: ${p.storages.join(', ')} | KSh ${p.priceKsh.toLocaleString()} | $${p.price}`);
  }
  console.log(`\n${products.length} products to import`);

  // Insert new products in batches of 10 (INSERT OR IGNORE preserves existing products and their images)
  console.log('\nInserting products...');
  let sql = '';
  for (const p of products) {
    const cols = [
      `id, name, price, priceKsh, description, category, brand, image, colors, storages, rating, reviewsCount, inStock, specifications, variants`,
      `${sqlStr(p.id)}, ${sqlStr(p.name)}, ${p.price}, ${p.priceKsh}, ${sqlStr(p.description)}, ${sqlStr(p.category)}, ${sqlStr(p.brand)}, ${sqlStr(p.image)}, ${sqlJson(p.colors)}, ${sqlJson(p.storages)}, ${p.rating}, ${p.reviewsCount}, ${p.inStock ? 1 : 0}, ${sqlJson(p.specifications)}, ${sqlJson(p.variants)}`,
    ];
    sql += `INSERT OR IGNORE INTO products (${cols[0]}) VALUES (${cols[1]});\n`;
  }

  // Write to SQL file and execute
  const fs = await import('fs');
  fs.writeFileSync('scripts/phones.sql', sql);
  console.log('Written to scripts/phones.sql');

  const out = execSync(`npx wrangler d1 execute ${DB_NAME} --remote --file=scripts/phones.sql`, { encoding: 'utf8' });
  console.log(out.includes('"success": true') ? '✅ Import complete!' : `⚠️ Check output: ${out.substring(0, 300)}`);

  // Verify count
  const countOut = runSql("SELECT COUNT(*) as c FROM products WHERE category = 'Phones'");
  const countMatch = countOut.match(/"c"\s*:\s*(\d+)/);
  console.log(`\nTotal phones in D1: ${countMatch ? countMatch[1] : '?'}`);
}

run().catch(console.error);
