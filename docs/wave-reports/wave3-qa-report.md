# QA — Wave 3 Report

Branch: `feat/v1-product-spec`
Date: 2026-05-12
Author: QA Engineer (Wave 3)
Base: commits `b7430e4` (Backend) + `755bf4e` (Frontend) + `3102225` (Full-stack)

---

## Build status

**npm install:** UNABLE TO RUN. Node.js is not installed or not on PATH in the QA engineer's shell environment (`/usr/local/bin`, `/opt/homebrew/bin`, `~/.nvm` — all checked, none present). The `package.json` has `jose ^4.15.9` explicitly listed as a direct dependency (added in Wave 2 commit `3102225`), so `npm install` should succeed once Node.js is available. The dependency was confirmed present in `package.json` before Wave 3 began.

**npm run build:** UNABLE TO RUN — same root cause (no npm/node binary). Build flags `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` are in place in `next.config.ts` per spec — these are intentional v1 settings. All TypeScript errors found during the static walk-through are documented below. The two bugs that would cause runtime failures (not just type errors) have been fixed in Wave 3.

**npm run lint:** UNABLE TO RUN — same root cause.

**Static analysis verdict:** The JSX trees, import chains, and API contracts are sound with the two exceptions fixed in this wave. No build-breaking syntax errors or missing imports were found by file-by-file inspection.

**Action required for Novalytix:** Run `npm install && npm run build` from a machine with Node.js 20+ to confirm the build. Given `typescript.ignoreBuildErrors: true`, even the remaining TypeScript mismatches (documented below under escalated bugs) will not fail the build.

---

## Bugs found and fixed

### Bug 1 — `pricePerKg` vs `leadPriceInr` mismatch in marketplace mapper

**File:line:** `app/b2b/marketplace/page.tsx:36`

**What was wrong:** The `mapToLeadCard()` function mapped the `raw.leadPriceInr` field (the total lead price in ₹, e.g. ₹1,000 for a 1000 kg 4W lead) into the `pricePerKg` field of `LeadCardData`. The `LeadCard` component computes `totalPrice = Math.round(lead.weightKg * lead.pricePerKg)`, so with `pricePerKg = 1000` and `weightKg = 1000` the displayed price would be `₹1,000,000` — six orders of magnitude wrong. Additionally, the `leadPriceInr` key does not exist in the `LeadCardData` interface, so TypeScript would flag this as an error if not hidden by `typescript.ignoreBuildErrors`.

**Fix applied:** Removed the `leadPriceInr` line. Added a `pricePerKg` computation from vehicle type per engineering-design §8 pricing rule (2W = ₹0.75/kg, 4W/truck = ₹1.0/kg). Added `// QA-fix:` comment.

**Diff (conceptual):**
```diff
- leadPriceInr: raw.leadPriceInr ?? 0,
+ // QA-fix: LeadCardData.pricePerKg is per-kg rate (₹/kg), not total price.
+ // Engineering-design §8: 2W = ₹0.75/kg, 4W/truck = ₹1.0/kg.
+ const pricePerKg = raw.vehicleType === "2W" ? 0.75 : 1.0
  ...
+ pricePerKg,
```

---

### Bug 2 — `referenceId` missing from marketplace `mapToLeadCard`

**File:line:** `app/b2b/marketplace/page.tsx:38`

