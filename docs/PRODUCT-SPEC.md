# Product Decisions — ScrapCentre.com (Live Working Spec)

This is the **running ledger of product decisions** made in PM conversations with the founder, Dr. Pranjal Patel. It is the **source of truth** for what the platform is being built to be — it supersedes anything in the as-built docs (`01-overview-architecture.md` through `07-tech-debt-and-security.md`) where they conflict, because those docs describe the *current code* and this doc describes the *intended product*.

**Any agent (Architect, UI/UX Designer, future PM, future engineer) MUST read this doc to be current before designing or building anything.** The agent understanding docs (`architect-understanding.md`, `uiux-understanding.md`) are point-in-time snapshots; this doc is live.

**Convention used in this doc:**
- ✅ **LOCKED** — confirmed by founder, build against this
- 💡 **PM-PROPOSED** — recommended by PM, awaiting founder sign-off
- ❓ **PENDING** — open question being negotiated

**Last updated:** 2026-05-11 (PM session 2 with founder).

---

## 1. Project identity & business model

✅ ScrapCentre.com is a **national lead-generation marketplace** for the entire RVSF (Registered Vehicle Scrapping Facility) industry in India. Not a portal for any single RVSF.

✅ The founder owns a separate physical RVSF in **Auraiya, UP** (under Restore Health MediCare Pvt. Ltd.). Auraiya is one fulfilment node among many, but gets **preferential lead routing** in its catchment.

✅ The platform invites **other RVSFs as partners** (167+ operational nationally). Partners browse leads, buy them at a flat per-kg fee, and fulfil the scrap transaction.

✅ The user owns the GitHub repo `ScrapCentre/RHSV` (typo — should be RVSF; rename later, not now). Working copy: `~/Documents/RHSV-work/`. Live site: scrapcenter.com (in development, no production traffic yet).

✅ Production domain locked: **https://scrapcentre.com** *(Founder, 2026-05-11, confirmed via corporate letterhead.)* The codebase reference at `app/layout.tsx:27` (`scrapcenter.in`) is a legacy artifact and must be updated everywhere. Brand identity captured in `brand-guide.md`.

✅ Staging / preview domain locked: **https://scrapcentre.online** *(Founder, 2026-05-11, registered for dummy preview hosting.)* This domain hosts the Novalytix-review build so production is never touched. PM recommendation: deploy via Vercel + Cloudflare DNS for the dummy (cheapest, fastest, every commit auto-previews). Long-term hosting decision (own server vs. Vercel vs. Cloudflare Pages) deferred to post-review. See §9.

### 1a. Revenue model

✅ **Per-lead fee from partner RVSFs:** ₹0.75/kg (2W) or ₹1/kg (4W). First-come-first-served.

✅ **No commission on the completed scrap transaction.** Once a partner RVSF buys a lead, that's it. *(Founder, 2026-05-11.)*

✅ **Future monetisation comes from value-added services**, not from squeezing the lead transaction:
- ScrapCentre OS (free for active lead-buyers, paid otherwise)
- Green Finance referral fees from banks (per-loan)
- Green Insurance referral fees from insurers (per-policy)
- CD Buyer service fees
- Dealer referral fees
- Enterprise contracts (OEMs / EPR / bulk fleets / auctioneers / recyclers)

✅ **Margin posture on Green Finance + Green Insurance:** ScrapCentre takes only enough margin to **cover marketing expenses** for that channel — not to profit. Maximum benefit passes to the customer. *(Founder, 2026-05-11.)* Same posture applies to dealer-discount tie-ups (skip commission, push extra discount to customer).

❓ Specific commission structures with banks/insurers/dealers — not yet decided. Founder picks model when partner conversations begin.

### 1b. Naming

✅ The intended brand is **ScrapCentre.com**. The folder/repo name `RHSV` is a typo for **RVSF** (Registered Vehicle Scrapping Facility). Rename later.

✅ The OS product is provisionally called **ScrapCentre OS** (positioned against Scrapon).

---

## 2. Target audiences (per Marketing Strategy v2)

✅ Eleven personas across four sides (full detail in `/tmp/scrapcentre_strategy.txt`):

