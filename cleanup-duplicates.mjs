/**
 * cleanup-duplicates.mjs
 * Uses --command for SELECT, --file for UPDATE.
 * Removes duplicate storageVariants (same storage+simType) per product,
 * keeping the LAST occurrence of each unique pair.
 */
import { execSync } from "child_process";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const DB_NAME = "axon-tech-db";
const FLAG = "--remote";

function runSelect(sql) {
  // Use --command with single-quotes for the outer shell, doubled single-quotes for SQL
  const inner = sql.replace(/'/g, "''");
  const cmd = `wrangler d1 execute ${DB_NAME} ${FLAG} --command='${inner}'`;
  try {
    const out = execSync(cmd, { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 });
    const trimmed = out.trim();
    const jsonStart = trimmed.lastIndexOf("[{");
    const jsonPart = jsonStart >= 0 ? trimmed.slice(jsonStart) : trimmed;
    return JSON.parse(jsonPart);
  } catch (e) {
    const txt = e.stdout?.toString() || e.message;
    const jsonStart = txt.trim().lastIndexOf("[{");
    if (jsonStart >= 0) {
      try { return JSON.parse(txt.trim().slice(jsonStart)); } catch {}
    }
    console.error("  SELECT ERROR:", txt.slice(0, 300));
    return null;
  }
}

function runUpdate(sql) {
  const path = join(tmpdir(), `_d1_update_${Date.now()}.sql`);
  writeFileSync(path, sql, "utf-8");
  const cmd = `wrangler d1 execute ${DB_NAME} ${FLAG} --file=${path}`;
  try {
    const out = execSync(cmd, { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 });
    if (existsSync(path)) unlinkSync(path);
    const trimmed = out.trim();
    const jsonStart = trimmed.lastIndexOf("[{");
    if (jsonStart >= 0) {
      try { return JSON.parse(trimmed.slice(jsonStart)); } catch {}
    }
    return { success: true };
  } catch (e) {
    const txt = e.stdout?.toString() || e.message;
    if (existsSync(path)) unlinkSync(path);
    console.error("  UPDATE ERROR:", txt.slice(0, 300));
    return null;
  }
}

async function main() {
  console.log("\n=== FINDING PRODUCTS WITH STORAGE VARIANTS ===");
  // Use <> instead of != to avoid shell quoting issues
  const result = runSelect(
    `SELECT id, name, storageVariants FROM products WHERE storageVariants IS NOT NULL AND storageVariants <> '[]'`
  );

  if (!result?.results?.length) {
    console.log("No products with storageVariants found.");
    return;
  }
  console.log(`Found ${result.results.length} product(s) to check.\n`);

  let totalRemoved = 0;
  let totalFixed = 0;

  for (const row of result.results) {
    const { id, name, storageVariants: raw } = row;
    let variants;
    try {
      variants = JSON.parse(raw);
    } catch {
      console.log(`SKIP ${id} — invalid JSON`);
      continue;
    }

    if (!Array.isArray(variants)) continue;

    // Find duplicates: keep last occurrence of each (storage, simType) pair
    const seen = new Map();
    const toRemove = new Set();

    variants.forEach((sv, i) => {
      const key = `${sv.storage || ""}|${sv.simType || ""}`.toLowerCase();
      if (seen.has(key)) toRemove.add(seen.get(key));
      seen.set(key, i);
    });

    if (toRemove.size === 0) {
      console.log(`OK  ${id} (${name}) — no duplicates`);
      continue;
    }

    const cleaned = variants.filter((_, i) => !toRemove.has(i));
    const removed = variants.length - cleaned.length;
    totalRemoved += removed;
    totalFixed++;

    const keptKeys = cleaned.map(sv => `${sv.storage}|${sv.simType}`).join(", ");
    console.log(`FIX ${id} (${name}) — removing ${removed} duplicate(s)`);
    console.log(`   Keeping (${cleaned.length}): ${keptKeys}`);

    // Use SQL file for UPDATE — avoids all shell escaping issues
    const cleanedJson = JSON.stringify(cleaned);
    const now = new Date().toISOString();
    const updateSql =
`UPDATE products SET storageVariants = '${cleanedJson}', updatedAt = '${now}' WHERE id = '${id}';
`;
    const res = runUpdate(updateSql);
    if (res?.success !== false) {
      console.log(`   → Updated`);
    } else {
      console.log(`   → FAILED!`);
    }
  }

  if (totalRemoved === 0) {
    console.log("\nNo duplicates found — DB is clean.");
  }
  console.log(`\n=== DONE: ${totalRemoved} duplicate variant(s) removed from ${totalFixed} product(s) ===\n`);
}

main().catch(console.error);
