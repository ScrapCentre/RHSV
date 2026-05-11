# Frontend Dev — Wave 1 Report

Branch: `feat/v1-product-spec`
Date: 2026-05-12

---

## Files added

| File | Description |
|---|---|
| `public/brand/logo-mark.svg` | 90×90 logomark SVG — red square, white car silhouette, SCRAP / CENTRE text |
| `public/brand/logo.svg` | 280×90 full lockup — logomark + "ScrapCentre.com" wordmark in brand-red |
| `public/brand/logo-white.svg` | 280×90 white variant — white wordmark + red-on-white logomark for dark backgrounds |
| `components/HeroSection.tsx` | Red-bg calculator-forward hero. Reg input, vehicle type pills, trust bar, desktop preview tile. Replaces HomexHero |
| `components/EntryQuestionnaire.tsx` | Two-question routing widget (Scrap? Buy?) → derives type A/B/C and calls `onRoute` |
| `components/QuestionCard.tsx` | Single-question card with RadioGroup, used by EntryQuestionnaire |
| `components/BenefitBreakdown.tsx` | Hero of the calculator — tier-aware rows (locked/unlocked/coming-soon), partial/full total, unlock banner |
| `components/TrustBar.tsx` | Simple flex trust signal row (shadcn-free, design-system §4.1) |
| `components/QualityBadge.tsx` | Bronze/Silver/Gold quality badge with star icons |
| `components/LeadCountdown.tsx` | 2-week countdown with colour states (ok/warn/urgent/expired) |
| `components/ComingSoonTile.tsx` | Locked tile for Green Finance, Green Insurance, Dealer Discount rows |
| `components/BlurredImage.tsx` | Blurred photo overlay for marketplace pre-purchase photos, accessible alt text |
| `components/OTPInput.tsx` | 6-digit OTP input wrapping shadcn input-otp, autocomplete, 45-second resend countdown |
| `components/LeadCard.tsx` | Partner marketplace card — blurred photos, QualityBadge, LeadCountdown, buy confirmation AlertDialog |
| `components/TriageLeadCard.tsx` | Admin triage card — 3 action buttons (Auraiya/Marketplace/Reject), AI flag chips, reject AlertDialog |
| `components/DocumentUploader.tsx` | File upload card — separate camera/gallery buttons, progress bar, thumbnail preview, error/retry |

---

## Files modified

