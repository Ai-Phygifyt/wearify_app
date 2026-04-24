# Wearify Security & Implementation Review

> Excludes OTP issues (per user request)

## Project Overview

**Wearify** is an AI-powered virtual try-on platform for Indian saree retailers. It has 6 interconnected modules (Admin, Store Dashboard, Tablet, Kiosk/Mirror, Customer PWA, Tailor Portal) with a Convex backend (41 tables) and Next.js 16 frontend.

---

## CRITICAL Issues (Immediate Action Required)

### 1. Weak Password Hashing
**Location:** `convex/phoneAuth.ts:56-62`

```typescript
// NOT bcrypt - static salt "wearify-salt-2024" is hardcoded
async function hashPassword(password: string): Promise<string> {
  const data = encoder.encode(password + "wearify-salt-2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
```

- Uses SHA-256 with static salt (not per-user)
- Salt is hardcoded in source code
- Comment says "In production, use bcrypt" but not implemented
- Vulnerable to rainbow tables and brute force

### 2. Insecure Token Generation (Session Tokens)
**Location:** `convex/phoneAuth.ts:64-71`

```typescript
function generateToken(): string {
  for (let i = 0; i < 48; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]; // Math.random()!
  }
}
```

- Uses `Math.random()` which is predictable
- Session tokens could be guessed by attackers

### 3. Insecure Trial Room Code Generation
**Location:** `convex/trialRoom.ts:6-11`

```typescript
function generateNumericCode(): string {
  code += Math.floor(Math.random() * 10).toString(); // Math.random()!
}
```

- Uses `Math.random()` for 6-digit codes
- ~1 million possibilities, guessable within 15-min window

### 4. Publicly Accessible Trial Room Validation
**Location:** `convex/trialRoom.ts:82-140`

`validateCode` is a **public query** with no authentication. Anyone who knows a store's ID can:
- Enumerate 6-digit trial room codes
- Retrieve customer phone numbers, customer IDs, session data
- Access shortlisted items for the session

### 5. Client-Side Only Admin Authorization
**Location:** `app/admin/layout.tsx:9, 169-179`

```typescript
const ADMIN_EMAIL = "admin@wearify.com";
// ... client-side check only:
if (data?.user?.email === ADMIN_EMAIL) { /* allow */ }
```

- No server-side verification that the authenticated user is admin
- Any user authenticated as `admin@wearify.com` gets full admin access

### 6. PIN Stored in Plaintext
**Location:** `schema.ts:118`, `staff.pin`

- Staff PIN stored as plaintext string in database
- If database is compromised, all PINs are exposed

---

## HIGH Issues (Should Address Soon)

### 7. No Rate Limiting
- OTP verification: unlimited attempts
- Staff PIN login: no lockout after failed attempts
- Trial room code generation: no rate limiting
- Password login: no attempt tracking

### 8. Typo in File Field Validation
**Location:** `convex/files.ts:53`

```typescript
"shopLicenseFileFileId"  // Should be "shopLicenseFileId"
```

### 9. No Billing/Payment Processing
**Location:** `convex/billing.ts`

- Only has `listInvoices` and `getStats` queries
- No actual payment gateway integration (Stripe/Razorpay)
- No invoice generation logic
- No subscription enforcement

### 10. Kiosk Has No Server-Side Authentication
**Location:** `app/kiosk/layout.tsx`

- Only checks `localStorage.getItem("wearify_kiosk_store")`
- No server validation that the device is legitimate
- Anyone with localStorage access can spoof kiosk mode

### 11. localStorage Data Leakage on Shared Devices

| Key | Stored Data | Risk |
|-----|-------------|------|
| `wearify_kiosk_session` | customerId, phone, sessionId | CRITICAL |
| `wearify_tablet_customer` | customerId, phone | CRITICAL |
| `wearify_auth_token` | 48-char session token | HIGH |
| `wearify_tablet_staff` | staffId, role, storeId | HIGH |

- No encryption of stored data
- Shared devices (kiosk, tablet) retain sensitive customer data
- No automatic clearing of session data on logout/timeout

