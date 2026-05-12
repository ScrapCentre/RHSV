# Backend Dev — Wave 1 Report

Branch: `feat/v1-product-spec`
Date: 2026-05-12

---

## Files added

### Models (6 new)
| File | Description |
|---|---|
| `models/LeadState.ts` | State-machine document for the 3-tier calculator. Holds all vehicle, verification, triage, and routing data per lead. Collection: `lead_states`. |
| `models/MarketplaceLead.ts` | Partner-facing lead record with masking, pricing, and atomic-lock semantics. Collection: `marketplace_leads`. |
| `models/ChatThread.ts` | One conversation per (MarketplaceLead × partner) pair. Unique compound index enforces the constraint. Collection: `chat_threads`. |
| `models/ChatMessage.ts` | Individual messages with poll index `{ threadId, createdAt }`. Collection: `chat_messages`. |
| `models/TriageDecision.ts` | Immutable audit log of admin triage decisions. Collection: `triage_decisions`. |
| `models/AntiHoardingAlert.ts` | Ops-team alerting records (no automated enforcement in v1). Collection: `anti_hoarding_alerts`. |

### API routes (19 new)
| File | Description |
|---|---|
| `app/api/calc/tier1/route.ts` | Anonymous calc entry: VAHAN lookup (mock), scrap range, LeadState creation, cookie |
| `app/api/calc/tier2/route.ts` | Retrieve tier2 data after phone verification (calcSession JWT gate) |
| `app/api/otp/issue/route.ts` | OTP issuance via MSG91 stub adapter; rate-limited 3/phone/10min |
| `app/api/otp/verify/route.ts` | OTP verification; issues 1-hour calcSession JWT (jose HS256); patches LeadState to tier2 |
| `app/api/verify/start/route.ts` | Initiates document collection session (calcSession JWT gate) |
| `app/api/verify/submit/route.ts` | Runs vision mock adapter (2s delay); transitions tier2→tier3→triage; auto-queues |
| `app/api/triage/queue/route.ts` | Admin feed of `tier === "triage"` leads (admin-only) |
| `app/api/triage/decide/route.ts` | Admin triage decision: auraiya / marketplace / rejected; creates TriageDecision + downstream docs |
| `app/api/marketplace/leads/route.ts` | Partner: list active, non-expired leads (masked) with pagination |
| `app/api/marketplace/leads/[id]/route.ts` | Partner: single lead detail with mock distance |
| `app/api/marketplace/leads/[id]/buy/route.ts` | Partner: atomic `findOneAndUpdate` purchase; creates ChatThread with unlocked phone |
| `app/api/marketplace/leads/[id]/watch/route.ts` | Partner: toggle watch/unwatch (`$addToSet` / `$pull`) |
| `app/api/marketplace/leads/[id]/return/route.ts` | Admin/partner: relist lead; tracks relist_count; moves to `in_revival` after 2 relists |
| `app/api/chat/threads/route.ts` | List threads — partners via NextAuth session, customers via calcSessionToken |
| `app/api/chat/threads/[threadId]/messages/route.ts` | GET (poll, `?since=ISO`): returns messages after timestamp. POST: send text or photo |
| `app/api/admin/mock-config/route.ts` | GET/POST mock toggle state; invalidates module-level cache on write |
| `app/api/admin/triage/alerts/route.ts` | List unresolved anti-hoarding alerts; POST creates alert (admin only) |
| `app/api/admin/triage/alerts/[id]/route.ts` | PATCH: mark alert resolved with note |
| `app/api/admin/maintenance/expire-leads/route.ts` | Sweeps `status: active, expiresAt <= now` → `expired`; idempotent |

