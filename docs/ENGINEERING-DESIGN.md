# Engineering Design — ScrapCentre.com Dummy Implementation

This document is the engineering source of truth for the dummy implementation PR (`pranjal1337/RHSV` → `ScrapCentre/RHSV:main`). It translates the locked v1 product spec (`product-decisions.md`) into a concrete system design that the Novalytix implementation agents will execute against. The codebase is a Next.js 15 App Router monolith backed by MongoDB Atlas and Cloudinary; the dummy keeps that stack unchanged while adding the Spinny-style three-tier calculator, the human-in-the-loop triage queue, the partner marketplace mechanics, a polled chat module, and a mock-service adapter layer with an admin toggle. Every external integration — VAHAN, DigiLocker, MSG91 OTP, AI vision verification, DigiELV, Google Maps, dealer discounts — is mocked. Six CRITICAL security holes (leaked DB creds, public admin-creation endpoints, hardcoded debug login, hardcoded OTP `1234`, unauthed B2B partner creation, unauthed eKYC endpoint) are remediated in this same PR. This document is design-only; no source files are modified here.

---

## 1. Scope & Non-Goals

### In scope for this PR

- Three-tier calculator state machine (Anonymous → Tier1 → OTP → Tier2 → Docs → Tier3 → Triage → routed)
- Admin triage page (Auraiya / marketplace / reject decision)
- Marketplace mechanics: lead quality scoring (Bronze/Silver/Gold), blurred-photo masking, first-come-first-served locking, 2-week expiry timer, return-to-marketplace path, anti-hoarding alert storage
- Chat module: text + photos, polled (no WebSockets), contact-info unlock post-purchase
- Partner onboarding: public `/rvsf` signup form → pending B2BRegistration → admin approval flow (already partially exists; extend it)
- Mock-service adapter layer with admin-controlled toggle (success/failure/random mode)
- Auth cleanup: remove dangerous endpoints, fix `User.role` enum, hash B2B partner passwords, replace hardcoded OTP with MSG91 stub adapter
- Brand cleanup: domain references, footer data, CSS tokens
- New Mongoose models: `LeadState`, `MarketplaceLead`, `ChatThread`, `ChatMessage`, `TriageDecision`, `AntiHoardingAlert` (new), extend `Setting` for mock toggle
- Deployment shape: Proxmox LXC CT 210 + Cloudflare Tunnel to `scrapcentre.online`

### Deferred (not in this PR)

- Real MSG91 OTP integration (stub adapter ships; real adapter is wired in later)
- Real VAHAN API (mock only)
- Real DigiLocker / Aadhaar eKYC (mock only)
- Real AI vision verification pipeline (mock returns "verified" after 2-second delay)
- Real DigiELV integration (Plan B instruction flow, no API)
- Real WhatsApp BSP / WAHA keyword flow
- Green Finance / Green Insurance partner connections
- Dealer discount API
- ScrapCentre OS (separate product)
- PostgreSQL / MinIO / WAHA / Redis migration from current MongoDB Atlas / Cloudinary stack
- WebSocket-based live chat
- Scrapon migration tool
- Any changes to `BulkOutsourcing` flow (kept as-is)
- Hindi i18n (structure prepared; translations deferred)
- ScrapCentre OS codebase question (architect recommendation: same monorepo, behind `/os` route prefix; decision deferred to PM)

---

## 2. Architectural Overview

The system remains a single Next.js 15 App Router process. The PR introduces a new conceptual layer — the **mock-service adapter** — sitting between the API handlers and external integrations.

```
Browser (React 19 + Tailwind + Shadcn)
        |
        | HTTPS
        v
Next.js 15 App Router (one next start process)
  |
  +-- app/(public)/                   Public pages: landing, /rvsf signup, /quote
  |     |
  |     +-- Calculator Widget         3-step progressive reveal
  |           |
  |           v
  |     LeadState machine (§6)        Persisted in LeadState collection
  |
  +-- app/api/
  |     |
  |     +-- /api/calc/*               Tier 1/2/3 calculator endpoints
  |     +-- /api/otp/*                OTP issue/verify → MSG91 stub adapter
  |     +-- /api/verify/*             AI verification → vision LLM mock adapter
  |     +-- /api/leads/*              Lead lifecycle management
  |     +-- /api/marketplace/*        Partner-facing lead feed
  |     +-- /api/chat/*               Polled chat endpoints
  |     +-- /api/triage/*             Admin triage queue
  |     +-- /api/admin/*              Existing + new admin endpoints
  |     +-- /api/b2b/*                Existing partner endpoints
  |     +-- /api/mock/*               [OPTIONAL] standalone mock harness
  |
  +-- Mock-Service Adapter Layer (lib/services/mock/)
  |     |
  |     +-- MockToggle                Reads Setting.key = "mockConfig"
  |     +-- vahan.adapter.ts          → real VAHAN | mock VAHAN
  |     +-- otp.adapter.ts            → real MSG91 | mock OTP
  |     +-- digilocker.adapter.ts     → real DigiLocker | mock
  |     +-- vision.adapter.ts         → real Claude Vision | mock
  |     +-- maps.adapter.ts           → real Google Maps | mock
  |
  +-- lib/auth.ts (cleaned)
  +-- lib/db.ts (unchanged)
  +-- lib/cloudinary.ts (unchanged)
  |
  +-- models/                         14 existing + 6 new (§12)
        |
        v
  MongoDB Atlas (unchanged for dummy)
        |
        +-- Cloudinary (eKYC + vehicle photos, unchanged)
```

### How the 3-tier calculator threads through

```
Landing page (/)
  └─ CalcWidget (client component)
       └─ Step 0: reg number OR make/model/year entry
            └─ POST /api/calc/tier1   [anonymous, no auth]
                 └─ Mock VAHAN fills details
                 └─ Computes scrap range (±20%)
                 └─ Creates LeadState { tier: "tier1", anonymousToken: uuid }
                 └─ Returns: { scrapRange, blurredTiles: [CD, dealer, finance, insurance] }
                 └─ Client: shows half-result, blurred tiles, CTA "Unlock"

       └─ Step 1: mobile number entry
            └─ POST /api/otp/issue { phone }   → MSG91 stub
            └─ OTP entered
            └─ POST /api/otp/verify { phone, otp }
                 └─ On success: issues a short-lived JWT "calc-session" token
                 └─ PATCH /api/calc/tier2 { leadStateId, calcSessionToken }
                      └─ Attaches phone to LeadState, tier: "tier2"
                      └─ Returns: full calculation (CD range, dealer discount stub)

       └─ Step 2: document upload + Aadhaar consent
            └─ POST /api/verify/start { leadStateId }
                 └─ Client uploads photos → Cloudinary (existing lib)
                 └─ POST /api/verify/submit { leadStateId, photoUrls[], rcUrl, aadhaarConsent }
                      └─ Vision mock adapter: 2-sec delay, returns confidence score
                      └─ PATCH LeadState { tier: "tier3", verificationResult, qualityScore }
                      └─ POST /api/triage/queue { leadStateId }
                           └─ Creates TriageDecision { status: "pending" }
                           └─ Admin sees it in /admin/triage
```

### Where the triage queue sits

```
LeadState.tier === "tier3"
    └─ TriageDecision.status = "pending"
         └─ Admin page /admin/triage
              └─ Three buttons: Auraiya | Marketplace | Reject
                   └─ POST /api/triage/decide
                        └─ Auraiya: LeadState.routing = "auraiya", creates SellVehicle/Valuation doc as before
                        └─ Marketplace: LeadState.routing = "marketplace", creates MarketplaceLead
                        └─ Reject: LeadState.routing = "rejected"
```

---

## 3. Data Model Deltas

### 3.1 Modified models

#### `models/User.ts` — fix `role` enum

**Current** (`models/User.ts:31-34`):
```ts
role: {
  type: String,
  enum: ["client", "admin", "b2b"],
  default: "client",
}
```

**New:**
```ts
role: {
  type: String,
  enum: ["client", "admin", "partner", "executive", "scrapcentre"],
  default: "client",
}
```

Rationale: `"b2b"` is dead and was never emitted by auth. `"partner"`, `"executive"`, `"scrapcentre"` are the live session role strings. The User collection only ever holds `"client"` and `"admin"` in practice; the others live in their own collections — the enum is the documentation surface.

#### `models/Setting.ts` — no schema change; new keys seeded

The existing `key/value` schema is used as-is. The dummy seeds two new keys at startup (via a one-time idempotent seed script, not a public API endpoint):

| key | value | description |
|---|---|---|
| `mockConfig` | `{ mode: "success", services: { vahan: "success", otp: "success", digilocker: "success", vision: "success", maps: "success" } }` | Mock toggle state |
| `leadExpiryDays` | `14` | Lead marketplace expiry window |

#### `models/B2BPartner.ts` — no schema change; password hashing enforced in API layer

See §11. Schema unchanged; the creation endpoint is fixed.

#### `models/Valuation.ts`, `models/SellVehicle.ts`, `models/ExchangeVehicle.ts`, `models/BuyVehicle.ts`

Status enum extended on all four to include `"triage_pending"` and `"rejected_by_triage"`. Also add:
```ts
leadStateId: { type: String }  // back-ref to LeadState._id
qualityScore: { type: String, enum: ["bronze", "silver", "gold"] }
triageDecisionId: { type: String }  // back-ref to TriageDecision._id
```

### 3.2 New models (6 new collections)

#### `models/LeadState.ts` — the state-machine document

