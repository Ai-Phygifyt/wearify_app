# Tailor Module — Design Brief

> Hand-off document for a UI/UX designer. Describes what the tailor module is, who uses it, which screens exist today, which ones are about to be built, and where the designer can add the most value. No code required to read this.

## 1. One-line pitch

Wearify is a virtual try-on platform for Indian saree retailers. The **tailor module** turns independent blouse-stitching tailors into an integrated marketplace partner — so a customer who falls in love with a saree at a Wearify kiosk (or on her phone) can get a custom-fitted blouse stitched by a verified local tailor without ever making a phone call.

## 2. Why this module exists

Indian saree buying has a hidden second purchase: **the matching blouse, custom-stitched to fit.** Today this happens through word-of-mouth tailors — fragmented, informal, trust-dependent. Wearify sits between the saree purchase and the blouse order, bringing:

- **For customers**: one-tap discovery of verified tailors in their city, transparent pricing, WhatsApp-native communication, rating after delivery.
- **For tailors**: a steady lead pipeline from partner stores and Wearify kiosks, zero cold-outreach, mobile-first job management.
- **For Wearify (platform)**: commission per referred order, trust layer (KYC), analytics on a previously invisible market.
- **For partner stores**: a "we can even arrange the blouse" value-add that closes more saree sales.

## 3. Three user personas

### 3a. The Tailor (primary user of the tailor portal)

- Runs a one-person or small shop. Age 30–55. Owns a smartphone, uses WhatsApp extensively, may have limited English — prefers Hindi / Marathi / regional languages.
- Logs in via **phone + OTP** on a mobile browser (there is no app install).
- Wants to see **today's new leads first**, track orders in progress, get paid transparently, and protect their time (working hours, holidays).
- Will **abandon the platform if the experience is fiddly** — forms that lose data, too many taps to log a job, unclear status.

### 3b. The Customer

- Shops at a Wearify partner store, tries on sarees at the smart mirror, or browses the customer PWA (`/c`) on her phone.
- Never wants to install another app just for blouse stitching.
- Needs: tailor's name, distance/area, rating, starting price, WhatsApp button.
- After delivery: wants to rate and, if asked, see her past tailor orders.

### 3c. The Admin (Wearify ops)

- Onboards and verifies tailors (approves Aadhaar / PAN / address KYC).
- Manages commission rates.
- Sees platform-level health (leads → orders conversion, payout queue, top tailors).

## 4. Module surfaces (where tailor functionality lives today)

| Surface | Route prefix | Audience | Device |
|---|---|---|---|
| **Tailor portal** | `/tailor/*` | The tailor | Mobile web (primary); tablet-friendly |
| **Customer PWA** | `/c/me/tailor-orders`, future `/c/tailors` | Customer | Mobile (PWA) |
| **Admin** | `/admin/stores` → Tailors tab (existing), future tailor approval screens | Wearify ops | Desktop |
| **Kiosk** | `/kiosk` — "Find Tailor" screen | Customer, in-store | Landscape tablet / smart mirror |
| **Store dashboard** (future) | `/store/customers/[id]` — "Refer to Tailor" | Store staff | Desktop |

## 5. The tailor portal today — screen inventory

All routes relative to `/tailor`. Screens marked **⚠️ need design love** are the ones whose UX is the weakest today.

### Auth
- **`/login`** — phone → OTP → password prompt. Also handles first-time registration with a 3-step wizard (phone → OTP → profile: name, city, area, specialties, services, bio). ⚠️ *Registration is a long scroll — worth splitting visually.*

### Home / dashboard
- **`/` (dashboard)** — shows the tailor's key numbers: leads this month, earned this month, rating, referrals count. Quick links to orders, referrals, profile. ⚠️ *Cards are present but feel undifferentiated — what does the tailor actually want to act on first?*

### Orders (the tailor's job list)
- **`/orders`** — list of all orders, filterable by status (`confirmed / measurements / stitching / ready / delivered`). Each card shows customer name, saree, due date, status.
- **`/orders/[id]`** — order detail. Shows customer measurements, due date, status progression, a button to advance status. A rating + comment appear if the customer has rated.
- **`/orders/create`** — tailor can also create an order manually (walk-in customer). ⚠️ *Measurements form is a long block of identical inputs; needs visual grouping.*

### Referrals (incoming leads)
- **`/referrals`** — list of referrals (customer handoffs from stores / kiosk / Wearify ops). Status: `new / contacted / quoted / confirmed / declined / completed`.
- **`/referrals/[id]`** — referral detail. Tailor can update status (Mark contacted, Mark quoted, Mark declined, Convert to order). ⚠️ *"Convert to order" is one of the most important CTAs but not visually prominent.*

