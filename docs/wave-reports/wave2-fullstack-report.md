# Wave 2 — Full-stack Integration Report

**Branch:** `feat/v1-product-spec`
**Date:** 2026-05-12
**Author:** Full-stack Developer (Wave 2)
**Base commits:** `b7430e4` (Backend Wave 1) + `755bf4e` (Frontend Wave 1)

---

## 1. Scope Summary

Wave 2 wired Backend Dev's Wave 1 APIs into Frontend Dev's Wave 1 components, creating every page-level route that was missing between them. It also brand-refreshed static pages and removed obsolete routes now superseded by the calculator flow.

---

## 2. Files Changed

### 2a. New Files Added (10)

| File | Purpose |
|------|---------|
| `app/start/page.tsx` | Entry questionnaire route — wraps `EntryQuestionnaire` with `useSearchParams` Suspense boundary; reads `?intent=sell\|buy\|both` |
| `app/start/commercial/page.tsx` | Fleet/commercial enquiry form (fleet size pills, vehicle type, contact fields); stubbed POST with 600 ms delay pending `POST /api/fleet-enquiry` |
| `app/calculator/page.tsx` | Tier 1 anonymous calc — reg-number → `POST /api/calc/tier1`; stores `leadStateId` + `anonymousToken` in `sessionStorage`; renders `BenefitBreakdown tier={1}` |
| `app/calculator/verify/page.tsx` | Tier 2 OTP gate — phone → `POST /api/otp/issue`; OTP → `POST /api/otp/verify`; stores `calcSessionToken` in `sessionStorage`; renders `BenefitBreakdown tier={2}` |
| `app/calculator/upload/page.tsx` | Tier 3 document upload — 5 × `DocumentUploader` slots; `POST /api/verify/start` + `POST /api/verify/submit` with `Authorization: Bearer calcSessionToken`; redirects to `/calculator/done` |
| `app/calculator/done/page.tsx` | Thank-you / confirmation screen — reads `qualityScore`+`verificationStatus` from `sessionStorage`; shows Gold/Silver/Bronze badge; WhatsApp + phone CTAs |
| `app/admin/triage/page.tsx` | RSC — server-side auth check + `GET /api/triage/queue` fetch (absolute URL via `NEXTAUTH_URL`); passes `initialLeads` to client section |
| `app/admin/triage/TriageClientSection.tsx` | `"use client"` — triage action buttons; `POST /api/triage/decide`; optimistic lead removal; per-lead spinner; manual refresh |
| `app/b2b/chat/[leadId]/page.tsx` | Partner chat — initial load `GET /api/chat/threads/:id/messages`; 5-second polling with `?since=ISO`; send text + photo upload via `FormData`; scroll-to-bottom ref; tappable `tel:` link |
| `package.json` | Added `jose ^4.15.9` for JWT decode utilities (JWT issued by `/api/otp/verify` uses HS256) |

### 2b. Files Modified (10)

| File | What Changed |
|------|-------------|
| `app/page.tsx` | Full rewrite — removed 800 ms loader + deleted `WelcomePopup`/`HomexHero`/`ServicesSection` imports; added `HeroSection`, `EntryQuestionnaire` with `onRoute` → `router.push`, `FounderVideoBlock`, `HowItWorksSection`, `ComingSoonTilesSection`, `ReviewSection`, `FeaturesSection`, `GrowWithUs`, `ValuationCTA`, `FAQSection` |
| `app/login/page.tsx` | Stripped 647-line monster down to ~200 lines; removed visible "demo OTP 1234" label; OTP now calls real `POST /api/otp/issue`; displays `_demoHint` from API response as toast (staging mode); role-based redirect after sign-in (admin→`/admin`, partner→`/b2b/marketplace`, executive→`/executive`, else→`/`) |
| `app/b2b/marketplace/page.tsx` | Rewritten — old `/api/valuations/marketplace` → new `GET /api/marketplace/leads`; vehicle-type filter bar; `POST /api/marketplace/leads/:id/buy` (409 guard); `POST /api/marketplace/leads/:id/watch` toggle; on buy success with `threadId` → navigate to `/b2b/chat/:threadId` |
| `app/admin/page.tsx` | Added quick-link buttons above `DashboardOverview`: "Triage Queue →" (brand-red, `/admin/triage`) + "Mock Config" (outline, `/admin/mock-config`) |
| `app/about/page.tsx` | Two CTA buttons: `/quote` → `/calculator`; `bg-emerald-600` → `bg-[#D92027]`; label "Get Free Valuation" → "Get My Vehicle's Value →" |
| `app/contact/page.tsx` | Copyright: "ScrapCenter" → "ScrapCentre.com" |
| `app/career/page.tsx` | Heading: "ScrapCenter India" → "ScrapCentre.com" |
| `app/register/page.tsx` | Subtitle: "Join ScrapCenter today" → "Join ScrapCentre.com today" |
| `next.config.ts` | Added `async redirects()` with 4 permanent 301s (see §4) |
| `package.json` | `jose ^4.15.9` added to dependencies |

