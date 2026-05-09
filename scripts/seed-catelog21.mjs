// One-shot seed: Catelog-21/ → 21 sarees on ST-001 with 4 images each.
//
// Behavior:
//   1. Refuses to run unless CONVEX_URL points at the known dev deployment
//      (formal-snake-780). Pass FORCE=1 to override (e.g. for a different
//      dev URL); will still refuse if URL contains "prod" or matches the
//      known prod deployment string.
//   2. Lists every existing saree on ST-001 and deletes them.
//   3. For each row 01–21 in the Catelog-21 folder:
//        a. Uploads its 4 product images (Input Img.png is skipped).
//        b. Calls sarees.create with parsed metadata + the 4 imageIds.
//      Stock is randomized in [5, 15].
//
// Run once on dev:
//   pnpm run seed:catelog21
// or:
//   node scripts/seed-catelog21.mjs

import { ConvexHttpClient } from "convex/browser";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── env loader ──────────────────────────────────────────────────────────────
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
  console.error("Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL (the latter is read from .env.local).");
  process.exit(1);
}

// ── safety guard: dev only ─────────────────────────────────────────────────
const KNOWN_DEV = "formal-snake-780";
const KNOWN_PROD = "quirky-narwhal-971";
const isProd = url.includes(KNOWN_PROD) || /\bprod\b/i.test(url);
const isKnownDev = url.includes(KNOWN_DEV);
if (isProd) {
  console.error(`REFUSED: ${url} looks like prod. This script only seeds dev.`);
  process.exit(1);
}
if (!isKnownDev && !process.env.FORCE) {
  console.error(`REFUSED: ${url} is not the known dev deployment (${KNOWN_DEV}).`);
  console.error(`Re-run with FORCE=1 to override (after confirming this is dev).`);
  process.exit(1);
}
console.log(`Seeding against ${url}`);
console.log("Target: ST-001 (MAUVE Sarees)\n");

const client = new ConvexHttpClient(url);
const { api } = await import("../convex/_generated/api.js");
const STORE_ID = "ST-001";