### Profile (identity + business settings)
- **`/profile`** — index of sub-pages. ⚠️ *Several dead links (`#`) for Help, Language, Consent — designer can help prioritize which deserve real pages.*
- **`/profile/edit`** — basic info (name, bio, specialties, service radius).
- **`/profile/availability`** — working days (Mon–Sun toggles), open/close hours, "Currently accepting orders" master toggle.
- **`/profile/commission`** — earnings breakdown + payout history. Currently **read-only**.
- **`/profile/portfolio`** — past work samples. Currently just **gradient swatches** (no photo upload).
- **`/profile/verification`** — KYC status (Aadhaar / PAN / Address). Currently **the upload tiles are mockups with no file picker**.

## 6. What's about to be built (ask the designer to cover these too)

| # | New / improved screen | Purpose |
|---|---|---|
| 1 | **KYC upload** on `/tailor/profile/verification` | Real file pickers + preview for Aadhaar / PAN / address-proof images. Show status (`pending / verified / rejected`) with timestamps and any admin note. |
| 2 | **Portfolio image upload** on `/tailor/profile/portfolio` | Replace gradient stubs with actual photo uploads. Tailors should show 4–12 work samples, taggable (wedding, festival, formal), with an empty state that coaches them on what to add. |
| 3 | **Service pricing editor** on `/tailor/profile/services` (new route) | Edit existing services (blouse stitching, fall-picco, falls, alteration) after registration. Each service has price range (₹min – ₹max) and "typical days to deliver". |
| 4 | **Admin KYC approval** — new admin screen | Review queue: pending tailor KYC applications with document previews and Approve / Reject / Request-changes actions. Sorting by oldest first. |
| 5 | **Kiosk "Connect tailor" flow** | Today the kiosk's Connect button shows a "coming soon" toast. Replace with an action sheet: tailor card (photo, city, rating, starting price) + "Send referral" (creates a lead, opens WhatsApp deeplink with a pre-filled message) + "Call" button. |
| 6 | **Customer-PWA tailor discovery (later, not part of this batch)** | `/c/tailors` — browse by city / specialty / rating. Profile page per tailor. Refer-me CTA pre-fills saree from the customer's wardrobe. |

Items 1, 2, 3, 4, 5 are in the immediate build. Item 6 is on the roadmap and benefits from design exploration now so the pattern is established.

## 7. Critical user flows the designer should optimize

### 7a. Tailor daily routine (most frequent path)

1. Opens `/tailor` on their phone.
2. Sees today's new leads at the top, followed by orders in progress.
3. Taps a lead → marks it "contacted" or "quoted".
4. When lead converts, taps "Convert to order" → fills measurements (or imports from referral) → confirms.
5. Later, advances status through the stitching milestones.
6. When delivered, order moves to the "done" pile; customer gets notified to rate.

**Where UX matters most:** the lead → order conversion. That's the money-making tap.

### 7b. Customer initiating a referral (from `/c`)

1. Opens `/c`, goes to `Tailors` (future page) or sees a "get this blouse stitched" CTA on a saved saree.
2. Browses tailors in her city, filters by specialty.
3. Taps a tailor → sees profile, starting price, portfolio.
4. Taps "Refer me" → confirms measurements are up to date → the referral is sent.
5. Tailor WhatsApps her within N hours.

**Where UX matters most:** trust. Photo quality, rating, verification badge, starting price must all be visible at a glance.

### 7c. Admin verifying a new tailor

1. Admin sees "3 tailors pending KYC" badge.
2. Opens the queue → sees each tailor's submitted docs as previews.
3. Approves the legit ones, rejects the bad ones with a reason.
4. Rejected tailor sees the reason on their `/tailor/profile/verification` screen and can resubmit.

**Where UX matters most:** throughput. An admin should be able to clear a queue of 20 in 10 minutes.

### 7d. In-store kiosk handoff (high-conversion moment)

1. Customer finishes trying on sarees at the kiosk. Order screen has a "Find a tailor" pill.
2. Taps it → sees tailors in the store's city.
3. Taps Connect on a tailor → confirms a WhatsApp deeplink opens with a pre-filled message: "Hi, I'm Ananya. I just tried a silk saree at Silk Heritage and want a blouse stitched. Here are my measurements: …"
4. Referral record is also created server-side for attribution.

**Where UX matters most:** no-typing. The customer is standing in front of a mirror with a saree on their shoulder — anything beyond one tap loses them.

## 8. Design system constraints

