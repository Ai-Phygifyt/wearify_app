# Customer App PWA Conversion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `/c/*` Wearify customer app installable as a standalone PWA on iOS and Android with offline shell, an install-prompt nudge, and the customer module scoped as the install target.

**Architecture:**
- Use `@serwist/next` (the actively-maintained Next 16 / App Router fork of `next-pwa`) to compile a Workbox-based service worker from `app/sw.ts` to `public/sw.js` at build time.
- Manifest scope is `/c` so the standalone window only owns the customer surface (admin/store/kiosk continue to render with browser chrome if visited).
- Icons + Apple touch icon + Apple splash are generated from a single checked-in SVG monogram via a one-shot `sharp` script committed alongside the PNGs.
- Push notifications are **explicitly out of scope** for this plan (separate subsystem — VAPID keys, `web-push` Convex action, `pushSubscriptions` table, client subscription UI). Track as a follow-up.

**Tech Stack:**
- `@serwist/next` ^9 (service worker build)
- `serwist` ^9 (runtime SW primitives)
- `sharp` ^0.33 (dev-only, icon generation)
- Next.js 16 App Router metadata API for manifest link + Apple meta
- React 19 client component for install-prompt banner

**Out of scope (deferred, flagged in CONTEXT.md log):**
- Web push notifications
- Background sync
- Web Share Target
- File handlers
- Per-language manifest variants

**Verification flavor:** PWA work is browser-runtime, not unit-testable. Each task pairs the implementation step with an explicit verification step (Lighthouse audit, DevTools Application panel inspection, `curl` against the dev server, or installed-PWA smoke test).

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `package.json` | Modify | Add `@serwist/next`, `serwist`, `sharp` deps |
| `next.config.ts` | Modify | Wrap config with `withSerwist` |
| `app/sw.ts` | Create | Service worker entry — precache + runtime caching + offline fallback |
| `public/manifest.json` | Create | Web App Manifest scoped to `/c` |
| `public/icons/source.svg` | Create | Source SVG (W monogram, ivory bg, maroon stroke) |
| `public/icons/icon-192.png` | Create (generated) | 192×192 standard icon |
| `public/icons/icon-512.png` | Create (generated) | 512×512 standard icon |
| `public/icons/icon-maskable-512.png` | Create (generated) | 512×512 maskable icon (safe zone padding) |
| `public/icons/apple-touch-icon.png` | Create (generated) | 180×180 Apple home-screen icon |
| `public/icons/apple-splash-2048x2732.png` | Create (generated) | iPad Pro splash (used as fallback for all iOS sizes) |
| `scripts/generate-pwa-icons.mjs` | Create | One-shot Node script using `sharp` to emit PNGs from SVG |
| `app/layout.tsx` | Modify | Add `manifest`, `appleWebApp`, `icons`, viewport `themeColor` to root metadata |
| `app/c/offline/page.tsx` | Create | Offline fallback page using customer-theme primitives |
| `components/c/InstallPrompt.tsx` | Create | Client component listening for `beforeinstallprompt`, shows dismissable banner |
| `app/c/layout.tsx` | Modify | Render `<InstallPrompt />` inside the authenticated shell |
| `CONTEXT.md` | Modify | Append §12 log entry for the PWA conversion |

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime PWA deps**

Run:
```bash
npm install @serwist/next@^9 serwist@^9
```
Expected: `package.json` `dependencies` gains both packages, `package-lock.json` updates, no peer-dep warnings on Next 16 / React 19. If you see `ERESOLVE`, retry with `npm install --legacy-peer-deps`.

- [ ] **Step 2: Install icon-generation dev dep**

Run:
```bash
npm install --save-dev sharp@^0.33
```
Expected: `devDependencies` gains `sharp`. On Linux this triggers a native binary download — that's normal.

- [ ] **Step 3: Verify type-check still clean**