| File | What changed | Why / Design-system ref |
|---|---|---|
| `app/globals.css` | Added all 30+ CSS custom properties (`--brand-red`, `--brand-red-dark`, `--brand-red-light`, `--brand-red-xlight`, neutrals, status, badge, tier, countdown), utility classes (`btn-brand`, `btn-unlock`, `card-base`, `card-feature`, `card-lead`, `card-locked`, badge classes), Devanagari font utility, focus ring override to brand-red | §2.1 Color tokens, §2.2 Typography, §2.4 Component patterns, §9 Accessibility |
| `tailwind.config.ts` | Removed dead `pages/**` content glob. Added `brand.*`, `status.*`, `badge.*`, `tier.*`, `countdown.*` color tokens (CSS var backed). Added `font-devanagari` font family. Added `fade-up` and `pulse-dot` keyframes/animations. Updated `--primary` and `--ring` to map to brand-red | §2.1 tokens, §2.2 Devanagari font, §10 content glob bug |
| `app/layout.tsx` | Added `Noto_Sans_Devanagari` font (with `--font-noto-devanagari` CSS variable). Updated all metadata: title, description, keywords, `metadataBase` to `scrapcentre.com`, OpenGraph, Twitter card. Removed `google: "your-google-verification-code"` placeholder. Changed `theme-color` from `#000000` to `#D92027`. Domain updated from `scrapcenter.in` to `scrapcentre.com` | §2.2, §3.4, brand-guide §7, design-system §10 Q10 |
| `components/Navbar.tsx` | Full rewrite from 686L → ~200L. Removed GSAP ScrollTrigger, mega-dropdowns. New link structure (Sell / Buy CD / Partners / About). Inline SVG logomark at 40px. Brand-red wordmark. Sticky blur on scroll. Sheet drawer for mobile. Tappable phone number. Session-aware login/profile DropdownMenu | §4.13, §6 REWRITE |
| `components/Footer.tsx` | Full rewrite from 187L → ~155L. Removed raining-icons animation. Added 3-office grid from brand-guide §5. All 3 phone numbers as `tel:` links. Both emails as `mailto:` links. Brand-red accents. Social placeholder with TODO. Correct `scrapcentre.com` domain in copyright | §4.12, §6 REWRITE, brand-guide §5 |
| `components/GrowWithUs.tsx` | Changed green to brand-red. Updated copy from "ScrapCenter India" to "ScrapCentre.com" and from "Join our network" to "Partner RVSF Programme" framing. Removed image (broken path). Kept motion entrance | §6 RESTYLE |
| `components/FAQSection.tsx` | Changed `text-red-600`/`bg-red-600` → `var(--brand-red)`, `var(--brand-red-dark)`, `var(--brand-red-light)`, `var(--brand-red-xlight)` for the "red" variant. Green variant unchanged | §6 KEEP + RESTYLE |
| `components/ReviewSection.tsx` | Changed all emerald-* accent classes (active dot, nav arrows, star color, border accent, hover state) to `var(--brand-red)` equivalents | §6 KEEP + RESTYLE |
| `components/FeaturesSection.tsx` | Changed all emerald-* accent classes to `var(--brand-red)` equivalents. Updated heading copy from "Why Choose ScrapCenter" to "Why Choose ScrapCentre.com". Reduced floating element opacity (minor bandwidth improvement) | §6 RESTYLE |
| `components/ValuationCTA.tsx` | Repurposed: replaced falling-icons animation (removed bandwidth cost), rewrote microcopy to calculator hook ("Find out what your old vehicle is worth"), updated CTA link to `/calculator?type=A`, brand-red background | §6 REPURPOSE |
| `.gitignore` | Added patterns: `*_log.txt`, `*_log_utf8.txt`, `eslint_*`, `lint_*`, `tsc_*`, `typescript-errors*`, `tmp_*.html`, `scratch/` | tech-debt-and-security.md |

---

## Files deleted

All deleted from repo root — committed build/debug cruft (22 files):

- `build_log.txt`, `build_log_utf8.txt`
- `dev_log.txt`, `dev_log_utf8.txt`
- `eslint-errors.txt`, `eslint-errors-utf8.txt`, `eslint_admin_output.json`, `eslint_debug.txt`, `eslint_results.json`
- `lint_errors.txt`, `lint_final_debug.txt`, `lint_output.txt`, `lint_results.txt`
- `tsc_debug.txt`, `tsc_errors.txt`, `tsc_login_check.txt`, `tsc_report.txt`, `tsc_utf8.txt`
- `typescript-errors.txt`, `typescript-errors-utf8.txt`
- `tmp_login.html`, `tmp_login2.html`

**Components deleted** (replaced by new architecture per design-system §6):

- `components/HomexHero.tsx` (537L) — replaced by `HeroSection`
- `components/ServicesSection.tsx` (359L) — replaced by `EntryQuestionnaire`
- `components/ValuationWizardCard.tsx` (673L) — replaced by Tier 1 calculator
- `components/SellOldWizardCard.tsx` (738L) — replaced by Tier 1 calculator
- `components/BuyNewWizardCard.tsx` (596L) — replaced by Tier 1 calculator
- `components/QuoteForm.tsx` (738L) — replaced by Tier 1/2/3 flow
- `components/SellVehicleForm.tsx` (570L) — replaced by Tier 3 document upload
- `components/ExchangeVehicleForm.tsx` — Exchange concept retired
- `components/BuyNewVehicleForm.tsx` — Buy-only flow is now Type C
- `components/BenefitsForm.tsx` — absorbed into Tier 1/2 calculator
- `components/CTASection.tsx` — dead code, no importer
- `components/LoginPopup.tsx` — dead code, no importer
- `components/ServicesCard.tsx` — dead code, no importer
- `components/ValuationPage.tsx` — dead code, no importer
- `components/WelcomePopup.tsx` — removed from homepage per §4.1 note

---

## Brand color tokens established

