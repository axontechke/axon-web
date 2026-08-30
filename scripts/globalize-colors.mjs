import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('db.json');
const raw = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(raw);

function stripPrefix(name) {
  if (typeof name !== 'string') return name;
  // Remove "iPhone <number> " prefix, e.g., "iPhone 11 Black" -> "Black", "iPhone 17 Mist Blue" -> "Mist Blue"
  return name.replace(/^iPhone\s+\d+\s+/, '');
}

console.log('=== Before: globalColors', db.globalColors.length);
for (const c of db.globalColors) {
  console.log(c.id, '->', c.name);
}

// Deduplicate globalColors by stripped name (case-insensitive)
// Keep generic entry if exists (id === col-<slug>), otherwise keep first occurrence
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const grouped = new Map(); // lowerName -> array of entries with stripped name
for (const c of db.globalColors) {
  const stripped = stripPrefix(c.name).trim();
  const key = stripped.toLowerCase();
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push({ original: c, stripped });
}

// For each group, pick keeper
const newGlobalColors = [];
const idRemap = new Map(); // old id -> keeper id (for dedup groups)
const discarded = [];
for (const [key, entries] of grouped.entries()) {
  // Find generic: id === `col-${slug}`
  const genericSlug = `col-${slugify(entries[0].stripped)}`;
  let keeperEntry = entries.find(e => e.original.id === genericSlug);
  if (!keeperEntry) {
    // otherwise keep first occurrence
    keeperEntry = entries[0];
  }
  const keeper = { ...keeperEntry.original, name: keeperEntry.stripped };
  newGlobalColors.push(keeper);
  // map all ids in group to keeper id
  for (const e of entries) {
    idRemap.set(e.original.id, keeper.id);
    if (e.original.id !== keeper.id) {
      discarded.push({ from: e.original.id, fromName: e.original.name, to: keeper.id, toName: keeper.name, codeFrom: e.original.code, codeTo: keeper.code });
    }
  }
}

console.log('\n=== Discarded duplicates (', discarded.length, ') ===');
for (const d of discarded) {
  console.log(`${d.from} (${d.fromName} ${d.codeFrom}) -> ${d.to} (${d.toName} ${d.codeTo})`);
}

console.log('\n=== After: globalColors', newGlobalColors.length);
for (const c of newGlobalColors) {
  console.log(c.id, '|', c.name, '|', c.code);
}

// Sort alphabetically by name for deterministic output? Keep original order but with keeper order as first seen
newGlobalColors.sort((a,b) => a.name.localeCompare(b.name));

db.globalColors = newGlobalColors;

// Now update products
let productsUpdated = 0;
let totalColorRenames = 0;
let variantImageKeyUpdates = 0;

function renameColorName(name) {
  const stripped = stripPrefix(name);
  if (stripped !== name) totalColorRenames++;
  return stripped;
}