```ts
import mongoose, { Schema, Document } from "mongoose"

export interface ILeadState extends Document {
  anonymousToken: string          // UUID issued at Tier 1, stored in client cookie
  tier: "tier1" | "tier2" | "tier3" | "triage" | "routed" | "rejected"
  routing: "auraiya" | "marketplace" | "rejected" | null

  // Vehicle data (from VAHAN mock or manual entry)
  vehicleType: "2W" | "4W" | "truck" | null
  registrationNumber: string | null
  brand: string | null
  model: string | null
  year: string | null
  state: string | null
  estimatedWeightKg: number | null

  // Tier 1 outputs
  scrapValueMin: number | null
  scrapValueMax: number | null
  pickupCost: number | null

  // Tier 2 (phone verified)
  phone: string | null
  phoneVerifiedAt: Date | null
  cdValueMin: number | null
  cdValueMax: number | null

  // Tier 3 (document verification)
  photoUrls: string[]            // Cloudinary URLs
  rcUrl: string | null
  aadhaarConsent: boolean
  verificationStatus: "pending" | "verified" | "flagged" | "rejected"
  verificationConfidence: number | null   // 0-100, from mock
  verificationFlags: string[]             // e.g. ["aadhaar_mismatch"]
  qualityScore: "bronze" | "silver" | "gold" | null

  // Triage link
  triageDecisionId: string | null

  // Downstream lead link
  downstreamLeadId: string | null       // _id of Valuation/SellVehicle created post-triage
  downstreamLeadType: string | null     // "valuation" | "sell"

  // Expiry
  expiresAt: Date | null

  createdAt: Date
  updatedAt: Date
}

const LeadStateSchema = new Schema<ILeadState>({
  anonymousToken:     { type: String, required: true, unique: true, index: true },
  tier:               { type: String, enum: ["tier1","tier2","tier3","triage","routed","rejected"], default: "tier1" },
  routing:            { type: String, enum: ["auraiya","marketplace","rejected",null], default: null },

  vehicleType:        { type: String, enum: ["2W","4W","truck",null], default: null },
  registrationNumber: { type: String },
  brand:              { type: String },
  model:              { type: String },
  year:               { type: String },
  state:              { type: String },
  estimatedWeightKg:  { type: Number },

  scrapValueMin:      { type: Number },
  scrapValueMax:      { type: Number },
  pickupCost:         { type: Number },

  phone:              { type: String, index: true },
  phoneVerifiedAt:    { type: Date },
  cdValueMin:         { type: Number },
  cdValueMax:         { type: Number },

  photoUrls:          [{ type: String }],
  rcUrl:              { type: String },
  aadhaarConsent:     { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ["pending","verified","flagged","rejected"], default: "pending" },
  verificationConfidence: { type: Number },
  verificationFlags:  [{ type: String }],
  qualityScore:       { type: String, enum: ["bronze","silver","gold",null], default: null },

  triageDecisionId:   { type: String },
  downstreamLeadId:   { type: String },
  downstreamLeadType: { type: String },

  expiresAt:          { type: Date },
}, { timestamps: true, collection: "lead_states" })

const LeadState = mongoose.models.LeadState || mongoose.model<ILeadState>("LeadState", LeadStateSchema)
export default LeadState
```

#### `models/MarketplaceLead.ts` — partner-facing lead record

```ts
interface IMarketplaceLead extends Document {
  leadStateId: string             // → LeadState._id
  downstreamLeadId: string        // → Valuation or SellVehicle _id
  downstreamLeadType: string      // "valuation" | "sell"

  // Visible to partners pre-purchase (masked set)
  vehicleType: "2W" | "4W" | "truck"
  brand: string
  model: string
  year: string
  cityMasked: string              // e.g. "Kanpur, UP" (no exact address)
  pincodeMasked: string           // first 3 digits only e.g. "208***"
  estimatedWeightKg: number
  qualityScore: "bronze" | "silver" | "gold"
  photoUrlsBlurred: string[]      // Cloudinary transformation URLs (blur applied)
  aadhaarVerified: boolean
  isRelisted: boolean             // true if previously bought and returned
  relist_count: number

  // Computed pricing for partners
  leadPriceInr: number            // = estimatedWeightKg * (vehicleType === "2W" ? 0.75 : 1.0)

  // Marketplace state
  status: "active" | "sold" | "expired" | "rejected" | "in_revival"
  soldToPartnerId: string | null
  soldAt: Date | null
  expiresAt: Date

  // Watchers (watch/favourite)
  watchedBy: string[]             // array of B2BPartner.userId

  createdAt: Date
  updatedAt: Date
}
```

Index: `{ status: 1, expiresAt: 1 }` for the partner marketplace feed. `{ soldToPartnerId: 1 }` for partner history.

#### `models/ChatThread.ts` — one thread per lead-partner pair

```ts
interface IChatThread extends Document {
  marketplaceLeadId: string       // → MarketplaceLead._id
  leadStateId: string             // → LeadState._id
  partnerId: string               // → B2BPartner.userId
  customerPhone: string | null    // null until purchase; unlocked on purchase
  customerName: string | null

  status: "active" | "closed"
  lastMessageAt: Date | null
  createdAt: Date
  updatedAt: Date
}
```

Index: `{ marketplaceLeadId: 1, partnerId: 1 }` unique — one thread per pair.

#### `models/ChatMessage.ts` — individual messages

```ts
interface IChatMessage extends Document {
  threadId: string                // → ChatThread._id
  senderRole: "customer" | "partner"
  senderId: string                // customer phone or partner userId
  messageType: "text" | "photo"
  textContent: string | null
  photoUrl: string | null         // Cloudinary URL
  readAt: Date | null
  createdAt: Date
  updatedAt: Date
}
```

Index: `{ threadId: 1, createdAt: 1 }` — for polling feed.

#### `models/TriageDecision.ts` — audit log of triage actions

```ts
interface ITriageDecision extends Document {
  leadStateId: string             // → LeadState._id
  decidedBy: string               // admin user email
  decision: "auraiya" | "marketplace" | "rejected"
  notes: string | null
  decidedAt: Date
  aiVerificationFlags: string[]   // surfaced from LeadState for convenience
  createdAt: Date
  updatedAt: Date
}
```

#### `models/AntiHoardingAlert.ts` — soft alerting (no enforcement)

```ts
interface IAntiHoardingAlert extends Document {
  marketplaceLeadId: string       // lead that was not acted on
  partnerId: string               // the RVSF that should have bought it
  partnerName: string
  partnerCity: string
  alertType: "nearby_lead_ignored"    // expandable enum
  alertedAt: Date
  resolvedAt: Date | null         // set when team manually follows up
  resolutionNote: string | null
  createdAt: Date
  updatedAt: Date
}
```

This collection is purely for the admin ops page listing alerts. No automated enforcement. The n8n trigger for outbound WhatsApp/SMS to the RVSF team is deferred; for the dummy, the admin page simply lists unresolved alerts.

---

## 4. API Surface

### 4.1 Real / Production Endpoints

These endpoints will eventually call live integrations. In the dummy they call the mock adapters.

| Method | Path | Auth | Request | Response | Notes |
|---|---|---|---|---|---|
| POST | `/api/calc/tier1` | None | `{ regNumber? }` OR `{ brand, model, year, state }` | `{ leadStateId, anonymousToken, scrapMin, scrapMax, pickupCost, blurredTiles }` | Creates LeadState tier1. anonymousToken returned and stored in cookie. |
| POST | `/api/otp/issue` | None | `{ phone }` | `{ success, expiresIn }` | Rate-limited: 3 per phone per 10 min |
| POST | `/api/otp/verify` | None | `{ phone, otp, leadStateId }` | `{ calcSessionToken, tier2Data }` | On success: issues signed 1-hour JWT calc-session, patches LeadState to tier2, returns full calc |
| PATCH | `/api/calc/tier2` | calcSession JWT | `{ leadStateId }` | `{ cdMin, cdMax, dealerDiscount, financeComingSoon, insuranceComingSoon, totalBenefitMin, totalBenefitMax }` | |
| POST | `/api/verify/start` | calcSession JWT | `{ leadStateId }` | `{ uploadToken }` | Initiates doc collection |
| POST | `/api/verify/submit` | calcSession JWT | multipart: `{ leadStateId, photos[], rcFile, aadhaarConsent }` | `{ verificationStatus, confidence, flags, qualityScore }` | Calls vision adapter; sets LeadState tier3; queues triage |
| GET | `/api/triage/queue` | admin | — | `[{ leadStateId, vehicleInfo, qualityScore, flags, createdAt }]` | Admin triage feed |
| POST | `/api/triage/decide` | admin | `{ leadStateId, decision, notes? }` | `{ success, routing }` | Creates TriageDecision; routes lead |
| GET | `/api/marketplace/leads` | partner | `?page&limit&vehicleType&city` | `[MarketplaceLead (masked)]` | Only active, non-expired |
| GET | `/api/marketplace/leads/:id` | partner | — | `MarketplaceLead + distanceKm` | |
| POST | `/api/marketplace/leads/:id/buy` | partner | — | `{ success, threadId, unlockedContact }` | Locks lead atomically (findOneAndUpdate status: sold); creates ChatThread |
| POST | `/api/marketplace/leads/:id/watch` | partner | — | `{ success }` | Adds partner to watchedBy |
| GET | `/api/chat/threads` | partner OR client | — | `[ChatThread]` | Partners see their threads; clients see threads for their lead |
| GET | `/api/chat/threads/:threadId/messages` | partner OR client | `?since=ISO_DATE` | `[ChatMessage]` | Polled every 5s |
| POST | `/api/chat/threads/:threadId/messages` | partner OR client | `{ type, textContent? }` OR multipart `{ type: "photo", file }` | `{ message }` | |
| GET | `/api/admin/triage/alerts` | admin | — | `[AntiHoardingAlert]` | Lists unresolved alerts |
| PATCH | `/api/admin/triage/alerts/:id` | admin | `{ resolutionNote }` | `{ success }` | Mark resolved |
| GET | `/api/admin/mock-config` | admin | — | `{ mode, services }` | Returns current mock toggle state |
| POST | `/api/admin/mock-config` | admin | `{ mode, services? }` | `{ success }` | Updates Setting key "mockConfig" |