| Side | Personas | Year 1 budget |
|---|---|---|
| 1. Consumer scrap | P1 Pragmatic Upgrader, P2 Sentimental Owner, P3 Inheritor, P4 Two-Wheeler Owner, P5 Compliance-Forced Owner | 55% |
| 2. CD Buyer (NEW) | P6 CD Buyer (urban, smart-shopper, in-market for new vehicle) | 15% |
| 3. Partner RVSFs | PP1 Partner RVSF (existing 166 operational nationally) | 15% |
| 4. Enterprise | B1 Small Fleet, B2 Bulk Consumer, B3 OEM Dealer Partner, B4 Enterprise EPR/Insurance/Auctioneer | 15% |

✅ Bilingual reality: scrap-side consumers think in Hindi (with regional flavours), CD Buyers think in Hinglish, partner RVSFs and enterprise think in English. UI must support this from v1.

---

## 3. Customer flow on the website

### 3a. Entry questionnaire

✅ **Two questions, asked one by one:**
1. "Are you looking to scrap your old vehicle?"
2. "Are you looking to buy a new vehicle?"

✅ **Three customer types** derived:
- **Type A** — Sell old only. Get CD. Optional: also sell the CD for ₹15–25k extra.
- **Type B** — Sell old + buy new. CD bridges them.
- **Type C** — Buy new only. Buy a CD from/through ScrapCentre, apply to new vehicle.

✅ **All vehicle classes:** 2W, 4W, trucks.

✅ **Sub-options below the main questionnaire:**
- "Are you a commercial vehicle owner?" → routes to commercial form
- "Are you looking to scrap your fleet / older fleet vehicles?" → fleet flow

✅ **Fleet sub-flow scope:** **same form handles all fleet sizes** (no SME-vs-enterprise split in v1). Auraiya has the capacity for fleets in v1. *(Founder, 2026-05-11.)*

❓ Vehicle category compatibility for CD (passenger-to-passenger, commercial-to-commercial) — calculator behaviour on mismatch (block? warn? compute and let user discover?) — to be locked.

### 3b. The benefit calculator (the hero — Spinny-style flow)

✅ Reference UX: **Spinny.com/scrap-car** — the founder's chosen pattern.

✅ **Three-tier reveal of the calculator output** *(Founder, 2026-05-11)*:

```
TIER 1 — Anonymous landing (no friction)
  Hero CTA: "Enter your car/bike registration number → Get your car Price"
  (Fallback: "Select your vehicle brand → make → model → year → state")
  → VAHAN auto-fills the rest in the background (when API live)
  → HALF CALCULATION shown on screen:
       - Scrap value range (with ±20% honesty band)
       - Headline number — "Your benefit could be ₹X–₹Y"
       - Other components (CD, dealer discount, green finance, green insurance)
         shown as BLURRED / LOCKED tiles with a hook:
         "Unlock the full breakdown — verify your number"

TIER 2 — Mild friction: mobile + OTP
  → Customer enters mobile number
  → OTP via SMS (MSG91)
  → FULL CALCULATION unlocked:
       - Confirmed scrap value (VAHAN-verified vehicle data)
       - CD value (range from DigiELV trade prices)
       - Dealer discount (state-specific data)
       - Green Finance + Green Insurance lines (until partners signed: "Coming Soon")
       - Combined headline number — "You save ₹X total"
  → Strong CTA: "Want us to handle the pickup + paperwork? Confirm to proceed."

TIER 3 — High friction (lead-firming, only after the customer commits)
  → Upload vehicle photos + RC photo (or DigiLocker pull) → AI verifies
  → Aadhaar via DigiLocker (eKYC)
  → Lead becomes a "Quality Lead — Verified"
  → Goes into the routing queue (see §4)
```

✅ **Estimate range tolerance:** ±20% (honesty band). *(Founder, 2026-05-11.)*

✅ **CD valuation logic:** computed from DigiELV trade prices, presented as a **realistic range**.

✅ **Dealer discount data:** manually compiled by tying up with city dealers. Pitch to dealers: skip your commission, give our customer extra discount instead.

✅ **"Coming Soon" UI pattern** for components not yet live: Green Finance, Green Insurance, **dealer discount** (until SIAM/government push for the 3–5% manufacturer discount lands). Show estimated savings as ranges with a "Coming Soon" tag.

❓ **New-vehicle price source for Type B/C** — two paths under research: (a) paid API (CarDekho / CarWale / 91Wheels / OEM direct), (b) AI scraping agent that builds an internal price DB at intervals. Decision to come.