// ── 21 sarees parsed from Catelog-21 _ 060526_ Details.xlsx ────────────────
// "fabric" overrides the column where the column reads ambiguously (Tissue
// for visibly Satin/Georgette items) — the column was inconsistent for a
// handful of rows; description blurb is more specific.
// "type" derives from fabric: Banarasi → Banarasi, Banarasi Silk → Banarasi,
// silks → "Designer Silk", everything else falls into "Designer" or the
// fabric name itself for fabric-as-genre items (Chiffon/Georgette).
// "occasion" is price-banded: ≥20000 → Wedding, ≥10000 → Festival, else Party.
// "tag" = "New" for everything (this is a fresh catalog drop).
const SAREES = [
  { folder: "01", colorName: "Navy Blue", colors: ["Blue", "Gold"],   fabric: "Soft Silk",     work: "Zariwork",            price: 9999,  description: "Navy Blue Medium Border Zariwork (Gold) Saree. The saree comes with an unstitched blouse piece. The blouse worn by the model might be for modelling purpose only. Check the image of the blouse piece to understand how the actual blouse piece looks like.", careInstructions: "Soft Silk — Dry Wash Only", grad: ["#0A2A66", "#C9941A"], emoji: "🌌" },
  { folder: "02", colorName: "Beige",     colors: ["Beige", "Gold"],  fabric: "Georgette",     work: "Sequins",             price: 14999, description: "Beige Sequins Saree. The saree comes with an unstitched blouse piece. The blouse worn by the model might be for modelling purpose only. Check the image of the blouse piece to understand how the actual blouse piece looks like.", careInstructions: "Georgette — Dry Wash Only", grad: ["#E8DAB2", "#C9941A"], emoji: "✨" },
  { folder: "03", colorName: "Sky Blue",  colors: ["Blue", "Silver"], fabric: "Satin",         work: "Stonework (Silver)",  price: 11999, description: "Sky Blue Medium Border Stonework (Silver) Saree. The saree comes with an unstitched blouse piece. The blouse worn by the model might be for modelling purpose only. Check the image of the blouse piece to understand how the actual blouse piece looks like.", careInstructions: "Satin — Dry Wash Only", grad: ["#87CEEB", "#C0C0C0"], emoji: "💎" },
  { folder: "04", colorName: "Mustard",   colors: ["Yellow"],         fabric: "Tissue",        work: "Cutdana",             price: 11999, description: "Mustard Cutdana Saree. The saree comes with an unstitched blouse piece. The blouse worn by the model might be for modelling purpose only. Check the image of the blouse piece to understand how the actual blouse piece looks like.", careInstructions: "Tissue — Dry Wash Only", grad: ["#D4A017", "#F4D35E"], emoji: "🌻" },
  { folder: "05", colorName: "Maroon",    colors: ["Maroon", "Gold"], fabric: "Banarasi",      work: "Zariwork + Stonework", price: 9999,  description: "Maroon Saree In Banarasi. The Saree Is Embellished With Zariwork Embroidery. Paired With A Matching Unstitched Blouse. Comes With The Koskii Promise Of Superior Quality.", careInstructions: "Banarasi Silk — Dry Wash Only", grad: ["#7B1D1D", "#C9941A"], emoji: "👑" },
  { folder: "06", colorName: "Pink",      colors: ["Pink", "Gold"],   fabric: "Banarasi Silk", work: "Zariwork",            price: 8999,  description: "Step into the spotlight with our Pink Silk Saree, where every drape glows with a playful yet elegant vibe. This masterpiece, adorned in luxurious zariwork, is crafted from sumptuous Banarasi silk, ensuring you shimmer with every move. Perfect for those who adore making a vibrant style statement, this saree is a tribute to the spirited beauty of traditional Indian wear.", careInstructions: "Banarasi Silk — Dry Wash Only", grad: ["#E91E63", "#C9941A"], emoji: "🌸" },
  { folder: "07", colorName: "Maroon",    colors: ["Red", "Gold"],    fabric: "Art Silk",      work: "Zariwork",            price: 7999,  description: "Maroon Silk Saree in Art Silk fabric. The Silk Saree is elevated with Zariwork embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Art Silk — Dry Wash Only", grad: ["#7B1D1D", "#A0522D"], emoji: "🌹" },
  { folder: "08", colorName: "Rani Pink", colors: ["Pink", "Gold"],   fabric: "Tissue",        work: "Sequins",             price: 7999,  description: "Rani Pink Saree in Tissue fabric. The Saree is elevated with Sequins embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Tissue — Dry Wash Only", grad: ["#D81B60", "#FFB6C1"], emoji: "🌷" },
  { folder: "09", colorName: "Peacock Blue", colors: ["Blue", "Gold"], fabric: "Tissue",       work: "Zariwork (Gold)",     price: 8999,  description: "Peacock Blue Saree in Tissue fabric. The Saree is elevated with Zariwork (Gold) embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Tissue — Dry Wash Only", grad: ["#005F73", "#C9941A"], emoji: "🦚" },
  { folder: "10", colorName: "Black",     colors: ["Black", "Gold"],  fabric: "Georgette",     work: "Stonework (Gold)",    price: 10999, description: "Black Saree in Georgette fabric. The Saree is elevated with Stonework (Gold) embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Georgette — Dry Wash Only", grad: ["#111111", "#C9941A"], emoji: "🖤" },
  { folder: "11", colorName: "Red",       colors: ["Red", "Silver"],  fabric: "Satin",         work: "Mirrorwork",          price: 22999, description: "Red Saree in Satin fabric. The Saree is elevated with Mirrorwork embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Satin — Dry Wash Only", grad: ["#B91C1C", "#C0C0C0"], emoji: "💃" },
  { folder: "12", colorName: "Beige",     colors: ["Beige", "Gold"],  fabric: "Net",           work: "Cording",             price: 12999, description: "Beige Saree in Net fabric. The Saree is elevated with Cording embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Net — Dry Wash Only", grad: ["#E8DAB2", "#A8916C"], emoji: "🎀" },
  { folder: "13", colorName: "Maroon",    colors: ["Red", "Silver"],  fabric: "Art Silk",      work: "Zardozi (Silver)",    price: 19999, description: "Maroon Silk Saree in Art Silk fabric. The Silk Saree is elevated with Zardozi (Silver) embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Art Silk — Dry Wash Only", grad: ["#7B1D1D", "#C0C0C0"], emoji: "🪙" },
  { folder: "14", colorName: "Royal Blue", colors: ["Blue", "Gold"],  fabric: "Art Silk",      work: "Stonework (Gold)",    price: 13999, description: "Royal Blue Silk Saree in Art Silk fabric. The Silk Saree is elevated with Stonework (Gold) embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Art Silk — Dry Wash Only", grad: ["#1E40AF", "#C9941A"], emoji: "💠" },
  { folder: "15", colorName: "White",     colors: ["White", "Gold"],  fabric: "Satin",         work: "Cutdana",             price: 4999,  description: "White Saree in Satin fabric. The Saree is elevated with Cutdana embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Satin — Dry Wash Only", grad: ["#F5F5F5", "#E0C97D"], emoji: "🤍" },
  { folder: "16", colorName: "Sea Green", colors: ["Green", "Silver"], fabric: "Satin",        work: "Cutdana",             price: 16999, description: "Sea Green Saree in Satin fabric. The Saree is elevated with Cutdana embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Satin — Dry Wash Only", grad: ["#2E8B57", "#C0C0C0"], emoji: "🌊" },
  { folder: "17", colorName: "Gold",      colors: ["Gold", "Yellow"], fabric: "Chiffon",       work: "Stonework (Gold)",    price: 14999, description: "Drape yourself in the sunshine hues of our Chiffon Gold Saree, where each fold shimmers with vibrant zariwork that captures the essence of elegance and festivity. This saree embodies the spirited charm of chiffon, designed to flutter gracefully with your every move, making it a perfect choice for those who wish to dazzle and celebrate in style.", careInstructions: "Chiffon — Dry Wash Only", grad: ["#C9941A", "#FFD700"], emoji: "🌟" },
  { folder: "18", colorName: "Mustard",   colors: ["Yellow", "Gold"], fabric: "Chiffon",       work: "Stonework",           price: 17999, description: "Mustard Saree in Chiffon fabric. The Saree is elevated with Stonework (Gold) embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Chiffon — Dry Wash Only", grad: ["#D4A017", "#FFE066"], emoji: "🌼" },
  { folder: "19", colorName: "Mustard",   colors: ["Yellow", "Gold"], fabric: "Georgette",     work: "Stonework (Gold)",    price: 14999, description: "Mustard Saree in Georgette fabric. The Saree is elevated with Threadwork embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Georgette — Dry Wash Only", grad: ["#D4A017", "#C9941A"], emoji: "🌾" },
  { folder: "20", colorName: "Black",     colors: ["Black", "Gold"],  fabric: "Georgette",     work: "Threadwork",          price: 18999, description: "Black Saree in Georgette fabric. The Saree is elevated with Threadwork embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Georgette — Dry Wash Only", grad: ["#0F0F0F", "#C9941A"], emoji: "🌑" },
  { folder: "21", colorName: "Black",     colors: ["Black"],          fabric: "Georgette",     work: "Threadwork",          price: 24999, description: "Black Saree in Georgette fabric. The Saree is elevated with Threadwork embroidery. It comes with an Unstitched blouse. Comes with the promise of premium quality.", careInstructions: "Georgette — Dry Wash Only", grad: ["#0A0A0A", "#3F3F3F"], emoji: "🖤" },
];

