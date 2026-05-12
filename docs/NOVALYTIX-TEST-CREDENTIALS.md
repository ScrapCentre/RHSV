# ScrapCentre.com — Dummy Test Credentials for Novalytix

**Use this doc to walk through every role + every page on the dummy.**

---

## 🔗 Live URL

**https://scrapcentre.online** *(stable, served from a Proxmox VM via Cloudflare tunnel)*

The dummy is hosted on the founder's own infrastructure for review. If you'd prefer to run it on your own hardware (Vercel / Docker / Node host), see "Deploy it yourselves" below — the fork is build-clean as of commit `04cb946`.

---

## 🧪 Test accounts

All accounts share the same password for ease of testing. **None of these accounts work in production** — they are seeded only in the dummy's MongoDB and only for this review.

**Shared password:** `NovalytixTest2026!`

| Role | Login identifier | Where to log in | What to test |
|---|---|---|---|
| **Admin** | `admin.test@scrapcentre.online` | `/login` (Universal tab — email + password) | `/admin`, `/admin/triage`, `/admin/mock-config`, `/admin/partners`, `/admin/executives`, `/admin/scrap-center-users`, `/admin/settings`, `/admin/contact`, `/admin/blogs/upload`, `/admin/b2b-generator`, `/admin/subcontracting`, `/admin/bulk-outsourcing`, `/admin/valuations/*` |
| **Client** | `client.test@scrapcentre.online` | `/login` (Universal tab — email + password) | Customer flow with login state: `/profile`, `/calculator/upload` (Tier 3 — needs auth), `/ekyc/*` |
| **Executive** | `exec.test@scrapcentre.online` | `/login` (Executive tab — email + password) | `/executive`, `/executive/dashboard`, `/executive/valuations/[type]`, `/executive/approved-requests`, `/executive/bulk-outsourcing` |
| **ScrapCentre operator** | `centre.test` (this is a Login ID, **not an email**) | `/login` (ScrapCentre tab — Login ID + password) | `/scrapcentre`, `/scrapcentre/dashboard` |
| **B2B Partner** | `partner.test` (this is a Partner ID, **not an email**) | `/login` (B2B Partner tab — Partner ID + password) | `/b2b`, `/b2b/dashboard`, `/b2b/marketplace` (masked leads + Buy flow), `/b2b/pickups`, `/b2b/enter-data`, `/b2b/chat/[leadId]` |

**No login required** for the customer-facing calculator funnel:
- `/` — homepage
- `/start` — entry questionnaire
- `/calculator` — Tier 1 anonymous estimate (mock VAHAN)
- `/calculator/verify` — Tier 2 OTP (any 6-digit input succeeds in mock-success mode)
- `/calculator/done` — confirmation

---

## 🎬 Suggested 10-minute walkthrough