- **Existing palette** (Wearify brand): warm ivory `#FDF8F2`, maroon `#7B1D1D`, gold `#C9941A`, navy `#0D1F35`. The tailor portal currently uses these via the `w-*` utility classes in `components/ui/wearify-ui.tsx`.
- **Typography**: Cormorant Garamond (headings, italic-first), DM Sans (body), DM Mono (numbers, prices).
- **Components available to reuse**: `Card`, `KPI`, `Tabs`, `Badge`, `Btn`, `Metric`, `Skeleton`, `PageLoading`.
- **Tone**: warm, premium, a little ceremonial — these are weddings and festivals. Avoid neon / startup-y feel. Think "trusted family atelier", not "gig economy app".
- **i18n**: all customer-facing tailor strings should go through the translation layer (`lib/i18n.ts`), covering English / Hindi / Marathi / Kannada / Tamil / Telugu / Bengali / Gujarati / Malayalam. Currently only the kiosk uses translations seriously.
- **Mobile-first for the tailor portal** (most tailors are on phones). Admin screens are desktop-first. Kiosk screens are landscape tablet.
- **Accessibility**: 44px minimum tap targets (kiosk enforces this strictly), high contrast on kiosk because lighting varies.

## 9. Data the designer can show in comps (pull this, don't invent)

- Seeded tailors (works in dev):
  - `TL-001` — **Manoj Darji**, Mumbai, 12 years, silk + blouse stitching, rating 4.7 (seed)
  - `TL-004` — **Geeta Bai**, Chennai, 8 years, pattu + bridal, rating 4.8 (seed)
- Typical services: "Blouse stitching" (₹800–₹1500, 7 days), "Fall & picco" (₹200–₹400, 2 days), "Alteration" (₹300–₹600, 3 days).
- Measurements fields: bust, waist, shoulder, arm length, back length, neck depth (front/back), sleeve length, neck circumference, measurement fabric.
- Order statuses (use these labels as-is): `confirmed → measurements → stitching → ready → delivered`.
- Referral statuses: `new → contacted → quoted → confirmed / declined → completed`.

## 10. What "better UX" looks like for each screen — designer's shopping list

Focus effort here:

1. **Tailor dashboard**: make "lead that needs action" feel urgent without being stressful. Consider a single hero card ("You have 3 new leads waiting") over a grid of equal-weight stats.
2. **Orders list**: color-code by due-date proximity, not just status. Overdue orders should scream.
3. **Order detail**: measurements are currently a tall list of identical fields — group them visually (upper body / sleeves / neck) and make the most-variant fields (bust, waist) prominent.
4. **Referral detail**: "Convert to order" is the main CTA — it should dominate the screen once the lead is confirmed. Today it's a small button among many.
5. **Portfolio**: an empty state that feels inviting, not abandoned. "Add your first work sample" with a tip about photo angle / lighting.
6. **Verification**: a clear progress meter. "1 of 3 documents uploaded. Usually verified within 24 hours."
7. **Kiosk tailor card**: landscape format, touch-friendly, with photo + name + rating + 1-line city. "Connect" button at least 60px tall.
8. **Customer tailor discovery** (new): list + detail pattern. Lead with portfolio photos — customers buy on visual trust.
9. **Admin KYC queue**: comparison view — show the doc next to the tailor's typed info so inconsistencies are obvious.

## 11. Known constraints that will shape design

- **WhatsApp is the universal fallback.** Every tailor card in every surface should have a WhatsApp button. Deeplinks like `https://wa.me/91XXXXXXXXXX?text=...` are available.
- **OTP is currently `123456` in dev** (backend hardcoded for now) — real Twilio or similar comes later. Doesn't affect UI.
- **Payments / deposits are out-of-band today** (UPI/cash between customer and tailor). The module records `depositPaid` but doesn't process payment. Design should signal that Wearify facilitates but doesn't broker the transaction.
- **Commission is 10% of order total**, currently hardcoded. Admin UI to adjust is planned (item 4 above).

## 12. Non-goals (don't over-design)

- No tailor-to-tailor messaging or marketplace bidding.
- No map view of tailors (city + area text is enough).
- No customer-side chat (WhatsApp is the channel).
- No multi-tailor collaboration on one order.
- No scheduled pickup / delivery logistics (tailor arranges with customer directly).

---

## Quick links for the designer

- Live app walkthrough: `npm run dev`, log in as tailor with phone `9800000301` (Manoj) or `9800000304` (Geeta), OTP `123456`, password `Tailor@123`.
- Current code lives under `/app/tailor/*`, Convex backend at `/convex/tailorOps.ts`. Not required reading, but helpful if the designer wants to see what data is actually available.
- Brand references in `/kisko-ui/` (mirror / kiosk screenshots) show the warm-premium direction we want to extend to the tailor portal.