❓ Inputs the calculator needs from the user (beyond reg number / make-model-year-state) — minimum locked above; any extras (mileage, condition self-report, ownership status) to be decided.

### 3c. Verification flow

✅ **Tier-3 flow uses AI-driven document verification** — no humans in the verification loop.

✅ **AI verification scope:** all of (a) photo not tampered, (b) vehicle matches make/model claimed, (c) condition accurately described, (d) cross-checks against VAHAN data. *(Founder, 2026-05-11.)*

✅ **AI failure handling:** flag for human review at the routing decision point (§4) — the founder's team approves Auraiya / marketplace / reject. *(Founder, 2026-05-11.)*

✅ **Aadhaar-vs-RC ownership mismatch:** ask for ownership transfer proof (or legal heir proof for the Inheritor persona). Don't reject. *(Founder, 2026-05-11.)*

✅ **Build approach for AI verification** *(Founder, 2026-05-11)* — build in-house to control cost, not pay per-call to a KYC SaaS:
- **Aadhaar:** UIDAI DigiLocker offline KYC (XML pull, signed) — no per-call fee, just licence cost
- **PAN:** NSDL / Income Tax PAN verification API (low per-call fee) OR OCR + checksum validation
- **RC:** OCR (Tesseract / Google Document AI / Claude Vision) extracts fields → cross-verified against VAHAN API. OCR handles the heavy lifting; VAHAN is the authority for spot-checks (saves cost vs full VAHAN fetch on every record)
- **Vehicle photos:** vision LLM (Claude Vision / Gemini Vision) — assesses tampering, vehicle-type match, condition
- **Form auto-fill:** OCR extracts fields from RC photo → pre-fills form. VAHAN validates a subset of fields (RC validity, ownership, expiry) rather than all fields, to keep API cost down

✅ **Virtual + physical evaluation flow:**
- Virtual = photos + videos + optional video call → gives the system its first quote
- Physical = when the vehicle reaches the **Auraiya facility** (or partner RVSF facility), team inspects in person → sets the **actual final price** → tells the customer with reasoning *(Founder, 2026-05-11)*
- Pickup happens after virtual quote is mutually agreed; physical eval happens on arrival at facility, and final price is reconciled there

❓ **Trigger conditions for needing extra physical info before pickup** (e.g., customer disputes virtual quote) — to be locked.

---

## 4. Marketplace mechanics

✅ **Pricing:** ₹0.75/kg (2W) or ₹1/kg (4W). First-come-first-served. No bidding.

✅ **Lead exclusivity:** Once a partner RVSF buys a lead, it is **removed from the marketplace immediately** (exclusive purchase).

✅ **Returns:** If the lead doesn't mature, it **returns to the marketplace**. Purchase fee is **non-refundable**.

✅ **Information masking pre-purchase** *(Founder agreed PM proposal, 2026-05-11)*:
- **Visible:** vehicle category, make + model, year, weight class, city + pincode prefix, distance from RVSF, "Aadhaar verified" badge, **blurred photos** (sharp ones unlock on purchase)
- **Hidden until purchase:** customer name, phone, exact address, RC number, sharp photos, contact info

✅ **Lead quality score** *(Founder agreed PM proposal, 2026-05-11)*:
- Bronze (mobile + VAHAN)
- Silver (+ Aadhaar)
- Gold (+ photo + AI condition score)

✅ **Lead expiry / freshness window: 2 weeks** *(Founder, 2026-05-11.)* After 2 weeks unbought, lead moves to a **revival queue** — team reaches back to the customer to revive it before re-listing.

✅ **Triage routing — human-in-the-loop** *(Founder, 2026-05-11)*:
- After Tier-3 verification, lead goes to an **admin triage queue** (a new admin page)
- Founder's team reviews the lead and chooses one of three actions:
  - **Approve for Auraiya** (own RVSF, preferential routing)
  - **Approve for marketplace** (other RVSFs)
  - **Reject** (quality concern)
- AI verification flags surface here so the team can act on them
- **No fully-automated routing in v1.** The team is in the loop, period.

✅ **Anti-hoarding and inactivity — soft, not enforced** *(Founder, 2026-05-11)*:
- **No hard rules at start.** PM's earlier proposal of "watch / penalty for low-maturity buyers" is deferred.
- Instead: **alerting system inside the platform** — when an RVSF hasn't taken action on a relevant lead in their area, the ScrapCentre team gets a notification. Team manually calls the RVSF and pitches the lead.
- This becomes a **lead-conversion ops function** — relationship-building disguised as nudges.