### 2c. Files Deleted (4)

| File | Reason |
|------|--------|
| `app/quote/page.tsx` | Replaced by `/calculator` flow; 301 redirect in place |
| `app/services/sell-vehicle/page.tsx` | Replaced by `/start?intent=sell`; 301 redirect in place |
| `app/services/buy-vehicle/page.tsx` | Replaced by `/start?intent=buy`; 301 redirect in place |
| `app/services/exchange-vehicle/page.tsx` | Replaced by `/start?intent=both`; 301 redirect in place |

**Total: 10 added, 10 modified, 4 deleted = 24 file operations**

---

## 3. Calculator State Machine Integration

The three-tier state machine (engineering-design §6) is fully wired end-to-end:

```
/calculator          → POST /api/calc/tier1
                       → stores leadStateId + anonymousToken in sessionStorage
                       → renders BenefitBreakdown tier={1}
                       → CTA → /calculator/verify?leadStateId=...

/calculator/verify   → POST /api/otp/issue (with phone)
                       → OTPInput component shown
                       → POST /api/otp/verify
                       → stores calcSessionToken in sessionStorage
                       → renders BenefitBreakdown tier={2}
                       → CTA → /calculator/upload

/calculator/upload   → reads calcSessionToken + leadStateId from sessionStorage
                       → guards: if missing → redirect to /calculator
                       → uploadToCloudinary() per slot (stub; returns fake URL)
                       → POST /api/verify/start   (Bearer calcSessionToken)
                       → POST /api/verify/submit  (Bearer + pre-uploaded URLs as JSON)
                       → stores qualityScore + verificationStatus in sessionStorage
                       → redirect → /calculator/done

/calculator/done     → reads qualityScore + verificationStatus from sessionStorage
                       → generates SC-YYYY-NNNNN reference number
                       → shows badge + next-steps + WhatsApp/phone CTAs
```

**Key decision (locked):** `calcSessionToken` lives exclusively in `sessionStorage` — never `localStorage`, never a cookie. It is passed as `Authorization: Bearer <token>` on every tier2/tier3 API call. The `anonymousToken` httpOnly cookie is set by the backend on `/api/calc/tier1` and is never read client-side. This matches engineering-design §6 exactly and is the mechanism that prevents anonymous session hijacking.

---

## 4. Redirects Configured

All 301 redirects are in `next.config.ts` `redirects()`:

| From | To | Permanent |
|------|-----|-----------|
| `/quote` | `/start` | Yes |
| `/services/sell-vehicle` | `/start?intent=sell` | Yes |
| `/services/buy-vehicle` | `/start?intent=buy` | Yes |
| `/services/exchange-vehicle` | `/start?intent=both` | Yes |

The `/services/android-app` route is untouched (kept per spec).

---

## 5. Admin Triage Integration

Pattern used: RSC + embedded client component (engineering-design §19).

- `app/admin/triage/page.tsx` (RSC): calls `getServerSession(authOptions)` → 302 to `/admin` if not admin role; fetches `GET /api/triage/queue` server-side using `process.env.NEXTAUTH_URL` as base URL; renders `<TriageClientSection initialLeads={leads} />`.
- `app/admin/triage/TriageClientSection.tsx` (`"use client"`): holds `useState` for lead list; `decide()` posts to `POST /api/triage/decide`; on success removes lead optimistically from local state; shows per-lead spinner via `actingOn` state; refresh button re-fetches queue from client side.

The page is `force-dynamic` so it never serves a stale cached triage queue.

---

## 6. Marketplace + Chat Integration

Marketplace (`app/b2b/marketplace/page.tsx`):
- `GET /api/marketplace/leads` with `?type=` filter param (4W/2W/HMV/All)
- `POST /api/marketplace/leads/:id/buy` → on 409 shows inline "Lead no longer available" toast (atomic sold-check handled server-side by `findOneAndUpdate`)
- On success response includes `threadId` → `router.push('/b2b/chat/' + threadId)`