All protected endpoints return `401` when unauthenticated, `403` when wrong role.

**`calcSession` JWT:** A short-lived (1 hour) HS256 JWT signed with `NEXTAUTH_SECRET + ":calc"`. Payload: `{ phone, leadStateId, iat, exp }`. Passed as `Authorization: Bearer <token>` header. Does not touch NextAuth session — it is separate because the customer has verified their phone but may not have a full account yet.

### 4.2 Mock Endpoints (`lib/services/mock/` adapter pattern)

**Chosen pattern: `lib/services/mock/` adapter, not `/api/mock/*` standalone routes.**

Rationale: a separate `/api/mock/*` namespace would expose mocking endpoints to any caller. The adapter pattern keeps all mock logic server-side, invisible to the browser, and toggled by the Setting record rather than by which URL is called. This is cleaner for security and makes the swap from mock to real transparent at the call site.

Each adapter exports a function that matches the real integration's interface:

```ts
// lib/services/mock/vahan.adapter.ts
export async function lookupVehicle(regNumber: string): Promise<VahanResult> {
  const config = await getMockConfig()
  const mode = config.services.vahan ?? config.mode
  await simulateDelay(mode)          // 200ms success, 50ms failure, random 0-500ms random
  if (mode === "failure") throw new MockServiceError("VAHAN_UNAVAILABLE")
  if (mode === "random" && Math.random() < 0.2) throw new MockServiceError("VAHAN_UNAVAILABLE")
  // Return deterministic fixture based on regNumber hash
  return generateVahanFixture(regNumber)
}
```

| Adapter file | What it simulates | Success default behaviour | Failure behaviour |
|---|---|---|---|
| `vahan.adapter.ts` | VAHAN vehicle data lookup | Returns fixture: brand/model/year/state from reg prefix heuristic | Throws "VAHAN_UNAVAILABLE" — caller falls back to manual entry |
| `otp.adapter.ts` | MSG91 OTP send + verify | Always accepts OTP `000000` in mock mode (not `1234` — see §11) | Throws "OTP_SEND_FAILED" |
| `digilocker.adapter.ts` | DigiLocker Aadhaar XML pull | Returns synthetic Aadhaar data matching phone | Throws "DIGILOCKER_UNAVAILABLE" |
| `vision.adapter.ts` | Claude Vision photo analysis | 2-second delay, returns `{ verified: true, confidence: 87, flags: [] }` | Returns `{ verified: false, confidence: 23, flags: ["photo_tampered"] }` |
| `maps.adapter.ts` | Google Maps Distance Matrix | Returns deterministic distance based on pincode math | Returns `{ distance: 0, cost: 0 }` (free pickup) |

### 4.3 Endpoints to DELETE in this PR

| File path (relative to `RHSV-work/`) | Reason |
|---|---|
| `app/api/setup-admin/route.ts` | CRITICAL: public admin creation with hardcoded credentials |
| `app/api/temp-seed/route.ts` | CRITICAL: public admin creation |

**Do not gate behind NODE_ENV — delete entirely.** The `scripts/seed-admin.ts` CLI script (already exists, runs with `ts-node`) is the replacement for one-time admin bootstrapping.

### 4.4 Endpoints to MODIFY (auth gates added, dangerous bypasses removed)

| File | Change |
|---|---|
| `lib/auth.ts:27-30` | DELETE the debug bypass block entirely |
| `lib/auth.ts:169` | REPLACE hardcoded `"1234"` with MSG91 stub adapter call |
| `lib/auth.ts:67-73` | REMOVE plaintext-password fallback; bcrypt-only after migration |
| `app/api/b2b-partner/route.ts` | Add admin session gate to POST and GET; hash password before create |
| `app/api/b2b-register/route.ts:56-190` | Add admin session gate to GET, PATCH, DELETE |
| `app/api/ekyc/route.ts` | Add session check + ownership check (`findOne({ _id, userId })`) |
| `app/api/ekyc/[type]/route.ts` | Same |
| `app/api/admin/ekyc/[type]/route.ts` | Add missing admin session check |
| `scratch/check-conn.js` | DELETE (leaked prod MongoDB URI) |
| `scripts/seed-now.ts` | REWRITE to use `process.env.MONGODB_URI` instead of hardcoded URI |

---

## 5. The Mock-Service Adapter Layer

### Toggle design

The mock toggle state lives in the `Setting` collection under key `mockConfig`. This reuses the existing key/value store — no new model needed.

```json
// Setting document for key="mockConfig"
{
  "key": "mockConfig",
  "value": {
    "mode": "success",
    "services": {
      "vahan":      "success",
      "otp":        "success",
      "digilocker": "success",
      "vision":     "success",
      "maps":       "success"
    }
  },
  "description": "Mock service toggle. Per-service overrides take precedence over global mode."
}
```

Mode values:
- `"success"` — always returns a happy-path fixture
- `"failure"` — always throws the error a failed integration would throw (caller must handle gracefully)
- `"random"` — 80% success / 20% failure, random delay 0–500ms (tests resilience)

The global `mode` is the fallback for any service key not explicitly set. Per-service keys override the global. So you can set `mode: "success"` globally but `vision: "failure"` to test just the AI path.

### `getMockConfig()` helper

```ts
// lib/services/mock/config.ts
import Setting from "@/models/Setting"
import connectToDatabase from "@/lib/db"

const DEFAULT_CONFIG = { mode: "success", services: {} }

export async function getMockConfig(): Promise<MockConfig> {
  await connectToDatabase()
  const doc = await Setting.findOne({ key: "mockConfig" }).lean()
  return (doc?.value as MockConfig) ?? DEFAULT_CONFIG
}
```

Cached with a 10-second TTL using a module-level variable — no Redis needed for the dummy. Pattern: `if (cache.ts && Date.now() - cache.ts < 10000) return cache.value`.

### Admin toggle UI

Route: `/admin/mock-config` (new page, admin-only).

UI: A simple settings card with a global mode selector (radio: success/failure/random) and per-service overrides (select per service). Save POSTs to `POST /api/admin/mock-config`. No confirmation required — this is a dev/staging-only page.

### Dev banner

When `NEXT_PUBLIC_IS_STAGING=true` (set in LXC env), a red sticky banner renders at the top of every page:

```tsx
// components/MockModeBanner.tsx (new)
// Render only when NEXT_PUBLIC_IS_STAGING === "true"
// Text: "⚠ Staging — all integrations are mocked"
// Color: brand-red #D92027, white text, z-index 9999
```

The banner is injected in `app/layout.tsx` conditionally. It is absent in production (`NEXT_PUBLIC_IS_STAGING` not set or `"false"`).

### How does the front-end know it's in mock mode?

It doesn't need to — from the browser's perspective, all API calls succeed or fail identically. The banner is the only signal. The mock adapter is entirely server-side.

---

## 6. The 3-Tier Calculator State Machine

### States

```
Anonymous ──[POST /api/calc/tier1]──► Tier1Estimate
                                           │
                              [POST /api/otp/issue + /otp/verify]
                                           │
                                           ▼
                                    Tier2VerifiedQuote
                                           │
                              [POST /api/verify/submit]
                                           │
                                           ▼
                                    Tier3QualityLead
                                           │
                                      [auto-queue]
                                           │
                                           ▼
                                         Triage ─────────────────┐
                                           │                     │
                                    [triage/decide]         [reject]
                                           │                     │
                         ┌─────────────────┘                     ▼
                         │                               Routing = "rejected"
                    [decision]
                    /         \
             Auraiya          Marketplace
         (creates SellVehicle  (creates MarketplaceLead
          / Valuation doc)      doc, enters partner feed)
```

### Persisted state: DB vs. cookie vs. URL

| Data | Where stored | Why |
|---|---|---|
| `leadStateId` | LeadState._id in MongoDB | Authoritative, survives tab close |
| `anonymousToken` | httpOnly cookie (7-day TTL) | Survives page reload, safe from XSS |
| Tier 1 calc output | LeadState fields in DB | Avoids re-fetch on refresh |
| `calcSessionToken` | sessionStorage only | Short-lived (1 hour), cleared on close |
| Photo uploads | Cloudinary + LeadState.photoUrls | Authoritative |
| Current wizard step | URL `?step=1/2/3` | Shareable, bookmarkable |

No `localStorage` for the new calc flow. (Existing eKYC localStorage keys remain for now — they are used by existing forms not being rewritten in this PR.)

### State-machine module — pseudocode

```ts
// lib/state-machine/lead.ts

export type LeadTier = "tier1" | "tier2" | "tier3" | "triage" | "routed" | "rejected"

interface Transition {
  from: LeadTier | LeadTier[]
  to: LeadTier
  guard?: (lead: ILeadState) => boolean
}

const TRANSITIONS: Transition[] = [
  { from: "tier1",   to: "tier2",   guard: (l) => !!l.phone && !!l.phoneVerifiedAt },
  { from: "tier2",   to: "tier3",   guard: (l) => l.photoUrls.length >= 1 && l.aadhaarConsent },
  { from: "tier3",   to: "triage",  guard: (l) => l.verificationStatus !== "pending" },
  { from: "triage",  to: "routed",  guard: (l) => !!l.routing && l.routing !== "rejected" },
  { from: "triage",  to: "rejected" },
]

export async function transition(leadId: string, to: LeadTier, updates: Partial<ILeadState>) {
  const lead = await LeadState.findById(leadId)
  if (!lead) throw new Error("LeadState not found")
  const allowed = TRANSITIONS.find(t =>
    (Array.isArray(t.from) ? t.from.includes(lead.tier) : t.from === lead.tier) &&
    t.to === to &&
    (!t.guard || t.guard({ ...lead.toObject(), ...updates } as ILeadState))
  )
  if (!allowed) throw new Error(`Invalid transition ${lead.tier} → ${to}`)
  await LeadState.findByIdAndUpdate(leadId, { tier: to, ...updates })
}
```

