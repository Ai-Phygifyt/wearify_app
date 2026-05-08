# Wearify Customer PWA — Designer Redesign Brief

**Audience:** External designer redesigning the `/c` customer-facing PWA into a premium, installable mobile app.
**Date:** 2026-05-07
**Source-of-truth:** This document. The codebase mirrors what's described here; if anything in the code contradicts this brief, defer to the brief unless an engineer says otherwise.

---

## Table of Contents

1. [Product context](#1-product-context)
2. [Sitemap & navigation](#2-sitemap--navigation)
3. [Current design system (reference, not constraint)](#3-current-design-system-reference-not-constraint)
4. [Per-surface specs](#4-per-surface-specs)
   - Shell & global: [Layout shell](#shell--layout-clayouttsx) · [Install prompt](#install-prompt-componentscinstallprompttsx) · [Offline](#coffline)
   - Auth: [Login](#clogin) · [Register](#cregister)
   - Main tabs: [Home](#c-home) · [Looks](#clooks) · [Look detail](#clooksid) · [New arrivals](#cnew) · [Wardrobe](#cwardrobe)
   - Account hub: [Me](#cme-account-hub) · [Profile](#cmeprofile) · [Preferences](#cmepreferences) · [Loyalty](#cmeloyalty) · [History](#cmehistory) · [Stores](#cmestores) · [Refer](#cmerefer) · [Feedback](#cmefeedback) · [Tailor orders](#cmetailor-orders) · [Language](#cmelanguage) · [Privacy](#cmeprivacy)
5. [Cross-cutting patterns](#5-cross-cutting-patterns)
6. [Backend data model (designer mental map)](#6-backend-data-model-designer-mental-map)
7. [PWA specifics to respect](#7-pwa-specifics-to-respect)
8. [Known UX gaps (observational)](#8-known-ux-gaps-observational)
9. [Out of scope](#9-out-of-scope)

---

## 1. Product context

**Wearify** is an AI virtual try-on platform for Indian saree retailers. It spans six interconnected modules:

| Module | Audience | Surface |
|---|---|---|
| **Admin** (Mission Control) | Wearify ops team | Web dashboard |
| **Retailer** (Store Dashboard) | Store owners/managers | Web |
| **Sales Tablet** | In-store staff | Tablet app, PIN auth |
| **Smart Mirror / Kiosk** | Customers in-store | Edge device, AI try-on, 9-language |
| **Customer PWA** (`/c`) | End customers | **Mobile PWA — this brief** |
| **Tailor** | Blouse-stitching partners | Web |

### Where `/c` fits

The customer journey:

1. **In-store (Kiosk):** Customer enters a saree store. Staff helps them onto a Wearify smart-mirror kiosk. Customer logs in by phone + OTP, scans body once (used for AI try-on rendering), and tries on sarees curated by staff (or pulls more from the catalog). Each try-on creates a **look** with an AI-rendered photo of the customer wearing that saree. Customer can save items to **wardrobe** (intent to buy/return to) or **cart** (immediate purchase) at the kiosk.

2. **Post-visit (PWA — `/c`):** Customer leaves the store. They open the Wearify PWA (or install it to their home screen). All their kiosk activity is already there — looks, wardrobe, visit history, store directory, loyalty points, referral codes, tailor orders. They can revisit looks, wishlist additional items, refer friends, edit preferences, chat with stores via WhatsApp, and submit feedback.

The PWA is the **at-home companion** to the in-store kiosk. It's never the discovery surface; it's the continuation surface.

### Who the customer is

Indian women shopping for sarees. Phones are mid-range Android (Chrome) and mid-to-premium iOS (Safari). Languages span 9 Indian languages — UI strings have English defaults today, but designs need to accommodate longer / shorter strings and non-Latin scripts (Devanagari, Tamil, Bengali, Telugu, Kannada, Malayalam, Gujarati). Aesthetic expectation: **premium boutique, not e-commerce mass-market**. Saree shopping is emotional + heritage-laden — think jewellery store, not Amazon.

### Why mobile-first

The PWA is held in-hand, post-store, often shared with family ("look what I tried"). Tablet/desktop is a non-goal — current desktop view stretches to 720px and centers. Designer can keep that constraint or expand, but mobile is the primary canvas.

### PWA constraints already wired (must respect)

- **Installable on Android**: Chrome `beforeinstallprompt` event; in-app banner prompts install.
- **Installable on iOS**: Safari "Add to Home Screen" via Apple meta tags. Both `apple-mobile-web-app-capable` and `mobile-web-app-capable` meta tags are emitted (don't remove either).
- **Manifest scope = `/c`**: installing the PWA gives the customer surface only. `/admin` and `/store` if visited from the installed window stay in browser chrome (intentional).
- **Theme color**: `#7B1D1D` (drives Android tab tint and standalone status bar).
- **Background color**: `#FDF8F2`.
- **Icons** delivered: 192×192, 512×512, maskable 512×512 (80% safe-zone padding for Android adaptive), Apple touch icon 180×180, iOS splash 2048×2732 single (iOS auto-scales).
- **Service worker** caches static assets; navigations are network-first; failed navigation falls back to `/c/offline`.
- **Splash screen** (custom in-app, not the OS one): 1200ms on initial cold load.
- **Safe-area-inset-bottom** is respected by the bottom nav on devices with home-indicators.
- **Touch targets**: 44px minimum across the surface today.

If the redesign changes any of these (e.g., larger touch target, different theme color, new icon shape), call it out so engineering can update the manifest and meta tags.

---

## 2. Sitemap & navigation

### Routes (20 surfaces total)

```
/c
├── /c                       (Home)
├── /c/login                 (PUBLIC)
├── /c/register              (PUBLIC)
├── /c/offline               (PUBLIC)
├── /c/looks                 (Try-on history feed)
│   └── /c/looks/[id]        (Single look detail)
├── /c/new                   (New arrivals from your stores)
├── /c/wardrobe              (Wardrobe + Wishlist tabs)
└── /c/me                    (Account hub)
    ├── /c/me/profile        (Edit profile)
    ├── /c/me/preferences    (Saree preferences)
    ├── /c/me/loyalty        (Tier, points, store credit)
    ├── /c/me/history        (Visit history)
    ├── /c/me/stores         (My stores)
    ├── /c/me/refer          (Refer a friend)
    ├── /c/me/feedback       (Rate your visit)
    ├── /c/me/tailor-orders  (My tailor orders)
    ├── /c/me/language       (9-language picker)
    └── /c/me/privacy        (DPDP / consent)
```

### Bottom navigation (5 tabs)

Persistent sticky bottom nav, visible on every gated route. Order:

1. **Home** — `Home` icon — `/c` — active when pathname is exactly `/c`
2. **Looks** — `Heart` icon — `/c/looks` — active when path starts with `/c/looks`
3. **New** — `Sparkles` icon — `/c/new` — active when path starts with `/c/new`
4. **Wardrobe** — `Shirt` icon — `/c/wardrobe` — active when path starts with `/c/wardrobe`
5. **Me** — `User` icon — `/c/me` — active when path starts with `/c/me`

(Login/register/offline render WITHOUT the bottom nav — they're "shell-less" public routes.)

### Auth gate

- **Public routes**: `/c/login`, `/c/register`, `/c/offline`. No session required.
- **Gated routes**: everything else. Redirects to `/c/login` if no token in `localStorage["wearify_auth_token"]` or session validation fails.
- **Splash** (1200ms) shows on initial cold load over the gate logic so the user always sees branded waiting, never a flash of redirect.

### Cross-page navigation map (key handoffs)

- Home → Looks: "View all" link from Recent Looks rail
- Home → Wardrobe: "My Wardrobe" quick action
- Home → New: "New Arrivals" quick action / "Discover New Collections" banner
- Home → Stores: "Store Locator" quick action / store rail card / "View all" link
- Home → Loyalty: store-credit CTA button (when credit > 0)
- Looks card → Looks detail (`/c/looks/[id]`)
- Looks detail → Tailor orders ("Find a Tailor" button)
- Looks detail → another Looks detail (same-session sibling carousel)
- Wardrobe (Wishlist tab) empty state → Looks
- Me index → all 10 sub-pages
- Me → Login (sign-out)

### Splash → home flow (text diagram)

```
Cold load
  └─ 1200ms splash overlay (gradient hero + "W" monogram)
     ├─ has token?
     │   ├─ no → redirect /c/login (after splash dismisses)
     │   └─ yes → validateSession query
     │       ├─ session=null or role≠customer → clear token → /c/login
     │       └─ valid → fetch customer by phone → render gated route
     └─ public route requested? → render directly (no validation)
```

---

## 3. Current design system (reference, not constraint)

The current system is documented here for orientation. **The designer is free to discard it entirely.** If you want to evolve, here's what to evolve from. If you want to start fresh, skip this section.

### Palette (CSS variables — "Heritage Rose")

**Neutrals (warm cream):**
- `--cx-bg: #FBF7F1` — primary background
- `--cx-bg-deep: #F3ECE0` — secondary background
- `--cx-surface: #FFFFFF` — cards, inputs
- `--cx-surface-soft: #F8F2E9` — hover/soft states

**Ink (warm near-black):**
- `--cx-ink: #1C1108` — primary text
- `--cx-ink-mid: #3D2E1E` — secondary
- `--cx-ink-soft: #6B5744` — tertiary
- `--cx-ink-muted: #9C8878` — muted labels
- `--cx-ink-ghost: #C4B5A8` — very faint

**Primary — deep brick (brand):**
- `--cx-primary: #8B2E2B`
- `--cx-primary-l: #A94540` (lighter)
- `--cx-primary-d: #5E1A18` (darker)
- `--cx-primary-xd: #3A0F0D` (darkest)
- `--cx-primary-ghost: #F5E6E3` (light tint background)

**Accent — champagne gold:**
- `--cx-gold: #B8860B`
- `--cx-gold-l: #D4A017`
- `--cx-gold-d: #7A5A08`
- `--cx-gold-ghost: #FAF1DD`

**Navy (occasional contrast):**
- `--cx-navy: #0D1F35`
- `--cx-navy-mid: #1A3550`

**Rose (soft feminine accent):**
- `--cx-rose: #B08080`
- `--cx-rose-l: #EADADA`
- `--cx-rose-d: #8B4A52`

**State colors:**
- Success: `#1E5C2F` (with 0.09 alpha bg)
- Error: `#8B0000` (with 0.09 alpha bg)
- Amber: `#8B4513` (with 0.10 alpha bg)
- WhatsApp: `#25D366`

**Borders:** `#E4D9CC` (default) · `#DFC07A` (gold-tinted) · `#F0E8DC` (light) · `#F8F2E9` (very light)

### Gradients (used heavily)

- `--cx-grad-primary`: `linear-gradient(135deg, #8B2E2B 0%, #A94540 100%)` — primary buttons
- `--cx-grad-gold`: `linear-gradient(135deg, #B8860B 0%, #D4A017 55%, #B8860B 100%)` — gold buttons
- `--cx-grad-hero`: deep brick → maroon → red-brown — splash, hero backgrounds
- `--cx-grad-rose`: rose-deep → rose-light
- `--cx-grad-dark`: `linear-gradient(135deg, #0D1F35 0%, #1A3550 100%)`
- `--cx-grad-whatsapp`: WhatsApp green spectrum
- `--cx-grad-cream`: `linear-gradient(180deg, #FBF7F1 0%, #F3ECE0 100%)`

### Typography

- **Cormorant Garamond** (300, 400, 500, 600, 700 + italics) — **display + headlines** (often italic for an "atelier" feel)
- **DM Sans** (300–700 + italics) — body text
- **DM Mono** (400, 500, 600) — numbers, codes, OTP boxes, prices

### Radii & shadows

- `--cx-r-xs: 6px` · `--cx-r-sm: 10px` · `--cx-r-md: 12px` · `--cx-r: 16px` (default) · `--cx-r-lg: 20px` · `--cx-r-xl: 26px` · `--cx-r-pill: 9999px`
- Shadows: `--cx-shadow-xs` (subtle), `--cx-shadow` (default), `--cx-shadow-md`, `--cx-shadow-lg`, `--cx-shadow-frame` (large modal), `--cx-shadow-gold` (gold glow), `--cx-shadow-primary` (primary glow)

### Layout vars

- `--cx-bottom-nav-h: 68px` — height reserved for bottom nav
- `--cx-shell-max: 720px` — max width on tablet+ (current desktop frames at 720px centered)
- `--cx-shell-pad: 18px` — horizontal padding inside shell

### Reusable primitives (current `.cx-*` class system)

**Buttons:** `.cx-btn` base + `.cx-btn-primary` · `-gold` · `-ghost` · `-outline` · `-dark` · `-danger` · `-whatsapp` · `-block` (full-width) · `-lg` (52px) · `-sm` (32px)

**Icon buttons:** `.cx-iconbtn` (38×38px circle) + `-sm` (32px) · `-lg` (44px) · `-glass` (semi-transparent for dark BGs) · `-danger`

**Cards:** `.cx-card` · `-flat` (no shadow) · `-soft` (soft surface bg) · `-padded` (14×16)

**Inputs:** `.cx-input` (1.5px border, focus ring) · `.cx-otp` (44×52px box, monospace 22px)

**Sections / chips:** `.cx-section` · `.cx-chip` (filter pill, active gradient variant) · `.cx-chip-row` (horizontal scroll)

**Empty states:** `.cx-empty` (48px padded) · `.cx-empty-icon` (64×64 ghost circle) · `.cx-empty-title` (20px serif italic) · `.cx-empty-sub` (13px muted)

**Loading:** `.cx-typing` (3 gold dots blinking) · `.cx-loading` (60vh spinner container)

**Decorative:** `.cx-zari` (gold divider line) · `.cx-paisley` (SVG pattern overlay) · `.cx-noise` (fractal noise) · `.cx-silk` (shimmer animation 5.5s) · `.cx-gold-shimmer` (animated gradient text clip)

### Animations

- `cx-fadeIn` (0.4s) · `cx-slideUp` (0.5s) · `cx-slideDown` (0.4s) · `cx-pageIn` (0.4s subtle up + fade) · `cx-scaleIn` (0.36s 0.93→1) · `cx-popIn` (0.3s bouncy 0.7→1) · `cx-shake` (0.35s ±6px horizontal) · `cx-spin` (infinite rotation) · `cx-press` (0.96 scale on active) · `cx-hover-lift` (translate up 2px + shadow)
- Stagger delay classes: `cx-d1` to `cx-d8` (0.04s → 0.38s)
- Easing: `--cx-spring` (bouncy), `--cx-ease` (smooth), `--cx-ease-out` (standard)

### Responsive breakpoints

- **<360px**: smaller phones — OTP boxes shrink (38×46px, 18px font); hero padding tightens
- **360–639px**: default mobile sizing
- **≥640px**: shell caps at 720px, centered, rounded, with frame shadow
- **≥1100px**: page background gets a radial gradient with gold + primary accents (so desktop "feels" branded around the centered shell)

### Source

`app/c/customer-theme.css` (~40KB). Engineering can extract the file or the relevant subset on request.

---

## 4. Per-surface specs

Every surface below follows this template:

- **Route** + **purpose** + **auth requirement**
- **Information architecture** (header → sections → footer in order)
- **Every visible UI element** with its data source
- **Form fields** with validation rules where applicable
- **States**: empty / loading / error / success (with exact UI copy where it exists)
- **Outbound + inbound navigation**
- **Notable behaviours** (auto-advance, paste, toasts, etc.)

---

### Shell / Layout (`/c/layout.tsx`)

**Route:** wraps every `/c/*` route.
**Purpose:** Splash, auth gate, persistent bottom nav, install-prompt host, top-level theme + font load.
**Auth:** N/A — provides the gate.

**Splash screen** (initial cold load, 1200ms):
- Full-viewport overlay over the active route
- Background: `--cx-grad-hero` (deep brick → maroon)
- Center stack:
  - 92×92px rounded square, semi-transparent white with gold border, containing a **"W" monogram** in Cormorant Garamond 52px italic, gold color
  - **"Wearify"** heading (32px, serif italic, gold-shimmer animated text-clip)
  - **"Try on the moment"** tagline (11px uppercase, muted light)
- Fade-in (0.25s); logo scale-in (0.5s)
- Auto-dismisses after 1200ms; doesn't block interaction

**Bottom navigation** (sticky, z-50):
- Backdrop blur (14px) + semi-transparent cream (rgba 0.94)
- Top border: light gray
- Safe-area-inset-bottom padding
- 5 equal-width tabs (icons + labels)
- Active state: icon stroke goes 1.7 → 2.2; label color → primary brick; gold indicator bar (18×2px) appears below active item; transitions 0.15s

**Install prompt** (component below) sits floating ~84px from bottom (above nav).

**Auth flow:**
1. On mount, read `localStorage["wearify_auth_token"]`
2. If absent and pathname not in `PUBLIC_ROUTES = ["/c/login", "/c/register", "/c/offline"]` → redirect `/c/login`
3. If present: pass to `api.phoneAuth.validateSession`; expect `{ phone, role }` with `role === "customer"`. If fail: clear token, redirect `/c/login`
4. On success: fetch `api.customers.getByPhone({ phone })` → populate `CustomerContext` provider with `{ user, customerId, phone, customer }`
5. Children consume via `useCustomer()` hook

**Loading state during validation:** centered 3-dot typing animation (`.cx-typing`).

**Fonts loaded** (Google Fonts link tag): Cormorant Garamond, DM Sans, DM Mono.

---

### Install Prompt (`components/c/InstallPrompt.tsx`)

**Purpose:** prompt PWA install on Android (where `beforeinstallprompt` fires). iOS users get install via Safari's native "Share → Add to Home Screen" (no in-app banner — Apple doesn't expose an event).

**Trigger conditions** (all must hold):
1. `beforeinstallprompt` event fires (Android Chrome / Edge)
2. NOT in standalone mode (`window.matchMedia("(display-mode: standalone)").matches === false`)
3. User hasn't dismissed previously (`localStorage["wearify_pwa_install_dismissed"]` not set)
4. Authenticated (component is rendered inside the gated shell only — login/register/offline don't show it)

**Position:** `position: fixed; left: 12px; right: 12px; bottom: 84px; z-index: 200;` (sits above bottom nav)

**Visual:**
- Dark semi-transparent bg (`rgba(20, 14, 10, 0.92)`) + 12px backdrop blur
- 1px gold border, 16px radius
- Padding 14px / 14px / 14px / 18px
- Elevated shadow
- Slide-up entry (0.3s)

**Layout (flex row, gap 12px):**
1. Left icon: 38×38px rounded box, semi-transparent gold bg, gold border, `Download` icon (lucide, 18px gold)
2. Text block (flex 1):
   - Title: **"Install Wearify"** (13px, weight 600, cream)
   - Subtitle: **"Add to home screen for the full app feel"** (11px, cream muted)
3. Install button: pill, gold gradient bg, dark text (12px, weight 700, uppercase) — on tap, calls the saved `prompt()` from the deferred install event
4. Dismiss button: 28×28px pill, semi-transparent bg, X icon — on tap, sets `wearify_pwa_install_dismissed` and hides

---

### `/c/offline`

**Route:** `/c/offline`
**Purpose:** Fallback rendered by service worker when a navigation fails offline.
**Auth:** Public (must work without backend).

**Layout:**
- Full viewport, flex column centered, gap 18px, 24px padding
- Background: `--cx-grad-hero` (same as splash)
- Center text alignment

**Content:**
- 84×84px rounded box, semi-transparent white with gold border, containing `WifiOff` icon (lucide, 36px gold)
- Heading: **"You're offline"** (28px serif italic, cream)
- Body: **"Reconnect to load fresh looks, your wardrobe, and the latest from your stores."** (14px cream muted, max 320px)
- Retry button: pill (border-radius 999), transparent bg, gold border 1.5px, gold text (13px, weight 600, uppercase). Action: `window.location.reload()`

The page is fully static (no Convex queries) so the service worker can cache the rendered HTML. The page is in `PUBLIC_ROUTES` so the auth gate doesn't try to validate-and-redirect when there's no backend.

---

### `/c/login`

**Route:** `/c/login`
**Purpose:** Existing-customer entry. Phone → OTP → home (or branch to register if no account).
**Auth:** Public.

**Two-step UI within one screen** (state-driven, no separate route).

#### Decorative background (constant)

- 4 floating gradient orbs (gold radial, opacity 0.25–0.5, 4.5s animation, staggered)
- Paisley SVG pattern overlay (gold outlines, low opacity)
- Fractal noise texture overlay
- Bottom: gold "zari line" (gradient fade) + copyright footer text

#### Step 1 — phone entry

**Header:**
- 78×78px circle with a flower icon (lucide), animated entry
- **"Wearify"** (32px serif italic, gold-shimmer)
- **"Your AI-powered saree experience"** tagline

**Card** (white bg, large radius, slide-up entry):
- Label: **"Mobile Number"**
- Two-part input:
  - Static plum-bg badge: **"+91"**
  - Tel input: `maxLength=10`, monospace, 0.06em letter-spacing
  - Placeholder: **"98765 43210"**
- Validation: regex `^[6-9]\d{9}$` (must start 6–9, 10 digits total)
- Error message (on shake animation): **"Enter a valid 10-digit mobile number starting with 6-9"**
- Primary button **"Send OTP"** (cx-btn-primary cx-btn-block cx-btn-lg, arrow icon right) — disabled until valid

**Bottom link:** **"New user? Register"** (teal underline) → `/c/register?phone=<formatted>` (carries entered phone if any)

#### Step 2 — OTP verification

**Header:**
- Glass circular back button (returns to phone step)
- **"Verify OTP"** (22px serif italic)
- Confirmation: **"Sent to +91 {phoneDigits}"**

**OTP input:**
- 6 boxes (44×52px standard; 38×46 on <360px screens)
- Monospace, 22px, center-aligned
- Border 1.5px light gray; focus → gold border + soft shadow + scale 1.02; filled → plum-ghost bg + primary border
- `inputMode="numeric"` for numeric mobile keyboard
- **Auto-advance** to next box when digit entered
- **Backspace** goes back to previous box if current is empty
- **Paste handling**: detects 6-digit paste anywhere → distributes across boxes → auto-submits

**Submit:**
- Auto-submit when all 6 filled
- Manual "Verify OTP" button (primary block, disabled if any empty)
- Loading state: 3-dot animation + **"Verifying..."** (12px muted); boxes disabled

**Branches after submission:**

A. **Success** → save token + user metadata to localStorage → `router.replace("/c")`

B. **No account found**:
- Gold-bordered alert card replaces (or appears above) the OTP boxes
- Title: **"No account found"**
- Message: **"We couldn't find a Wearify account for +91 {phoneDigits}. Create one in under a minute."**
- CTA: **"Register as new user"** (gold gradient) → `/c/register?phone=...`
- Secondary: **"Try a different number"** (underline) → resets to step 1

C. **OTP invalid:**
- Red 12px error text below boxes; shake animation; clears boxes; refocuses first box
- Verify button stays active for retry

**Resend OTP:** ghost link below ("Resend"), clears boxes, refocuses first.

**Backend:** `api.phoneAuth.loginWithOtp({ phone, otp, allowCreate: false })`

---

### `/c/register`

**Route:** `/c/register` (accepts `?phone=` query param to pre-fill)
**Purpose:** 3-step new-customer wizard. Phone → OTP → profile.
**Auth:** Public.

**Background:** ivory `--cx-bg`, max 440px width, centered.

**Progress indicator** (top of every step): 3 horizontal bars; current step bar is wide + gold; future bars narrow + gray border. Smooth width/color transition on step change.

**Header (constant):**
- Title: **"Create your Wearify account"** (28px serif italic, plum)
- Subtitle changes per step:
  - Step 1: **"We'll send you a one-time code to verify your number."**
  - Step 2: **"Enter the 6-digit code sent to +91 {phone}"**
  - Step 3: **"Tell us a bit about you so we can personalise your looks."**

**Error banner** (when validation/network fails): red bg, red text, shake.

#### Step 1 — phone

- Field **"Mobile Number *"** (auto-focus on mount): same +91 prefix + 10-digit input pattern as login
- Submit **"Send OTP"** (primary block large, arrow icon)
- Bottom link **"Already have an account? Log in"** → `/c/login`

#### Step 2 — OTP

- Same 6-box OTP input pattern as login (auto-advance, paste, backspace)
- Submit button **"Verify"** (loading state shows `Loader2` spinner + **"Verifying…"**)
- Secondary **"Change mobile number"** (ghost block, back-arrow) — returns to step 1, clears OTP

#### Step 3 — profile

**Photo (optional)**:
- 112×112px circular tappable label
- 3px solid gold border
- Default state: plum-gradient bg with **user's initials** (computed from name, max 2 chars; serif italic 40px)
- Bottom-right: 28px gold circle with `Camera` icon (lucide). After photo selected, icon swaps to `Pencil`
- File input: accepts JPEG/PNG/WebP. Validation: `MAX_PHOTO_BYTES = 4MB` (`validatePhoto` from `lib/profileHelpers.ts`)
- During upload: overlay "Uploading…" + spinner
- Help text below: **"Photo optional — we'll show your initials otherwise"**

**Form fields:**

| # | Label | Input | Validation |
|---|---|---|---|
| 1 | **Full Name *** | text | non-empty, ≥ 2 chars trimmed |
| 2 | **Date of Birth *** | date | not blank, valid YYYY-MM-DD, **age ≥ 13** (`MIN_AGE_YEARS = 13`), age ≤ 120. Max date = today − 13y (`maxDobToday()`). Below input shows live age: **"Age: {n}"** (gray, 12px) |
| 3 | **Gender *** | 2×2 toggle grid: Female / Male / Other / Prefer not to say. Active = gold border + gold ghost bg. | required |
| 4 | **Height *** | unit toggle (cm / ft+in pill switch); cm → single number 145–215; ft+in → two inputs (3–7 ft, 0–11 in). Helper shows the converted value live. | clamped to `MIN_HEIGHT_CM=120` to `MAX_HEIGHT_CM=220`. Required. |
| 5 | **City *** | text, placeholder **"e.g. Mumbai"** | non-empty trimmed |
| 6 | **Email** | email | optional; if non-empty must match `^[^\s@]+@[^\s@]+\.[^\s@]+$` |

**Submit button:** **"Finish & Enter Wearify"** (primary block large, arrow icon).
- Disabled if photo uploading or saving
- Loading: spinner + **"Creating account…"**

**On submit:**
1. Validate via `validateProfile` (returns first error message)
2. `api.phoneAuth.loginWithOtp({ phone, otp, allowCreate: true })` → token + customerId
3. `api.customers.completeProfile(...)` with all fields + optional photoFileId
4. Save token + user metadata to localStorage
5. Navigate to `/c`

**Footer info text** (below button): **"By finishing, you agree to our DPDP consent terms. You can edit any of these later."** (11px, muted, centered)

---

### `/c` (Home)

**Route:** `/c`
**Purpose:** Dashboard — first surface after login. Greeting, quick stats, store credit, offers, store rail, navigation hub, recent activity.
**Auth:** Gated.

#### Hero

- Background image (kiosk lifestyle photo) with paisley + noise overlays + dark scrim for legibility
- **Branding row:** flower icon + **"Wearify"** + **"Your Style Journey"**
- **Time-based greeting:** **"Good morning,"** / **"Good afternoon,"** / **"Good evening,"** + first name (from `user.name` or `customer.name`) with `Sparkles` icon
- **Stats badges row** (glass-gold style on dark hero):
  - **"❤️ {N} looks"**
  - **"🏪 {N} stores"**

(Computed from `looks.length` and `stores.length`.)

#### Store credit CTA (conditional)

Only renders if `customer.storeCredit > 0`.

- Full-width gold-gradient button with `Wallet` icon
- Label: **"₹{storeCredit} store credit available"**
- Tap → `/c/me/loyalty`

#### Offers carousel (conditional)

Only renders if any offers from `api.customers.listOffersForCustomer` have `active !== false`.

- Section title: **"🏷️ Offers & Promotions"**
- Horizontal scroll, 230px-wide cards:
  - Per-offer gradient bg (custom `offer.grad` or default red→gold)
  - Optional uppercase pill badge
  - Headline (serif bold italic 17px white)
  - Optional subline (12px semi-transparent white)
  - Optional CTA button (semi-transparent white pill + chevron)

#### My Stores section

- Section title: **"My Stores"**, "View all" link (only if stores exist) → `/c/me/stores`
- **Empty state** (no stores): icon + **"Visit a Wearify-powered store to see it here"**
- Otherwise: horizontal scroll of 156px-wide cards. Each card:
  - 82px-tall image with store badge bottom-left
  - Store name (13px bold, truncated)
  - **"{city}"** with `MapPin` icon (11px muted)
  - **"{n} visit(s)"** (10px ghost)

Source: `api.customers.listStoreLinksEnriched({ customerId })`

#### Discover banner

- Full-width dark-gradient button with semi-transparent overlay
- `Sparkles` icon + serif title **"Discover New Collections"** (22px)
- Subtext: **"Explore curated sarees from your favourite stores"**
- CTA pill **"Browse now"** (semi-transparent white + chevron)
- Tap → `/c/new`

#### Quick action grid (2×2)

Each tile = colored gradient icon strip (56px) + label (13px bold) + sub (11px muted). Staggered delay animations.

| Tile | Sub | Color | Route |
|---|---|---|---|
| **My Looks** | **"{N} saved look(s)"** | rose gradient + Heart icon | `/c/looks` |
| **New Arrivals** | **"Fresh collections"** | gold gradient + Sparkles | `/c/new` |
| **My Wardrobe** | **"{N} piece(s)"** | rose-blush gradient + Shirt | `/c/wardrobe` |
| **Store Locator** | **"{N} store(s)"** | plum gradient + Pin | `/c/me/stores` |

#### Recent Looks rail (conditional)

Renders only if `recentLooks.length > 0` (top 3 looks).

- Section title: **"Recent Looks"** + "View all" link if `looks.length > 3` → `/c/looks`
- Horizontal scroll of 156px-wide × 180px-tall image cards:
  - Image (placeholder gradient or AI render)
  - Store ID badge bottom-left (dark blur)
  - **"❤️ LOOK"** badge top-right (gold gradient)
  - Saree name (13px bold)
  - Optional price (12px gold monospace)

Tap a card → `/c/looks/[id]`

#### WhatsApp footer CTA

- Full-width card with WhatsApp gradient circle icon
- Title: **"Chat with a store"**
- Subtitle: **"Get styling advice via WhatsApp"**
- Tap → opens `wa.me/...` (uses store phone if exactly one store, else generic)

#### Data sources

- `api.customers.listStoreLinksEnriched`
- `api.sessionOps.listByCustomer` (looks)
- `api.sessionOps.listWardrobeByCustomer`
- `api.customers.listOffersForCustomer`
- `customer.storeCredit` (from CustomerContext)

---

### `/c/looks`

**Route:** `/c/looks`
**Purpose:** Full gallery of every try-on the customer has done at any kiosk. Filterable by store + date.
**Auth:** Gated.

#### Header

- Back button (top-left)
- Title: **"My Looks"**
- Subtitle: **"{N} try-on(s) across {M} store(s)"** (with store count bolded)

#### Sticky store filter (top: 0, z-20)

- Eyebrow: **"Filter by store"** (10px uppercase)
- Chip row (horizontal scroll):
  - First chip: **"All Stores ({totalCount})"**
  - Per-store chip: **"{StoreName} ({lookCountForStore})"**
- Active chip: primary gradient bg + white text + shadow
- Tapping "All Stores" also resets the date filter

#### Date filter chips (conditional)

Renders only if filtered set has > 1 unique date.
- Chips: **"All"** + per-unique-date (formatted en-IN locale)
- Tap selects that date

#### Look grid

- 2-column grid, 14px gap
- Each card 140px image height + info section. Tap → `/c/looks/[id]`
- Image renders: `look.imageFileId` (AI render) → fallback to gradient + faint saree SVG watermark (gold, 13% opacity bottom-right)
- **Heart button** (top-right): wishlist toggle
  - Filled gold heart if in wishlist; outlined white otherwise
  - On tap (stop propagation): toggles via `api.customers.addToWishlist` / `removeFromWishlist`; toast at bottom (96px from bottom): **"Added to wishlist"** / **"Removed from wishlist"** (2000ms auto-dismiss)
- Optional store-city badge (bottom-left, dark blur)
- Below image: saree name (12.5px bold truncated) + optional price (12px gold monospace)

#### Empty state

- Icon (Heart)
- Title: **"No looks yet"**
- Body: **"Visit a Wearify store and try on sarees to see them here"**

#### Loading state

- Skeleton grid with 4 cards, staggered `cx-d1`–`cx-d4` delays.

#### Data sources

- `api.sessionOps.listByCustomer({ customerId })` — enriched with `sareeImageId`, `sareeGrad`, `sareeEmoji`
- `api.customers.listStoreLinksEnriched({ customerId })` — for store filter chip data
- `api.customers.getWishlist({ customerId })` — keyed by `sareeId` for the heart state
- Mutations: `api.customers.addToWishlist`, `api.customers.removeFromWishlist`

---

### `/c/looks/[id]`

**Route:** `/c/looks/[id]`
**Purpose:** Single-look detail. Hero render + actions + details + same-session siblings.
**Auth:** Gated.

#### Hero (300px tall)

- Background: `look.grad` (or default `["#71221D", "#D4A843"]`)
- Silk shimmer overlay (5.5s infinite)
- SVG cross-hatch pattern (white 14% opacity)
- Saree silhouette SVG bottom-center (semi-transparent)
- Dark-to-transparent gradient at bottom for text legibility

**Top-left:** circular glass back button (38px, white arrow). Action: `router.back()`.

**Top-right (10px gap):**
- **Heart button**: toggles wishlist for this look's saree. Animates `cx-heartBeat` (0.55s) on tap. Filled gold if wished, outlined white otherwise.
- **Share button**: opens WhatsApp share dialog with pre-filled message:
  > **"Check out this beautiful {sareeName} saree I tried on at Wearify! {price}"**

**Bottom of hero (dark overlay):**
- Saree name (24px serif italic bold, white, text-shadow)
- Below: fabric (if exists) · separator dot · date (en-IN day/month/year)

#### Price + availability row (below hero)

- Price (left, if present): monospace 28px gold (₹ prefix, en-IN format)
- Right: pill **"AVAILABLE"** (plum-ghost bg, 10px bold)

#### Action buttons row

- **Add to Wishlist** (flex 1):
  - Wished state: gradient plum bg + white text + filled heart, label **"In Wishlist — tap to remove"**
  - Not wished: white bg + plum border + plum text + outline heart, label **"Add to Wishlist"**
- **Find a Tailor** (flex 1): white bg + gold border + gold text, `Scissors` icon + label. Tap → `/c/me/tailor-orders`

#### WhatsApp share button (full width)

- Gradient green WhatsApp bg, message-circle icon
- On tap: opens `wa.me/?text=<encoded>` and shows **"Link Copied!"** state for 2000ms

#### Zari divider

#### Details card

- Title: **"Details"** (16px serif italic bold plum)
- White card with shadow, 16px padding
- Rows (10px v-padding, divider between except last):
  - Fabric (if exists)
  - Drape Style (if exists)
  - Neckline (if exists)
  - Store (storeId)
  - Date
- **Accessories** subsection (if `look.accessories` non-empty): label + plum-ghost pill badges per accessory

#### Same-session siblings rail

Renders only if `sessionLooks.length > 0` (other looks from the same kiosk session).

- Section title: **"From the Same Session"** (16px serif italic plum)
- Horizontal scroll, 130px-wide × 100px-tall tiles:
  - Same gradient + shimmer + cross-hatch decoration
  - Saree name (11px bold truncated) + price (mono gold)
- Tap a tile → `/c/looks/[id]` (replace navigation)

#### States

- **Loading:** centered typing animation
- **Not found:** back button + **"Look not found"** (20px serif) + **"This look may have been removed"** (12px muted)

#### Data sources

- `api.sessionOps.listByCustomer` → find by `_id` (current set fetched once, scanned client-side)
- `api.sessionOps.listBySession({ sessionId })` excluding current look — for siblings rail
- `api.customers.getWishlist`
- Mutations: `addToWishlist`, `removeFromWishlist`

---

### `/c/new`

**Route:** `/c/new`
**Purpose:** Curated feed of new arrivals from the customer's linked stores.
**Auth:** Gated.

#### Hero (full-bleed image, ~50vh on mobile)

- Background: kiosk image with Ken-Burns 18s loop zoom
- Dark gradient scrim
- Glass back button top-left
- Eyebrow: **"Freshly curated"** (11px uppercase gold)
- Title: **"New Arrivals"** (30px serif italic cream)
- Subtitle: **"{totalSarees} new sarees across {storeCount} store(s)"** (13px cream muted; "store(s)" bolded gold)
- Gold zari divider below

#### Store filter row (only if > 1 store)

- White bg with light bottom border
- Eyebrow: **"Filter by store"**
- Horizontal-scroll chip row:
  - **"All Stores ({totalCount})"**
  - Per-store: **"{StoreName} ({itemCount})"**
- Active chip: primary gradient bg + white text + shadow

#### Per-store sections

For each store (when "All Stores" or that store is selected):

- **Header row:**
  - 36×36px plum-gradient circle with `Store` icon
  - Store name (14px bold truncated) + **"{n} item(s)"** (11px muted, pluralized)
- **Saree grid** (2 cols, 10px gap):
  - 150px-tall image tile with occasion-derived gradient (Wedding, Festival, Party, Office, Daily, Gift each have a default gradient palette listed in the source) + dark veil overlay
  - **Tag badge** (top-right) if `saree.tag`: gold gradient + 9px bold uppercase
  - **Occasion badge** (bottom-left) if `saree.occasion`: dark semi-transparent + backdrop blur + 9px 600 weight
  - Below image: saree name (12.5px bold, ellipsis truncated)
  - Bottom row: price (mono 13px gold left) + fabric (10px muted right)
  - Press: `cx-press` (0.96)
  - Hover: `cx-hover-lift`

#### Empty state

- 64×64 plum-ghost circle with `Sparkles` icon
- Title: **"No new arrivals yet"** (20px serif italic)
- Body: **"Check back soon for fresh collections from your stores"** (13px muted, max 280px center-aligned)

#### Loading

- Centered 3-dot typing animation

#### Data sources

- `api.customers.listStoreLinksEnriched` — store list
- `api.customers.listNewArrivalsForCustomer({ customerId })` — `{ stores: [{ storeId, sarees: [...] }] }`

---

### `/c/wardrobe`

**Route:** `/c/wardrobe`
**Purpose:** Two-tab list — kiosk-saved sarees ("Wardrobe") + hearted catalog items ("Wishlist"). Default tab: Wardrobe.
**Auth:** Gated.

#### Header / hero

- Back button
- Title: **"My Wardrobe"** (when on Wardrobe tab) / **"Wishlist"** (when on Wishlist tab)
- Subtitle:
  - Wardrobe: **"{n} pieces from the mirror · ₹{total}"**
  - Wishlist: **"{n} sarees hearted · ₹{total}"**

#### Sticky tab switcher

- Pill style (`cx-tabs`)
- **"Wardrobe · {n}"** | **"Wishlist · {n}"**
- Active tab has underline/highlight

#### Wardrobe tab

**Empty state:**
- `Shirt` icon (26px)
- Title: **"Nothing in your wardrobe yet"**
- Body: **"Save looks from the smart mirror during your next store visit to build your wardrobe"**

**Item list** — each card:
- Thumb 64×72px (rounded), gradient bg + actual saree image
- Info: saree name (14px bold truncated); store name + city (11px muted); drape style if present (10px rose italic); price if present (14px bold gold mono)
- Right: X icon button (danger style) → `removeFromWardrobe(wardrobeId, customerId)`

**Footer card:** **"Wardrobe value"** label + ₹ total (20px bold mono plum)

#### Wishlist tab

**Empty state:**
- `Heart` icon
- Title: **"Your wishlist is empty"**
- Body: **"Tap the heart on any look or saree to save it here for later"**
- Button: **"Browse My Looks"** → `/c/looks`

**Item list** — each card:
- Thumb (solid gradient bg, **no image rendered today** — see Known UX gaps)
- Info: saree name (14px bold) + store ID (11px muted) + price (14px bold gold mono)
- Right: X icon button → `removeFromWishlist`

**Footer card:** **"Total Wishlist Value"** + ₹ total

**WhatsApp CTA button** (after total): full-width green gradient, message-circle icon + label **"Ask Store About My Wishlist"**. Pre-filled message:
> **"Hi! I have {count} sarees worth {total} on my Wearify wishlist. Can you help me with these?"**

#### Data sources

- `api.sessionOps.listWardrobeByCustomer({ customerId })` — wardrobe with enriched store/saree fields
- `api.customers.getWishlist({ customerId })`
- Mutations: `api.sessionOps.removeFromWardrobe`, `api.customers.removeFromWishlist`

---

### `/c/me` (Account Hub)

**Route:** `/c/me`
**Purpose:** Customer's account dashboard + entry point to all 10 sub-pages.
**Auth:** Gated.

#### Hero (paisley dark gradient)

- Avatar: 64×64 circle, gold border, serif initials fallback or photo
- Display name (Cormorant Garamond italic)
- Phone masked: first 8 digits + `XXXXX`
- Two badges: tier (e.g., **"Gold"**) + **"{n} visits"**

#### Stats bar (4-column horizontal scroll)

- **"Looks"** ({looks count})
- **"Stores"** ({unique stores visited})
- **"Wishlist"** ({wishlist count})
- **"Credit"** (₹{storeCredit})

#### My Stores rail (conditional, top 3–4)

- Horizontal scroll, 140px-wide cards (store icon + name + city)
- "All" link with chevron → `/c/me/stores`

#### Settings menu (9 rows in this exact order)

Each row: leading icon | label + subtitle | trailing chevron

| # | Label | Sub | Icon | Route |
|---|---|---|---|---|
| 1 | **Edit Profile** | "Name, photo, DOB, height, city" | User | `/c/me/profile` |
| 2 | **Preferences** | "Occasions, fabrics, colours, upcoming events" | Settings | `/c/me/preferences` |
| 3 | **Visit History** | dynamic ("{n} visits across {m} stores") | Clock | `/c/me/history` |
| 4 | **Loyalty & Credits** | dynamic ({points} pts · ₹{credit} · tier) | Crown (gold) | `/c/me/loyalty` |
| 5 | **My Tailor Orders** | "Track orders, measurements & rate tailors" | Scissors | `/c/me/tailor-orders` |
| 6 | **Refer a Friend** | "Earn ₹500 Wearify credit per referral" | Users (rose/coral) | `/c/me/refer` |
| 7 | **Rate Your Visit** | "Share feedback on your last store visit" | Star (gold) | `/c/me/feedback` |
| 8 | **Privacy & DPDP** | "Manage consent, download or delete data" | Lock | `/c/me/privacy` |
| 9 | **Language** | "Tap to change" | Globe | `/c/me/language` |

#### Footer

- WhatsApp button: **"Chat with a Wearify Store"** (green gradient, opens wa.me)
- **Sign Out** button (red/error color) — opens confirm modal:
  - Icon: `LogOut` in error-bg circle
  - Title: **"Sign Out?"**
  - Body: **"You can sign back in anytime with your mobile number."**
  - Buttons: **Cancel** | **Yes, Sign Out**
  - Confirm action: `api.phoneAuth.logout({ token })` → clear localStorage → `router.replace("/c/login")`

#### Data sources

- `useCustomer()` → user, phone, customerId, customer
- `api.customers.listStoreLinksEnriched`
- `api.customers.getWishlist`
- `api.sessionOps.listByCustomer`
- `api.customers.listVisitHistory`
- Customer fields: name, photoFileId, loyaltyTier, loyaltyPoints, storeCredit

---

### `/c/me/profile`

**Route:** `/c/me/profile`
**Purpose:** Edit existing profile (same fields as `/c/register` step 3).
**Auth:** Gated.

#### Layout

- Header: back button + **"Edit Profile"**
- Photo upload at top (100×100 circular, gold border, paisley gradient fallback with initials)
- Tap → file picker (JPEG, PNG, WebP, max 4MB)
- Pencil icon bottom-right; "Uploading…" overlay during upload

#### Form fields

Identical contract to register step 3 — see that section. Validation by `validateProfile` (same constants):
- Full Name (required ≥ 2 chars trimmed)
- Date of Birth (required, age ≥ 13, age ≤ 120)
- Gender (4 options, required)
- Height (cm ↔ ft/in toggle, clamped 120–220 cm)
- City (required)
- Email (optional, validated if non-empty)

**Save button states** (single button):
- **"Save Changes"** when dirty
- **"Saving..."** while in flight (disabled)
- **"Saved"** (briefly after success)
- Disabled when not dirty / saving / photo uploading

**Success toast:** **"Profile updated"** at bottom 96px, 2.5s fade.

#### Data sources

- `api.customers.getById({ customerId })` (initial load)
- `api.customers.updateProfile(...)` (save)
- `api.files.getUrl({ fileId })` (photo URL)
- `useUploadFile(GUARDS.customerPhoto)` (upload helper)

---

### `/c/me/preferences`

**Route:** `/c/me/preferences`
**Purpose:** Saree style preferences for personalized recommendations.
**Auth:** Gated.

#### Sections

1. **Occasions** (multi-select chips) — Wedding · Festival · Party · Office · Daily · Gift
2. **Fabrics** (multi-select chips) — Pure Silk · Georgette · Cotton · Linen · Chanderi · Banarasi · Kanjivaram · Tussar
3. **Colours** (multi-select chips with 14×14 swatch circles):
   - Crimson `#DC143C` · Purple `#7B3FA0` · Gold `#B8860B` · Green `#2D8544` · Blue `#2C5F7C` · Pink `#E88DAF` · White `#F5F0E8` · Black `#1A1A1A`
4. **Budget Range** (single-select native dropdown):
   - "Select budget" (placeholder)
   - "Under ₹5,000"
   - "₹5,000–₹15,000"
   - "₹15,000–₹30,000"
   - "₹30,000–₹50,000"
   - "Above ₹50,000"
5. **Upcoming Occasion**:
   - Text input ("e.g., Daughter's wedding")
   - Date input
   - Both optional, paired side-by-side

#### Save

- Button: **"Save Preferences"** (gold gradient)
- Success state: button → green + **"Saved ✓"** + green toast: **"Preferences saved successfully"**

Active chip = gold gradient + white; inactive = light beige + dark.

#### Data sources

- `api.customers.getById` — load
- `api.customers.updatePreferences` — save
- Customer fields: `preferredOccasions[]`, `preferredFabrics[]`, `preferredColors[]`, `budgetRange`, `upcomingOccasion`, `upcomingOccasionDate`

---

### `/c/me/loyalty`

**Route:** `/c/me/loyalty`
**Purpose:** Loyalty tier, points, store credit, transaction history.
**Auth:** Gated.

#### Hero card (tier-colored gradient)

- **Left:** label **"Current Tier"** + tier name (large bold serif italic — e.g., **"Gold"**)
- **Right:** label **"Points"** + number (large mono)
- **Progress bar** (when not VIP): height 6px, rounded, cream bg, white fill animated. Labels above: e.g., **"Gold"** → **"VIP (15000 pts)"**. Below: **"{n} points to VIP"**

**Tier thresholds:**
- Regular: 0–999 pts
- Silver: 1,000–4,999 pts
- Gold: 5,000–14,999 pts
- VIP: 15,000+ pts

**Tier colors:** Regular `#9C8878` · Silver `#A0A0A0` · Gold `#B8860B` · VIP `#8B2E2B`

#### Store credit banner (gold gradient)

- Label **"Wearify Credit"** + ₹ amount (mono large) + `Wallet` icon

#### Tier benefits grid (2×2)

Each tile: tier icon + name + (if current) **"YOU"** badge. List of 3–5 benefits with checkmarks.

**Per tier:**
- **Regular:** Earn points on every visit · Access to new collections
- **Silver:** All Regular + 5% discount · Priority booking · Access to new collections
- **Gold:** All Silver + 10% discount · Free alterations · Early access to sales
- **VIP:** All Gold + Personal stylist · 15% discount · Home delivery · Exclusive events

Current tier highlighted with light beige background.

#### Points history list

- Section label: **"Points History"**
- Loading: 3 skeleton bars (56px)
- Empty: **"No transactions yet"** centered
- Each transaction card: reason + date | ±points
  - Earn = green (+); redeem = red (−)

#### Data sources

- `api.customers.getById` — `loyaltyPoints`, `loyaltyTier`, `storeCredit`
- `api.customers.getLoyaltyTransactions({ customerId })` — array of `{ reason, type, points, date }`

---

### `/c/me/history`

**Route:** `/c/me/history`
**Purpose:** Visit log + per-store aggregation.
**Auth:** Gated.

#### Hero

- Back button
- Title **"Visit History"**
- Subtitle: **"{n} visits across {m} stores"**

#### "By Store" card (when visits > 0)

- Eyebrow: **"BY STORE"**
- List of stores with visit count badges (sorted descending). Pluralized "visit" / "visits"

#### Visit cards (vertical list)

- **Loading:** 4 skeleton cards (80px) shimmer
- **Empty state:**
  - Icon
  - **"No visits yet"**
  - **"Your visit history will appear here"**
- **Each visit:**
  - Top row: date (bold) + **"Purchased"** (green) or **"Browsing only"** (beige) pill
  - **"{n} sarees tried"** + optional **"Staff: {name}"**
  - Optional: **"+{n} points earned"** (gold)
  - Store name as subtitle
  - White card, border, shadow
  - Staggered entry `cx-slideUp cx-d1` to `cx-d4+`

#### Data sources

- `api.customers.listVisitHistory({ customerId })` — date, storeId, storeName, purchased, sareesTried, staffName, pointsEarned
- `api.customers.listStoreLinksEnriched` (for store stats card)

---

### `/c/me/stores`

**Route:** `/c/me/stores`
**Purpose:** Visited-stores directory with contact + directions.
**Auth:** Gated.

#### Layout

- Hero: back button + **"My Stores"** + **"{n} Wearify stores"**
- Loading: 3 skeleton cards (140px) gradient shimmer
- **Empty state:** `ShoppingBag` icon + **"No stores visited yet"** + **"Visit a Wearify-powered store to see it here"**

#### Store cards

- **Top bar** (56px tall): dark red-brown gradient, white `Store` icon
- **Body:**
  - Store name (bold)
  - **"{city}, {state}"** with `MapPin`
  - Stats row: `User` + visit count (gold mono) · `Clock` + **"Last: {date}"**
  - Address (full text, wrapped)
  - Hours + closed days (if available)
  - Divider
  - Two action buttons:
    - **WhatsApp** (green gradient) → `wa.me/{storePhone}`
    - **Directions** (outlined dark red) → Google Maps with the store address

Staggered entry animation `cx-slideUp cx-d1`–`cx-d6`.

#### Data sources

- `api.customers.listStoreLinksEnriched` — `{ storeName, storeId, storeCity, storeState, storeAddress, storeHours, storeClosedOn, storePhone, visits, lastVisit }`

---

### `/c/me/refer`

**Route:** `/c/me/refer`
**Purpose:** Send referral invites + share on WhatsApp + view referral status.
**Auth:** Gated.

#### Hero

- Back button + **"Refer a Friend"** + **"Share the joy, earn rewards"**

#### Reward card (gold gradient centered)

- Headline: **"Earn ₹500 per referral"**
- Body: **"Invite a friend to any Wearify-powered store. You both get ₹500 Wearify credit!"**

#### Send referral form

- Two text inputs:
  - **"Friend's name"**
  - **"Friend's phone number"** (tel)
- Submit: **"Send Referral"** (gold gradient, disabled until both filled)
- Loading: **"Sending..."**, disabled
- Success: green toast **"Referral sent successfully!"**, form clears after 2.5s

#### WhatsApp share button (full-width green)

Opens `wa.me/?text=<encoded>` with message:
> **"Hey! I shop for sarees on Wearify and the virtual try-on is amazing. You should try it too! Use my referral and we both get ₹500 credit."**

#### Referral history

- Loading: 3 skeleton cards (56px)
- Empty: **"No referrals yet. Share your link to get started!"**
- Each card: referred name (bold) + date (small) + status pill + reward points if earned (**"+500 pts"** gold)

**Statuses:** **Rewarded** (green `#1B5E20` on `#E8F5E9`) · **Visited** (orange `#7A5A08` on `#FAF1DD`) · **Pending** (gray `#9C8878` on `#F5E6E3`)

#### Data sources

- `api.customers.listReferrals({ customerId })`
- `api.customers.createReferral`
- Referral fields: `referredName`, `referredPhone`, `status`, `date`, `reward`

---

### `/c/me/feedback`

**Route:** `/c/me/feedback`
**Purpose:** Rate the most recent in-store visit. Guarded against orphan feedback (no visit → empty state).
**Auth:** Gated.

#### Three states

**A. No visits ever**:
- Hero + back
- Centered `Star` (gold)
- **"No visits yet"** (heading)
- **"Once you've visited a Wearify store, you'll be able to rate your experience here."**
- Button: **"Back to Profile"** → `/c/me`

**B. Submitted (success view post-submit):**
- Centered green checkmark
- **"Thank you!"** + **"Your feedback helps us improve"**
- Button: **"Back to Profile"** → `/c/me`

**C. Form (default when last visit exists):**
- Hero: **"Rate Your Visit"** + subtitle = store name + date (or **"How was your last visit?"**)

#### Form

**Stars (centered, 5):**
- Label: **"How was your experience?"**
- Tap to select 1–5
- Selected = filled gold; unselected = light beige outline
- Subtext below selected rating: 5 → **"Excellent!"** · 4 → **"Great!"** · 3 → **"Good"** · 2 → **"Fair"** · 1 → **"Poor"**

**Quick feedback chips (multi-select):**
- Label: **"Quick Feedback"**
- 6 chips: **Great Service** · **Beautiful Collection** · **Quick Try-On** · **Friendly Staff** · **Clean Store** · **Good Lighting**
- Active = gold gradient + white; inactive = light beige + dark

**Comment (optional):**
- Label: **"Tell us more (optional)"**
- 4-row textarea
- Placeholder: **"Share your detailed feedback..."**

**Submit:**
- Button **"Submit Feedback"** (gold gradient), disabled if rating = 0
- Loading: **"Submitting..."**

#### Data sources

- `api.customers.getLastVisit({ customerId })` — `{ storeId, sessionId, storeName, date }` or null
- `api.customers.submitFeedback({ customerId, customerPhone, storeId, sessionId, rating, chips[], comment, date })`

(Engineering note: no duplicate-rating guard today — same visit can be rated repeatedly. Designer can choose to surface "you already rated this visit" if they want.)

---

### `/c/me/tailor-orders`

**Route:** `/c/me/tailor-orders`
**Purpose:** Track blouse-stitching tailor orders (originated from a kiosk session). Includes status, progress, chat, post-delivery rating.
**Auth:** Gated.

#### Hero

- Back button + **"My Tailor Orders"** + **"{n} order(s)"**

#### States

- Loading: 3 skeleton cards (110px)
- Empty: measuring-tape icon + **"No tailor orders yet"** + **"Find a tailor through Wearify to get started"**

#### Order cards (collapsible)

**Collapsed:**
- Header (clickable):
  - Tailor name (bold) + service (e.g., **"Blouse Stitching"**) + saree name if known
  - Status pill (colored by status)
- **5-step progress bar:** 5 segmented dots/bars: confirmed · measurements · stitching · ready · delivered. Current step highlighted.
- Step labels under bar
- Meta row: price + due date + order date

**Expanded (on tap header):**
- Grid of detail rows: Fabric · Deposit Paid · Order ID · Note (italic, wrapped)
- **Chat with Tailor** button (green WhatsApp) → `wa.me/{tailorPhone}`
- **Rate Tailor** section (only if `status === "delivered"` AND no rating yet):
  - "Rate Tailor" button expands to:
    - 5 stars (tap to select; gold when active)
    - Comment text input ("Add a comment (optional)")
    - **Submit Rating** button (disabled until rating selected)
    - Loading: **"Submitting..."**
- **If already rated:** display existing stars + comment

#### Status colors / labels

| Status | Color | Label |
|---|---|---|
| confirmed | `#A94540` red-brown | "Confirmed" |
| measurements | `#1A4A65` navy | "Measured" |
| stitching | `#B8860B` gold | "Stitching" |
| ready | `#1B5E20` green | "Ready" |
| delivered | `#1B5E20` green | "Delivered" |

#### Data sources

- `api.tailorOps.listOrdersByCustomer({ customerPhone })`
- `api.tailorOps.rateOrder({ orderId, rating, comment })`

---

### `/c/me/language`

**Route:** `/c/me/language`
**Purpose:** Pick UI + WhatsApp message language.
**Auth:** Gated.

#### Layout

- Hero: back + **"Language"** + **"Choose your preferred language"**
- Vertical list of full-width language buttons:

| Code | Native | English |
|---|---|---|
| en | English | English |
| hi | हिंदी | Hindi |
| mr | मराठी | Marathi |
| kn | ಕನ್ನಡ | Kannada |
| ta | தமிழ் | Tamil |
| te | తెలుగు | Telugu |
| bn | বাংলা | Bengali |
| gu | ગુજરાતી | Gujarati |
| ml | മലയാളം | Malayalam |

Each row: native script (large, bold) + English (smaller, gray).
Selected: light beige bg + dark red border + checkmark in gold circle.
Tap → saves immediately (no separate save button).

#### Footer note

- Info icon + **"Changes apply to WhatsApp messages and the Wearify interface."**

#### Data sources

- `api.customers.getById` → `customer.language`
- `api.customers.updateProfile({ language })`

---

### `/c/me/privacy`

**Route:** `/c/me/privacy`
**Purpose:** DPDP Act 2023 consent management — consent toggles + data download/delete requests.
**Auth:** Gated.

#### Hero

- Back + **"Privacy & DPDP"** + **"Manage your data permissions"**

#### "Data Permissions" section

White rounded card containing 4 toggleable rows:

| # | Label | Description |
|---|---|---|
| 1 | **Visit History** | "Allow stores to see your visit and browsing history" |
| 2 | **WhatsApp Messages** | "Receive offers, reminders, and updates via WhatsApp" |
| 3 | **AI Personalization** | "Allow AI to recommend sarees based on your preferences and history" |
| 4 | **Try-On Photos** | "Allow virtual try-on photos to be stored and used for your profile" |

Each row: gold icon (18px) + label + description + toggle switch. Toggle ON = dark red; OFF = light beige.

**Save Preferences** button (gold gradient, full-width) below. On success: button → green + **"Saved"** for 2s.

**Default state:** All four consent flags default to `true` (opt-out model).

#### "Your Data" section

Two cards:

**Download My Data**
- `Download` icon (18px dark red)
- Heading: **"Download My Data"**
- Body: **"Get a copy of all your personal data stored with Wearify"**
- Button: **"Request Data Download"** (outlined dark red)
- On click: alert **"Data download request submitted. You will receive it via email within 48 hours."**

**Delete All My Data**
- `Trash` icon (18px dark red)
- Heading: **"Delete All My Data"** (red text)
- Body: **"Permanently delete all your data. This action cannot be undone and will be processed within 30 days."**
- Button: **"Request Data Deletion"** (outlined dark red) → opens confirmation modal

#### "DPDP Act Compliance" footer

`Shield` icon + **"DPDP Act Compliance"** heading + legal body:
> **"Under India's Digital Personal Data Protection Act (2023), you have full control over your personal data. Wearify acts as a Data Fiduciary and processes your data only with your explicit consent. You can withdraw consent, request data portability, or request erasure at any time. Changes will be processed within the statutory timeframe."**

#### Delete confirmation modal

- Centered, scale-in animation, backdrop blur
- `Trash` icon in red error-bg circle
- Title: **"Delete All Data?"**
- Body: **"This will permanently erase all your personal data, visit history, preferences, and photos. This cannot be undone."**
- Buttons: **Cancel** (light) | **Yes, Delete** (red)
- On confirm: alert **"Data deletion request noted. Your data will be permanently deleted within 30 days. You can contact support to cancel this request."**

#### Data sources

- `api.customers.getById`
- `api.customers.updateConsent({ consentHistory, consentMessages, consentAiPersonal, consentPhotos })`
- Customer fields: `consentHistory`, `consentMessages`, `consentAiPersonal`, `consentPhotos`, `consentGrantedDate`

---

## 5. Cross-cutting patterns

### Image priority chain (`components/SareeThumb.tsx`)

When rendering any saree thumbnail, the priority is:

1. **Look's AI render** (`look.imageFileId`) — for surfaces showing tried-on images (Looks feed, Look detail hero, kiosk-recent rail). The customer wearing the saree.
2. **Saree catalog image** (`saree.imageIds[0]`) — first image from the store's product photoshoot.
3. **Seeded local image** — for old demo data; static `/inventory/<name>` files.
4. **Gradient placeholder** — fallback. Optional centered emoji overlay (e.g., 👗) for character.

Designer should plan for any of the four to render. The fallback gradient is intentional — old demo sarees in dev environments lack images and the gradient prevents broken-image icons.

### Multi-image gallery (`components/SareeImageGallery.tsx`)

Used today on:
- `/c/looks/[id]` if the saree has multiple images (rare today, but supported)
- (Tablet & kiosk product detail also use this — not in this brief's scope)

Behaviour:
- 0–1 images → falls through to plain SareeThumb (no controls)
- ≥ 2 images → 44px circular chevron buttons left/right (semi-transparent dark bg, white icon), animated dot pill at bottom-center (active dot widens to 22px), touch swipe (40px threshold)
- Arrows disable at start/end (no wraparound)
- Click handlers stop propagation

### Toast pattern

- Position: `position: fixed; bottom: 96px; left: 50%; transform: translateX(-50%)`
- Style: dark plum bg, white text, padding 10px 18px, fully rounded (100px radius)
- Duration: 2000ms (most surfaces) or 2500ms (`/c/me/profile` save toast)
- Used for wishlist add/remove, profile save success, preferences save, copy-link, etc.

### WhatsApp deep-link pattern

URL format: `https://wa.me/{phone}?text={URI-encoded message}` (or `wa.me/?text=...` if no specific recipient).

**Pre-filled messages used today** (designer can adjust):

| Surface | Message |
|---|---|
| `/c` home WhatsApp footer | (generic store-help) |
| `/c/looks/[id]` share | "Check out this beautiful {sareeName} saree I tried on at Wearify! {price}" |
| `/c/wardrobe` Wishlist tab | "Hi! I have {count} sarees worth {total} on my Wearify wishlist. Can you help me with these?" |
| `/c/me` footer | (generic store-help) |
| `/c/me/refer` share | "Hey! I shop for sarees on Wearify and the virtual try-on is amazing. You should try it too! Use my referral and we both get ₹500 credit." |
| `/c/me/stores` per-store | (opens chat with that store's phone, no pre-filled text by default) |
| `/c/me/tailor-orders` chat | (opens chat with the tailor, no pre-filled text by default) |

### Form save pattern

Single button cycles through: **"Save Changes"** → **"Saving..."** → **"Saved"** (briefly) → back to **"Save Changes"** when next dirty. Disabled when not dirty / saving / sub-asset uploading.

### Loading indicators

- **Typing dots** (`.cx-typing` — 3 gold animated circles) — for top-level page-data loading (auth gate, profile fetch, language picker, preferences fetch)
- **Skeleton cards** — for list-heavy pages (looks grid, wardrobe list, tailor orders, stores, history, points history)
- Choose based on the surface: tiny pages = dots; list pages = skeletons.

### Phone masking convention

In `/c/me` hero and anywhere phone is displayed for the customer themselves: **first 8 digits + "XXXXX"**. No country code shown.

### Native dropdowns vs custom

`/c/me/preferences` uses a native `<select>` for budget — no custom appearance. Designer should decide if this is acceptable on iOS/Android (which give native pickers).

---

## 6. Backend data model (designer mental map)

The designer doesn't need to write data — but knowing what each surface reads helps decide how flexible the redesign can be.

### Customer-relevant tables

| Table | Purpose |
|---|---|
| `customers` | The user — name, photo, DOB, gender, height, city, email, language, loyalty (`loyaltyPoints`, `loyaltyTier`, `storeCredit`), consent flags (`consentHistory`, `consentMessages`, `consentAiPersonal`, `consentPhotos`), preferences (`preferredOccasions[]`, `preferredFabrics[]`, `preferredColors[]`, `budgetRange`, `upcomingOccasion`), `bodyScanFileId` (used by AI) |
| `looks` | One row per try-on. `imageFileId` is the AI render. Foreign keys: `customerId`, `storeId`, `sessionId`, `sareeId` |
| `wardrobe` | Saves made on the kiosk (intent to buy/return). FK: customer + saree |
| `wishlist` | Hearted catalog items. Distinct from wardrobe (different lifecycle). FK: customer + saree |
| `customerStoreLinks` | M2M of customer ↔ store with denormalized `visits`, `lastVisit`, `clv`, `segment` (New, Regular, …) |
| `visitHistory` | One row per kiosk visit. Has `purchased: boolean`, `sareesTried`, `pointsEarned`, `staffName` |
| `loyaltyTransactions` | Earn / redeem rows. `reason`, `type` (earn/redeem), `points`, `date` |
| `customerReferrals` | Outbound referrals: `referredName`, `referredPhone`, `status` (Pending / Visited / Rewarded), `reward` |
| `feedback` | Visit feedback rows: rating (1–5), chips[], comment, attribution to a `(storeId, sessionId)` |
| `tailorOrders` | Blouse-stitching jobs from kiosk sessions. Has progress status, measurements, price, deposit, optional rating |
| `offers` | Promotional content shown in home offers carousel. `active`, `headline`, `subline`, `grad`, optional CTA |
| `sarees` | The catalog. Per-store. Has `imageIds[]`, `name`, `price`, `fabric`, `occasion`, `tag`, `grad`, etc. |
| `stores` | Saree retailer rows — `storeName`, `city`, `state`, `address`, `phone`, `whatsappNumber`, `hours`, `closedOn`, `logoFileId` |

### Tier thresholds (drives `/c/me/loyalty` UI)

```
0–999 pts          → Regular  (#9C8878)
1,000–4,999 pts    → Silver   (#A0A0A0)
5,000–14,999 pts   → Gold     (#B8860B)
15,000+ pts        → VIP      (#8B2E2B)
```

### 9 supported languages

EN · HI · MR · KN · TA · TE · BN · GU · ML (codes per `/c/me/language`).

Translations are stored in `lib/i18n.ts`. Today the customer PWA renders English; designer should NOT assume English-only text for layout (Hindi headings can be ~1.4× longer; Tamil + Malayalam compounds even longer). Plan for ~25% string growth.

---

## 7. PWA specifics to respect

### Manifest (`public/manifest.json`)

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
    { "src": "/icons/icon-192.png",          "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png",          "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Icon assets (designer will redesign these)

| File | Size | Purpose |
|---|---|---|
| `/icons/icon-192.png` | 192×192 | Standard Android icon |
| `/icons/icon-512.png` | 512×512 | Larger Android icon (splash screen, store) |
| `/icons/icon-maskable-512.png` | 512×512, **80% safe-zone padding inside** | Android adaptive icon (the OS may crop to circle/squircle/rounded-square — keep brand mark inside the central 80%) |
| `/apple-touch-icon.png` | 180×180 | iOS home screen icon |
| `/icons/apple-splash-2048x2732.png` | 2048×2732 | iOS standalone splash (auto-scaled to other devices) |

### Standalone-launch requirements (must keep)

iOS Safari needs both meta tags emitted:
- `<meta name="apple-mobile-web-app-capable" content="yes">`  ← legacy iOS
- `<meta name="mobile-web-app-capable" content="yes">`         ← new W3C cross-platform

Without the Apple-prefixed legacy tag, iOS users get the icon but tapping it opens a Safari-with-chrome view instead of standalone — known regression in Next.js 16 default `appleWebApp.capable: true`. Engineering has a workaround in place; designer just needs to know the constraint exists.

### Service worker behaviour

- **Precache:** Next.js static assets cached at install
- **Runtime:** StaleWhileRevalidate for static, NetworkFirst for navigations, CacheFirst for fonts/images
- **Navigation preload** enabled
- **Offline fallback:** any failed `document` fetch → render `/c/offline`
- **skipWaiting + clientsClaim** — new SW versions take over on next page load

Disabled in development (Next.js dev server).

### Touch & layout constraints

- Touch targets: 44px minimum
- Bottom nav respects `safe-area-inset-bottom`
- Splash dismissal must not block interaction (route can render under it)
- Decoration is CSS — no large hero videos that hurt offline; background images degrade gracefully (fallback gradient if 404)

---

## 8. Known UX gaps (observational, not prescriptive)

The current state has some loose ends. The designer can address (or ignore) any of these — they're not part of "preserve current intent":

1. **`/c/me/stores` cards loop to themselves.** Tapping a store card on `/c/me/stores` currently re-routes to `/c/me/stores`. Likely should open store detail or directions / WhatsApp directly.
2. **`/c/wardrobe` Wishlist thumbnails are gradient-only.** The data is available (saree fields are populated) but the wishlist tab doesn't pass a `fileId` to its thumb component. Looks unintentional.
3. **Sign-out is buried.** Last-and-only on `/c/me` after 9 menu rows. Could be more discoverable (profile menu? top-right corner?).
4. **`/c/me/feedback` allows duplicate ratings.** Same `(customerId, sessionId)` can be submitted multiple times. UI doesn't show "already rated".
5. **Toast / install-prompt overlap.** Toast position `bottom: 96px` and install prompt `bottom: 84px` can stack on top of each other.
6. **No global search.** No surface searches across looks, wardrobe, or wishlist.
7. **`/c/wardrobe` tab default not remembered.** Always defaults to Wardrobe on each load — could remember last selected.
8. **No visit-by-store filter on `/c/me/history`.** The "BY STORE" card aggregates but doesn't drill in.
9. **Profile photo and `/c/register` step 3 photo upload don't show progress percent** — only a generic "Uploading…" overlay.
10. **`Send Referral` form has no validation** for phone format. Just non-empty.

This is not a fix list — just observation. Engineering will close these if the designer's redesign motivates the work.

---

## 9. Out of scope

This brief is **only** for `/c`. The following are NOT to be redesigned (they're separate surfaces with separate audiences):

- **Admin** (`/admin/*`) — Wearify ops dashboard
- **Retailer** (`/store/*`) — store owner dashboard
- **Sales Tablet** (`/tablet/*`) — in-store staff app
- **Smart Mirror / Kiosk** (`/kiosk/*`) — the in-store device. The kiosk has its own design language (Montserrat / Roboto, lucide icons, maroon palette) and is touch-table-optimized, not phone-optimized.
- **Tailor module** (`/tailor/*`) — has its own brief at `TAILOR_MODULE_BRIEF.md`

Not in this brief either:

- **Backend redesign** — Convex tables, mutations, schemas are fixed. The redesign respects the current data shape.
- **Auth flow architecture** — Better Auth + phone OTP is the contract. Only the UI changes.
- **Translations** — designer doesn't need translation copy, just to know 9 languages need to fit the layouts (and consider non-Latin script readability).
- **Push notifications** — flagged as a future PWA feature; designer can mock UI for "you have a new look" / "your tailor finished your blouse" / etc. but the plumbing isn't built yet.
- **Web share target** — receiving images shared from other apps — future work.
- **Background sync** — queueing wishlist toggles offline — future work.

---

## Designer's checklist (use this to verify the redesign covers everything)

- [ ] Login: phone → OTP → home; "no account found" branch routes to register
- [ ] Register: 3-step wizard with photo, DOB, gender, height (cm/ft), city, email
- [ ] Splash 1200ms with Wearify branding
- [ ] Bottom nav 5 tabs (Home, Looks, New, Wardrobe, Me) with active states
- [ ] Install prompt position above bottom nav, dismissible, persists dismissal
- [ ] Offline fallback page
- [ ] Home: greeting, store credit (conditional), offers carousel (conditional), my-stores rail, discover banner, 2×2 quick action grid, recent looks rail, WhatsApp footer
- [ ] Looks: store filter + date filter + 2-col grid + heart toggle + toasts + empty state
- [ ] Look detail: hero with AI render, share, action row (wishlist + tailor), WhatsApp share, details card, same-session rail, not-found state
- [ ] New: hero with Ken-Burns, store filter chips, per-store sections, tag/occasion badges, empty state
- [ ] Wardrobe: tab switcher, two list states (with images vs. gradient-only currently), totals, WhatsApp CTA on Wishlist
- [ ] Me: avatar with tier + visits, stats bar, my-stores rail, 9-row settings menu, WhatsApp + sign-out
- [ ] Sign-out modal
- [ ] Profile editor with photo (4MB), DOB (age ≥ 13), height toggle, city, optional email
- [ ] Preferences: 4 chip groups + budget select + upcoming occasion + save toast
- [ ] Loyalty: tier card with progress, store credit banner, 4-tier benefits, transaction history
- [ ] History: by-store aggregation + per-visit cards + empty state
- [ ] Stores list: contact cards with WhatsApp + Directions
- [ ] Refer: reward card, send-referral form, share button, referral history with status pills
- [ ] Feedback: 3 states (no visits / submitted / form), stars, chips, comment
- [ ] Tailor orders: collapsible cards, 5-step progress, chat, post-delivery rate flow
- [ ] Language: 9 options, native + English script, immediate save
- [ ] Privacy: 4 consent toggles + save, data download request, deletion request + modal, DPDP statement
- [ ] All "empty / loading / error / success" states for every surface
- [ ] Accessibility: 44px touch targets, focus rings on inputs, aria-labels on icon buttons
- [ ] Long-string accommodation for non-English languages
- [ ] PWA icon set redesigned (192, 512, maskable, apple-touch, iOS splash)

---

**Questions, ambiguities, or surfaces you want walked through live?** Engineering can spin up a dev environment with seed data so you can click through every surface yourself. Test credentials in `TEST_CREDENTIALS.md` (customer: phone `9900000003` / `9900000005`, OTP `123456`).
