import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const OUT = "/home/abhigna/Desktop/kiosk-ui/screenshots/tailor";
const BASE = "http://localhost:3000";
const VIEWPORT = { width: 390, height: 844 }; // iPhone 14-class

// Real auth (minted via phoneAuth:loginWithPassword for TL-001 / Tailor@123).
const AUTH_TOKEN = "GQRFsDRnfZbwe6xsmQR7sHUJupuAWrYWGqDLrs5cbSTyd8Wg";
const AUTH_USER = { tailorId: "TL-001", role: "tailor" };

const ORDER_ID = "px740d34fh7m1e567jn23zt0qx85dweg";
const REFERRAL_ID = "q578da7n589ntt3pyk0yve4q4x87z286";

const SCREENS = [
  { name: "01-login", route: "/tailor/login", auth: false },
  { name: "02-dashboard", route: "/tailor" },
  { name: "03-orders", route: "/tailor/orders" },
  { name: "04-orders-create", route: "/tailor/orders/create" },
  { name: "05-order-detail", route: `/tailor/orders/${ORDER_ID}` },
  { name: "06-referrals", route: "/tailor/referrals" },
  { name: "07-referral-detail", route: `/tailor/referrals/${REFERRAL_ID}` },
  { name: "08-profile", route: "/tailor/profile" },
  { name: "09-profile-edit", route: "/tailor/profile/edit" },
  { name: "10-profile-portfolio", route: "/tailor/profile/portfolio" },
  { name: "11-profile-services", route: "/tailor/profile/services" },
  { name: "12-profile-availability", route: "/tailor/profile/availability" },
  { name: "13-profile-commission", route: "/tailor/profile/commission" },
  { name: "14-profile-ratings", route: "/tailor/profile/ratings" },
  { name: "15-profile-verification", route: "/tailor/profile/verification" },
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
      await sleep(4000); // auth validation + Convex data settle
      await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
      const finalUrl = page.url();
      const redirected = finalUrl.includes("/login") && s.route !== "/tailor/login";
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
