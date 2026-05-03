// One-shot backfill: uploads public/inventory/*.{jpeg,webp} to Convex Storage
// and patches the matching seeded saree rows with imageIds.
//
// Why: convex/tryOn.ts requires saree.imageIds[0] for RunPod (Step 7 guard).
// Seeded sarees only ship with a `grad` + `emoji` for the SareeThumb fallback,
// so any try-on against a seeded row throws INTERNAL: saree has no image.
//
// Run once per environment:
//   node scripts/backfill-saree-images.mjs            # uses dev (.env.local)
//   CONVEX_URL=https://...convex.cloud node scripts/backfill-saree-images.mjs
//
// Idempotent — sarees that already have imageIds are skipped.

import { ConvexHttpClient } from "convex/browser";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Tiny .env.local parser — avoids a dotenv dep just for this one script.
// Looks for KEY=VALUE lines, ignores comments and blanks.
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

// Mirror of components/SareeThumb.tsx SAREE_IMAGE — saree.name → file in public/inventory.
// Keep in sync if the front-end map changes.
const SAREE_IMAGE = {
  "Chanderi Floral":           "Chanderi-Floral.jpeg",
  "Chiffon Rose Garden":       "Chiffon-Rose-Garden.webp",
  "Cotton Handloom Daily":     "Cotton-Handloom-Daily.webp",
  "Georgette Sequin Party":    "Georgette-Sequin-Party.webp",
  "Kanjeevaram Temple Border": "Kanjeevaram-Temple-Border.webp",
  "Linen Summer Fresh":        "Linen-Summer-Fresh.jpeg",
  "Organza Pastel Dream":      "Organza-Pastel-Dream.jpeg",
  "Paithani Heritage":         "Paithani-Heritage.webp",
  "Tussar Geometric":          "Tussar-Geometric.webp",
};

const STORE_IDS = ["ST-001", "ST-002", "ST-003", "ST-004", "ST-005"];

const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) {
  console.error("Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL (the latter is read from .env.local).");
  process.exit(1);
}
const client = new ConvexHttpClient(url);
console.log(`Backfill against ${url}\n`);

const { api } = await import("../convex/_generated/api.js");

const allSarees = [];
for (const storeId of STORE_IDS) {
  const rows = await client.query(api.sarees.listByStore, { storeId });
  allSarees.push(...rows);
}
console.log(`Loaded ${allSarees.length} sarees across ${STORE_IDS.length} stores.\n`);

let uploaded = 0;
let skipped = 0;
let unmapped = 0;

for (const saree of allSarees) {
  const file = SAREE_IMAGE[saree.name];
  if (!file) {
    console.log(`UNMAPPED: ${saree.name} (${saree.storeId}) — no entry in SAREE_IMAGE`);
    unmapped += 1;
    continue;
  }
  if (Array.isArray(saree.imageIds) && saree.imageIds.length > 0) {
    console.log(`SKIP:     ${saree.name} (${saree._id}) — already has ${saree.imageIds.length} image(s)`);
    skipped += 1;
    continue;
  }
  const filePath = join(__dirname, "..", "public", "inventory", file);
  if (!existsSync(filePath)) {
    console.warn(`MISSING:  ${file} — expected at ${filePath}`);
    continue;
  }
  const bytes = readFileSync(filePath);
  const mime = file.endsWith(".jpeg") || file.endsWith(".jpg")
    ? "image/jpeg"
    : "image/webp";

  const uploadUrl = await client.mutation(api.files.generateUploadUrl, {});
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": mime },
    body: bytes,
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`FAIL:     ${saree.name} upload ${res.status}: ${text}`);
    continue;
  }
  const { storageId } = await res.json();
  await client.mutation(api.files.setSareeImages, {
    sareeId: saree._id,
    imageIds: [storageId],
  });
  console.log(`OK:       ${saree.name} (${saree.storeId}) → ${storageId}`);
  uploaded += 1;
}

console.log(`\nDone — uploaded ${uploaded}, skipped ${skipped} (already had images), unmapped ${unmapped} (no local file).`);
if (unmapped > 0) {
  console.log("Unmapped sarees can't try-on until someone uploads images via /store/inventory/<id> — RunPod needs a real garment image.");
}