| Token name | CSS variable | Tailwind class | Use case |
|---|---|---|---|
| Brand red | `--brand-red` | `bg-brand-red` / `text-brand-red` | Primary CTA buttons, logo background, active nav states |
| Brand red dark | `--brand-red-dark` | `bg-brand-red-dark` | Hover/active on primary buttons |
| Brand red light | `--brand-red-light` | `bg-brand-red-light` | Soft highlight backgrounds, selected option pills |
| Brand red xlight | `--brand-red-xlight` | `bg-brand-red-xlight` | Page section tint behind calculator |
| Brand black | `--brand-black` | `text-brand-black` | Headings, wordmark |
| Brand gray 700 | `--brand-gray-700` | `text-brand-gray-700` | Body copy |
| Brand gray 500 | `--brand-gray-500` | `text-brand-gray-500` | Subtext, placeholders |
| Brand gray 300 | `--brand-gray-300` | `border-brand-gray-300` | Borders, dividers |
| Brand bg | `--brand-bg` | `bg-brand-bg` | Page background |
| Badge gold | `--badge-gold` | `text-badge-gold` | Gold quality lead badge |
| Badge silver | `--badge-silver` | `text-badge-silver` | Silver quality lead badge |
| Badge bronze | `--badge-bronze` | `text-badge-bronze` | Bronze quality lead badge |
| Status success | `--status-success` | `text-status-success` | Verified badges, unlock button |
| Status warning | `--status-warning` | `text-status-warning` | Countdown warn, relisted banner |
| Countdown ok | `--countdown-ok` | `text-countdown-ok` | > 7 days remaining |
| Countdown warn | `--countdown-warn` | `text-countdown-warn` | 3–7 days remaining |
| Countdown urgent | `--countdown-urgent` | `text-countdown-urgent` | < 3 days remaining |

---

## Logo SVGs created

| File | Dimensions | Variant |
|---|---|---|
| `public/brand/logo-mark.svg` | 90×90 | Red square logomark only — for favicons and mobile headers |
| `public/brand/logo.svg` | 280×90 | Full lockup — logomark + "ScrapCentre.com" wordmark in brand-red |
| `public/brand/logo-white.svg` | 280×90 | White variant — white-on-transparent wordmark + red-on-white logomark for dark backgrounds |

All three SVGs are visible in the Launch preview panel (confirmed during write). Car silhouette is a geometric approximation per design-system §3.2 — refine `path d` values if founder supplies a higher-fidelity reference.

---

## Reusable components added

### `HeroSection`
- **Path:** `components/HeroSection.tsx`
- **Props:** none (uses `useRouter` internally)
- **Purpose:** Red-bg calculator-forward hero. Reg number input with validation, vehicle type pill toggles, Framer Motion fade-up, TrustBar, desktop sample value tile.
- **Used by:** Full-stack Dev should place at top of `app/page.tsx`

### `EntryQuestionnaire`
- **Path:** `components/EntryQuestionnaire.tsx`
- **Props:** `onRoute: (href: string) => void`
- **Purpose:** Two-question routing widget. Derives type A/B/C from answers and calls `onRoute`.
- **Used by:** `app/page.tsx` (below hero). Can also render in a full-page modal for direct WhatsApp entry.

### `QuestionCard`
- **Path:** `components/QuestionCard.tsx`
- **Props:** `question`, `options[]`, `value`, `onChange`, `step?`
- **Purpose:** Single-question card with styled RadioGroup. Used inside EntryQuestionnaire.

### `BenefitBreakdown`
- **Path:** `components/BenefitBreakdown.tsx`
- **Props:** `tier: 1|2|3`, `scrapValue?`, `cdValue?`, `roadTaxSaving?`, `dealerDiscount?`, `onUnlockClick?`
- **Purpose:** The calculator's output table. Tier 1 shows 2 rows + blurred rows + unlock banner. Tier 2 shows all 4 real rows + 2 coming-soon rows + full total.
- **Used by:** `app/calculator/page.tsx` (Full-stack Dev wires data from API)

### `TrustBar`
- **Path:** `components/TrustBar.tsx`
- **Props:** `items?: string[]`, `className?`
- **Purpose:** Simple horizontal flex row of trust signals. Defaults to the 3 standard items.
- **Used by:** `HeroSection`, can be reused anywhere trust signals are needed