All API handlers call `transition()` — they never write `tier` directly. This enforces the state machine at the service layer.

---

## 7. AI Verification Pipeline Architecture

### Intended production pipeline (design for dummy, implemented as mock)

```
Input: photos[] + RC photo + aadhaar consent flag
          │
          ▼
Step 1: OCR pass (Tesseract / Google Document AI)
    - Extract RC fields: reg number, owner name, chassis no, engine no, make/model/year
    - Extract Aadhaar fields: name, DOB, masked UID (from DigiLocker XML)
          │
          ▼
Step 2: VAHAN cross-check (spot-check, not full fetch)
    - Submit reg number → VAHAN API
    - Validate: reg number matches RC OCR result, ownership not suspended
    - Flag if mismatch: verificationFlags += "vahan_mismatch"
          │
          ▼
Step 3: DigiLocker Aadhaar pull (offline KYC XML)
    - Customer has given aadhaarConsent = true
    - Pull Aadhaar XML → extract name, DOB, address
    - Cross-check name against RC owner name (fuzzy match threshold 0.8)
    - Flag if mismatch: verificationFlags += "aadhaar_rc_name_mismatch"
    - If Aadhaar ≠ RC name: set flag "ownership_proof_needed" (do not reject)
          │
          ▼
Step 4: Vision LLM check (Claude Vision / Gemini Vision)
    - Input: vehicle photos[]
    - Checks: (a) photo not tampered/AI-generated, (b) vehicle type matches claimed type,
              (c) condition description plausible, (d) no RC/Aadhaar data visible in photo
    - Returns: { verified: bool, confidence: 0-100, flags: string[] }
          │
          ▼
Step 5: Aggregate result
    - If all steps pass with zero flags: verificationStatus = "verified", qualityScore derived
    - If flagged items: verificationStatus = "flagged" → goes to triage for human review
    - If critical failure (e.g., step 1 returns no readable RC): verificationStatus = "rejected" → triage
```

### Quality score derivation

```
Gold:   phoneVerified + aadhaarVerified + photosVerified + confidence >= 80 + zero flags
Silver: phoneVerified + aadhaarVerified + (photosVerified OR confidence >= 60)
Bronze: phoneVerified + VAHAN lookup success (minimum bar for marketplace listing)
```

### Sequential vs. parallel

Steps 1+2 run sequentially (OCR must complete before VAHAN cross-check). Steps 3+4 can run in parallel with `Promise.all`. Step 5 waits for all. In the dummy, the entire pipeline is replaced by the vision mock adapter:

```ts
// lib/services/mock/vision.adapter.ts
export async function runVerificationPipeline(input: VerifyInput): Promise<VerificationResult> {
  const config = await getMockConfig()
  const mode = config.services.vision ?? config.mode
  await new Promise(r => setTimeout(r, 2000))   // 2-second realistic delay
  if (mode === "failure") {
    return { status: "flagged", confidence: 23, flags: ["photo_tampered"], qualityScore: "bronze" }
  }
  // random mode: 20% flagged
  if (mode === "random" && Math.random() < 0.2) {
    return { status: "flagged", confidence: 45, flags: ["vahan_mismatch"], qualityScore: "silver" }
  }
  return { status: "verified", confidence: 87, flags: [], qualityScore: deriveQuality(input) }
}

function deriveQuality(input: VerifyInput): "bronze" | "silver" | "gold" {
  if (input.photoUrls.length >= 3 && input.rcUrl && input.aadhaarConsent) return "gold"
  if (input.photoUrls.length >= 1 && input.aadhaarConsent) return "silver"
  return "bronze"
}
```

### Human review hand-off at triage

The `TriageDecision` page (`/admin/triage`) surfaces:
- Vehicle info (type, make, model, year, estimated weight)
- Quality score badge (Bronze/Silver/Gold)
- All verification flags as colour-coded chips (orange for warnings, red for failures)
- Blurred photo thumbnails (click to full-res — admin only, no blur for admin)
- RC document viewer (Cloudinary URL)
- Aadhaar consent status

The admin makes one of three decisions. The flags do not auto-decide — no routing automation in v1, per product spec §4.

---

## 8. Marketplace Mechanics

### Lead state model

```
MarketplaceLead.status transitions:

"active"
  └─ partner clicks Buy → findOneAndUpdate($set: { status: "sold", soldToPartnerId })
       └─ "sold"
            ├─ lead matures (partner marks car_scrapped) → final state "sold" (retained)
            └─ lead does not mature → partner reports non-maturity
                 └─ PATCH /api/marketplace/leads/:id/return
                      └─ status: "active", isRelisted: true, relist_count++, new expiresAt
                           └─ if all attempts exhausted (relist_count >= 2): status: "in_revival"

"active" → 2 weeks pass without purchase
  └─ background job (cron or on-demand check at admin page load): status: "expired"
       └─ Admin can trigger revival: status: "active", isRelisted: true, new expiresAt

"active" → triage rejects → never enters marketplace, remains in LeadState.routing = "rejected"
```

### Atomic locking on purchase

```ts
// app/api/marketplace/leads/[id]/buy/route.ts
const locked = await MarketplaceLead.findOneAndUpdate(
  { _id: id, status: "active" },         // only if still active
  { $set: { status: "sold", soldToPartnerId: partnerId, soldAt: new Date() } },
  { new: true }
)
if (!locked) return NextResponse.json({ error: "Lead already sold" }, { status: 409 })
// Then create ChatThread, update downstream lead doc
```

One MongoDB operation — no two-step race condition. If two partners click simultaneously, one gets the document and the other gets null (409 Conflict).

### Information masking

| Field | Pre-purchase | Post-purchase |
|---|---|---|
| vehicleType, brand, model, year, weight class | Visible | Visible |
| cityMasked ("Kanpur, UP") | Visible | Visible |
| pincodeMasked ("208***") | Visible | Full pincode visible |
| qualityScore badge | Visible | Visible |
| aadhaarVerified badge | Visible | Visible |
| photoUrlsBlurred | Blurred via Cloudinary transformation | Sharp original URLs |
| customerName, phone, exact address | Hidden | Visible in ChatThread |
| RC number | Hidden | Visible |
| isRelisted + relist_count | Visible ("Previously offered") | Visible |

Cloudinary blur transformation: `f_auto,q_auto,e_blur:800,w_400`. Applied at query time by replacing the base URL with the transformation URL in the MarketplaceLead document before sending to the partner. The original sharp URLs are never sent pre-purchase.

### Lead pricing

```ts
function computeLeadPrice(vehicleType: "2W" | "4W" | "truck", weightKg: number): number {
  const rate = vehicleType === "2W" ? 0.75 : 1.0   // ₹/kg
  return Math.round(weightKg * rate)
}
```

Stored on `MarketplaceLead.leadPriceInr` at creation time. Not recalculated on view.

### 2-week expiry timer

```ts
// On MarketplaceLead creation:
expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
```

Expiry is checked lazily: at `GET /api/marketplace/leads`, the query includes `{ status: "active", expiresAt: { $gt: new Date() } }`. Expired documents remain in the DB with status `"active"` until a lightweight background sweep marks them `"expired"`. The sweep runs:
- When admin loads `/admin/triage` or `/admin/marketplace` (on-demand, no daemon needed for dummy)
- Via a `GET /api/admin/maintenance/expire-leads` endpoint (admin-only, safe to call repeatedly)

### Anti-hoarding alerts

For the dummy, alerting is triggered manually (or by a future n8n webhook):

```ts
// POST /api/admin/triage/alerts  (admin-only, or n8n webhook)
// Body: { marketplaceLeadId, partnerId, alertType }
// Creates AntiHoardingAlert doc
// Admin page: /admin/ops/alerts — lists AntiHoardingAlert where resolvedAt === null
```

The admin ops page (`/admin/ops/alerts`) lists all unresolved alerts with the partner name, city, lead info, and days since alert. Admin can mark resolved with a note. No automated messaging in the dummy.

### Watch / favourite

```ts
// POST /api/marketplace/leads/:id/watch
// Toggles: $addToSet or $pull on watchedBy array
// Front-end shows "watching" badge; no other effect in v1
```

---

## 9. Chat Module

### Architecture

Polled (no WebSockets). Client polls `GET /api/chat/threads/:threadId/messages?since=<ISO>` every 5 seconds. `since` is the `createdAt` of the last known message. Server returns only messages created after that timestamp.

No long-polling, no SSE — this is explicitly a dummy simplification. The polling interval is set in a component-level constant so it can be changed in one line when WebSockets are added later.

### Message storage

See `ChatThread` and `ChatMessage` models in §3. One thread per (MarketplaceLead × partner) pair. The thread is created by `POST /api/marketplace/leads/:id/buy` when the partner purchases the lead.

### Contact info unlock

```ts
// ChatThread.customerPhone and .customerName are set to null at creation
// After purchase:
await ChatThread.findOneAndUpdate(
  { _id: threadId },
  { customerPhone: leadState.phone, customerName: lead.contact?.name ?? null }
)
```

When the partner fetches their thread, `customerPhone` is returned in the response — they can call or WhatsApp directly. No masking post-purchase (per product decision §5).

### Customer-facing chat

Customers access their chat via `/chat/:threadId?token=<calcSessionToken>`. The `calcSessionToken` identifies them. The endpoint validates the token and confirms `ChatThread.leadStateId` matches the token's `leadStateId`. This avoids requiring the customer to create a full account just to chat.