// ── derived fields ──────────────────────────────────────────────────────────
function deriveType(fabric) {
  if (fabric === "Banarasi" || fabric === "Banarasi Silk") return "Banarasi";
  if (fabric === "Soft Silk" || fabric === "Art Silk") return "Designer Silk";
  if (fabric === "Chiffon" || fabric === "Georgette" || fabric === "Net") return fabric;
  return "Designer";
}
function deriveOccasion(price) {
  if (price >= 20000) return "Wedding";
  if (price >= 10000) return "Festival";
  return "Party";
}
function deriveWeight(fabric) {
  if (fabric === "Banarasi" || fabric === "Banarasi Silk" || fabric === "Soft Silk" || fabric === "Art Silk") return "Heavy";
  if (fabric === "Satin" || fabric === "Tissue") return "Medium";
  return "Light";
}
function makeName({ colorName, fabric }) {
  // "Pink Banarasi Silk Saree", "Navy Blue Soft Silk Saree", "Mustard Chiffon Saree".
  return `${colorName} ${fabric} Saree`;
}
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function mrpFromPrice(price) {
  // 15-25% markup, rounded to nearest 100, no exact match with price.
  const markup = 1.15 + Math.random() * 0.10;
  return Math.round((price * markup) / 100) * 100;
}

function listImageFiles(folder) {
  const dir = join(__dirname, "..", "Catelog-21", folder);
  const all = readdirSync(dir).filter((f) =>
    /^0[1-4]\.(webp|jpe?g|png)$/i.test(f),
  );
  // sort by leading digits to keep 01,02,03,04 order
  all.sort((a, b) => a.localeCompare(b));
  return all.map((f) => ({
    name: f,
    path: join(dir, f),
    mime: f.match(/\.png$/i) ? "image/png"
        : f.match(/\.jpe?g$/i) ? "image/jpeg"
        : "image/webp",
  }));
}

