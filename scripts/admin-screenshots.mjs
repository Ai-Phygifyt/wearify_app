import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const OUT = "/home/abhigna/Desktop/kiosk-ui/screenshots/admin";
const BASE = "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 }; // desktop

const ADMIN_EMAIL = "admin@wearify.com";
const ADMIN_PASSWORD = "Admin@123!";
const TRUSTED_ORIGIN = "https://wearify-app.vercel.app"; // Convex SITE_URL — required by Better Auth CSRF

// Authenticated routes (one shared session). login is captured separately.
const AUTH_SCREENS = [
  ["01-dashboard", "/admin/dashboard"],
  ["02-command-center", "/admin/command-center"],
  ["03-stores", "/admin/stores"],
  ["04-store-detail", "/admin/stores/ST-001"],
  ["05-store-onboard", "/admin/stores/onboard"],
  ["06-devices", "/admin/devices"],
  ["07-agents", "/admin/agents"],
  ["08-models", "/admin/models"],
  ["09-revenue", "/admin/revenue"],
  ["10-billing", "/admin/billing"],
  ["11-network", "/admin/network"],
  ["12-support", "/admin/support"],
  ["13-tailors", "/admin/tailors"],
  ["14-vendors", "/admin/vendors"],
  ["15-releases", "/admin/releases"],
  ["16-resilience", "/admin/resilience"],
  ["17-security", "/admin/security"],
  ["18-data-governance", "/admin/data-governance"],
  ["19-legal", "/admin/legal"],
  ["20-audit", "/admin/audit"],
  ["21-settings", "/admin/settings"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HIDE_DEV =
  "nextjs-portal,#__next-dev-tools-indicator,[data-nextjs-dev-tools-button]{display:none !important;}";

async function mintCookies() {
  const res = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: TRUSTED_ORIGIN },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`sign-in failed: ${res.status} ${await res.text()}`);
  const setCookies = res.headers.getSetCookie();
  const cookies = setCookies.map((sc) => {
    const [pair] = sc.split(";");
    const eq = pair.indexOf("=");
    return {
      name: pair.slice(0, eq).trim(),
      value: pair.slice(eq + 1).trim(),
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    };
  });
  return cookies.filter((c) => c.name.includes("better-auth"));
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const cookies = await mintCookies();
  console.log(`minted ${cookies.length} auth cookies: ${cookies.map((c) => c.name).join(", ")}`);

  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
  const results = [];

  // ── Public login page (no cookies) ──
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
    await ctx.addInitScript((css) => {
      const inject = () => { const st = document.createElement("style"); st.textContent = css; document.documentElement.appendChild(st); };
      if (document.documentElement) inject(); else document.addEventListener("DOMContentLoaded", inject);
    }, HIDE_DEV);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(2500);
    await page.screenshot({ path: `${OUT}/00-login.png` });
    console.log("✓ 00-login");
    await ctx.close();
  }

  // ── Authenticated pages (shared context with session cookies) ──
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  await ctx.addCookies(cookies);
  await ctx.addInitScript((css) => {
    const inject = () => { const st = document.createElement("style"); st.textContent = css; document.documentElement.appendChild(st); };
    if (document.documentElement) inject(); else document.addEventListener("DOMContentLoaded", inject);
  }, HIDE_DEV);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log(`  ! pageerror:`, e.message));

  for (const [name, route] of AUTH_SCREENS) {
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await sleep(4500); // auth handshake + Convex data + charts
      const finalUrl = page.url();
      if (finalUrl.includes("/admin/login")) {
        console.log(`⚠ REDIRECTED-TO-LOGIN ${name}`);
        results.push({ name, ok: false });
      } else {
        await page.screenshot({ path: `${OUT}/${name}.png` });
        console.log(`✓ ${name}`);
        results.push({ name, ok: true });
      }
    } catch (err) {
      console.log(`✗ ${name}: ${err.message}`);
      results.push({ name, ok: false });
    }
  }
  await ctx.close();
  await browser.close();
  console.log(`\nDone: ${results.filter((r) => r.ok).length}/${AUTH_SCREENS.length} auth pages + login → ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