### 12. Invalid Date Validation
**Location:** `customers.ts:223`

Regex `^\d{4}-\d{2}-\d{2}$` allows invalid dates like `2024-02-30`.

---

## MEDIUM Issues (Plan to Fix)

### 13. No Server-Side Authorization on Most Queries

Most Convex queries don't verify the caller's role or ownership:
- `listStaffByStore` - Anyone can list staff for any store
- `customers.getByPhone` - Should be restricted to own phone only
- `stores.list` - Anyone can list all stores

### 14. 4-Digit Staff PIN with No Lockout
- Only 10,000 possibilities
- No lockout after failed attempts
- Low entropy for authentication

### 15. Loyalty Points Are Global, Not Per-Store
- Customer's points balance is global across all stores
- When redeeming at Store A, global balance is deducted
- No per-store point accounting

### 16. AI/Agent System is Only a Tracker
**Location:** `convex/agents.ts`

- Stores AI configurations but no actual AI processing
- Virtual try-on likely runs on edge devices (Mirrors)

### 17. No External API Integrations
- **Twilio:** Not integrated (OTP is hardcoded placeholder)
- **WhatsApp:** Templates stored but no sending logic
- **Payments:** Not integrated

### 18. Staff Login Returns Success for Inactive Staff
**Location:** `phoneAuth.ts:428-430`

```typescript
if (!staffMember) {
  return { success: false, error: "Invalid PIN" };
}
// No check for staffMember.status === "inactive"
return { success: true, ... }; // Returns success even if inactive!
```

---

## Implementation Issues (Non-Security)

### 19. Missing File Upload Validation
KYC documents (Aadhaar, PAN) are uploaded but:
- No virus scanning
- No document expiry tracking
- No verification status enforcement

### 20. Session Never Expires (30-day TTL)
- Tokens have 30-day TTL but no activity-based refresh
- No sliding expiration
- Tokens not invalidated on password change

### 21. Password Reset Not Implemented
No "forgot password" flow exists.

---

## What's Implemented Correctly ✅

1. **Schema Design** - Good use of indexes, proper relationships, correct use of Convex types
2. **Phone Number Normalization** - Converts all phones to `+91XXXXXXXXXX` format
3. **String Trimming** - Good input sanitization on text fields (`customers.ts:161-168`)
4. **File Validation** - Server-side validation mirrors client guards with size limits
5. **Multi-Device Sessions** - Per-device token support, `logoutAll` works correctly
6. **Cascading Delete** - Store removal cleans up related records
7. **Idempotent Customer Creation** - `ensureCustomerByPhone` handles duplicates
8. **Good API Structure** - Using Convex queries/mutations properly

---

## Summary Table

| Severity | Count | Top Issues |
|----------|-------|------------|
| CRITICAL | 6 | Password hashing, session tokens, trial room codes, trial room validation, admin auth, PIN storage |
| HIGH | 5 | Rate limiting, typo, billing missing, kiosk auth, localStorage leakage |
| MEDIUM | 6 | Server-side auth, PIN lockout, loyalty accounting, AI placeholder |
| INFO | 3 | No external APIs, no password reset, 30-day TTL |

---

## Recommendations

### Priority 1 (Fix Immediately)
1. Upgrade password hashing to bcrypt with per-user salt
2. Replace `Math.random()` with `crypto.getRandomValues()` for tokens and codes
3. Add server-side authorization to `validateCode` query
4. Move admin authorization check to server-side Convex mutation

### Priority 2 (Fix Soon)
5. Add rate limiting to login, OTP, and code generation endpoints
6. Encrypt sensitive data in localStorage or avoid storing it
7. Clear localStorage on session end for kiosk/tablet
8. Add failed attempt lockout for staff PIN login
9. Add server-side validation for kiosk device identity

### Priority 3 (Plan for Production)
10. Implement actual billing/payment processing
11. Add password reset flow
12. Implement per-store loyalty point accounting
13. Add virus scanning for KYC document uploads
14. Add token refresh mechanism