// Validate all folders + sizes BEFORE doing any writes.
console.log("→ Validating folders and image sizes…");
const MAX_BYTES = 5 * 1024 * 1024;
const issues = [];
for (const s of SAREES) {
  const files = listImageFiles(s.folder);
  if (files.length !== 4) {
    issues.push(`${s.folder}: expected 4 product images, found ${files.length} (${files.map((f) => f.name).join(", ") || "none"})`);
    continue;
  }
  for (const f of files) {
    const stat = readFileSync(f.path);
    if (stat.length > MAX_BYTES) {
      issues.push(`${s.folder}/${f.name}: ${(stat.length / 1024 / 1024).toFixed(1)}MB exceeds 5MB sareePhoto guard`);
    }
  }
}
if (issues.length > 0) {
  console.error("✗ Pre-flight failed:");
  for (const i of issues) console.error("  -", i);
  process.exit(1);
}
console.log(`  ✓ All 21 folders have 4 valid images.\n`);

// ── delete existing ST-001 sarees ──────────────────────────────────────────
const existing = await client.query(api.sarees.listByStore, { storeId: STORE_ID });
console.log(`→ Found ${existing.length} existing sarees on ${STORE_ID}.`);
if (existing.length > 0) {
  console.log("  Names: " + existing.map((s) => s.name).join(", "));
}
console.log(`→ Deleting all ${existing.length}…`);
let deleted = 0;
for (const s of existing) {
  try {
    await client.mutation(api.sarees.remove, { id: s._id });
    deleted += 1;
  } catch (err) {
    console.error(`  ✗ Failed to delete ${s.name} (${s._id}):`, err.message);
  }
}
console.log(`  ✓ Deleted ${deleted}/${existing.length}.\n`);

// ── insert 21 sarees ────────────────────────────────────────────────────────
console.log("→ Uploading images and creating sarees…");
let created = 0;
const failures = [];
for (const s of SAREES) {
  const name = makeName(s);
  const files = listImageFiles(s.folder);
  try {
    // Upload all 4 images
    const imageIds = [];
    for (const f of files) {
      const bytes = readFileSync(f.path);
      const uploadUrl = await client.mutation(api.files.generateUploadUrl, {});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": f.mime },
        body: bytes,
      });
      if (!res.ok) {
        throw new Error(`Upload failed for ${s.folder}/${f.name}: ${res.status} ${await res.text()}`);
      }
      const { storageId } = await res.json();
      imageIds.push(storageId);
    }

    const stock = randInt(5, 15);
    const price = s.price;
    const sareeId = await client.mutation(api.sarees.create, {
      storeId: STORE_ID,
      name,
      type: deriveType(s.fabric),
      fabric: s.fabric,
      occasion: deriveOccasion(price),
      price,
      mrp: mrpFromPrice(price),
      stock,
      status: "active",
      colors: s.colors,
      colorName: s.colorName,
      emoji: s.emoji,
      grad: s.grad,
      tag: "New",
      weave: s.work,
      weight: deriveWeight(s.fabric),
      description: s.description,
      careInstructions: s.careInstructions,
      drapingStyles: ["Nivi"],
      approvalStatus: "approved",
      addedBy: "Catelog-21 Seed",
      imageIds,
    });
    console.log(`  ✓ ${s.folder}: ${name} → ₹${price} stock=${stock} sareeId=${sareeId}`);
    created += 1;
  } catch (err) {
    failures.push({ folder: s.folder, name, error: err.message });
    console.error(`  ✗ ${s.folder}: ${name} — ${err.message}`);
  }
}

// ── summary ─────────────────────────────────────────────────────────────────
console.log("\n──────────────────────────────────────────────────────");
console.log(`Result: deleted ${deleted}, created ${created}/${SAREES.length}`);
if (failures.length > 0) {
  console.log(`Failures: ${failures.length}`);
  for (const f of failures) console.log(`  - ${f.folder} ${f.name}: ${f.error}`);
  process.exit(1);
}
console.log(`✓ Done — ST-001 now has ${created} sarees with 4 images each.`);