### lib/ (9 new files)
| File | Description |
|---|---|
| `lib/services/mock/config.ts` | `getMockConfig()` with 10s TTL module-level cache; `simulateDelay()`; `invalidateMockConfigCache()` |
| `lib/services/mock/vahan.adapter.ts` | VAHAN mock: deterministic fixture from reg prefix; success/failure/random modes |
| `lib/services/mock/otp.adapter.ts` | MSG91 mock: issues OTP "000000" in mock mode; delegates verify to otp-store |
| `lib/services/mock/digilocker.adapter.ts` | DigiLocker mock: synthetic Aadhaar fixture keyed by phone last-4 |
| `lib/services/mock/vision.adapter.ts` | AI vision mock: 2s delay; success→confidence 87 Gold; failure→confidence 23 flagged |
| `lib/services/mock/maps.adapter.ts` | Google Maps mock: deterministic distance from pincode math; ₹8/km pickup cost |
| `lib/services/otp-store.ts` | In-memory Map OTP store: single-use, 10-min TTL, rate-limit tracking (3/phone/10min) |
| `lib/state-machine/lead.ts` | `transition()`: enforces valid tier transitions and guard conditions |
| `lib/middleware/requireRole.ts` | `requireRole(role)` and `requireAuth()` helpers (shared across routes) |

### scripts (2 new)
| File | Description |
|---|---|
| `scripts/hash-partner-passwords.ts` | One-shot B2BPartner password migration: re-hashes any plaintext `$2`-check safe |
| `scripts/seed-settings.ts` | Seeds `mockConfig` and `leadExpiryDays` Setting rows (idempotent upsert) |

---

## Files modified

| File | What changed | Engineering-design ref |
|---|---|---|
| `lib/auth.ts` | (1) Deleted debug bypass block (`debug@test.com / debug123`). (2) Replaced hardcoded OTP `"1234"` with `verifyOtp()` adapter call. (3) Removed plaintext-password fallback in both `credentials` and `b2b-credentials` providers — bcrypt-only. (4) Raw `AUTH_ERROR: ${err.message}` throw replaced with generic `AUTHENTICATION_FAILED`. (5) Added `import { verifyOtp } from "@/lib/services/otp-store"`. | §11, 07-tech-debt CRITICAL/HIGH |
| `models/User.ts` | role enum: `["client","admin","b2b"]` → `["client","admin","partner","executive","scrapcentre"]` | §3.1, §12 |
| `models/Valuation.ts` | status enum extended with `"triage_pending"`, `"rejected_by_triage"`; added `leadStateId`, `qualityScore`, `triageDecisionId` fields | §3.1, §12 |
| `models/SellVehicle.ts` | Same as Valuation | §3.1, §12 |
| `models/ExchangeVehicle.ts` | Same as Valuation | §3.1, §12 |
| `models/BuyVehicle.ts` | Same as Valuation | §3.1, §12 |
| `app/api/b2b-partner/route.ts` | Added admin session gate on both POST and GET; hash password with bcrypt.hash(12) before create; strip password from GET response with `.select("-password")` | §11, 07-tech-debt CRITICAL |
| `app/api/b2b-register/route.ts` | Added admin session gate on GET, DELETE, PATCH (POST remains public for RVSF signup). Password excluded from partner lookup response. | §11, 07-tech-debt HIGH |
| `app/api/ekyc/route.ts` | Added session check; ownership check `findOne({ _id, userId })`; ekycStatus changed to `"pending"` (was auto-set `"verified"`); file type/size validation before Cloudinary upload | §11, 07-tech-debt HIGH |
| `app/api/ekyc/[type]/route.ts` | Same auth and ownership fixes; Next.js 15 `params: Promise<{type}>` typing | §11, 07-tech-debt HIGH/MEDIUM |
| `app/api/admin/ekyc/[type]/route.ts` | Added missing admin session check (mirrors `view/[type]/[id]/route.ts`); Next.js 15 params typing | §11, 07-tech-debt HIGH |
| `scripts/seed-now.ts` | Replaced hardcoded Atlas URI with `process.env.MONGODB_URI` (dotenv from `.env.local`) | 07-tech-debt CRITICAL, §13 |

---

## Files deleted

| File | Reason |
|---|---|
| `scratch/check-conn.js` | CRITICAL: hardcoded `mongodb+srv://scrapcentre69_db_user:FMTSiCszPRoHDnmI@...` leaked in source |
| `app/api/setup-admin/route.ts` | CRITICAL: public unauthenticated endpoint creating admin accounts with known credentials |
| `app/api/temp-seed/route.ts` | CRITICAL: public unauthenticated endpoint creating a second known admin account |

---

## Mock adapters created