✅ **Watch / favourite without buying** *(Founder agreed PM proposal, 2026-05-11)* — competitive-interest signal helps PM team time their nudges.

✅ **Re-listed lead transparency** *(Founder agreed PM proposal, 2026-05-11)* — when a returned-to-marketplace lead reappears, label it ("previously offered, did not mature").

❓ **Auraiya catchment definition** — founder proposed using a "Locate me" geolocation feature in the form, computing distance-from-Auraiya rather than maintaining a static pincode list. PM endorses; concrete cutoff distance (km radius) still to be picked.

❓ **Auraiya preferential routing flavour** — implicit from §4 above: routing is **human-in-the-loop**. The team chooses Auraiya OR marketplace per lead. So "preferential" = team's discretion, not an automated rule. To be confirmed: do we still want a 2-hour exclusive window for Auraiya, OR is it purely the triage decision?

---

## 5. Communication module (chat + negotiation)

✅ **Customer ↔ partner-RVSF communication happens on the platform** (lock-in mechanism).

✅ **Module type:** chat with **negotiation** functionality. Not just messaging.

✅ **Chat scope:** **text + photo sharing**. No voice notes / video / call scheduling in v1. *(Founder, 2026-05-11.)*

✅ **Off-platform contact handling** *(Founder, 2026-05-11)*:
- After buying the lead, the RVSF sees the chat window with the customer's contact info unlocked
- The RVSF **can choose to take the conversation off-platform** (their discretion). The platform doesn't actively mask phone numbers / WhatsApp inside chat.
- Trade-off accepted: faster deal closing wins over data lock-in for v1. We can always tighten later if RVSFs go dark.

---

## 6. Partner RVSF onboarding

✅ **Final state = Assisted Self-Serve** *(Founder, 2026-05-11)* — manual KYC verification call by ScrapCentre team is **always required** before activation. No fully-self-serve activation in v1 or v2.

✅ **Phased ramp:**
- **Months 1–3 (manual everything):** team identifies 5–10 high-fit RVSFs from VAHAN portal, calls/visits, signs MOU, manually creates account. No public signup form.
- **Months 4+ (assisted self-serve, permanent):** public landing page at `/rvsf` with signup form. Submission → team gets notified → calls within 24h → KYC + intent check → activate if fit.
- ~~Months 7+ (true self-serve)~~ **Removed.** Team-in-the-loop verification is permanent.

---

## 7. ScrapCentre OS (parallel product)

✅ **Separate product from the lead marketplace** but lives in the same brand. RVSF management software, ERP-style. Trojan horse: free for active lead-buyer RVSFs, paid otherwise.

✅ **Features (the eight gaps vs Scrapon):**
1. Direct DigiELV integration for CD lifecycle tracking (scope contingent on partnership — see §13)
2. ESG impact reporting (CO₂, plastic, steel recovery) — exportable for OEM EPR
3. Read-only regulator dashboards (SPCB, CPCB)
4. Multi-RVSF benchmarking analytics for partners in the network
5. Tally / GST e-invoicing / QuickBooks / Zoho exports
6. Pickup logistics auto-routing (Crossroads / Helpline / AAI partnerships)
7. API connections to recycler buyers + OEM EPR portals
8. AI-based loss/theft anomaly detection (weight reconciliation, dual-inspection variance)

✅ **Pricing tiers:**
- Free (active lead-buyer with ≥5 leads/month) — full features
- Standard ₹50,000/year (single RVSF, basic features)
- Pro ₹1,50,000/year (full features + ESG dashboard + APIs + DigiELV integration)
- Enterprise custom (₹3–10 lakh/year, multi-state, dedicated support)

✅ **Migration from Scrapon:** Auraiya currently runs on Scrapon. We **build the migration tool ourselves** for our own switch — it doubles as the migration path for any partner RVSF that comes from Scrapon. *(Founder, 2026-05-11.)*

❓ **OS codebase** — same monorepo as scrapcentre.com or separate? Founder said "can be different, still in progress, will see how to implement." Architect to weigh in.

❓ **OS v1 ship target** — strategy says Month 4–6. Realistic given everything else is starting from zero. To re-baseline.

---

## 8. External integrations & current state

