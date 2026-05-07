// One-shot cleanup: deletes any saree whose imageIds[3] is missing.
//
// Why: convex/tryOn.ts now prefers imageIds[3] (the flat-lay shot, no
// model) for the garment input. Sarees with fewer than 4 photos fall
// back to slot 0 (a model wearing the saree) which causes the AI to
// transfer the model's body/face/hair onto the customer. Easier to
// remove the contaminated catalog than to re-shoot.
//
// Behavior:
//   1. Refuses to run unless CONVEX_URL points at the known dev
//      deployment formal-snake-780. Same guard as seed-catelog21.mjs.
//   2. Lists every saree across all 5 stores; filters to those
//      missing imageIds[3].
//   3. Prints the list + per-store counts before deleting.
//   4. Deletes via sarees.remove.
//
// Run:
//   pnpm run cleanup:flatlay-less

import { ConvexHttpClient } from "convex/browser";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const path = join(__dirname, "..", ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvLocal();

const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) {
  console.error("Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL.");
  process.exit(1);
}

const KNOWN_DEV = "formal-snake-780";
const KNOWN_PROD = "quirky-narwhal-971";
const isProd = url.includes(KNOWN_PROD) || /\bprod\b/i.test(url);
const isKnownDev = url.includes(KNOWN_DEV);
if (isProd) {
  console.error(`REFUSED: ${url} looks like prod. This script only cleans dev.`);
  process.exit(1);
}
if (!isKnownDev && !process.env.FORCE) {
  console.error(`REFUSED: ${url} is not the known dev deployment (${KNOWN_DEV}).`);
  console.error(`Re-run with FORCE=1 to override.`);
  process.exit(1);
}

console.log(`Cleanup against ${url}\n`);

const client = new ConvexHttpClient(url);
const { api } = await import("../convex/_generated/api.js");

const STORE_IDS = ["ST-001", "ST-002", "ST-003", "ST-004", "ST-005"];

// Gather all sarees across every store.
const all = [];
for (const storeId of STORE_IDS) {
  const rows = await client.query(api.sarees.listByStore, { storeId });
  all.push(...rows);
}
console.log(`Found ${all.length} sarees across ${STORE_IDS.length} stores.`);

// A saree is "flatlay-less" iff imageIds[3] is missing — slot 3 is what
// the new tryOn flow expects. Anything shorter is a leak risk.
const victims = all.filter((s) => !s.imageIds || s.imageIds.length < 4);
const survivors = all.length - victims.length;
console.log(`  Keeping ${survivors} sarees with imageIds[3] present.`);
console.log(`  Removing ${victims.length} sarees missing slot 3.\n`);

if (victims.length === 0) {
  console.log("Nothing to remove. Done.");
  process.exit(0);
}

// Per-store breakdown for a sanity check before deletes fire.
const byStore = {};
for (const v of victims) {
  byStore[v.storeId] = (byStore[v.storeId] ?? 0) + 1;
}
console.log("By store:");
for (const [sid, n] of Object.entries(byStore)) {
  console.log(`  ${sid}: ${n}`);
}
console.log("");

// Sample names so the operator can sanity-check.
console.log("Sample (first 10):");
for (const v of victims.slice(0, 10)) {
  const slots = v.imageIds?.length ?? 0;
  console.log(`  - ${v.storeId}: ${v.name} (${slots} image${slots === 1 ? "" : "s"})`);
}
if (victims.length > 10) console.log(`  …and ${victims.length - 10} more.`);
console.log("");

// Delete.
console.log("Deleting…");
let deleted = 0;
const failures = [];
for (const v of victims) {
  try {
    await client.mutation(api.sarees.remove, { id: v._id });
    deleted += 1;
  } catch (err) {
    failures.push({ storeId: v.storeId, name: v.name, error: err.message });
  }
}

console.log(`\n──────────────────────────────────────────────────────`);
console.log(`Deleted ${deleted}/${victims.length}.`);
if (failures.length > 0) {
  console.log(`Failures: ${failures.length}`);
  for (const f of failures) console.log(`  - ${f.storeId} ${f.name}: ${f.error}`);
  process.exit(1);
}

// Verify.
const finalAll = [];
for (const storeId of STORE_IDS) {
  const rows = await client.query(api.sarees.listByStore, { storeId });
  finalAll.push(...rows);
}
const finalByStore = {};
for (const s of finalAll) {
  finalByStore[s.storeId] = (finalByStore[s.storeId] ?? 0) + 1;
}
console.log(`\nFinal saree counts:`);
for (const sid of STORE_IDS) {
  console.log(`  ${sid}: ${finalByStore[sid] ?? 0}`);
}
console.log(`✓ Done.`);
