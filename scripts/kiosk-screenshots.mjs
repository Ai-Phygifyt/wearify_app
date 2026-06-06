import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const OUT = "/tmp/kiosk-shots";
const BASE = "http://localhost:3000";
const VIEWPORT = { width: 1366, height: 1024 };

// Paired kiosk config seeded into localStorage so the layout/page don't
// bounce to /kiosk/setup. deviceToken only needs to be truthy for rendering
// (mutations/actions aren't triggered in screenshot mode).
const KIOSK_CFG = {
  storeId: "ST-001",
  storeName: "MAUVE Sarees",
  deviceId: "shot-device",
  deviceToken: "shot-token",
  deviceLabel: "Smart Mirror",
  pairedAt: 1700000000000,
};

// label, ?screen= value (or special route), optional overlay / action
const SCREENS = [
  { name: "01-setup", route: "/kiosk/setup", paired: false },
  { name: "02-idle", screen: "idle" },
  { name: "03-lang", screen: "lang" },
  { name: "04-modeSelect", screen: "modeSelect" },
  { name: "05-codeEntry", screen: "codeEntry" },
  { name: "06-phoneAuth", screen: "phoneAuth" },
  { name: "07-otp", screen: "otp" },
  { name: "08-newCustomer", screen: "newCustomer" },
  { name: "09-consent", screen: "consent" },
  { name: "10-scanChoice", screen: "scanChoice" },
  { name: "11-bodyScan", screen: "bodyScan" },
  { name: "12-aiProcessing", screen: "aiProcessing" },
  { name: "13-home", screen: "home" },
  { name: "14-productDetail", screen: "productDetail" },
  { name: "15-trialRoom", screen: "trialRoom" },
  { name: "16-wardrobe", screen: "wardrobe" },
  { name: "17-order", screen: "order" },
  { name: "18-tailors", screen: "tailors" },
  { name: "19-tailorDetail", screen: "tailors", clickTailor: true },
  { name: "20-order-feedback", screen: "order", overlay: "feedback" },
  { name: "21-order-dataSave", screen: "order", overlay: "save" },
  { name: "22-sessionEnd", screen: "sessionEnd" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
  });

  const results = [];
  for (const s of SCREENS) {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 2,
      permissions: ["camera"],
    });
    // Seed paired config before any page script runs.
    if (s.paired !== false) {
      await context.addInitScript((cfg) => {
        window.localStorage.setItem("wearify_kiosk_store", JSON.stringify(cfg));
      }, KIOSK_CFG);
    }
    // Hide the Next.js dev-tools indicator badge from screenshots.
    await context.addInitScript(() => {
      const css = "nextjs-portal,#__next-dev-tools-indicator,[data-nextjs-dev-tools-button]{display:none !important;}";
      const inject = () => {
        const st = document.createElement("style");
        st.textContent = css;
        document.documentElement.appendChild(st);
      };
      if (document.documentElement) inject();
      else document.addEventListener("DOMContentLoaded", inject);
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => console.log(`  ! pageerror[${s.name}]:`, e.message));

    const url = s.route
      ? `${BASE}${s.route}`
      : `${BASE}/kiosk?screen=${s.screen}${s.overlay ? `&overlay=${s.overlay}` : ""}`;
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      // Convex keeps a websocket open so "networkidle" never fires — use a
      // fixed settle delay instead (seed data + entry animations land in ~3s).
      await sleep(3500);

      if (s.clickTailor) {
        // Open the first tailor card's detail modal.
        const card = page.locator("button, [role=button], div").filter({ hasText: /View|Details|Manoj|Geeta|Tailor/ }).first();
        await card.click({ timeout: 4000 }).catch(() => {});
        await sleep(1500);
      }

      const file = `${OUT}/${s.name}.png`;
      await page.screenshot({ path: file });
      console.log(`✓ ${s.name}`);
      results.push({ ...s, file, ok: true });
    } catch (err) {
      console.log(`✗ ${s.name}: ${err.message}`);
      results.push({ ...s, ok: false });
    }
    await context.close();
  }

  await browser.close();
  console.log(`\nDone: ${results.filter((r) => r.ok).length}/${SCREENS.length} captured → ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