| Integration | Purpose | Status (founder, 2026-05-11) | Owner / next action |
|---|---|---|---|
| **VAHAN API** | Vehicle data auto-fill, RC verification, ownership check | Application submitted, in progress | Founder pushes for status update weekly |
| **DigiLocker** | Aadhaar eKYC at scale (offline-KYC XML pull) | Application submitted, in progress | Founder pushes for status update weekly |
| **Aadhaar / UIDAI** | Customer identity verification | Applications submitted, some in progress | Confirm specific service |
| **DigiELV / MMCM** | CD trading platform | **Likely won't sign partnership.** Plan B: instruct customer + RVSF on what to do in their own DigiELV logins. Still exploring. *(Founder, 2026-05-11.)* | PM still recommends sending the Appendix-B memo in Month 2 — costs nothing |
| **WhatsApp Business API** | Customer comms, keyword auto-quote | Founder asks: **can we get the API directly from Meta?** | See §8a below |
| **SMS / OTP provider** | Mobile OTP for verification | **Developers are setting up MSG91** *(Founder, 2026-05-11)* | Confirm DLT registration started |
| **AI document verification** | RC OCR, vehicle photos, Aadhaar checks | **Build in-house**, not buy. Approach locked in §3c. *(Founder, 2026-05-11.)* | Architect to design pipeline |
| **Google Maps Distance Matrix** | Pickup pricing | Already integrated | — |
| **Cloudinary** | Document storage | Already integrated | Reused for AI verification pipeline |
| **MongoDB Atlas** | Primary database | Integrated; **leaked credentials must be rotated out-of-band** (see `07-tech-debt-and-security.md`) | Founder action: rotate |

### 8a. WhatsApp Business API — direct from Meta vs. via a BSP

The founder asked: "can we get WhatsApp Business API ourselves?" Short answer: **yes, but in practice you'll still want a BSP layer on top.** Here's the comparison:

| Approach | Pros | Cons | Recommended for |
|---|---|---|---|
| **Meta Cloud API (direct)** | Free hosting (Meta hosts the API), no BSP middleman, full control of templates, lower per-message cost | You handle: phone number verification + Facebook Business Manager setup + template approvals + webhook infra + retries + queueing + DLT-equivalent compliance + chatbot logic | Larger orgs with engineering capacity |
| **BSP-managed (AiSensy / Gupshup / Wati / Interakt)** | Approved templates faster, drag-drop chatbot UI, pre-built keyword routing, no infra to manage, vendor handles compliance | Per-message premium (₹0.10–0.30 over Meta cost), vendor lock-in for templates | Speed-to-market — your case |

**PM recommendation:** Start with a **BSP for the customer-facing keyword flow** (CALC / BIKE / SAFE / PICKUP) — speed matters in v1. Use **Meta Cloud API direct** when you've outgrown the BSP (Year 2+) and want margin back.

Default BSP pick for ScrapCentre's scale and audience: **AiSensy** (cheapest reliable Indian BSP, good for Hindi-belt comms, decent template approval speed). Alternatives: **Gupshup** (most features, more expensive), **Wati** (best UX, mid-priced).

❓ **Founder pick** — AiSensy unless reason to differ?

---

## 9. Operational state of the platform (as of 2026-05-11)

✅ **No production traffic yet.** Site is live but unadvertised. Lead-funnel issues fixable before any real users hit them.

✅ **Nobody currently handles inbound leads.** Founder's developer will sit with the team for a few days **~1 month from now** to set up handling. *(Founder, 2026-05-11.)*

✅ **Auraiya RVSF currently runs on Scrapon software** (third-party paid SaaS). Will be migrated to ScrapCentre OS once OS ships, using a migration tool we build ourselves.

✅ **Year 1 phasing:** Founder wants to start ASAP. *(Founder, 2026-05-11.)* "Month 0" effectively starts when the developer's team-handover happens (~1 month away).

❓ **Live production deployment target** (scrapcentre.com) — `wrangler.toml` says Cloudflare Pages static export but the app needs server-side APIs. Founder said "Novalytix is hosting." Specific platform (Vercel? Node host? Cloudflare with `next-on-pages`?) to be confirmed by founder asking Novalytix.