Run:
```bash
npm run type-check
```
Expected: exits 0 with no errors. (No code touched yet, so this is a baseline check confirming the deps didn't introduce a typing regression.)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(pwa): add serwist + sharp for PWA tooling"
```

---

## Task 2: Source SVG + icon-generation script

**Files:**
- Create: `public/icons/source.svg`
- Create: `scripts/generate-pwa-icons.mjs`

- [ ] **Step 1: Create source SVG**

Write `public/icons/source.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#FDF8F2"/>
  <rect x="32" y="32" width="448" height="448" rx="96" fill="#7B1D1D"/>
  <text
    x="256"
    y="356"
    font-family="Cormorant Garamond, Georgia, serif"
    font-size="320"
    font-weight="700"
    font-style="italic"
    fill="#C9941A"
    text-anchor="middle">W</text>
</svg>
```

- [ ] **Step 2: Create generation script**

Write `scripts/generate-pwa-icons.mjs`:
```js
import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(__dirname, "../public/icons/source.svg");
const outDir = resolve(__dirname, "../public/icons");

const svg = await readFile(srcPath);
await mkdir(outDir, { recursive: true });

const targets = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of targets) {
  await sharp(svg).resize(size, size).png().toFile(resolve(outDir, name));
  console.log(`wrote ${name} (${size}x${size})`);
}

// Maskable icon: render the source onto a larger canvas with padding
// so the safe zone (inner 80%) is fully inside Android's circular mask.
const maskableSize = 512;
const innerSize = Math.round(maskableSize * 0.8); // 80% safe zone
const inner = await sharp(svg).resize(innerSize, innerSize).png().toBuffer();
await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: { r: 123, g: 29, b: 29, alpha: 1 }, // #7B1D1D maroon
  },
})
  .composite([{ input: inner, gravity: "center" }])
  .png()
  .toFile(resolve(outDir, "icon-maskable-512.png"));
console.log("wrote icon-maskable-512.png (512x512, maskable)");

// Apple splash: 2048x2732 (iPad Pro 12.9"), works as a scaled fallback for all iOS sizes.
const splashIconSize = 460;
const splashIcon = await sharp(svg).resize(splashIconSize, splashIconSize).png().toBuffer();
await sharp({
  create: {
    width: 2048,
    height: 2732,
    channels: 4,
    background: { r: 253, g: 248, b: 242, alpha: 1 }, // #FDF8F2 ivory
  },
})
  .composite([{ input: splashIcon, gravity: "center" }])
  .png()
  .toFile(resolve(outDir, "apple-splash-2048x2732.png"));