**What was wrong:** `LeadCardData` requires a `referenceId: string` field (rendered at the bottom of each `LeadCard` as the lead's reference number). The `mapToLeadCard()` function did not set this field. TypeScript with `ignoreBuildErrors` would silently pass; at runtime the field would be `undefined`, rendering as an empty string in the card footer.

**Fix applied:** Added `referenceId: raw._id ? \`SC-${String(raw._id).slice(-5).toUpperCase()}\` : "SC-?????"`. Pattern is consistent with how `TriageClientSection.tsx` generates reference IDs. Added `// QA-fix:` comment.

---

## Bugs found and NOT fixed (escalated)

### Escalated 1 — `/admin/mock-config` page is missing

**File:** `app/admin/mock-config/` (directory does not exist)
**What's wrong:** The admin dashboard (`app/admin/page.tsx:318`) has a quick-link button pointing to `/admin/mock-config`. This navigates to a Next.js 404. The underlying API endpoint (`GET/POST /api/admin/mock-config`) is fully implemented and tested. Only the page UI (the form that calls the endpoint) is missing.
**Why not fixed:** Creating a full admin settings page is more than 5 lines of code and is explicitly listed as a "Not In Scope" item in Wave 2 report §8. It is not a runtime crash in any critical user flow.
**Severity:** Medium — demo workaround available (call the API directly via `curl` or REST client).
**Who should fix:** Wave 4 Full-stack Dev. Suggested: a simple radio-group form reading from `GET /api/admin/mock-config` and writing via `POST`. Pattern mirrors the triage page RSC + client component split.

---

### Escalated 2 — SVG logo files missing but referenced in frontend report

**File:** `public/brand/logo-mark.svg`, `public/brand/logo.svg`, `public/brand/logo-white.svg`
**What's wrong:** The Wave 1 Frontend report states these three SVG files were created. They are not present on disk. The `Navbar.tsx` uses `<img src="/brand/logo.png">` (the real canonical PNG) not the SVG files — so there is no visible breakage in any consumer-facing path.
**Why not fixed:** No consumer path is broken. The brand-guide was updated on 2026-05-12 after the frontend report was written, noting the real `logo.png` exists and supersedes any AI-recreated SVGs. Recreating SVGs from scratch is not appropriate for QA.
**Severity:** Low — no user-visible impact.
**Who should fix:** Only if the founder or Novalytix wants a scalable SVG version — the brand-guide notes the `logo.pdf` vector source can be exported via Illustrator/Inkscape.

---

### Escalated 3 — `cdValue` and `vehicleLabel` not returned by tier1 API

**File:** `app/api/calc/tier1/route.ts` (no `cdValue` or `vehicleLabel` in response JSON)
**What's wrong:** `app/calculator/page.tsx:86,88` reads `data.cdValue ?? 52000` and `data.vehicleLabel ?? getDisplayLabel(regNumber)` from the tier1 API response. The API does not return either field — it returns `scrapMin`, `scrapMax`, `pickupCost`, `vehicleData`, `vahanAvailable`, and `blurredTiles`. The fallbacks (`?? 52000`, `?? getDisplayLabel(regNumber)`) are safe and the page displays correctly. However, the CD value shown at Tier 1 is always the hardcoded ₹52,000 fallback rather than a computed figure.
**Why not fixed:** Fallbacks are safe; no crash. The engineering-design does not specify a CD value at Tier 1 — CD is only computed at Tier 2 via `computeCdRange()` in the OTP verify route. Adding `cdValue` to the tier1 response would require designing a Tier 1 CD estimation formula, which is a product decision, not a QA fix.
**Severity:** Low — display is correct per design; the blurred tiles pattern means CD is shown locked at Tier 1 anyway.
**Who should fix:** Backend Dev, once a Tier 1 CD estimate formula is locked with PM.

---

## Static walk-through findings per page

| Page | JSX tree sane? | Concerns |
|------|---------------|----------|
| `app/page.tsx` | Yes | Correct `"use client"` at top; `useRouter` valid; all 7 imported components exist and are correctly typed |
| `app/start/page.tsx` | Yes | `useSearchParams` wrapped in `Suspense` (correct per Next.js 15); `intent` param is informational only |
| `app/start/commercial/page.tsx` | Yes | Fleet form is a stub — 600ms delay + success toast. `POST /api/fleet-enquiry` does not exist; the TODO is documented |
| `app/calculator/page.tsx` | Yes | `useSearchParams` in `Suspense`; `BenefitBreakdown` props correct; `tier1Data.cdValue` uses safe fallback |
| `app/calculator/verify/page.tsx` | Yes | `useSearchParams` in `Suspense`; `OTPInput` props match interface; `BenefitBreakdown tier={2}` correct |
| `app/calculator/upload/page.tsx` | Yes | Session guard (redirects to `/calculator` if no `calcSessionToken`) is correct; `DocumentUploader` props match; upload stub clearly marked |
| `app/calculator/done/page.tsx` | Yes | No `Suspense` needed (no `useSearchParams`); `sessionStorage` reads have safe defaults |
| `app/admin/triage/page.tsx` | Yes | RSC; correct `force-dynamic`; server-side session check → redirect to `/admin` if not admin; `TriageClientSection` import resolves |
| `app/admin/triage/TriageClientSection.tsx` | Yes | `"use client"`; `TriageLeadCard` and `QualityBadge` imports resolve; `mapToTriageLead` correctly maps API shape |
| `app/admin/page.tsx` | Yes | RSC; quick-link buttons added; `/admin/mock-config` link goes to missing page (escalated above) |
| `app/b2b/marketplace/page.tsx` | Yes (after fix) | `"use client"`; `LeadCard` import resolves; `mapToLeadCard` fixed in Wave 3 |
| `app/b2b/chat/[leadId]/page.tsx` | Yes | `"use client"`; `useParams()` correctly typed; `POLL_INTERVAL_MS = 5000` constant in place; `clearInterval` on unmount |
| `lib/services/mock/config.ts` | Yes | `getMockConfig()` with 10s TTL cache; `invalidateMockConfigCache()` exported and called by mock-config POST route |
| `lib/services/mock/otp.adapter.ts` | Yes | Imports `MockServiceError` from `vahan.adapter.ts` correctly; `storeOtp` / `verifyOtp` from `otp-store.ts` correct |
| `lib/services/mock/vahan.adapter.ts` | Yes | `MockServiceError` class defined here (imported by other adapters) |
| `lib/services/mock/vision.adapter.ts` | Yes | 2-second delay + `simulateDelay(mode)` correctly chained |
| `lib/state-machine/lead.ts` | Yes | `transition()` validates from/to and guard conditions; throws on invalid transition |
| `lib/middleware/requireRole.ts` | Yes | `requireRole(role)` and `requireAuth()` exported; used by all new API routes |
| `app/api/calc/tier1/route.ts` | Yes | `lookupVehicle` import from `vahan.adapter.ts` correct; `LeadState.create` uses correct schema fields |
| `app/api/otp/verify/route.ts` | Yes | `SignJWT` from `jose` (in `package.json`); `getCalcSecret()` uses `NEXTAUTH_SECRET + ":calc"`; `transition()` called correctly |
| `app/api/verify/submit/route.ts` | Yes | `jwtVerify` from `jose` for `calcSession` auth; `runVerificationPipeline()` import correct; double `transition()` call (tier2→tier3, tier3→triage) is correct |
| `app/api/triage/queue/route.ts` | Yes | `requireRole("admin")`; `LeadState.find({ tier: "triage" })` correct |
| `app/api/marketplace/leads/[id]/buy/route.ts` | Yes | `params: Promise<{ id: string }>` correctly awaited (Next.js 15); atomic `findOneAndUpdate` pattern correct; `ChatThread.create` after purchase |
| `app/api/admin/mock-config/route.ts` | Yes | `requireRole("admin")`; `invalidateMockConfigCache()` called on POST |
| `app/api/chat/threads/[threadId]/messages/route.ts` | Yes | Correct `params: Promise<{ threadId: string }>` awaited; GET polls since `?since=ISO`; POST handles both `text` and multipart `photo` |

---

## Mock-toggle verification

Tracing one mock adapter end-to-end (OTP flow):

1. `app/calculator/verify/page.tsx` → calls `POST /api/otp/issue` with `{ phone: "9876543210" }`
2. `app/api/otp/issue/route.ts` → calls `checkOtpRateLimit(phone)` from `lib/services/otp-store.ts` → passes (first request)
3. → calls `issueOtp(phone)` from `lib/services/mock/otp.adapter.ts`
4. `otp.adapter.ts` → calls `getMockConfig()` from `lib/services/mock/config.ts`
5. `getMockConfig()` → checks 10s cache; if miss, fetches `Setting.findOne({ key: "mockConfig" })` from Atlas; returns `{ mode: "success", services: {} }`
6. → `mode = config.services.otp ?? config.mode = "success"`
7. → `simulateDelay("success")` → 200ms delay
8. → calls `storeOtp("9876543210", "000000")` in the in-memory Map with 10-min TTL
9. → returns `{ success: true, expiresIn: 600 }`
10. `route.ts` → adds `_demoHint: "Demo mode — OTP is 000000"` if `NEXT_PUBLIC_IS_STAGING === "true"`
11. Page → shows toast with `_demoHint`

Verification step:
1. Page → calls `POST /api/otp/verify` with `{ phone, otp: "000000", leadStateId }`
2. `route.ts` → calls `verifyOtp("9876543210", "000000")` from `lib/services/mock/otp.adapter.ts`
3. → `mode = "success"` → delegates to `import("@/lib/services/otp-store").verifyOtp("9876543210", "000000")`
4. Store → finds entry, checks expiry (not expired), compares "000000" === "000000" → `true`, deletes entry (single-use)
5. → `valid = true`
6. `route.ts` → calls `LeadState.findById(leadStateId)` → found → calls `transition(leadStateId, "tier2", { phone, phoneVerifiedAt, cdValueMin, cdValueMax })`
7. → issues `calcSessionToken` JWT signed with `NEXTAUTH_SECRET + ":calc"`
8. → returns `{ calcSessionToken, tier2Data: { cdMin, cdMax, ... } }`
9. Page → stores `calcSessionToken` in `sessionStorage`, shows Tier 2 breakdown

The full chain is intact. Admin toggle via `POST /api/admin/mock-config` with `{ services: { otp: "failure" } }` would make `issueOtp` throw `MockServiceError("OTP_SEND_FAILED")`, which the route catches and returns `503 OTP service temporarily unavailable`.

---

## Test-data state

**Before the demo, run these scripts against the Atlas DB:**

```bash
# 1. Seed mock settings (idempotent — safe to run multiple times)
npx tsx scripts/seed-settings.ts

# 2. Seed admin account (check seed-admin.ts for credentials — do not commit credentials)
npx tsx scripts/seed-admin.ts

# 3. Only if B2BPartner documents exist with plaintext passwords:
npx tsx scripts/hash-partner-passwords.ts
```

**Collections that will be empty initially (require user actions to populate):**
- `lead_states` — created when a customer hits `POST /api/calc/tier1`
- `marketplace_leads` — created when admin approves "marketplace" in triage
- `chat_threads`, `chat_messages` — created when partner buys a lead
- `triage_decisions` — created when admin acts on triage queue
- `anti_hoarding_alerts` — admin-initiated only; will be empty throughout demo
- `b2bpartner` — needs at least one partner account for marketplace demo

**Collections that should be populated before the demo:**
- `settings` — must have `mockConfig` and `leadExpiryDays` keys (seeded by `seed-settings.ts`)
- `users` — must have at least one `admin` role user (seeded by `seed-admin.ts`)
- `b2bpartner` — must have at least one partner account for Steps 8–9 of the demo script. Create via `POST /api/b2b-partner` (admin session required) or via `/admin/b2b-generator` in the admin UI.

**Note on the OTP store:** `lib/services/otp-store.ts` is an in-memory Map. It is reset every time the Next.js process restarts. After a server restart, OTPs issued before the restart are gone — users would need to request a new OTP. This is safe for the demo; for production, replace with Redis CT 201.

---

## Recommended demo prep checklist for the founder

Before screen-sharing with Novalytix, complete the following in order:

- [ ] **Deploy to staging LXC CT 210** per product-decisions.md §9 deployment plan
- [ ] **Set `NEXT_PUBLIC_IS_STAGING=true`** in the LXC environment — confirms the staging banner appears and OTP demo hint is shown in toasts
- [ ] **Set `NEXTAUTH_SECRET`** to a fresh random string (`openssl rand -base64 32`)
- [ ] **Verify MongoDB Atlas connection** — Atlas password should be rotated before the demo (see out-of-band actions). If not yet rotated, at minimum confirm the connection works from the LXC
- [ ] **Run `npx tsx scripts/seed-settings.ts`** against the Atlas DB — confirms `mockConfig` row exists
- [ ] **Run `npx tsx scripts/seed-admin.ts`** — creates the admin account you'll log in with
- [ ] **Create one partner account** via `/admin/b2b-generator` page or `POST /api/b2b-partner` — needed for Steps 8–9
- [ ] **Walk through the demo script** (Steps 1–9 in `novalytix-handover.md`) end-to-end by yourself before the call — confirm each step produces the expected output
- [ ] **Test the admin triage flow**: complete Steps 1–6 on the consumer side, then switch to admin and approve a lead to marketplace; then switch to partner and buy it and open chat
- [ ] **Have a REST client ready** (Insomnia / Postman / curl) to call `POST /api/admin/mock-config` if you want to demonstrate the failure modes — the UI page for mock-config is not built yet
- [ ] **Note the mock OTP `000000`** — the staging toast shows this automatically, but have it ready to say aloud if screen-sharing audio is cut off
- [ ] **Confirm the staging banner is visible** at the top of every page — if it's missing, `NEXT_PUBLIC_IS_STAGING` is not set in the LXC env
- [ ] **Prepare a brief context paragraph** explaining that everything external is mocked — Novalytix reviewers may ask why there are no real SMS or VAHAN responses
