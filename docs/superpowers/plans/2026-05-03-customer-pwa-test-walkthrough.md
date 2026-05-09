# Customer PWA — Test Walkthrough

> **Companion to:** [2026-05-03-customer-pwa-conversion.md](./2026-05-03-customer-pwa-conversion.md). This is plan **Task 8** in human-runnable form.
>
> **Branch under test:** `feat/customer-pwa` (or `pre-production` after merge).
> **Local URL:** `http://localhost:3000` (PWA features require a secure context — `localhost` is exempt; LAN IPs are NOT).

---

## Prerequisites

```bash
cd /home/vrathik/wearify-claude/wearify   # or the worktree path
npm run build && npm run start
```

Wait for "Ready in …" and confirm:

```bash
curl -sI http://localhost:3000/manifest.json | head -1   # → HTTP/1.1 200 OK
curl -sI http://localhost:3000/sw.js          | head -1   # → HTTP/1.1 200 OK
```

Both must return `200`. If either is `404`, the service-worker build didn't run — recheck `package.json:build` is `next build --webpack` (Next 16's default Turbopack rejects Serwist's webpack plugin; this is the documented workaround).

---

## Step 1 — Open and hard-reload

In Chrome (desktop): open **`http://localhost:3000/c`**. If it redirects to `/c/login`, that's correct.

Hard-reload with **Cmd/Ctrl+Shift+R** so you don't get yesterday's cache.

---

## Step 2 — Verify the manifest

DevTools → **Application** → **Manifest** (left sidebar).

Expected values:

| Field | Value |
|---|---|
| Name | Wearify |
| Short name | Wearify |
| Start URL | /c |
| Scope | /c |
| Display | standalone |
| Theme color | `#7B1D1D` (dark red swatch) |
| Background color | `#FDF8F2` (ivory swatch) |
| Icons | 3 thumbnails — 192×192, 512×512 (any), 512×512 (maskable). Each shows the maroon-tile W monogram. |

Scroll to the **Installability** section at the bottom — every line should be a green checkmark. If anything is red, the message names exactly what's missing (e.g., "service worker not found", "icon dimension mismatch").

**Pass criteria:** all green checkmarks under Installability.

---

## Step 3 — Verify the service worker

DevTools → **Application** → **Service Workers** (left sidebar).

Expected:
- One SW entry, **Source:** `/sw.js`
- **Status:** `activated and is running` (green dot)
- Tick **"Update on reload"** at the top — helps during testing.

**Pass criteria:** status reads `activated and is running`. Anything else (`redundant`, `installing`, missing) is a fail.

---

## Step 4 — Verify the offline fallback

30-second sequence:

1. Load `/c/login` and let it fully render (this populates the SW precache).
2. DevTools → **Network** tab → tick **Offline** in the throttle dropdown (top of the panel).
3. In the address bar, navigate to `localhost:3000/c/wardrobe` and press Enter.

Expected: the maroon-tinted "You&apos;re offline" screen with the WifiOff icon and a "Try again" button.

**Failure modes:**
- **Chrome dinosaur** → SW didn't catch the navigation. Re-verify Step 3 status; reload `/c` first to seed the cache, then retry.
- **Login redirect** → `/c/offline` not in `PUBLIC_ROUTES` (regression in `app/c/layout.tsx:64`).
- **A different screen** → cached old version. Application → Storage → "Clear site data", then full refresh.

4. Untick **Offline**, click "Try again". Should reload normally.

**Pass criteria:** the offline screen appears in step 3, app recovers in step 4.

---

## Step 5 — Verify the install prompt

Still on `/c` (logged in or out — try both).

Chrome auto-fires `beforeinstallprompt` once the manifest + SW + icons criteria are met. The maroon-tinted "Install Wearify" banner should slide up at the bottom, above the nav bar.

**Two ways to trigger:**
- **Wait:** stay on `/c` for 10–20 seconds; banner should appear.
- **Force:** Chrome menu (⋮) → "Install Wearify…" OR DevTools → Application → Manifest → "Add to home screen" link near the bottom.

**Re-test after dismissing:**
```js
// In DevTools Console
localStorage.removeItem("wearify_pwa_install_dismissed");
// Then reload
```

**Pass criteria:** banner appears at bottom of `/c` (not on `/c/login` or `/c/register`), Install button opens Chrome's install dialog, X button dismisses persistently.

---

## Step 6 — Lighthouse PWA audit

DevTools → **Lighthouse** tab.

- **Mode:** Navigation
- **Device:** Mobile
- **Categories:** tick **Performance** and **Progressive Web App**
- **URL:** `http://localhost:3000/c/login`
- Click **Analyze page load** (~30 s)

**Pass criteria (PWA section only):**
- ✅ **Installable** — manifest valid, SW registered, icons of correct sizes
- ✅ **PWA Optimized** — themed, viewport set, masked icon, content sized correctly

Performance score is informational and can be ignored for this audit (Convex networking dominates).