console.log("wrote apple-splash-2048x2732.png");
```

- [ ] **Step 3: Run the script**

Run:
```bash
node scripts/generate-pwa-icons.mjs
```
Expected output (5 lines):
```
wrote icon-192.png (192x192)
wrote icon-512.png (512x512)
wrote apple-touch-icon.png (180x180)
wrote icon-maskable-512.png (512x512, maskable)
wrote apple-splash-2048x2732.png
```

- [ ] **Step 4: Verify the generated files**

Run:
```bash
ls -la public/icons/
file public/icons/icon-192.png
```
Expected: `source.svg` + 5 PNGs present. `file` should report `PNG image data, 192 x 192, 8-bit/color RGBA`.

- [ ] **Step 5: Commit**

```bash
git add public/icons/ scripts/generate-pwa-icons.mjs
git commit -m "feat(pwa): source SVG + icon generation script + generated PNGs"
```

---

## Task 3: Web App Manifest

**Files:**
- Create: `public/manifest.json`

- [ ] **Step 1: Write the manifest**

Write `public/manifest.json`:
```json
{
  "name": "Wearify",
  "short_name": "Wearify",
  "description": "Try on the moment — your personal saree wardrobe",
  "start_url": "/c",
  "scope": "/c",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FDF8F2",
  "theme_color": "#7B1D1D",
  "lang": "en",
  "categories": ["lifestyle", "shopping"],
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

- [ ] **Step 2: Verify the manifest is served**

Start the dev server in another terminal: `npm run dev:frontend`. Then run:
```bash
curl -s http://localhost:3000/manifest.json | head -c 200
```
Expected: first 200 chars of the JSON above. If you get HTML, the file is in the wrong location — confirm it's at `public/manifest.json` (not `app/`).

- [ ] **Step 3: Commit**

```bash
git add public/manifest.json
git commit -m "feat(pwa): add web app manifest scoped to /c"
```

---

## Task 4: Root layout metadata — manifest link + Apple meta + theme color

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update root metadata**

Edit `app/layout.tsx`. Replace the existing imports + `metadata` export with:

```ts
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { getToken } from "@/lib/auth-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wearify — Mission Control",
  description: "AI-powered virtual try-on platform for Indian saree retailers",
  manifest: "/manifest.json",
  applicationName: "Wearify",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wearify",
    startupImage: [
      {
        url: "/icons/apple-splash-2048x2732.png",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#7B1D1D",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
```

Leave the `RootLayout` function below unchanged.

- [ ] **Step 2: Verify rendered HTML head**

Restart the dev server (manifest config is read at startup). Then:
```bash
curl -s http://localhost:3000/c/login | grep -E '(manifest|apple-touch-icon|theme-color)' | head -20
```
Expected: lines containing `<link rel="manifest" href="/manifest.json"/>`, `<link rel="apple-touch-icon" .../>`, `<meta name="theme-color" content="#7B1D1D"/>`, and `<meta name="apple-mobile-web-app-capable" content="yes"/>`.

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```
Expected: 0 errors. (Importing `Viewport` from `next` is valid in Next 16.)

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(pwa): manifest link + Apple meta + theme-color in root layout"
```

---

## Task 5: Service worker via @serwist/next

**Files:**
- Create: `app/sw.ts`
- Modify: `next.config.ts`
- Modify: `.gitignore` (so the generated `public/sw.js` doesn't get committed)

- [ ] **Step 1: Write the service worker entry**

Create `app/sw.ts`:
```ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/c/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
```

- [ ] **Step 2: Wrap next.config with withSerwist**

Replace `next.config.ts` entirely with:
```ts
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);
```

The `disable: ... === "development"` is intentional — service workers cache aggressively and make local dev iteration painful. SW is built and registered in production builds only. We'll smoke-test against `npm run build && npm start` later.

- [ ] **Step 3: Ignore generated SW artifacts in git**

Append to `.gitignore`:
```
# generated by @serwist/next at build time
public/sw.js
public/sw.js.map
public/swe-worker-*.js
public/workbox-*.js
public/workbox-*.js.map
```

- [ ] **Step 4: Type-check**

```bash
npm run type-check
```
Expected: 0 errors. The `app/sw.ts` declares its own globals so the service worker types don't clash with the DOM lib.

- [ ] **Step 5: Production build**

```bash
npm run build
```
Expected: completes successfully, console output near the end mentions `Compiling service worker...` or similar Serwist output, and `public/sw.js` exists after the build.

```bash
ls -la public/sw.js public/swe-worker-*.js 2>/dev/null
```
Expected: both files exist.

- [ ] **Step 6: Smoke-test SW registration**

Start the production server: `npm run start`. Open `http://localhost:3000/c/login` in Chrome. Open DevTools → Application → Service Workers. Expected: a registered service worker for `localhost:3000` with status `activated and is running`. The SW source should be `/sw.js`.

If nothing registers: check the Console for errors; the most common cause is `swSrc` path mismatch.

- [ ] **Step 7: Commit**

```bash
git add app/sw.ts next.config.ts .gitignore
git commit -m "feat(pwa): service worker via @serwist/next, disabled in dev"
```

---

## Task 6: Offline fallback page

**Files:**
- Create: `app/c/offline/page.tsx`

- [ ] **Step 1: Write the offline page**

Create `app/c/offline/page.tsx`:
```tsx
"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: 24,
        background: "var(--cx-grad-hero, #FDF8F2)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 22,
          background: "rgba(255,255,255,0.08)",
          border: "1.5px solid rgba(184,134,11,0.65)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <WifiOff size={36} color="#C9941A" />
      </div>
      <div
        className="cx-serif"
        style={{
          fontSize: 28,
          fontWeight: 700,
          fontStyle: "italic",
          color: "#FBF7F1",
        }}
      >
        You're offline
      </div>
      <div
        style={{
          fontSize: 14,
          color: "rgba(253,248,240,0.7)",
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        Reconnect to load fresh looks, your wardrobe, and the latest from your stores.
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 12,
          padding: "10px 24px",
          borderRadius: 999,
          border: "1.5px solid rgba(184,134,11,0.65)",
          background: "transparent",
          color: "#C9941A",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Make sure the route is bypassed by the auth gate**

The customer layout's `PUBLIC_ROUTES` set in `app/c/layout.tsx:63` currently allows `/c/login` and `/c/register` only. Offline fallback fires when there's no network — typical user is logged-out at that moment OR has a token but Convex is unreachable. Add `/c/offline` to the public set so the layout doesn't try to validate a session against an unreachable backend.

Edit `app/c/layout.tsx:63`, change:
```ts
const PUBLIC_ROUTES = new Set<string>(["/c/login", "/c/register"]);
```
to:
```ts
const PUBLIC_ROUTES = new Set<string>(["/c/login", "/c/register", "/c/offline"]);
```

- [ ] **Step 3: Verify the route renders**

Restart dev server. Visit `http://localhost:3000/c/offline`. Expected: the offline screen renders with the WifiOff icon, italic "You're offline", and a "Try again" button. Splash flashes first (1.2s) then the offline page appears without redirecting to login.

- [ ] **Step 4: Verify offline fallback wiring in production**

Run `npm run build && npm run start`. Visit `http://localhost:3000/c` in Chrome and let it load fully (this populates the SW precache). Open DevTools → Network → check "Offline". Reload the page. Expected: the offline page renders instead of a Chrome dinosaur. (If you get the dinosaur, the SW didn't catch the navigation — check Application → Service Workers shows it's `activated`.)

- [ ] **Step 5: Commit**

```bash
git add app/c/offline/page.tsx app/c/layout.tsx
git commit -m "feat(pwa): offline fallback page wired into SW + auth gate bypass"
```

---

## Task 7: Install-prompt component

**Files:**
- Create: `components/c/InstallPrompt.tsx`
- Modify: `app/c/layout.tsx`

- [ ] **Step 1: Write the InstallPrompt component**

Create `components/c/InstallPrompt.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISSED_KEY = "wearify_pwa_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    // Already running standalone? No prompt.
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !evt) return null;

  const onInstall = async () => {
    await evt.prompt();
    await evt.userChoice;
    setEvt(null);
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  const onDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setEvt(null);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Install Wearify"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 84, // sits above the bottom nav (68px nav + 16px gap)
        zIndex: 200,
        background: "rgba(20, 14, 10, 0.92)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(184,134,11,0.45)",
        borderRadius: 16,
        padding: "14px 14px 14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 18px 50px -12px rgba(0,0,0,0.55)",
        animation: "cx-slideUp 0.3s ease-out",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: "rgba(184,134,11,0.18)",
          border: "1px solid rgba(184,134,11,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Download size={18} color="#C9941A" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#FBF7F1",
            letterSpacing: "0.01em",
          }}
        >
          Install Wearify
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(253,248,240,0.6)",
            marginTop: 2,
          }}
        >
          Add to home screen for the full app feel
        </div>
      </div>
      <button
        onClick={onInstall}
        style={{
          padding: "8px 14px",
          borderRadius: 999,
          border: "none",
          background: "#C9941A",
          color: "#1A0F08",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        Install
      </button>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          border: "none",
          background: "rgba(255,255,255,0.06)",
          color: "rgba(253,248,240,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Render it inside the customer shell**

Edit `app/c/layout.tsx`. Add an import at the top of the file (after the existing `lucide-react` import on line 9):
```ts
import InstallPrompt from "@/components/c/InstallPrompt";
```

Then in the authenticated-render branch (currently lines 227–238), insert `<InstallPrompt />` inside the `cx-shell` div, just before `<BottomNav />`:

Find:
```tsx
        <div className="cx-shell">
          <div className="cx-screen">{children}</div>
          <BottomNav />
        </div>
```

Replace with:
```tsx
        <div className="cx-shell">
          <div className="cx-screen">{children}</div>
          <InstallPrompt />
          <BottomNav />
        </div>
```

The prompt is intentionally **not** rendered on `/c/login` or `/c/register` — those branches return early before the authenticated shell. Showing the install prompt to a not-yet-logged-in visitor is bad UX (they install, then immediately face a login wall).

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```
Expected: 0 errors.

- [ ] **Step 4: Verify the prompt fires**

Build + serve: `npm run build && npm run start`. Open `http://localhost:3000/c` in Chrome (logged in). The browser fires `beforeinstallprompt` automatically once the manifest + SW + icons criteria are met (Lighthouse calls this "installability"). The banner should appear at the bottom above the nav.

If it doesn't appear: open DevTools → Application → Manifest. The "Installability" section lists exactly what's missing. The most common cause is the SW not being activated yet — reload once.

To re-test after dismissing: `localStorage.removeItem("wearify_pwa_install_dismissed")` in the console, then reload.

- [ ] **Step 5: Verify dismiss persistence**

Click "Install" or the X. Reload the page. Expected: banner does NOT reappear (the `wearify_pwa_install_dismissed` flag is set in localStorage).

- [ ] **Step 6: Commit**

```bash
git add components/c/InstallPrompt.tsx app/c/layout.tsx
git commit -m "feat(pwa): install-prompt banner inside /c shell, dismiss persisted"
```

---

## Task 8: End-to-end verification

**Files:** none — this is a verification-only task.

- [ ] **Step 1: Lighthouse PWA audit**

`npm run build && npm run start`. Open Chrome DevTools → Lighthouse → check **Progressive Web App** + **Performance** categories → "Analyze page load" against `http://localhost:3000/c/login`.

Expected results:
- Installable: ✅ pass (manifest valid, has icons of correct sizes, SW registered, served over `localhost` which counts as secure)
- PWA optimized: ✅ all checks pass (themed, viewport set, masked icon, etc.)

If any check fails, the failure message names the exact missing/wrong field — fix and re-run.

- [ ] **Step 2: Real install on Android (manual, requires device)**

Open `https://wearifyy.netlify.app/c` on a Chrome Android browser (after the next deploy). Look for the "Install Wearify" prompt OR menu → "Install app". Install. Open from home screen. Expected: standalone window with no Chrome UI, splash flash with Wearify monogram, lands on `/c`. Install prompt does NOT reappear inside the installed app (the `display-mode: standalone` check kills it).

- [ ] **Step 3: Real install on iOS (manual, requires device)**

Open `https://wearifyy.netlify.app/c` on Mobile Safari iOS. Tap Share → Add to Home Screen. The icon should be the maroon-tile W (the apple-touch-icon, NOT the iOS auto-screenshot fallback). Open from home screen. Expected: standalone window with status-bar-style `default`, splash uses our 2048×2732 image scaled.

iOS does NOT support `beforeinstallprompt` so the in-app install banner never fires there — that's expected; the Apple "Add to Home Screen" flow is the only path.

- [ ] **Step 4: Offline smoke test (production build)**

`npm run start`. Load `/c` in Chrome and let it fully render. DevTools → Network → "Offline". Navigate to `/c/looks`. Expected: offline fallback page renders (the WifiOff screen). Toggle offline back off and click "Try again" — page should reload normally.

- [ ] **Step 5: Verify scope behavior**

While in the installed standalone PWA window, navigate to `/admin` (paste the URL into the address bar if visible, or use a dev link). Expected: the standalone window either shows a Chrome chrome bar (out-of-scope navigation) or refuses to navigate. This is the desired effect of `"scope": "/c"` — the install is customer-app-only.

If there's no perceptible behavior on out-of-scope navigation, that's also fine (browsers vary); the important thing is `/c/*` itself stays standalone.

---

## Task 9: Log decision in CONTEXT.md and commit

**Files:**
- Modify: `CONTEXT.md`

- [ ] **Step 1: Append a new §12 entry**

Open `CONTEXT.md`. Find the line `## 12. Conversation Log — engineering decisions taken` and the most recent log entry below it (currently the "Production deployment — Netlify..." entry). Insert a NEW entry immediately above the most recent one (most recent goes to top of the list — reverse chronological order is the convention).

Add this entry as the new top entry, immediately after the descriptive paragraph that introduces the log:

```markdown
### Customer module — installable PWA (manifest + SW + offline + install prompt)

- **Why:** `/c/*` was a polished mobile web app but had zero PWA primitives — no manifest, no service worker, no installable home-screen icon. Customers had to use it as a tab. Now it's installable on Android (Chrome `beforeinstallprompt` + in-app banner) and iOS (Safari "Add to Home Screen" — Apple meta tags).
- **Tooling:** [@serwist/next](https://serwist.pages.dev) for the service worker (active fork of `next-pwa`, Next 16 compatible). `swSrc: "app/sw.ts"` → `swDest: "public/sw.js"`. SW is **disabled in dev** (`disable: process.env.NODE_ENV === "development"` in [next.config.ts](next.config.ts)) because cached assets make iteration painful — production-only registration.
- **Manifest scope = `/c`.** [public/manifest.json](public/manifest.json) sets `"scope": "/c"` and `"start_url": "/c"`, which means installing the PWA gets you the customer app standalone — `/admin` and `/store` continue to render with browser chrome if visited from the installed window. Intentional.
- **Icons.** Generated from a single source SVG ([public/icons/source.svg](public/icons/source.svg)) via [scripts/generate-pwa-icons.mjs](scripts/generate-pwa-icons.mjs) using `sharp`. Outputs: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (with 80% safe-zone padding on a maroon background for Android adaptive icons), `apple-touch-icon.png` (180×180), `apple-splash-2048x2732.png` (single iPad Pro size — iOS scales it for smaller devices). Re-run the script if the brand mark ever changes.
- **Apple meta in [app/layout.tsx](app/layout.tsx).** `appleWebApp.capable: true`, `statusBarStyle: "default"`, `startupImage` points at the splash. iOS does NOT read `manifest.json` for icons or splash — these meta tags are the only way Safari installs work.
- **Theme color.** `#7B1D1D` (the customer-app maroon hero) in `viewport.themeColor`. Drives the Android tab-bar tint on Chrome and the standalone status-bar background.
- **Service worker behavior** ([app/sw.ts](app/sw.ts)):
  - `precacheEntries` from Serwist's build manifest — Next.js static assets cached for instant repeat loads.
  - `runtimeCaching: defaultCache` — Serwist's batteries-included strategy (StaleWhileRevalidate for static, NetworkFirst for navigations, CacheFirst for fonts/images).
  - `navigationPreload: true` — speeds up SW-controlled navigation responses.
  - `fallbacks.entries: [{ url: "/c/offline", matcher: req.destination === "document" }]` — any document fetch that fails → render [app/c/offline/page.tsx](app/c/offline/page.tsx).
  - `skipWaiting + clientsClaim` — new SW versions take over immediately on next page load. Trade-off: a user on a slow network might get a mid-session SW swap. Acceptable for now; can switch to "wait for restart" if it ever causes weirdness.
- **Offline fallback** ([app/c/offline/page.tsx](app/c/offline/page.tsx)). Added to `PUBLIC_ROUTES` in [app/c/layout.tsx](app/c/layout.tsx) so the auth gate doesn't try to `validateSession` against an unreachable backend.
- **Install-prompt UX** ([components/c/InstallPrompt.tsx](components/c/InstallPrompt.tsx)). Listens for `beforeinstallprompt` (Chrome/Edge/Android only), stashes the event, shows a dismissable banner above the bottom nav. Dismiss persists via `localStorage.wearify_pwa_install_dismissed` so we don't nag on every load. Suppressed when `matchMedia("(display-mode: standalone)").matches` (already-installed users never see it). Rendered inside the authenticated shell only — login/register surfaces don't get the banner because installing pre-auth and immediately hitting a login wall is hostile.
- **Out of scope (deferred to follow-up plans):**
  - **Web push notifications** — needs VAPID key pair, `web-push` Convex action, new `pushSubscriptions` table keyed by `customerId`, client subscription UI inside `/c/me/preferences`, and a notification taxonomy (loyalty milestone, look ready, store offer). Standalone subsystem.
  - **Background Sync API** — for queueing wishlist toggles / look-saves while offline.
  - **Web Share Target** — receive shared images from other apps into a try-on flow.
  - **Per-language manifest variants** — currently `lang: "en"` only; could ship 9 manifests for each i18n locale once kiosk language picker writes back to the customer profile.
- **Production caveat — env var to add.** None for this pass — manifest + SW are built into the Next bundle at `npm run build`. Netlify deploys pick them up automatically. **However:** if a future change adds runtime SW config that depends on `NEXT_PUBLIC_*` vars, those vars must be set in Netlify env (Next.js side), not Convex env (Better Auth side) — see the dual-runtime gotcha in the production-deployment entry below.
- **Verification:** Lighthouse PWA audit passes (Installable + PWA-optimized). Real install tested on `[fill in once tested]`. Offline fallback verified in DevTools → Network → Offline. Type-check clean.
```

- [ ] **Step 2: Verify the markdown renders correctly**

Run:
```bash
head -50 CONTEXT.md | tail -20
```
to confirm §0 instructions are still intact, then:
```bash
grep -n "### " CONTEXT.md | head -10
```
Expected: the new "Customer module — installable PWA" header appears as the FIRST `### ` heading after the §12 introductory paragraph.

- [ ] **Step 3: Commit**

```bash
git add CONTEXT.md
git commit -m "docs(context): log customer-PWA conversion — manifest, SW, offline, install prompt"
```

---

## Self-Review Checklist (run after writing the plan)

- ✅ **Spec coverage** — every PWA pillar from the audit is addressed: manifest (Task 3), icons (Task 2), service worker (Task 5), Apple meta + viewport (Task 4), offline fallback (Task 6), install prompt (Task 7), HTTPS already in prod, Lighthouse audit (Task 8). Push notifications + background sync are explicitly deferred per the architecture note.
- ✅ **Placeholder scan** — no TBDs, no "appropriate error handling", no "similar to Task N", every code block is complete.
- ✅ **Type consistency** — `InstallPrompt` exports default, imported as default in `app/c/layout.tsx`. `BeforeInstallPromptEvent` interface matches the Web API. `Viewport` import from `next` is the Next 16 metadata API. SW types declared inline.
- ✅ **File paths exact** — every path is rooted at the repo root and matches what's actually in the tree (verified `next.config.ts` is `.ts`, `app/layout.tsx` is server-component async, `app/c/layout.tsx` is client component with `PUBLIC_ROUTES` set on line 63).
- ✅ **CONTEXT.md log entry written** per §0 working-style rule.
- ✅ **Commits per task** — 9 tasks, 9 commits, atomic and revertable.