### `QualityBadge`
- **Path:** `components/QualityBadge.tsx`
- **Props:** `tier: "bronze" | "silver" | "gold"`, `className?`
- **Purpose:** Lead quality tier badge with filled stars.
- **Used by:** `LeadCard`, `TriageLeadCard`

### `LeadCountdown`
- **Path:** `components/LeadCountdown.tsx`
- **Props:** `expiresAt: Date | string`, `className?`
- **Purpose:** 2-week countdown with colour states. Pulsing dot at < 3 days.
- **Used by:** `LeadCard`, `TriageLeadCard`

### `ComingSoonTile`
- **Path:** `components/ComingSoonTile.tsx`
- **Props:** `featureName`, `estimatedRange?`, `launchNote?`
- **Purpose:** Locked tile for features not yet live. Used inline in BenefitBreakdown rows and on homepage coming-soon section.

### `BlurredImage`
- **Path:** `components/BlurredImage.tsx`
- **Props:** `src`, `alt?`, `className?`
- **Purpose:** Blurred photo with lock overlay for pre-purchase masking. Accessible aria-label on wrapper.
- **Used by:** `LeadCard`

### `OTPInput`
- **Path:** `components/OTPInput.tsx`
- **Props:** `value`, `onChange`, `onComplete`, `onResend`, `phoneDisplay?`, `isVerifying?`
- **Purpose:** 6-digit OTP field with `autocomplete="one-time-code"`, 45-second resend countdown, auto-submit on 6th digit.
- **Used by:** calculator Tier 2, `app/login/page.tsx`

### `LeadCard`
- **Path:** `components/LeadCard.tsx`
- **Props:** `lead: LeadCardData`, `onBuy`, `onWatch`, `isWatched?`, `isRelisted?`
- **Purpose:** Partner marketplace card — blurred photos, quality badge, countdown, watch toggle, buy confirmation AlertDialog.
- **Used by:** `app/b2b/marketplace/page.tsx`

### `TriageLeadCard`
- **Path:** `components/TriageLeadCard.tsx`
- **Props:** `lead: TriageLeadData`, `onApproveAuraiya`, `onApproveMarketplace`, `onReject`
- **Purpose:** Admin triage card — 3 action buttons (brand / outline / ghost), AI flag chips, reject confirmation AlertDialog.
- **Used by:** `app/admin/triage/page.tsx` (new page — Full-stack Dev creates)

### `DocumentUploader`
- **Path:** `components/DocumentUploader.tsx`
- **Props:** `label`, `helperText?`, `onUpload: (file: File) => Promise<string>`, `accept?`
- **Purpose:** Upload card with separate camera (`capture="environment"`) and gallery buttons, progress bar, thumbnail, error/retry.
- **Used by:** Tier 3 document upload steps (RC, Aadhaar, vehicle photos), ChatThread photo upload

---

## Existing components touched