1. **Land on https://scrapcentre.online** — see the new homepage with the real ScrapCentre logo + brand red.
2. **Click "Get started"** (or navigate to `/start`) — answer the two questions ("scrap?" + "buy?"). Pick "yes/yes" → routed to Type B.
3. **Enter a vehicle reg number** like `UP70AB1234` on `/calculator` → see Tier 1 estimate with **CD / Dealer / Green Finance / Green Insurance rows blurred** ("Verify My Number" green CTA).
4. **Click "Verify My Number"** → enter any 6-digit OTP (e.g. `123456`) → Tier 2 reveals the full breakdown.
5. **Click "Confirm Pickup"** → log in as `client.test@scrapcentre.online` → upload mock photos + RC + Aadhaar (form renders; uploads to placeholder Cloudinary so it'll fail upload, but the lead will still proceed to the next state).
6. **Switch to admin** — log out, then log in as `admin.test@scrapcentre.online`.
7. **Visit `/admin/triage`** — see the lead from step 5 in the queue. Three buttons: Approve for Auraiya / Approve for Marketplace / Reject.
8. **Visit `/admin/mock-config`** — flip VAHAN to "Always fail" → save → re-visit `/calculator` and enter the reg number → see the failure path.
9. **Switch to partner** — log out, log in as `partner.test` (Partner ID, not email) on the B2B Partner tab.
10. **Visit `/b2b/marketplace`** — see masked leads (blurred photos, Bronze/Silver/Gold quality badges, 2-week countdown).
11. **Click "Buy" on a lead** → contact info unlocks → open chat thread.

---

## 🔧 What's mocked vs. real

| Integration | State in dummy | How to swap to real |
|---|---|---|
| MongoDB Atlas | **Real** (still using leaked creds — to be rotated; see below) | Rotate Atlas password + update `MONGODB_URI` in `.env.local` |
| WhatsApp / SMS OTP | Mocked via `lib/services/mock/otp.adapter.ts` | Wire MSG91 (or AiSensy WA-BSP) → replace adapter |
| VAHAN | Mocked via `lib/services/mock/vahan.adapter.ts` | Wire VAHAN production API → replace adapter |
| DigiLocker (Aadhaar eKYC) | Mocked via `lib/services/mock/digilocker.adapter.ts` | Wire DigiLocker offline-KYC API → replace adapter |
| AI vision (vehicle photos) | Mocked via `lib/services/mock/vision.adapter.ts` | Wire Claude Vision / Gemini Vision → replace adapter |
| Google Maps Distance Matrix | Mocked via `lib/services/mock/maps.adapter.ts` | Wire real GMaps API → replace adapter |
| Cloudinary uploads | **Placeholder creds** — upload calls will fail | Replace `CLOUDINARY_*` env vars with real account |
| DigiELV CD trading | Mocked confirmation only | Pending MMCM partnership decision |

**Toggle mock behaviour** at `/admin/mock-config` — flip per-service to "Always succeed", "Always fail", or "Random". Changes apply within ~10 s (server-side cache TTL).

---

## 📂 Where the code is

- **GitHub PR:** https://github.com/ScrapCentre/RHSV/pull/1
- **Branch:** `feat/v1-product-spec` on the founder's fork `pranjal1337/RHSV`
- **Docs in repo:** `/docs/HANDOVER.md`, `/docs/PRODUCT-SPEC.md`, `/docs/ENGINEERING-DESIGN.md`, `/docs/DESIGN-SYSTEM.md`, `/docs/BRAND-GUIDE.md`
- **Per-wave reports:** `/docs/wave-reports/`

5 commits, can be cherry-picked / squash-merged / rebased per your preference.

---

## 🚀 Deploy it yourselves (recommended — staging URL is unstable)

The hosted URL above runs through a Cloudflare Tunnel from a Proxmox LXC behind a residential ISP, and is currently flaky (intermittent 502/530). The fork is clean and self-hosting is straightforward — feel free to just deploy it on whatever infra you prefer.

```bash
git clone https://github.com/pranjal1337/RHSV.git
cd RHSV
git checkout feat/v1-product-spec   # 6 commits, fully build-clean
npm install --legacy-peer-deps      # ~601 packages, 1-2 min
cp .env.local.example .env.local    # (or write your own — see below)
npx tsx scripts/seed-novalytix-test.ts   # creates the 5 test accounts above
npx tsx scripts/seed-settings.ts          # creates mockConfig + leadExpiryDays
npm run build && npm run start            # serves on :3000
```

**Required env vars** (`.env.local`):

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://<wherever-you-deploy-it>
CLOUDINARY_CLOUD_NAME=<your value or "demo" if you don't need uploads>
CLOUDINARY_API_KEY=<your value or "000000000000000">
CLOUDINARY_API_SECRET=<your value or "demo">
NEXT_PUBLIC_IS_STAGING=true
```

> ⚠️ The previous `MONGODB_URI` value (with credentials `scrapcentre69_db_user` / `FMTSiCszPRoHDnmI`) was leaked in the historical codebase; it's been removed from the working branch but the password should be rotated upstream before this hits production.

**Vercel:** the dummy is just a Next.js app — connecting Vercel directly to the fork on `feat/v1-product-spec` works out of the box. Add the env vars above in Vercel's dashboard, deploy, and you have a stable URL.

**Docker / Node host:** standard `npm install && npm run build && npm run start`. Add a reverse proxy if you want SSL.

---

## ⚠️ Other caveats Novalytix should know

1. **Atlas credentials in the staging LXC are the legacy leaked ones** — do not run anything destructive against that DB until rotated. Use a fresh Atlas DB if you self-host.
2. **NEXTAUTH_URL must match where you deploy.** OAuth redirects (Google sign-in) won't work otherwise. Credentials login (email + password) works regardless.
3. **Brand domain inconsistency:** the wordmark says "ScrapCentre.com" but the dummy LXC URL is `scrapcentre.online`. Production should redirect both to the canonical one.
4. **The `NEXT_PUBLIC_IS_STAGING=true` flag** is set so any "staging banner" UI fires.

---

## 📞 If something's broken

- **502 errors:** transient — refresh in 30 s
- **App not loading at all:** the LXC may be down. Ping the founder.
- **A specific route 500s:** check the docs/HANDOVER.md "Known issues / open TODOs" section
- **Anything else:** the per-wave reports in `/docs/wave-reports/` explain the design decisions for each area
