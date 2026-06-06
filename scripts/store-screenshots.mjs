import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const OUT = "/tmp/store-shots";
const BASE = "http://localhost:3000";
const VIEWPORT = { width: 390, height: 844 }; // iPhone 14-class

// Real auth (minted via phoneAuth:loginWithPassword for ST-001 / Store@123).
const AUTH_TOKEN = "8YAdSvYQtDmYQNgf6gFzJqCDLMCWDmasNHN3R7NQxbhBG7kH";
const AUTH_USER = { storeId: "ST-001", storeName: "MAUVE Sarees", role: "store_owner" };

const CUSTOMER_ID = "ns76jjejqx8xw31q7jfgyw5enh84kzmn";
const SAREE_ID = "ph7554tdxe7m768xxmfj80dc7d866wpe";

// name, route, public? (login page needs no auth)
const SCREENS = [
  { name: "01-login", route: "/store/login", auth: false },
  { name: "02-dashboard", route: "/store" },
  { name: "03-analytics", route: "/store/analytics" },
  { name: "04-inventory", route: "/store/inventory" },
  { name: "05-inventory-add", route: "/store/inventory/add" },
  { name: "06-inventory-detail", route: `/store/inventory/${SAREE_ID}` },
  { name: "07-orders", route: "/store/orders" },
  { name: "08-customers", route: "/store/customers" },
  { name: "09-customer-detail", route: `/store/customers/${CUSTOMER_ID}` },
  { name: "10-campaigns", route: "/store/campaigns" },
  { name: "11-staff", route: "/store/staff" },
  { name: "12-settings", route: "/store/settings" },
  { name: "13-settings-profile", route: "/store/settings/profile" },
  { name: "14-settings-kiosks", route: "/store/settings/kiosks" },
  { name: "15-settings-billing", route: "/store/settings/billing" },
  { name: "16-settings-notifications", route: "/store/settings/notifications" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });

  const results = [];
  for (const s of SCREENS) {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    await context.addInitScript(({ token, user, auth }) => {
      if (auth !== false) {
        window.localStorage.setItem("wearify_auth_token", token);
        window.localStorage.setItem("wearify_auth_user", JSON.stringify(user));
      }
      const css = "nextjs-portal,#__next-dev-tools-indicator,[data-nextjs-dev-tools-button]{display:none !important;}";
      const inject = () => { const st = document.createElement("style"); st.textContent = css; document.documentElement.appendChild(st); };
      if (document.documentElement) inject(); else document.addEventListener("DOMContentLoaded", inject);
    }, { token: AUTH_TOKEN, user: AUTH_USER, auth: s.auth });

    const page = await context.newPage();
    page.on("pageerror", (e) => console.log(`  ! pageerror[${s.name}]:`, e.message));
    try {
      await page.goto(`${BASE}${s.route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await sleep(4000); // auth validation + Convex data + charts settle
      await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
      const finalUrl = page.url();
      const redirected = finalUrl.includes("/login") && s.route !== "/store/login";
      console.log(`${redirected ? "⚠ REDIRECTED" : "✓"} ${s.name}${redirected ? " -> " + finalUrl : ""}`);
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