Partner-facing chat is at `/b2b/chat/:threadId`, gated by `role === "partner"`.

### Photo sharing

Customer or partner sends photo: POST to `POST /api/chat/threads/:threadId/messages` as multipart. Server uploads to Cloudinary under `scrapcentre/chat/<threadId>/<timestamp>`. Returns the ChatMessage with `photoUrl`. The other party sees it on next poll.

---

## 10. Admin Triage Page

### Route: `/admin/triage`

**Data fetched (server component, RSC):**
```ts
// On page load, two parallel queries:
const [pending, resolved] = await Promise.all([
  TriageDecision.find({ status: "pending" }).sort({ createdAt: 1 }).limit(50).lean(),
  TriageDecision.find({ status: { $ne: "pending" } }).sort({ decidedAt: -1 }).limit(20).lean(),
])
// Hydrate each with its LeadState for display
const leadStates = await LeadState.find({
  _id: { $in: pending.map(t => t.leadStateId) }
}).lean()
```

### Three actions

Each card in the triage queue shows:

1. Vehicle summary (type, brand/model/year, estimated weight, quality badge)
2. Verification result (confidence %, flags as chips)
3. Photo grid (unblurred for admin)
4. Action buttons: **[Approve — Auraiya]** | **[Approve — Marketplace]** | **[Reject]**

All three buttons POST to `POST /api/triage/decide`:

```json
{
  "leadStateId": "...",
  "decision": "auraiya" | "marketplace" | "rejected",
  "notes": "optional text"
}
```

**Handler logic:**

```ts
// app/api/triage/decide/route.ts
const leadState = await LeadState.findById(leadStateId)
await transition(leadStateId, "routed", { routing: decision })

// Create TriageDecision audit record
await TriageDecision.create({
  leadStateId, decidedBy: session.user.email, decision, notes,
  decidedAt: new Date(), aiVerificationFlags: leadState.verificationFlags
})

if (decision === "auraiya") {
  // Create SellVehicle doc (mirrors existing Tier 3 → Sell flow)
  const sv = await SellVehicle.create({ ...vehicleDataFromLeadState, status: "approved", leadStateId, qualityScore })
  await LeadState.findByIdAndUpdate(leadStateId, {
    downstreamLeadId: sv._id.toString(), downstreamLeadType: "sell"
  })
}

if (decision === "marketplace") {
  const ml = await MarketplaceLead.create({ ...maskedDataFromLeadState, status: "active", expiresAt: ... })
  await LeadState.findByIdAndUpdate(leadStateId, {
    downstreamLeadId: ml._id.toString(), downstreamLeadType: "marketplace"
  })
}
// "rejected": no downstream doc created
```

### Audit log

The `TriageDecision` collection is the complete audit log. The admin page `/admin/triage/history` shows all resolved decisions with: lead summary, who decided, when, what decision, and any notes. This is read-only; no editing of past decisions.

### State transitions driven by triage

```
LeadState.tier: "tier3" → "triage" (auto on verify/submit)
TriageDecision.status: created as "pending"

Admin decides:
  LeadState.tier: "triage" → "routed" (routing = "auraiya"|"marketplace")
  OR
  LeadState.tier: "triage" → "rejected" (routing = "rejected")
  TriageDecision.status: "pending" → (inline on create, no separate update needed — TriageDecision is created once with final decision)
```

---

## 11. Auth + Roles Cleanup

### Remove dangerous endpoints

| Action | File |
|---|---|
| `git rm app/api/setup-admin/route.ts` | Delete entirely |
| `git rm app/api/temp-seed/route.ts` | Delete entirely |
| `git rm scratch/check-conn.js` | Delete entirely |

### Fix `lib/auth.ts` — before/after

**Before (`lib/auth.ts:27-30`):**
```ts
// 1. DEBUG BYPASS
if (credentials.email === "debug@test.com" && credentials.password === "debug123") {
    console.log("[Auth] DEBUG LOGIN SUCCESS");
    return { id: "debug-id", name: "Debug User", email: "debug@test.com", role: "admin" }
}
```

**After:** Delete lines 26-30 entirely. No conditional, no NODE_ENV check. The bypass is gone unconditionally.

**Before (`lib/auth.ts:169` — phone OTP provider):**
```ts
if (credentials.otp !== "1234") return null
```

**After:**
```ts
// Call MSG91 stub adapter
const valid = await verifyOtp(credentials.phone, credentials.otp)
if (!valid) return null
```