✅ **Dummy / staging deployment target** (scrapcentre.online) **LOCKED** *(Founder, 2026-05-11; refined 2026-05-12)*: **single throwaway LXC** on the founder's own **Proxmox cluster** (`thegreatcluster`). Production will eventually move to whatever infra Novalytix runs — the dummy is purely a preview environment for the founder + Novalytix to review the new build, then tear down.
- New **LXC container** on `prox` (R720, 192.168.0.250). Suggested IP: 192.168.0.210 (next free). Suggested specs: 4 cores / 8 GB RAM / 30 GB ZFS.
- Container runs: Node.js 20 + the Next.js app (built from the fork branch) + nginx reverse proxy + `cloudflared` (Cloudflare Tunnel daemon).
- **External exposure via Cloudflare Tunnel** — no port forwarding on the MikroTik router needed. Cloudflare DNS (CNAME `scrapcentre.online` → tunnel ID) handles the public domain. Free, secure.
- **Intentionally NOT integrated** with the founder's existing Proxmox services (Postgres CT 200 / MinIO CT 204 / n8n CT 202 / WAHA CT 205 / Redis CT 201). Those are production services for other workloads — the dummy stays isolated.
- **Database:** keep MongoDB Atlas (already in code, zero migration). Use the same Atlas credentials the codebase already targets.
- **Object storage:** keep Cloudinary (already in code, zero migration).
- **All external services that aren't real yet** (WhatsApp / SMS / VAHAN / DigiLocker / AI verification / DigiELV / dealer prices / new-vehicle prices) are **mocked via the `lib/services/mock/` adapter layer** per engineering-design §5. Mocks are toggleable from admin per service.
- **Disposable by design:** `pct destroy` removes everything; spin up fresh with one shell script.

Future evolution path (post-dummy, separate decisions):
- Swap MongoDB Atlas → in-cluster Mongo or Postgres CT 200 — when production migrates to founder's infra
- Swap Cloudinary → MinIO CT 204 — when KYC privacy / cost matters
- Swap AiSensy WhatsApp BSP → WAHA CT 205 — when dummy ships
- Add n8n CT 202 routing automation — when triage volume justifies it

Full Proxmox infrastructure reference: `~/Documents/Proxmox/infrastructure-reference.md` (left untouched by this project).

---

## 10. Team setup

✅ Multi-agent team operating via Claude Code:
- **PM** — Claude (Opus) in PM voice. Routes the conversation, owns prioritisation and product spec.
- **Software Architect** — Claude (Sonnet) sub-agent. Understanding doc: `architect-understanding.md` (873 lines). Engaged when system-design questions arise.
- **UI/UX Designer** — Claude (Sonnet) sub-agent. Understanding doc: `uiux-understanding.md` (602 lines). Engaged when product flow is locked.
- **(Future)** engineer/contributor agents for actual code PRs once spec + design are locked.

✅ **Persistence model:** because `SendMessage` is not available in this Claude Code environment, agents are spawned fresh per turn. Continuity comes from reading the understanding docs + this `product-decisions.md`. **Always re-brief spawned agents with these docs.**

---

## 11. Current blockers (timeline-critical)

| # | Blocker | Status | Owner |
|---|---|---|---|
| 1 | Pick WhatsApp BSP | PM recommends AiSensy; founder to confirm | Founder |
| 2 | SMS provider (MSG91) — DLT registration | In progress (developers) | Developers |
| 3 | VAHAN API approval | In progress | Founder + UIDAI/MoRTH |
| 4 | DigiLocker approval | In progress | Founder + UIDAI |
| 5 | AI document verification — build vs buy decision | **Build in-house**, locked. Architect to design. | Architect (next) |
| 6 | Rotate MongoDB Atlas credentials | Open | Founder |
| 7 | Confirm live deployment target | Open | Founder asks developer |
| 8 | Pick partnership candidates: 2 banks + 2 insurers | PM to deliver outreach doc; founder picks targets | PM (now) → Founder |

---

## 12. Immediate next concrete steps (PM's recommended sequence)

1. ✅ **PM session 1 + 2** — locked ~95% of v1 product spec (this doc).
2. **PM drafts Finance + Insurance partnership outreach doc** (`partnership-outreach-finance-insurance.md`) — founder asked for this. ← **Now.**
3. **Architect engaged** to translate this spec into a system design doc — data model changes, new API surface, calculator architecture, verification state machine, marketplace mechanics, chat module, triage queue. Architect needs founder's go-ahead to start.
4. **UI/UX Designer engaged** to take this spec + persona docs + Hindi-first audience and produce a UX flow → wireframes → eventually clickable mockups. Can run in parallel with Architect after Architect's first pass.
5. **Founder works the long-pole external dependencies in parallel** (blockers list above).
6. **Architect's design + UI/UX flow handed to the developer** as a bundle of small PRs once both are ready.

