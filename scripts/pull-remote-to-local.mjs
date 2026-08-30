/**
 * pull-remote-to-local.mjs
 * Pulls products (and full DB) from remote D1 to local D1.
 * Uses wrangler export + filtered import to avoid d1_migrations conflicts.
 * Run: node scripts/pull-remote-to-local.mjs
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const DB = 'axon-tech-db';
const tmp = path.join(os.tmpdir(), 'opencode', `remote-dump-${Date.now()}.sql`);
const filtered = path.join(os.tmpdir(), 'opencode', `remote-filtered-${Date.now()}.sql`);

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });
}

function runCapture(cmd) {
  return execSync(cmd, { encoding: 'utf8' });
}

console.log('1. Exporting remote DB...');
run(`npx wrangler d1 export ${DB} --remote --output "${tmp}" --skip-confirmation`);

console.log('2. Filtering dump (remove d1_migrations, sessions, CREATE TABLE)...');
let lines = fs.readFileSync(tmp, 'utf8').splitlines();
let inserts = [];
for (const l of lines) {
  if (l.includes('INSERT INTO "d1_migrations"')) continue;
  if (l.includes('INSERT INTO "sqlite_sequence"')) continue;
  if (l.includes('session:') && l.includes('"config"')) continue;
  if (l.startsWith('INSERT INTO')) {
    inserts.push(l.replace('INSERT INTO', 'INSERT OR REPLACE INTO'));
  }
}
const tables = ["config","contact","delivery_methods","blog","global_colors","global_sim_types","orders","support_requests","reviews","price_trackers","whatsapp_notifications","whatsapp_api_logs","product_reviews","product_variant_images","product_variants","products","users"];
let out = 'PRAGMA defer_foreign_keys=TRUE;\n';
for (const t of tables) out += `DELETE FROM "${t}";\n`;
for (const l of inserts) out += l + '\n';
// Ensure baseName column exists locally (added in 2026-08-29 sync)
out += `INSERT OR IGNORE INTO global_sim_types (id,name,code,description) VALUES ('sim-physical','Physical SIM','physical','Traditional nano/micro SIM card'),('sim-esim','eSIM','esim','Embedded digital SIM'),('sim-both','Dual SIM (Physical + eSIM)','both','Supports both physical and eSIM'),('sim-none','No SIM / WiFi Only','none','WiFi-only devices like tablets or laptops'),('sim-dual-physical','Dual Physical SIM','dual-physical','Two physical SIM slots');\n`;
fs.mkdirSync(path.dirname(filtered), { recursive: true });
fs.writeFileSync(filtered, out, 'utf8');
console.log(`  Filtered ${inserts.length} inserts -> ${filtered}`);

console.log('3. Ensuring local schema has baseName column...');
try { runCapture(`npx wrangler d1 execute ${DB} --local --command "ALTER TABLE products ADD COLUMN baseName TEXT DEFAULT '';"`); } catch {}

console.log('4. Importing into local D1...');
run(`npx wrangler d1 execute ${DB} --local --file="${filtered}"`);

console.log('5. Verifying...');
const verify = runCapture(`npx wrangler d1 execute ${DB} --local --command "SELECT count(*) as c FROM products;"`);
console.log(verify);
const remoteVerify = runCapture(`npx wrangler d1 execute ${DB} --remote --command "SELECT count(*) as c FROM products;"`);
console.log('Remote:', remoteVerify);

console.log('Done. Local DB updated from remote.');