| File | Service | Default behaviour | Failure behaviour | Toggle key |
|---|---|---|---|---|
| `lib/services/mock/vahan.adapter.ts` | VAHAN vehicle lookup | Deterministic fixture from reg prefix heuristic; 200ms delay | Throws `MockServiceError("VAHAN_UNAVAILABLE")` — caller falls back to manual entry | `mockConfig.services.vahan` |
| `lib/services/mock/otp.adapter.ts` | MSG91 OTP send/verify | Stores OTP `"000000"` in otp-store; verifies via single-use store | Throws `MockServiceError("OTP_SEND_FAILED")`; verify returns `false` | `mockConfig.services.otp` |
| `lib/services/mock/digilocker.adapter.ts` | DigiLocker Aadhaar XML | Synthetic Aadhaar fixture keyed by phone last-4 digits | Throws `MockServiceError("DIGILOCKER_UNAVAILABLE")` | `mockConfig.services.digilocker` |
| `lib/services/mock/vision.adapter.ts` | AI vision verification | 2s delay + 200ms; returns `{ status: "verified", confidence: 87, flags: [], qualityScore: derived }` | Returns `{ status: "flagged", confidence: 23, flags: ["photo_tampered"], qualityScore: "bronze" }` | `mockConfig.services.vision` |
| `lib/services/mock/maps.adapter.ts` | Google Maps Distance Matrix | Deterministic km from pincode math; ₹8/km pickup cost | Returns `{ distanceKm: 0, pickupCostInr: 0 }` (fail open) | `mockConfig.services.maps` |

Global mode controlled by `mockConfig.mode` in the `settings` collection. Per-service overrides take precedence. Admin writes to `POST /api/admin/mock-config` which invalidates the 10s module-level cache.

---

## API routes — final state

| Method | Path | Auth | What it does |
|---|---|---|---|
| POST | `/api/calc/tier1` | None | Creates LeadState tier1; calls VAHAN mock; sets cookie |
| PATCH | `/api/calc/tier2` | calcSession JWT | Returns tier2 CD/discount data for existing lead |
| POST | `/api/otp/issue` | None | Issues OTP via MSG91 stub; rate-limited 3/10min |
| POST | `/api/otp/verify` | None | Verifies OTP; issues calcSession JWT; patches lead to tier2 |
| POST | `/api/verify/start` | calcSession JWT | Initiates doc collection; returns uploadToken |
| POST | `/api/verify/submit` | calcSession JWT | Runs vision mock; transitions tier2→tier3→triage |
| GET | `/api/triage/queue` | admin | Lists leads in `tier === "triage"` |
| POST | `/api/triage/decide` | admin | Routes lead: auraiya/marketplace/rejected; creates TriageDecision + downstream |
| GET | `/api/marketplace/leads` | partner | Paginated active leads (masked); expiry filtered |
| GET | `/api/marketplace/leads/:id` | partner | Single lead + mock distance |
| POST | `/api/marketplace/leads/:id/buy` | partner | Atomic purchase; creates ChatThread |
| POST | `/api/marketplace/leads/:id/watch` | partner | Toggle watchedBy |
| PATCH | `/api/marketplace/leads/:id/return` | admin or partner | Relist; max 2 relists then `in_revival` |
| GET | `/api/chat/threads` | partner or calcSession | List threads for caller |
| GET | `/api/chat/threads/:threadId/messages` | partner or calcSession | Poll messages since ISO timestamp |
| POST | `/api/chat/threads/:threadId/messages` | partner or calcSession | Send text or photo message |
| GET | `/api/admin/mock-config` | admin | Current mock toggle state |
| POST | `/api/admin/mock-config` | admin | Update global mode and/or per-service overrides |
| GET | `/api/admin/triage/alerts` | admin | List unresolved anti-hoarding alerts |
| POST | `/api/admin/triage/alerts` | admin | Create alert (manual or n8n webhook) |
| PATCH | `/api/admin/triage/alerts/:id` | admin | Resolve alert with note |
| GET | `/api/admin/maintenance/expire-leads` | admin | Sweep expired leads; returns count |
| POST | `/api/b2b-partner` | admin | Create B2B partner (password bcrypt-hashed) |
| GET | `/api/b2b-partner` | admin | List partners (password field excluded) |
| POST | `/api/b2b-register` | None (public) | RVSF signup form submission |
| GET | `/api/b2b-register` | admin | List/get registrations |
| PATCH | `/api/b2b-register` | admin | Update registration status |
| DELETE | `/api/b2b-register` | admin | Delete registration |
| PATCH | `/api/ekyc` | session (any auth) | Submit eKYC with ownership check; ekycStatus→pending |
| POST | `/api/ekyc/:type` | session (any auth) | Submit eKYC for type; ownership check |
| GET | `/api/admin/ekyc/:type` | admin | List eKYC docs (auth gate added) |

