import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const OUT = "/home/abhigna/Desktop/kiosk-ui/screenshots/tablet";
const BASE = "http://localhost:3000";
const VIEWPORT = { width: 1366, height: 1024 }; // iPad Pro 12.9" landscape

// localStorage-based tablet auth (no server gating — presence only).
const STORE = { storeId: "ST-001", storeName: "MAUVE Sarees" };
const STAFF = { staffId: "m17arrnf2fq51vqtbrqpz18st184stjf", name: "Ravi", role: "R04", storeId: "ST-001" };
const CUSTOMER = { customerId: "ns76jjejqx8xw31q7jfgyw5enh84kzmn", name: "Ananya Mehta", phone: "+919900000001" };
const SESSION = { sessionId: "SS-1780654017933", startTime: 1780654017933, occasion: "Wedding", budget: "₹10k–25k", visitNote: "", colors: [] };
const SAREE_ID = "ph7554tdxe7m768xxmfj80dc7d866wpe";

// seed: which localStorage keys to set before load.
const SCREENS = [
  { name: "01-setup", route: "/tablet/setup", seed: {} },
  { name: "02-pin", route: "/tablet/pin", seed: { store: true } },
  { name: "03-home", route: "/tablet", seed: { store: true, staff: true } },
  { name: "04-phone", route: "/tablet/phone", seed: { store: true, staff: true } },
  { name: "05-register", route: "/tablet/register", seed: { store: true, staff: true } },
  { name: "06-occasion", route: "/tablet/occasion", seed: { store: true, staff: true, customer: true } },
  { name: "07-catalogue", route: "/tablet/catalogue", seed: { store: true, staff: true, customer: true, session: true } },
  { name: "08-catalogue-detail", route: `/tablet/catalogue/${SAREE_ID}`, seed: { store: true, staff: true, customer: true, session: true } },
  { name: "09-shortlist", route: "/tablet/shortlist", seed: { store: true, staff: true, customer: true, session: true } },
  { name: "10-session", route: "/tablet/session", seed: { store: true, staff: true, customer: true, session: true } },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });

  const results = [];
  for (const s of SCREENS) {
    const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
    await context.addInitScript((data) => {
      const { seed, store, staff, customer, session } = data;
      if (seed.store) localStorage.setItem("wearify_tablet_store", JSON.stringify(store));
      if (seed.staff) localStorage.setItem("wearify_tablet_staff", JSON.stringify(staff));
      if (seed.customer) localStorage.setItem("wearify_tablet_customer", JSON.stringify(customer));
      if (seed.session) localStorage.setItem("wearify_tablet_session", JSON.stringify(session));
      const css = "nextjs-portal,#__next-dev-tools-indicator,[data-nextjs-dev-tools-button]{display:none !important;}";
      const inject = () => { const st = document.createElement("style"); st.textContent = css; document.documentElement.appendChild(st); };
      if (document.documentElement) inject(); else document.addEventListener("DOMContentLoaded", inject);
    }, { seed: s.seed, store: STORE, staff: STAFF, customer: CUSTOMER, session: SESSION });

    const page = await context.newPage();
    page.on("pageerror", (e) => console.log(`  ! pageerror[${s.name}]:`, e.message));
    try {
      await page.goto(`${BASE}${s.route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await sleep(4000); // Convex data + redirects settle
      await page.screenshot({ path: `${OUT}/${s.name}.png` });
      const finalUrl = page.url();
      const expected = s.route.replace(/\/$/, "");
      const redirected = !finalUrl.includes(expected.split("?")[0]);
      console.log(`${redirected ? "⚠ REDIRECTED -> " + finalUrl : "✓"} ${s.name}`);
      results.push({ ...s, ok: !redirected });
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