Where `verifyOtp` is the mock adapter — reads `getMockConfig()`, in success mode validates against a server-side stored OTP (see `OtpRecord` below). In mock mode, accepts `000000` (not `1234` — different value so the old bypass doesn't work). The mock OTP is `000000` and this is documented only in internal developer docs, never shown to end users.

**OTP storage for dummy:** A simple in-memory Map in the OTP adapter (sufficient for the dummy; Redis CT 201 in production):

```ts
// lib/services/otp-store.ts
const store = new Map<string, { otp: string; expiresAt: number }>()
export function storeOtp(phone: string, otp: string) {
  store.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 })  // 10 min TTL
}
export function verifyOtp(phone: string, provided: string): boolean {
  const entry = store.get(phone)
  if (!entry || Date.now() > entry.expiresAt) return false
  const valid = entry.otp === provided
  if (valid) store.delete(phone)  // single-use
  return valid
}
```

In mock success mode, `issueOtp` stores `"000000"`. In mock random mode, it stores a genuine random 6-digit string (but the dummy email/SMS never actually sends, so testers use `000000`).

**Before (`lib/auth.ts:67-73` — universal credentials, partner login):**
```ts
const isHashed = storedPw?.startsWith("$2")
const isMatch = isHashed ? await bcrypt.compare(password, storedPw) : storedPw === password
```

**After:**
```ts
if (!partner.password) return null
const isMatch = await bcrypt.compare(password, partner.password)
```

Precondition: a one-shot migration script (see §17) re-hashes all `B2BPartner.password` fields before this change lands.

**Before (`app/api/b2b-partner/route.ts:33`):**
```ts
password, // NOTE: In a real app, hash this password with bcrypt!
```

**After:**
```ts
password: await bcrypt.hash(body.password, 12),
```

Also add at the top:
```ts
const session = await getServerSession(authOptions)
if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
}
```

### `User.role` enum update

See §3.1. Change `["client","admin","b2b"]` → `["client","admin","partner","executive","scrapcentre"]`.

### B2B partner password migration script

```ts
// scripts/hash-partner-passwords.ts
// Run ONCE before deploying the auth.ts plaintext-fallback removal
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const URI = process.env.MONGODB_URI!
await mongoose.connect(URI)
const docs = await mongoose.connection.collection("b2bpartner").find().toArray()
for (const doc of docs) {
  if (!doc.password.startsWith("$2")) {
    const hashed = await bcrypt.hash(doc.password, 12)
    await mongoose.connection.collection("b2bpartner")
      .updateOne({ _id: doc._id }, { $set: { password: hashed } })
    console.log(`Hashed password for partner: ${doc.userId}`)
  }
}
await mongoose.disconnect()
```

---

## 12. The Mongo/Mongoose Changes (Concrete)

### Schema files to modify

| File | Change | Key delta |
|---|---|---|
| `models/User.ts` | MODIFY | `role` enum: `["client","admin","partner","executive","scrapcentre"]` (remove `"b2b"`) |
| `models/Valuation.ts` | MODIFY | Add fields: `leadStateId: String`, `qualityScore: String enum`, `triageDecisionId: String`. Extend status enum: add `"triage_pending"`, `"rejected_by_triage"` |
| `models/SellVehicle.ts` | MODIFY | Same three fields as Valuation above |
| `models/ExchangeVehicle.ts` | MODIFY | Same |
| `models/BuyVehicle.ts` | MODIFY | Same |
| `models/B2BPartner.ts` | NO schema change | Password handling fixed in API layer |
| `models/Setting.ts` | NO schema change | New seed keys added via script |

### New schema files (6)

| File | Collection | Purpose |
|---|---|---|
| `models/LeadState.ts` | `lead_states` | State-machine document for the 3-tier calculator (see §3.2) |
| `models/MarketplaceLead.ts` | `marketplace_leads` | Partner-facing lead with masking and lock semantics |
| `models/ChatThread.ts` | `chat_threads` | One conversation per (lead × partner) |
| `models/ChatMessage.ts` | `chat_messages` | Individual messages with poll index |
| `models/TriageDecision.ts` | `triage_decisions` | Audit log of admin triage actions |
| `models/AntiHoardingAlert.ts` | `anti_hoarding_alerts` | Ops-team alerting records |

### Indexes to create (via `createIndexes()` in a setup script or Mongoose `index: true`)

```
lead_states:          { anonymousToken: 1 } unique
lead_states:          { phone: 1 }
lead_states:          { tier: 1, createdAt: -1 }
marketplace_leads:    { status: 1, expiresAt: 1 }
marketplace_leads:    { soldToPartnerId: 1 }
marketplace_leads:    { watchedBy: 1 }
chat_threads:         { marketplaceLeadId: 1, partnerId: 1 } unique
chat_messages:        { threadId: 1, createdAt: 1 }
triage_decisions:     { leadStateId: 1 }
triage_decisions:     { status: 1, createdAt: -1 }
anti_hoarding_alerts: { resolvedAt: 1 }
```

---

## 13. Files in the Codebase That Will Change

This is the contract for implementation agents. **Do not touch files not listed here** without explicit PM approval. ADD = new file, MODIFY = existing file changed, DELETE = file removed, KEEP = no change.

### `app/api/*`

| File | Action | Summary |
|---|---|---|
| `app/api/setup-admin/route.ts` | DELETE | CRITICAL security hole |
| `app/api/temp-seed/route.ts` | DELETE | CRITICAL security hole |
| `app/api/b2b-partner/route.ts` | MODIFY | Add admin session gate; hash password |
| `app/api/b2b-register/route.ts` | MODIFY | Add admin gate to GET/PATCH/DELETE |
| `app/api/ekyc/route.ts` | MODIFY | Add session check; ownership check |
| `app/api/ekyc/[type]/route.ts` | MODIFY | Add session check; ownership check |
| `app/api/admin/ekyc/[type]/route.ts` | MODIFY | Add missing admin session check |
| `app/api/calc/tier1/route.ts` | ADD | Anonymous calc entry point |
| `app/api/calc/tier2/route.ts` | ADD | Post-OTP full calc |
| `app/api/otp/issue/route.ts` | ADD | OTP issuance via MSG91 stub |
| `app/api/otp/verify/route.ts` | ADD | OTP verification; issues calcSessionToken |
| `app/api/verify/start/route.ts` | ADD | Initiates document collection |
| `app/api/verify/submit/route.ts` | ADD | Runs AI verification pipeline (mock) |
| `app/api/triage/queue/route.ts` | ADD | Admin: list pending triage items |
| `app/api/triage/decide/route.ts` | ADD | Admin: submit triage decision |
| `app/api/marketplace/leads/route.ts` | ADD | Partner: list active marketplace leads |
| `app/api/marketplace/leads/[id]/route.ts` | ADD | Partner: get single lead |
| `app/api/marketplace/leads/[id]/buy/route.ts` | ADD | Partner: purchase lead (atomic) |
| `app/api/marketplace/leads/[id]/watch/route.ts` | ADD | Partner: watch/unwatch |
| `app/api/marketplace/leads/[id]/return/route.ts` | ADD | Admin: return lead to marketplace |
| `app/api/chat/threads/route.ts` | ADD | List chat threads (partner or client) |
| `app/api/chat/threads/[threadId]/messages/route.ts` | ADD | Poll + post messages |
| `app/api/admin/mock-config/route.ts` | ADD | Read/write mock toggle |
| `app/api/admin/triage/alerts/route.ts` | ADD | List anti-hoarding alerts |
| `app/api/admin/triage/alerts/[id]/route.ts` | ADD | Resolve alert |
| `app/api/admin/maintenance/expire-leads/route.ts` | ADD | Sweep expired marketplace leads |
| `app/api/valuation/route.ts` | KEEP | Unchanged for now (existing flow) |
| `app/api/sell-vehicle/route.ts` | KEEP | Used by Auraiya triage path |
| `app/api/buy-vehicle/route.ts` | KEEP | |
| `app/api/exchange-vehicle/route.ts` | KEEP | |
| `app/api/b2b/pickups/route.ts` | KEEP | Existing partner pickup flow |
| `app/api/b2b/pickups/[id]/status/route.ts` | KEEP | |
| `app/api/b2b/bulk-outsourcing/route.ts` | KEEP | |
| `app/api/admin/requests/approve/route.ts` | KEEP | |
| `app/api/admin/requests/delete/route.ts` | KEEP | |
| `app/api/settings/scrapRates/route.ts` | KEEP | |
| `app/api/valuations/marketplace/route.ts` | KEEP | Old B2B marketplace (legacy, keep running) |

### `app/admin/*`

| File | Action | Summary |
|---|---|---|
| `app/admin/triage/page.tsx` | ADD | Triage queue page (RSC) |
| `app/admin/triage/history/page.tsx` | ADD | Triage decision audit log |
| `app/admin/ops/alerts/page.tsx` | ADD | Anti-hoarding alerts ops page |
| `app/admin/mock-config/page.tsx` | ADD | Mock toggle admin page |
| `app/admin/page.tsx` | MODIFY | Add links to new triage pages in nav/dashboard |
| `app/admin/valuations/quote/temp_draft.tsx` | DELETE | Abandoned draft |

### `app/b2b/*`

| File | Action | Summary |
|---|---|---|
| `app/b2b/marketplace/page.tsx` | MODIFY | Update to use new MarketplaceLead API; add quality badge, blurred photos, lead price |
| `app/b2b/marketplace/[id]/page.tsx` | ADD | Lead detail page with Buy button |
| `app/b2b/chat/page.tsx` | ADD | Partner chat thread list |
| `app/b2b/chat/[threadId]/page.tsx` | ADD | Partner chat window (polled) |

### `app/(public)/*`

| File | Action | Summary |
|---|---|---|
| `app/page.tsx` | MODIFY | Wire new CalcWidget; update domain references |
| `app/quote/page.tsx` | MODIFY | Integrate 3-tier calculator flow |
| `app/rvsf/page.tsx` | ADD | Partner RVSF signup landing page |
| `app/chat/[threadId]/page.tsx` | ADD | Customer chat window |
| `app/layout.tsx` | MODIFY | Fix domain (`scrapcenter.in` → `scrapcentre.com`); add MockModeBanner; update metadata |

### `components/*`

| File | Action | Summary |
|---|---|---|
| `components/CalcWidget.tsx` | ADD | 3-tier progressive calculator UI |
| `components/CalcTier1.tsx` | ADD | Anonymous reg-number / manual entry step |
| `components/CalcTier2.tsx` | ADD | OTP entry + full result reveal |
| `components/CalcTier3.tsx` | ADD | Document upload + Aadhaar consent |
| `components/MockModeBanner.tsx` | ADD | Staging warning banner |
| `components/QualityBadge.tsx` | ADD | Bronze/Silver/Gold badge component |
| `components/ChatWindow.tsx` | ADD | Polled chat UI (customer + partner shared) |
| `components/MarketplaceLeadCard.tsx` | ADD | Blurred-photo lead card for partner feed |
| `components/TriageCard.tsx` | ADD | Admin triage decision card |
| `components/Footer.tsx` | MODIFY | Update to brand-guide.md §5 contact data |
| `components/Navbar.tsx` | MODIFY | Update domain text |
| `components/GoogleAnalytics.tsx` | KEEP | GA4 hardcoded ID stays (low priority) |
| `components/ValuationWizardCard.tsx` | KEEP | Existing flow unchanged |
| `components/eKYCForm.tsx` | KEEP | Existing eKYC flow unchanged |

### `lib/*`

| File | Action | Summary |
|---|---|---|
| `lib/auth.ts` | MODIFY | Remove debug bypass; fix OTP; fix B2B plaintext fallback |
| `lib/services/mock/config.ts` | ADD | getMockConfig() helper |
| `lib/services/mock/vahan.adapter.ts` | ADD | VAHAN mock adapter |
| `lib/services/mock/otp.adapter.ts` | ADD | MSG91 mock adapter |
| `lib/services/mock/digilocker.adapter.ts` | ADD | DigiLocker mock adapter |
| `lib/services/mock/vision.adapter.ts` | ADD | AI vision mock adapter |
| `lib/services/mock/maps.adapter.ts` | ADD | Google Maps mock adapter |
| `lib/services/otp-store.ts` | ADD | In-memory OTP Map store |
| `lib/state-machine/lead.ts` | ADD | LeadState transition engine |
| `lib/middleware/requireRole.ts` | ADD | Shared auth guard helper |
| `lib/db.ts` | KEEP | |
| `lib/cloudinary.ts` | KEEP | |

### `models/*`

| File | Action | Summary |
|---|---|---|
| `models/LeadState.ts` | ADD | New (see §3.2) |
| `models/MarketplaceLead.ts` | ADD | New |
| `models/ChatThread.ts` | ADD | New |
| `models/ChatMessage.ts` | ADD | New |
| `models/TriageDecision.ts` | ADD | New |
| `models/AntiHoardingAlert.ts` | ADD | New |
| `models/User.ts` | MODIFY | Fix `role` enum |
| `models/Valuation.ts` | MODIFY | Add `leadStateId`, `qualityScore`, `triageDecisionId`; extend status enum |
| `models/SellVehicle.ts` | MODIFY | Same |
| `models/ExchangeVehicle.ts` | MODIFY | Same |
| `models/BuyVehicle.ts` | MODIFY | Same |
| `models/B2BPartner.ts` | KEEP | |
| `models/B2BPickup.ts` | KEEP | |
| `models/B2BRegistration.ts` | KEEP | |
| `models/BulkOutsourcing.ts` | KEEP | |
| `models/Contact.ts` | KEEP | |
| `models/Executive.ts` | KEEP | |
| `models/ScrapCentreUser.ts` | KEEP | |
| `models/Setting.ts` | KEEP | |
| `models/WhatsAppMessage.ts` | KEEP | |

### `scripts/*` and `scratch/*`

| File | Action | Summary |
|---|---|---|
| `scratch/check-conn.js` | DELETE | Leaked prod MongoDB URI |
| `scripts/seed-now.ts` | MODIFY | Replace hardcoded URI with `process.env.MONGODB_URI` |
| `scripts/hash-partner-passwords.ts` | ADD | One-shot migration (run before deploy) |
| `scripts/seed-settings.ts` | ADD | Seeds `mockConfig` and `leadExpiryDays` Setting rows |

### Root config files

| File | Action | Summary |
|---|---|---|
| `.gitignore` | MODIFY | Add: `scratch/`, `*_log.txt`, `eslint*.json`, `tsc*.txt`, `tmp_*` |
| `tmp_login.html`, `tmp_login2.html` | DELETE | Debug artifacts |
| `next.config.ts` | MODIFY | Update `images.domains` if needed; add `NEXT_PUBLIC_IS_STAGING` env passthrough |
| `app/globals.css` | MODIFY | Add CSS variables: `--brand-red: #D92027`, `--brand-red-dark: #A8161C`, `--brand-red-light: #FCE5E6`, quality badge colours |

---

## 14. The Novalytix-Facing Demo Flow

Novalytix will access `https://scrapcentre.online` and walk through these steps:

### Step 1: Public landing → Tier 1 calc (2 min)

1. Navigate to `https://scrapcentre.online`. Verify: MockModeBanner is visible at top in brand red. Footer shows correct offices, phones, emails.
2. Enter a registration number (any format, e.g. `UP32AB1234`). Click "Get Value."
3. Verify: Scrap range appears with ±20% band. Three tiles (CD value, dealer discount, green finance) are blurred with a "Verify number to unlock" CTA.
4. Inspect browser dev tools → no sensitive data in network response.

### Step 2: OTP → Tier 2 unlock (2 min)

5. Enter mobile number `9999999999`. Click "Send OTP."
6. Toast appears: "Demo mode — OTP is 000000". Enter `000000`.
7. Verify: Full calculation unlocks. CD range, dealer discount (stub: "Coming Soon"), headline total. Strong CTA "Proceed to confirm pickup."

### Step 3: Document upload → Tier 3 (3 min)

8. Click "Proceed." Upload any 2 JPEG images as vehicle photos. Upload any PDF as RC document. Check "I consent to Aadhaar verification."
9. Click "Verify & Submit." Loading spinner shows for ~2 seconds.
10. Verify: "Verification successful — Quality: Gold" badge appears. "Your lead is under review" message shown.

### Step 4: Admin triage (2 min)

11. Open a new tab. Navigate to `/admin`. Log in using `ADMIN_EMAIL` / `ADMIN_PASSWORD` env credentials.
12. Navigate to "Triage Queue." Verify: The lead from Step 3 appears with vehicle info, quality badge (Gold), confidence score (87%), zero flags.
13. Click "Approve — Marketplace." Verify: Lead disappears from triage queue.

### Step 5: Partner marketplace (3 min)

14. Open a new tab. Navigate to `/b2b`. Log in as a demo partner (created via `scripts/seed-settings.ts`).
15. Navigate to "Marketplace." Verify: The lead appears with blurred photos, masked city/pincode, quality badge, lead price in ₹.
16. Click the lead → detail page. Verify: "Buy Lead — ₹X" button visible.
17. Click "Buy Lead." Verify: Page updates to "Sold — Your Lead". Button replaced by "Open Chat."
18. Open another partner tab → log in as a second demo partner. Try to buy the same lead. Verify: "Lead no longer available — already sold" (409).

### Step 6: Chat (2 min)

19. In the partner tab: click "Open Chat." Send a text message: "Hello, when can you arrange pickup?"
20. Navigate to `/chat/<threadId>?token=<calcSessionToken>` (link shown on the customer success screen from Step 3). Verify: Partner's message is visible. Reply: "Available this Saturday."
21. Back in partner tab — verify customer reply appears (within 5-second poll cycle).
22. Verify: Customer phone number and name are visible in the chat thread sidebar (unlocked on purchase).

### Step 7: Mock toggle (1 min)

23. In admin tab: navigate to "Mock Config." Change `vision` service mode to `"failure"`.
24. Open a new incognito window. Repeat Steps 1–3 with a different reg number.
25. At Step 9: Verify that verification shows "Flagged" status (confidence 23%, flag: "photo_tampered"). Lead goes to triage with flags visible.
26. Reset mock config to `success`.

### Step 8: Auth security check (1 min)

27. Try navigating to `/api/setup-admin` directly. Verify: 404 Not Found.
28. Try navigating to `/api/temp-seed`. Verify: 404 Not Found.
29. Try `POST /api/b2b-partner` with no session. Verify: 403 Unauthorized.
30. Try the OTP with value `1234`. Verify: rejected (only `000000` works in mock mode).

---

## 15. Deployment Shape (Proxmox LXC + Cloudflare Tunnel)

### LXC container spec (new CT 210 on `prox` R720)

```
CTID:     210
Hostname: scrapcentre-app
Node:     prox (192.168.0.250)
IP:       192.168.0.210 (static, vmbr0)
Cores:    4
RAM:      8 GB
Storage:  30 GB (sn350pool ZFS)
OS:       Debian 12 (bookworm)
```

**Why not Vercel for the dummy?** PM noted Vercel as an option. However, the dummy uses `lib/services/otp-store.ts` with an in-memory Map (which requires process persistence), and the Proxmox cluster is already running and available. Vercel serverless would reset the Map on every cold start. The LXC with `next start` keeps the Map alive for the demo's duration. For the actual production deployment, Vercel (or any serverless platform) is fine once OTP store moves to Redis CT 201.

### Runtime: `next start` behind nginx + systemd

```ini
# /etc/systemd/system/scrapcentre.service
[Unit]
Description=ScrapCentre Next.js App
After=network.target

[Service]
User=appuser
WorkingDirectory=/opt/scrapcentre
ExecStart=/usr/bin/node_modules/.bin/next start -p 3000
Restart=always
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/opt/scrapcentre/.env.production
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

nginx on port 80 proxies to localhost:3000. nginx is not exposed externally — Cloudflare Tunnel handles TLS termination.

**Why systemd over PM2?** Systemd is native to Debian, no extra install, integrates with journald, and restarts on failure. PM2 is reasonable but adds a dependency. For a single-app LXC, systemd is simpler.

### Cloudflare Tunnel setup (high-level)

1. Install `cloudflared` on CT 210: `curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | gpg --dearmor > /usr/share/keyrings/cloudflare-main.gpg && echo 'deb [signed-by=...] https://pkg.cloudflare.com/cloudflared bookworm main' | tee /etc/apt/sources.list.d/cloudflared.list && apt install cloudflared`
2. Authenticate: `cloudflared tunnel login` (opens browser, authenticates against Cloudflare account owning `scrapcentre.online`)
3. Create tunnel: `cloudflared tunnel create scrapcentre-staging`
4. Configure (`/etc/cloudflared/config.yml`):
   ```yaml
   tunnel: <tunnel-uuid>
   credentials-file: /root/.cloudflared/<tunnel-uuid>.json
   ingress:
     - hostname: scrapcentre.online
       service: http://localhost:80
     - service: http_status:404
   ```
5. Add CNAME in Cloudflare DNS: `scrapcentre.online → <tunnel-uuid>.cfargotunnel.com` (Cloudflare-managed, proxied)
6. Run as systemd service: `cloudflared service install` → `systemctl enable --now cloudflared`

No port forwarding on the MikroTik router (192.168.0.1). No inbound holes in the firewall. All traffic originates outbound from CT 210 to Cloudflare.

### Build and deploy flow

```bash
# On developer machine (or CI):
git clone git@github.com:pranjal1337/RHSV.git
cd RHSV
npm ci
npm run build            # next build

# Copy build artifact to CT 210:
rsync -avz --delete .next/ root@192.168.0.210:/opt/scrapcentre/.next/
rsync -avz package.json package-lock.json root@192.168.0.210:/opt/scrapcentre/
ssh root@192.168.0.210 "cd /opt/scrapcentre && npm ci --production && systemctl restart scrapcentre"
```

No Docker for the dummy. Keeps it simple and matches existing Proxmox patterns. Containerization (Docker Compose or Portainer on LXC) can be added when Novalytix takes over the full deployment.

### Environment file on CT 210 (`/opt/scrapcentre/.env.production`)

```
MONGODB_URI=<rotated Atlas URI>
NEXTAUTH_SECRET=<generated with openssl rand -base64 32>
NEXTAUTH_URL=https://scrapcentre.online
GOOGLE_CLIENT_ID=<real value>
GOOGLE_CLIENT_SECRET=<real value>
CLOUDINARY_CLOUD_NAME=<real value>
CLOUDINARY_API_KEY=<real value>
CLOUDINARY_API_SECRET=<real value>
GOOGLE_MAPS_API_KEY=<real value>
WHATSAPP_VERIFY_TOKEN=<real value>
ADMIN_EMAIL=<real admin email, not debug@test.com>
ADMIN_PASSWORD=<strong password>
NEXT_PUBLIC_IS_STAGING=true
```

The `.env.production` file has `chmod 600 root:root`. It is never committed to git.

---

## 16. Testing Strategy

### Minimum bar for the dummy

The dummy is a design-review artifact, not a production hardening. The minimum bar is: every demo flow in §14 works end-to-end without errors.

### Unit tests

Location: `__tests__/` at project root (new — currently no test infrastructure).

Minimum unit test coverage for this PR:

| Module | Tests |
|---|---|
| `lib/state-machine/lead.ts` | Valid transitions succeed; invalid transitions throw; guard conditions enforced |
| `lib/services/mock/config.ts` | Returns DEFAULT_CONFIG when no Setting row; respects per-service override |
| `lib/services/otp-store.ts` | OTP expires after TTL; single-use (deleted after verify); wrong OTP returns false |
| `lib/services/mock/vision.adapter.ts` | Returns verified in success mode; flagged in failure mode; random mode produces both |
| Calc pricing: scrap range ±20% | Math checks |
| Lead price calc (`0.75/1.0 per kg`) | Math checks |

Test runner: **Vitest** (add `vitest` + `@vitejs/plugin-react` to devDependencies). Vitest runs on Node without a browser, compatible with Next.js App Router server-only modules, and is fast. Jest is the alternative but requires more config for ESM + Next.js 15.

### Integration tests

Deferred to Phase B (Novalytix adds their test infra). The security-critical paths (auth removal, OTP verification) should have integration tests but are out of scope for the dummy timeline.

### E2E (manual QA, §14 is the script)

No Playwright/Cypress for the dummy. The Novalytix demo flow (§14) is the QA checklist. The QA agent works through all 30 steps and logs pass/fail.

---

## 17. Migration & Rollback

### On merging this PR to production

1. **B2BPartner passwords:** run `scripts/hash-partner-passwords.ts` before deploying the updated `lib/auth.ts`. This is a one-way migration — passwords that were plaintext are now bcrypt-hashed. Safe to run on live Atlas (bcrypt is idempotent per the `startsWith("$2")` check in the script).

2. **User.role enum change:** existing User documents with `role: "b2b"` (if any exist) will fail Mongoose validation after the enum change. Remediation: run a one-shot update before deploy: `db.users.updateMany({ role: "b2b" }, { $set: { role: "partner" } })`. In practice this should affect zero documents (the `"b2b"` value was never written by any code path), but run it defensively.

3. **New Mongoose models:** MongoDB creates collections on first insert — no migration needed. Indexes are created by Mongoose on first connect (from `index: true` declarations). First deploy will trigger index creation on the new collections; this is a background operation on Atlas and will not block reads/writes.

4. **Setting seed rows:** run `scripts/seed-settings.ts` once after deploy. Idempotent (upserts by key).

5. **Deleted API routes:** Any bookmarked URL to `/api/setup-admin` or `/api/temp-seed` will 404. No existing user flow depends on these — they were dev-only utilities.

6. **Modified status enums (Valuation, SellVehicle, etc.):** the new values (`"triage_pending"`, `"rejected_by_triage"`) are additive. Existing documents with old status values are unaffected.

### Rollback path

If the PR needs to be reverted after merge:

1. `git revert <merge-commit>` — the Next.js build will rebuild with the old code.
2. The six deleted files (`setup-admin`, `temp-seed`, `check-conn.js` etc.) will reappear. **Do not redeploy the deleted endpoints to a public-facing server.** If rollback is needed while keeping the security fixes, cherry-pick just the security PRs rather than full revert.
3. The new collections (`lead_states`, `marketplace_leads`, etc.) can be left in place — they are additive and do not conflict with the old code. If cleanup is required: `db.lead_states.drop()` etc.
4. The B2BPartner password hash migration is **not reversible** — the plaintext passwords are gone. Partners will need to reset passwords. This is intentional — do not roll back the password migration.
5. The `User.role` enum change is reversible in code but the `"b2b"` value was never in use, so there is nothing to migrate back.

### Production risk assessment

Founder confirmed: no production traffic yet. Risk is effectively zero for data integrity. The main risk is breaking the developer's working local environment — mitigated by thorough PR review against this document before merge.

---

## 18. Open Questions for the PM

1. **Mock OTP value:** The design proposes `000000` as the mock OTP (replacing the old `1234` bypass). Should this be documented anywhere visible to demo viewers (e.g., in the mock banner text), or kept only in the developer README?

2. **Mock toggle per-session vs. global:** The design proposes a single global toggle (one Setting row). Should it be per-user (each admin can set their own mode independently), or is global appropriate given there's only one admin during the demo period? Note: global is simpler and sufficient for a one-admin demo.

3. **Triage page — bulk actions:** The design delivers one-lead-at-a-time triage. Does the PM want a "bulk approve all to marketplace" action for v1, or is per-lead always required?

4. **Auraiya catchment rule:** The triage page presents all three options to the admin regardless of vehicle location. Should the UI highlight or pre-select "Auraiya" when the lead is within a certain radius? If yes, what is the km cutoff? (Product spec §4 notes this is still open.)

5. **Lead price display to customer:** Should the customer ever see the ₹/kg rate that partners pay for their lead? Or is the marketplace economics entirely B2B-facing?

6. **Chat — customer authentication:** The design uses the `calcSessionToken` (1-hour JWT) for customer chat access. If the customer returns the next day, their token is expired. Options: (a) require account creation for chat persistence, (b) extend calcSessionToken to 7 days, (c) magic link via SMS. Which is preferred?

7. **Anti-hoarding alert trigger:** For the dummy, alerts are manually created by an admin via the API. In production, what triggers the alert — a time threshold (e.g., lead is active for > 5 days and a nearby RVSF has not viewed it), a view count threshold, or manual ops team judgment? This shapes whether n8n automation is worth designing.

8. **Mock mode for production staging:** The `NEXT_PUBLIC_IS_STAGING=true` flag and the red banner will be visible when Novalytix reviews the dummy at `scrapcentre.online`. Is the founder comfortable with Novalytix seeing the mock infrastructure details (e.g., "000000" OTP)? Or should the banner say something different?

9. **Green Finance / Green Insurance "Coming Soon" tiles:** The Tier 2 calculator output shows these as blurred/coming-soon. Should the coming-soon tile show a specific future date (e.g., "Expected Q3 2026") or just "Coming Soon"? If a specific date, what is it?

10. **Partner portal — existing `/api/valuations/marketplace` vs. new `/api/marketplace/leads`:** The dummy adds a new marketplace feed. Should the old marketplace feed (`GET /api/valuations/marketplace` → existing `B2BPickup` flow) be deprecated in the same PR, or kept running in parallel? Deprecating it would break the existing B2B portal at `/b2b/marketplace` unless that page is also updated. The design proposes updating the B2B portal page to use the new feed — confirm this is in scope.

---

## 19. Hand-Off Notes

### Backend Dev (Novalytix)

**Own:** All new API routes under `app/api/calc/*`, `app/api/otp/*`, `app/api/verify/*`, `app/api/triage/*`, `app/api/marketplace/*`, `app/api/chat/*`. All `lib/services/mock/*` adapter files. All six new Mongoose models. The `lib/state-machine/lead.ts` module. Auth cleanup in `lib/auth.ts`.

**Contracts you must respect:**
- The `LeadState.tier` field is owned exclusively by `lib/state-machine/lead.ts`. Never write `tier` directly from an API route.
- The `calcSessionToken` is a separate JWT from NextAuth. Do not try to store it in the NextAuth session. Validate it with `jwt.verify(token, process.env.NEXTAUTH_SECRET + ":calc")`.
- The `MarketplaceLead.status` "sold" transition must use `findOneAndUpdate` with the conditional filter (`{ status: "active" }`), never a two-step find-then-update. This is the atomic locking guarantee.
- The mock adapters must never be called directly from anywhere except the corresponding real-service wrapper function. Callers always go through the wrapper (e.g., `import { lookupVehicle } from "@/lib/services/vahan"`; the real/mock decision is inside).
- Run `scripts/hash-partner-passwords.ts` before deploying the `lib/auth.ts` plaintext-fallback removal.
- Add `lib/middleware/requireRole.ts` and use it in every new protected route. Do not copy-paste the inline session check pattern from old routes.

**Do not touch without PM approval:** `models/B2BPickup.ts`, `models/BulkOutsourcing.ts`, existing B2B pickup API routes, `app/api/valuation/route.ts`.

### Frontend Dev (Novalytix)

**Own:** `components/CalcWidget.tsx` + child step components (`CalcTier1/2/3`). `components/MarketplaceLeadCard.tsx`. `components/ChatWindow.tsx`. `components/QualityBadge.tsx`. `components/MockModeBanner.tsx`. `components/TriageCard.tsx`. Partner-facing pages under `app/b2b/marketplace/[id]`, `app/b2b/chat/*`. Customer-facing `app/chat/[threadId]`. Public `app/rvsf` signup page.

**Contracts you must respect:**
- All primary CTAs use `--brand-red: #D92027`. Not Tailwind's default green/blue.
- The calculator widget stores the `anonymousToken` in an httpOnly cookie (the backend sets `Set-Cookie` on the Tier 1 response). The frontend must not set this cookie itself or read it (httpOnly).
- The `calcSessionToken` (from Tier 2 OTP verify) lives in `sessionStorage` only. Never `localStorage`. Component reads it on mount with `sessionStorage.getItem("calcSessionToken")`.
- Chat polling: `setInterval` of 5000ms (5 seconds), cleared on component unmount. The `since` parameter must be the ISO string of the latest message's `createdAt`, not `Date.now()`.
- Blurred photos are served as Cloudinary transformation URLs — do not attempt to "unblur" them client-side (they are server-side transformations, not CSS blur).
- The `isRelisted` flag on `MarketplaceLead` must trigger a visible "Previously offered" badge on the card.
- Footer: use exactly the contact data from `brand-guide.md §5`. Three offices, three phones, two emails.

**Do not touch without PM approval:** `components/ValuationWizardCard.tsx`, `components/eKYCForm.tsx`, existing admin pages not in the MODIFY list.

### Full-Stack Dev (Novalytix)

**Own:** Admin triage page (`app/admin/triage/page.tsx`) — it is both a server component (data fetch) and interactive (action buttons that call APIs). Admin mock-config page. Anti-hoarding alerts ops page. Settings seed scripts. Deployment on CT 210 (LXC provisioning, systemd setup, Cloudflare Tunnel).

**Contracts you must respect:**
- The triage page is a server component for the initial data load, but the action buttons (Approve/Reject) must be client-side fetches (not server actions for this dummy, to keep things simple and debuggable). Use a client-side wrapper component inside the RSC page.
- The `TriageDecision` model is append-only — never update an existing decision. A reversal (if needed) is a new TriageDecision with a `reversedBy` field (not designed yet — escalate to PM if asked).
- The `scripts/seed-settings.ts` script must use upsert (`Setting.findOneAndUpdate({ key }, { $set: { value, description } }, { upsert: true })`). It must be idempotent — safe to run multiple times.
- Before deploying to CT 210: rotate the MongoDB Atlas credential (`FMTSiCszPRoHDnmI` is the leaked one). Do not use the leaked credential even for the staging environment.
- The `.env.production` on CT 210 must have `chmod 600`. Never commit it to git.
- Cloudflare Tunnel must be the only public entry point. nginx on CT 210 should only listen on `127.0.0.1:80`, not `0.0.0.0:80`.

---

*Document finalized: 2026-05-12. Architect: Claude (Sonnet 4.6), Software Architect role, ScrapCentre.com dummy implementation sprint.*