for (const p of db.products) {
  let changed = false;

  // colors array (legacy, string[])
  if (Array.isArray(p.colors)) {
    const newColors = p.colors.map(c => typeof c === 'string' ? renameColorName(c) : c);
    if (JSON.stringify(newColors) !== JSON.stringify(p.colors)) {
      p.colors = newColors;
      changed = true;
    }
  }
  // storages array - not color, skip
  // storageVariants
  if (Array.isArray(p.storageVariants)) {
    for (const sv of p.storageVariants) {
      if (Array.isArray(sv.colors)) {
        for (const col of sv.colors) {
          if (col && typeof col.name === 'string') {
            const nn = renameColorName(col.name);
            if (nn !== col.name) {
              col.name = nn;
              changed = true;
            }
          }
        }
      }
      // also sv.color single field if exists
      if (sv.color && typeof sv.color === 'string') {
        const nn = renameColorName(sv.color);
        if (nn !== sv.color) { sv.color = nn; changed = true; }
      }
    }
  }
  // variants (legacy)
  if (Array.isArray(p.variants)) {
    for (const v of p.variants) {
      if (v.color && typeof v.color === 'string') {
        const nn = renameColorName(v.color);
        if (nn !== v.color) { v.color = nn; changed = true; }
      }
      if (v.colors && Array.isArray(v.colors)) {
        // unlikely
        for (let i=0;i<v.colors.length;i++) if(typeof v.colors[i]==='string'){ const nn=renameColorName(v.colors[i]); if(nn!==v.colors[i]){v.colors[i]=nn;changed=true}}
      }
    }
  }
  // colorImages: object mapping color name -> image(s) or array?
  if (p.colorImages && typeof p.colorImages === 'object' && !Array.isArray(p.colorImages)) {
    const newCI = {};
    for (const [k, v] of Object.entries(p.colorImages)) {
      const nk = renameColorName(k);
      // If nk already exists and v is different, merge? Prefer keep existing? Just take first
      if (nk !== k) variantImageKeyUpdates++;
      if (newCI[nk] === undefined) newCI[nk] = v;
      else {
        // merge if array? but colorImages values are string? Let's just keep first
        // could also merge arrays if needed
      }
      if (nk !== k) changed = true;
    }
    if (changed) p.colorImages = newCI;
  }
  // colorCodes: object mapping color name -> hex
  if (p.colorCodes && typeof p.colorCodes === 'object' && !Array.isArray(p.colorCodes)) {
    const newCC = {};
    for (const [k, v] of Object.entries(p.colorCodes)) {
      const nk = renameColorName(k);
      if (nk !== k) changed = true;
      if (newCC[nk] === undefined) newCC[nk] = v;
    }
    if (JSON.stringify(newCC) !== JSON.stringify(p.colorCodes)) {
      p.colorCodes = newCC;
      changed = true;
    }
  }
  // variantImages: object mapping "storage|color" -> entries
  if (p.variantImages && typeof p.variantImages === 'object' && !Array.isArray(p.variantImages)) {
    const newVI = {};
    let viChanged = false;
    for (const [k, v] of Object.entries(p.variantImages)) {
      // k is like "512 GB|iPhone 17 Cosmic Orange" or "512 GB|Orange"
      const parts = k.split('|');
      let nk = k;
      if (parts.length === 2) {
        const storage = parts[0];
        const color = parts[1];
        const nc = renameColorName(color);
        nk = `${storage}|${nc}`;
        if (nk !== k) {
          viChanged = true;
          variantImageKeyUpdates++;
        }
      } else if (k.includes('iPhone')) {
        nk = renameColorName(k);
        if (nk !== k) viChanged = true;
      }
      if (newVI[nk] === undefined) {
        newVI[nk] = v;
      } else {
        // merge arrays if duplicate after strip (e.g., two blues collapsed to same key)
        // concatenate image entries
        if (Array.isArray(newVI[nk]) && Array.isArray(v)) {
          newVI[nk] = [...newVI[nk], ...v];
        }
      }
    }
    if (viChanged) {
      p.variantImages = newVI;
      changed = true;
    }
  }
  // also handle generic 'images' not needed

  if (changed) productsUpdated++;
}

// Also handle other top-level collections that might have color names: orders, priceTrackers, reviews, etc.
// Do a deep recursive scan for any string value matching ^iPhone \d+  and replace
function deepStrip(obj) {
  if (Array.isArray(obj)) {
    for (let i=0;i<obj.length;i++) {
      if (typeof obj[i] === 'string') {
        const nn = stripPrefix(obj[i]);
        if (nn !== obj[i]) {
          obj[i] = nn;
          totalColorRenames++;
        }
      } else if (typeof obj[i] === 'object' && obj[i] !== null) {
        deepStrip(obj[i]);
      }
    }
  } else if (typeof obj === 'object' && obj !== null) {
    // handle keys that are color names - but we already did variantImages/colorImages
    // For generic objects, we need to handle keys containing iPhone prefix
    const entries = Object.entries(obj);
    for (const [k, v] of entries) {
      const newK = /^iPhone \d+ /.test(k) ? stripPrefix(k) : k;
      if (newK !== k) {
        obj[newK] = v;
        delete obj[k];
        totalColorRenames++;
        // need to process v under new key
        if (typeof v === 'string') {
          const nn = stripPrefix(v);
          if (nn !== v) { obj[newK] = nn; totalColorRenames++; }
        } else if (typeof v === 'object' && v !== null) {
          deepStrip(v);
        }
      } else {
        if (typeof v === 'string') {
          const nn = stripPrefix(v);
          if (nn !== v) { obj[k] = nn; totalColorRenames++; }
        } else if (typeof v === 'object' && v !== null) {
          deepStrip(v);
        }
      }
    }
  }
}

// Run deepStrip on remaining top-level keys except we already handled products and globalColors
for (const key of Object.keys(db)) {
  if (key === 'globalColors' || key === 'products') continue;
  deepStrip(db[key]);
}

console.log(`\n=== Products updated: ${productsUpdated} / ${db.products.length}, color renames: ${totalColorRenames}, variantImage key updates: ${variantImageKeyUpdates} ===`);

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Wrote db.json');

// Also produce summary for migration file
console.log('\n=== New global_colors SQL values ===');
for (const c of newGlobalColors) {
  const escName = c.name.replace(/'/g, "''");
  const escCode = c.code.replace(/'/g, "''");
  const escImg = (c.image || '').replace(/'/g, "''");
  console.log(`('${c.id}', '${escName}', '${escCode}', '${escImg}'),`);
}