Realistic timeline if the next PM session locks the remaining ❓ items:
- This week: PM finishes outreach doc (today/tomorrow)
- Week 1: Architect's design doc
- Week 2: UI/UX flow doc + initial wireframes (in parallel with Architect)
- Week 3: First batch of small, mergeable PRs handed to developer when they sit with the team

---

## Decision log (chronological — append, never edit)

- **2026-05-11 (PM session 1)** — Founder confirmed: ScrapCentre takes per-lead fee only (₹0.75/₹1 per kg). **No commission on the completed scrap transaction.** Future monetisation = OS, Green Finance, Green Insurance, CD Buyer fee, dealer referrals, enterprise.
- **2026-05-11 (PM session 1)** — Founder confirmed: two-question entry questionnaire ("scrap?" + "buy?") fanning into Type A / Type B / Type C, with commercial / fleet sub-options. Calculator is the hero. AI-driven document verification (no humans in loop). Marketplace = first-come-first-served, masked, non-refundable, lead returns on non-maturity. Chat + negotiation module on platform. Partner onboarding = self-serve form + manual team verification call.
- **2026-05-11 (PM session 1)** — Founder confirmed integrations status: VAHAN / DigiLocker / Aadhaar applications submitted (some in progress); WhatsApp BSP, SMS provider, AI verification vendor not yet chosen; live deployment by founder's developer, no real traffic yet.
- **2026-05-11 (PM session 1)** — UI/UX Designer hired into the team. Understanding doc landed at `uiux-understanding.md`. Active engagement deferred until product flow is locked.
- **2026-05-11 (PM session 2)** — Founder pointed at Spinny.com/scrap-car as reference UX. Locked the **three-tier reveal** of the calculator: Tier 1 anonymous → half calculation; Tier 2 OTP → full calculation; Tier 3 commit → documents + Aadhaar. Estimate range tolerance ±20%.
- **2026-05-11 (PM session 2)** — Locked marketplace: blurred photos pre-purchase, Bronze/Silver/Gold quality scores, **2-week** lead expiry then revive queue, **human-in-the-loop triage** (Auraiya / marketplace / reject), **soft anti-hoarding** via team-alerting (not penalty rules), watch/favourite + re-listed transparency.
- **2026-05-11 (PM session 2)** — Locked chat: text + photos only; RVSF has discretion to take conversation off-platform after purchase.
- **2026-05-11 (PM session 2)** — Locked partner onboarding: cap at **assisted self-serve** (manual KYC call always required). No fully-self-serve in v1 or v2.
- **2026-05-11 (PM session 2)** — Locked Green Finance + Green Insurance margin posture: take only marketing-cost-recovery margin, pass max benefit to customer. Same for dealer-discount tie-ups (skip commission, push extra discount). Coming-Soon UI for all three until partners signed.
- **2026-05-11 (PM session 2)** — Locked AI document verification approach: **build in-house** using OCR + VAHAN API + DigiLocker + vision LLM, not pay-per-call to a KYC SaaS. Vehicle photos via Claude/Gemini Vision; RC via OCR + VAHAN spot-check; Aadhaar via DigiLocker offline-KYC.
- **2026-05-11 (PM session 2)** — Locked physical evaluation flow: virtual eval first (photos/video/video call), pickup happens after virtual quote agreement, **physical eval at the Auraiya facility on arrival** sets the actual final price.
- **2026-05-11 (PM session 2)** — Locked Aadhaar-RC mismatch handling: ask for ownership transfer / legal heir proof, do not reject.
- **2026-05-11 (PM session 2)** — Locked migration tool: **build it ourselves** (Scrapon → ScrapCentre OS). Doubles as migration path for partner RVSFs from Scrapon.
- **2026-05-11 (PM session 2)** — DigiELV partnership: **likely won't sign**. Plan B = instruct customer + RVSF on their own DigiELV logins. Still exploring.
- **2026-05-11 (PM session 2)** — Operational timing: developer team-handover ~1 month away → effective "Month 0" of the strategy. Founder wants to start ASAP.