Deleted routes (now 404): `/api/setup-admin`, `/api/temp-seed`

---

## Models — final state

| Model | Status | Key notes |
|---|---|---|
| `LeadState` | NEW | 6-tier state machine (tier1→tier2→tier3→triage→routed/rejected); unique `anonymousToken` index |
| `MarketplaceLead` | NEW | Compound `{ status, expiresAt }` index; `soldToPartnerId` and `watchedBy` indexes |
| `ChatThread` | NEW | Unique compound index `{ marketplaceLeadId, partnerId }` |
| `ChatMessage` | NEW | Poll index `{ threadId, createdAt }` |
| `TriageDecision` | NEW | Audit log; `leadStateId` and `decidedAt` indexes |
| `AntiHoardingAlert` | NEW | `resolvedAt` index for unresolved query |
| `User` | MODIFIED | role enum: removed `"b2b"`, added `"partner"`, `"executive"`, `"scrapcentre"` |
| `Valuation` | MODIFIED | status enum + `leadStateId`, `qualityScore`, `triageDecisionId` fields |
| `SellVehicle` | MODIFIED | Same as Valuation |
| `ExchangeVehicle` | MODIFIED | Same as Valuation |
| `BuyVehicle` | MODIFIED | Same as Valuation |
| `B2BPartner` | UNCHANGED | Schema unchanged; password hashing enforced at API layer |
| `Setting` | UNCHANGED | Seeded via `scripts/seed-settings.ts` with `mockConfig` and `leadExpiryDays` |
| `B2BPickup`, `B2BRegistration`, `BulkOutsourcing`, `Contact`, `Executive`, `ScrapCentreUser`, `WhatsAppMessage` | UNCHANGED | Per §12 KEEP list |

---

## Open items / TODOs

All `TODO[backend-dev]:` comments in the code:

1. **`app/api/marketplace/leads/[id]/buy/route.ts` line `customerName: null`** — `TODO[backend-dev]: populate customerName from LeadState or Contact collection when contact data is available from the calc flow. Currently null because the tier2 flow only captures phone; name comes from the eKYC/contact form which may not exist yet.`

2. **`app/api/chat/threads/route.ts`** — `TODO[backend-dev]: refine "client" role thread listing once customer account model is aligned with LeadState.phone. Currently returns empty array for NextAuth client role — customers access threads via calcSessionToken which works correctly.`

3. **JWT library** — `jose` is used (bundled with next-auth v4). If the team upgrades to next-auth v5 or removes next-auth, `jose` must be added as an explicit dependency in `package.json`. No `npm install` was run per instructions. Confirm `jose` resolves at runtime; if not, add `jose@^4` to package.json.

4. **OTP store persistence** — `lib/services/otp-store.ts` uses an in-memory `Map`. Safe for the dummy (Proxmox LXC with `next start`, process-persistent). Breaks on Vercel serverless cold-starts. Production: replace with Redis CT 201 call.

5. **`triage_pending` status** — The `SellVehicle` created for marketplace routing is set to `status: "triage_pending"`. Ensure the existing admin `/admin/valuations/sell` page filters or labels this correctly. Full-stack Dev should handle the page-level display.

6. **eKYC `ekycStatus`** — Changed from auto-`"verified"` to `"pending"`. Any existing admin UI that filters on `ekycStatus === "verified"` now needs to be updated by Full-stack Dev to also show `"pending"` for new submissions.

7. **`scripts/hash-partner-passwords.ts`** — Must be run BEFORE deploying `lib/auth.ts` plaintext fallback removal. PM should coordinate this as a pre-deploy step per engineering-design.md §17.

---

## Verification done