Chat (`app/b2b/chat/[leadId]/page.tsx`):
- Route param name is `leadId` but semantically holds the `threadId` returned by the buy endpoint
- `POLL_INTERVAL_MS = 5000` constant; `setInterval` cleared on `useEffect` cleanup
- Polling passes `?since=<lastMessageAt>` ISO timestamp — only fetches messages newer than last seen
- Photo upload uses `FormData` with `type: "photo"` field alongside `file`
- Customer phone shown as `<a href="tel:...">` once thread is in `purchased` state

---

## 7. Brand Refresh

| Page | Before | After |
|------|--------|-------|
| `about/page.tsx` | `/quote` CTAs, `emerald-600` buttons | `/calculator` CTAs, `#D92027` buttons |
| `contact/page.tsx` | "ScrapCenter" in copyright | "ScrapCentre.com" |
| `career/page.tsx` | "ScrapCenter India" | "ScrapCentre.com" |
| `register/page.tsx` | "Join ScrapCenter today" | "Join ScrapCentre.com today" |
| `login/page.tsx` | "Demo OTP: 1234" visible in UI | Removed; backend sends `_demoHint` to staging clients only |

---

## 8. Open Items / TODOs for Next Waves

### Backend Dev (Wave 3 blockers)
1. **`POST /api/fleet-enquiry`** — Commercial vehicle page at `/start/commercial` stubs 600 ms delay then shows success. Needs real endpoint.
2. **Cloudinary upload** — `uploadToCloudinary()` in `calculator/upload/page.tsx` returns a fake URL (`https://res.cloudinary.com/demo/image/upload/…`). Backend Dev needs to either expose `POST /api/upload` returning a signed Cloudinary URL, or confirm the existing `/api/ekyc` endpoint handles it.
3. **`POST /api/verify/submit` multipart vs JSON** — Current impl passes pre-uploaded URLs as JSON. Backend's vision mock does not process file bytes, so this works for demo. For production, Backend Dev needs to confirm whether submit expects multipart or a JSON array of CDN URLs.

### Frontend Dev (Wave 3 polish)
4. **`PartnerClientLayout.tsx` sidebar** — Wave 1 hand-off note #11 asks for a "Chat" link pointing to `/b2b/chat/[leadId]`. Since `leadId` is only known after a purchase, the sidebar link should point to `/b2b/marketplace` with a badge count of active threads. Not implemented in Wave 2.
5. **`/admin/mock-config/page.tsx`** — Admin quick-link button was added pointing here but the page does not yet exist. Frontend Dev or Backend Dev should scaffold it (reads/writes `Setting.key = "mockConfig"` via `GET/PUT /api/admin/settings/mock-config`).

### Not In Scope (explicitly excluded per task spec)
- `app/admin/triage/history/page.tsx` — audit log
- `app/admin/ops/alerts/page.tsx` — anti-hoarding alerts
- `app/b2b/marketplace/[id]/page.tsx` — single lead detail page
- `app/b2b/chat/page.tsx` — partner chat thread list
- Admin user pages (`scrap-center-users`, `executives`) placeholder email domains still reference `@scrapcenter.in` — admin territory, out of scope

---

## 9. Integration Decisions Locked

1. **calcSessionToken in sessionStorage** (most important — see §3)
2. **RSC + client-component split for triage** — avoids server actions, gives optimistic UI without prop-drilling session
3. **Polling at fixed 5000 ms** — no WebSocket for v1; `?since=ISO` avoids re-sending already-seen messages
4. **301 redirects in `next.config.ts`** — permanent redirects handled at framework level, not in page components, so old bookmarks and SEO links carry equity to new routes
5. **Atomic 409 handling in marketplace** — `findOneAndUpdate` on server side; client shows toast on 409 without crashing the card list

---

## 10. Verification Checklist

- [x] All `"use client"` pages using `useSearchParams()` wrapped in `Suspense`
- [x] `calcSessionToken` never written to `localStorage` or cookies
- [x] `anonymousToken` never read client-side
- [x] `NEXTAUTH_URL` used for absolute URL in RSC server fetch (triage queue)
- [x] Chat poll interval cleared on component unmount
- [x] 409 response handled on marketplace buy without full-page error
- [x] Deleted pages have corresponding 301 redirects before deletion
- [x] `/services/android-app` untouched
- [x] Demo OTP hint (`000000`) only surfaced via `_demoHint` from API, not hard-coded in UI
- [x] Brand red `#D92027` used consistently; no residual `emerald-` classes on Wave 2 pages
- [x] All "ScrapCenter India" / "ScrapCenter" references corrected to "ScrapCentre.com" on in-scope pages