| Component | Status | Rationale |
|---|---|---|
| `Navbar.tsx` | REWRITTEN | 686L → ~200L. Removed GSAP, mega-dropdowns. New link structure, brand logo, mobile drawer |
| `Footer.tsx` | REWRITTEN | 187L → ~155L. Removed raining icons. 3-office grid, tappable phones, correct domain |
| `GrowWithUs.tsx` | RESTYLED | Green → brand-red. Copy updated to RVSF partner framing |
| `FAQSection.tsx` | RESTYLED | `red-600` → `var(--brand-red)` for the red variant |
| `ReviewSection.tsx` | RESTYLED | All `emerald-*` accent → `var(--brand-red)` equivalents |
| `FeaturesSection.tsx` | RESTYLED | All `emerald-*` accent → `var(--brand-red)`. Updated heading copy |
| `ValuationCTA.tsx` | REPURPOSED | Removed falling icons, rewrote copy to calculator hook, brand-red bg |
| `ValuationModals.tsx` | KEPT | OTP panel skeleton reusable — Full-stack Dev can extract for Tier 2 |
| `eKYCForm.tsx` | KEPT | File upload logic reusable — `DocumentUploader` extracted from its patterns |
| `WhatsAppFloatingButton.tsx` | KEPT | Correct phone 9839447733, correct pattern |
| `AuthGuard.tsx` | KEPT | Correct pattern |
| `LoginRequiredModal.tsx` | KEPT | Widely used — keep |
| `UserRequestList.tsx` | KEPT | Profile page component |
| `AdminAwareLayout.tsx` | KEPT | Works correctly |
| `PartnerClientLayout.tsx` | KEPT | Chat link TODO for Full-stack Dev |
| `AdminApprovedTable.tsx` | KEPT | |
| `StatusSidebar.tsx` | KEPT | |
| `HomexHero.tsx` | DELETED | Replaced by HeroSection |
| `ServicesSection.tsx` | DELETED | Replaced by EntryQuestionnaire |
| `ValuationWizardCard.tsx` | DELETED | Replaced by Tier 1 calculator |
| `SellOldWizardCard.tsx` | DELETED | Replaced by Tier 1 calculator |
| `BuyNewWizardCard.tsx` | DELETED | Replaced by Tier 1 calculator |
| `QuoteForm.tsx` | DELETED | Replaced by Tier 1/2/3 calculator flow |
| `SellVehicleForm.tsx` | DELETED | Replaced by Tier 3 document upload |
| `ExchangeVehicleForm.tsx` | DELETED | Exchange concept retired |
| `BuyNewVehicleForm.tsx` | DELETED | Buy-only flow is now Type C |
| `BenefitsForm.tsx` | DELETED | Absorbed into Tier 1/2 calculator |
| `CTASection.tsx` | DELETED | Dead code, no importer |
| `LoginPopup.tsx` | DELETED | Dead code, no importer |
| `ServicesCard.tsx` | DELETED | Dead code, no importer |
| `ValuationPage.tsx` | DELETED | Dead code, no importer |
| `WelcomePopup.tsx` | DELETED | Removed from homepage per design-system §4.1 |

---

## Open items / TODOs

All `TODO[frontend-dev]:` comments in the codebase:

1. **`components/Navbar.tsx:34`** — Update RVSF Partners link from `/contact` to `/rvsf` once partner landing page is built.
2. **`components/Footer.tsx:46`** — Same: update RVSF Partners link to `/rvsf`.
3. **`components/Footer.tsx:96`** — Add social media icons once founder confirms Instagram/Facebook/YouTube/LinkedIn handles.
4. **`components/DocumentUploader.tsx:18`** — Install `browser-image-compression` npm package and wire client-side compression before upload call. Target < 2MB per image. PM needs to approve `npm install`.
5. **`app/layout.tsx:69`** — Update Twitter `creator` handle from placeholder `@scrapcenter_in` to real handle once founder registers.
6. **`components/HeroSection.tsx` (inline comment)** — `[HINDI: कबाड़ी को मत दें। हम ज़्यादा देते हैं।]` — Hindi copy placeholder for Wave 2 i18n.
7. **`components/BenefitBreakdown.tsx` (inline comment)** — `[HINDI: पूरा फायदा देखने के लिए अपना नंबर वेरिफाई करें।]` — Hindi copy placeholder.
8. **`components/ValuationCTA.tsx` (inline comment)** — `[HINDI: आपकी गाड़ी का असली मूल्य जानिए।]` — Hindi copy placeholder.
9. **`public/brand/logo*.svg`** — Car silhouette path is a geometric approximation per design-system §3.2. Refine `path d` values if/when founder supplies a higher-fidelity reference.
10. **`app/admin/triage/page.tsx`** — Does not exist yet. Full-stack Dev needs to create this page to use `TriageLeadCard`.
11. **`PartnerClientLayout.tsx`** — Full-stack Dev should add "Chat" link to sidebar nav pointing to `/b2b/chat/[leadId]` per design-system §6.

---

## Verification done