If anything is red, copy the failure message verbatim and ask for a fix.

---

## Step 7 — Real Android install (requires deploy)

Plain `http://localhost:3000` and `http://192.168.x.x:3000` don't qualify as secure contexts on a real device, so PWA install will not work over them. Three paths to test on a real device:

| Option | Setup | Notes |
|---|---|---|
| **A) cloudflared tunnel** | `cloudflared tunnel --url http://localhost:3000` | Quick HTTPS tunnel. Public URL. Tunnel ends on Ctrl-C. |
| **B) Netlify deploy preview** | `git push origin feat/customer-pwa` (or merge → `pre-production` auto-deploys) | True production parity (Convex prod, real env vars). ~3 min round-trip. |
| **C) Skip until next release** | Test on the next prod deploy | Fine if step 6 passed cleanly. |

For options A/B, on a Chrome Android device:

1. Open the HTTPS URL → `/c`.
2. Chrome menu (⋮) → **Install app**. Or wait for the in-app install banner.
3. Open the installed app from the home screen.

**Pass criteria:** standalone window opens (no Chrome address bar), maroon-W tile is the icon, app navigates within `/c`. Tapping a link to `/admin` or `/store` should escape to a regular Chrome tab (manifest scope `/c` enforces this).

---

## Step 8 — Real iOS install (requires deploy)

iOS Safari does **not** support `beforeinstallprompt`; the install path is manual.

1. Open the HTTPS URL on Mobile Safari (iPhone or iPad). **Chrome on iOS will not work** — must be Safari.
2. Tap **Share** → **Add to Home Screen**.
3. The icon preview should be the maroon-W tile (NOT a screenshot of the page — if it's a screenshot, the apple-touch-icon link is broken).
4. Tap **Add**. Open from home screen.

**Pass criteria:** standalone window (no Safari chrome), splash flashes from the 2048×2732 PNG (centered W on ivory), lands on `/c`.

**iOS quirks:**
- Status bar uses `default` style — black icons over the page background, not translucent.
- `display-mode: standalone` works; the install prompt banner correctly suppresses inside the installed PWA.
- Convex websocket reconnects on resume — first cold-start may show a brief loading state.

---

## Common failure modes (post-merge)

| Symptom | Likely cause | Fix |
|---|---|---|
| `npm run build` errors with "This build is using Turbopack, with a `webpack` config" | Someone reverted `--webpack` flag | Re-add `--webpack` to `package.json:build` |
| Lighthouse "No matching service worker detected" | Built with Turbopack, SW skipped | Rebuild with `next build --webpack` |
| `<meta name="apple-mobile-web-app-capable">` missing in head | `metadata.other` field stripped from `app/layout.tsx` | Re-add `other: { "apple-mobile-web-app-capable": "yes" }` |
| Maskable icon shows white edges on Android | Maskable PNG was regenerated without the maroon background | Re-run `node scripts/generate-pwa-icons.mjs` |
| Install banner shows on `/c/login` | Render moved out of authenticated branch | Restore `<InstallPrompt />` next to `<BottomNav />` in the post-auth render of `app/c/layout.tsx` |
| Offline page shows login redirect instead of the WifiOff screen | `/c/offline` removed from `PUBLIC_ROUTES` | Re-add to the Set in `app/c/layout.tsx:64` |

---

## Quick verification commands (no browser required)

For CI or sanity checks without Chrome DevTools:

```bash
# Manifest is served and valid JSON
curl -s http://localhost:3000/manifest.json | jq .name           # → "Wearify"
curl -s http://localhost:3000/manifest.json | jq -r .scope       # → /c
curl -s http://localhost:3000/manifest.json | jq '.icons | length' # → 3

# Service worker is served as JS
curl -sI http://localhost:3000/sw.js | grep -i content-type      # → application/javascript

# Apple meta tags emitted in HTML head
curl -s http://localhost:3000/c/login | grep -E 'apple-mobile-web-app|mobile-web-app|theme-color|manifest'
# Expected lines:
#   <meta name="theme-color" content="#7B1D1D"/>
#   <link rel="manifest" href="/manifest.json"/>
#   <meta name="apple-mobile-web-app-capable" content="yes"/>
#   <meta name="mobile-web-app-capable" content="yes"/>
#   <meta name="apple-mobile-web-app-title" content="Wearify"/>
#   <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
#   <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180"/>

# Generated icons exist at correct dimensions
file public/icons/icon-192.png         # → PNG image data, 192 x 192
file public/icons/icon-512.png         # → PNG image data, 512 x 512
file public/icons/icon-maskable-512.png # → PNG image data, 512 x 512
file public/icons/apple-touch-icon.png # → PNG image data, 180 x 180
file public/icons/apple-splash-2048x2732.png # → PNG image data, 2048 x 2732
```

If all of the above succeed and steps 1–6 in the browser pass, the PWA is verified and the branch can be merged.