- Confirmed `lib/auth.ts` no longer contains: `debug@test.com`, `debug123`, `otp !== "1234"`, `startsWith("$2")` plaintext ternary, `AUTH_ERROR: ${err.message}`, or the raw error throw.
- Confirmed `scratch/check-conn.js` deleted; `scripts/seed-now.ts` reads `process.env.MONGODB_URI`.
- Confirmed `app/api/setup-admin/` and `app/api/temp-seed/` directories still exist (Next.js creates the directory via the route registration) but the `route.ts` files are deleted — navigating to those paths will return 404.
- Confirmed `models/User.ts` enum updated to `["client","admin","partner","executive","scrapcentre"]`.
- Confirmed all 5 vehicle models have `triage_pending`, `rejected_by_triage`, `leadStateId`, `qualityScore`, `triageDecisionId`.
- Confirmed `app/api/b2b-partner/route.ts` has `getServerSession` gate on POST and GET, `bcrypt.hash(password, 12)`, and `.select("-password")`.
- Confirmed `app/api/b2b-register/route.ts` POST is public; GET/PATCH/DELETE are admin-gated.
- Confirmed `app/api/ekyc/route.ts` and `app/api/ekyc/[type]/route.ts` have session check, ownership check, and `ekycStatus: "pending"`.
- Confirmed `app/api/admin/ekyc/[type]/route.ts` has admin session gate.
- Confirmed all new routes use `requireRole()` or inline `getServerSession` checks.
- Confirmed `jose` used throughout (not `jsonwebtoken` which is not in package.json).
- Confirmed `getMockConfig()` has 10s TTL cache and `invalidateMockConfigCache()` is called by `POST /api/admin/mock-config`.
- Confirmed `transition()` in `lib/state-machine/lead.ts` validates guard conditions and throws on invalid transitions.
- Confirmed atomic `findOneAndUpdate({ _id, status: "active" })` in buy route for first-come-first-served locking.

---

## Hand-off notes for Full-stack Dev

### calcSession JWT
All tier2/tier3/verify/chat-customer routes require `Authorization: Bearer <calcSessionToken>`. The token is returned by `POST /api/otp/verify` and should be stored in `sessionStorage` (not localStorage). It expires in 1 hour.

### Cookie for anonymous token
`POST /api/calc/tier1` sets an `httpOnly` cookie `anonymousToken` (7-day TTL). The frontend does not need to manage this manually — the browser sends it automatically. The `leadStateId` is returned in the response body and should be stored in `sessionStorage` for step navigation.

### Mock OTP in staging
`POST /api/otp/issue` returns `{ _demoHint: "Demo mode — OTP is 000000" }` when `NEXT_PUBLIC_IS_STAGING=true`. FE should display this hint in a toast.

### Chat polling
Poll `GET /api/chat/threads/:threadId/messages?since=<ISO>` every 5 seconds. Pass the `createdAt` of the last received message as `since`. The endpoint returns only messages after that timestamp. The polling interval constant should be set in the component — easy to change when WebSockets come later.

### Lead purchase flow
`POST /api/marketplace/leads/:id/buy` returns `{ threadId, unlockedContact: { phone } }`. The `threadId` should be used immediately to navigate to the chat window. A 409 response means the lead was already purchased — show "Lead no longer available."

### Mock config admin page
`GET /api/admin/mock-config` returns `{ mode: "success"|"failure"|"random", services: { vahan, otp, digilocker, vision, maps } }`. `POST /api/admin/mock-config` accepts `{ mode?, services?: { serviceName: mode } }` — partial update is fine, omitted keys are preserved.

### Triage page data
`GET /api/triage/queue` returns an array with `leadStateId`, `vehicleInfo`, `qualityScore`, `verificationStatus`, `confidence`, `flags[]`, `photoUrls[]`, `rcUrl`, `aadhaarConsent`. Photo URLs are sharp (unblurred) for admin view. Blurred versions are only on `MarketplaceLead.photoUrlsBlurred`.

### eKYC status change
`ekycStatus` is now `"pending"` on submission (was auto-`"verified"`). Any page showing "Verified" badge based on `ekycStatus === "verified"` will now not show the badge until an admin/integration marks it. Adjust the eKYC status display logic.

### Partner routes require `role === "partner"` in session
Partner login uses the `b2b-credentials` NextAuth provider. After the password migration script runs, only bcrypt-hashed passwords work. Partners who existed with plaintext passwords need the migration to run before they can log in.