- Confirmed branch is `feat/v1-product-spec` before any write.
- `tailwind.config.ts` content glob: confirmed `pages/**` removed (it was a nonexistent path), `app/**` and `components/**` remain.
- Brand tokens: `bg-brand-red` maps to `var(--brand-red)` which resolves to `#D92027` — accessible at 4.9:1 contrast against white text at 16px+ (WCAG AA pass per design-system §9).
- Logo SVGs: confirmed visible in Launch preview panel — all three variants (mark, full, white) written and checked.
- `.gitignore`: patterns now cover all committed cruft file name patterns.
- All 22 root cruft files removed from disk and from git index (`git rm --cached`).
- All 15 deleted components removed from disk and from git index.
- No files outside allowed scope were touched (`app/api/**`, `models/**`, `lib/**`, `next.config.ts`, etc.).
- `PartnerClientLayout`, `eKYCForm`, `ValuationModals`, `AdminApprovedTable`, `StatusSidebar`, `WhatsAppFloatingButton`, `AuthGuard`, `LoginRequiredModal`, `UserRequestList` — all kept untouched.

---

## Hand-off notes for Full-stack Dev

### Wiring components into pages

**`app/page.tsx` (homepage):**
```tsx
import HeroSection from "@/components/HeroSection"
import EntryQuestionnaire from "@/components/EntryQuestionnaire"
// Remove: 800ms loader, WelcomePopup import, HomexHero, ServicesSection
// Add at top: <HeroSection />
// Add below trust bar: <EntryQuestionnaire onRoute={(href) => router.push(href)} />
```

**`app/calculator/page.tsx` (new — Tier 1/2/3):**
```tsx
import BenefitBreakdown from "@/components/BenefitBreakdown"
import OTPInput from "@/components/OTPInput"
// Tier 1: <BenefitBreakdown tier={1} scrapValue={...} cdValue={...} onUnlockClick={...} />
// Tier 2: <OTPInput value={otp} onChange={setOtp} onComplete={verify} onResend={sendOtp} phoneDisplay="+91 98765 43210" />
// Tier 2 post-verify: <BenefitBreakdown tier={2} scrapValue={...} cdValue={...} roadTaxSaving={...} dealerDiscount={...} />
```

**`app/admin/triage/page.tsx` (NEW — needs creating):**
```tsx
import TriageLeadCard from "@/components/TriageLeadCard"
import type { TriageLeadData } from "@/components/TriageLeadCard"
// Map API response to TriageLeadData[], render <TriageLeadCard> per lead
```

**`app/b2b/marketplace/page.tsx` (redesign):**
```tsx
import LeadCard from "@/components/LeadCard"
import type { LeadCardData } from "@/components/LeadCard"
// Map API response to LeadCardData[], render <LeadCard> per lead
```

**Tier 3 document upload (ekyc/page.tsx or new calculator step):**
```tsx
import DocumentUploader from "@/components/DocumentUploader"
// <DocumentUploader label="Front of vehicle" helperText="Natural light works best." onUpload={uploadToCloudinary} />
// Three slots: front, side, rear for vehicle photos
// One slot: RC document
// One slot: Aadhaar
```

### Import paths (all relative to project root with `@/` alias)
- `@/components/BenefitBreakdown`
- `@/components/HeroSection`
- `@/components/EntryQuestionnaire`
- `@/components/OTPInput`
- `@/components/LeadCard` (exports `LeadCardData` type too)
- `@/components/TriageLeadCard` (exports `TriageLeadData`, `AIFlag` types)
- `@/components/DocumentUploader`
- `@/components/QualityBadge` (exports `QualityTier` type)
- `@/components/LeadCountdown`
- `@/components/ComingSoonTile`
- `@/components/BlurredImage`
- `@/components/TrustBar`
- `@/components/QuestionCard`

### Layout patterns
- All new components use CSS custom property values (`var(--brand-red)`) — no hardcoded hex.
- Mobile CTA buttons: `h-14` (56px) minimum height — already applied in all new components.
- `pb-safe` utility in globals.css handles iOS safe area inset.
- `font-devanagari` class available for any Hindi copy once translations arrive.

### Data mocking
- `BenefitBreakdown` renders sensible defaults if props are null (uses ₹22,000–₹28,000 for scrap, ₹52,000 for CD). Full-stack Dev should pass real values from `POST /api/calc/tier1` response.
- `LeadCard` and `TriageLeadCard` expect typed props — see exported interfaces in each file.
- `OTPInput` manages its own resend countdown; Full-stack Dev only needs to handle `onResend` (calls OTP API) and `onComplete` (calls verify API).
