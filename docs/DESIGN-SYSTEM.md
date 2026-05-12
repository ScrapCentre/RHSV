# Design System & Wireframes — ScrapCentre.com Dummy v1

This document is the design source of truth for the dummy v1 implementation of ScrapCentre.com. It covers brand application, design tokens, logo recreation, screen-by-screen wireframes with real microcopy, and a full hand-off brief for the Frontend Developer. Every decision here is grounded in the product spec (`product-decisions.md`), the brand guide (`brand-guide.md`), the persona set (`scrapcentre_strategy.txt`), and the UX audit (`uiux-understanding.md`). The calculator is the hero. Mobile-first is not a footnote — it is the primary rendering target. Trust is earned through specificity, founder face, and math, not through marketing language.

---

## 1. Design philosophy

**Mobile-first, low-bandwidth, zero-assumption.** The target scrap-side audience (P1–P4) is on ₹8,000–₹20,000 Android handsets, often on slow 4G or 3G in tier-2 and tier-3 UP cities. Every animation, every font weight, every image is a bandwidth tax. We keep the page weight lean, the critical path fast, and the above-the-fold content interactive before any non-essential asset loads. We remove the 800ms artificial loading screen entirely. The Three.js, GSAP particle animations, and background video inherited from v1 are stripped from the critical consumer path. shadcn/ui components + Tailwind utility classes are the full rendering budget. Framer Motion is permitted for subtle transitions only — entrance animations that add perceived quality without blocking interactivity.

**Trust-first for a low-trust, high-stakes, one-time decision.** Scrapping a vehicle is as emotionally charged as writing a will or settling an estate. The P2 Sentimental Owner does not trust a website; they trust a person. The P3 Inheritor is anxious and will read the fine print. The P1 Pragmatic Upgrader will sniff out a fake calculator in 3 seconds. Trust is not built through "100% Safe" badge icons or SSL lock graphics — it is built through the founder's face appearing in the hero, through rupee numbers that are specific (₹87,400 not "up to a lakh"), through a math breakdown that can be audited, and through a phone number that is large, real, and tappable. Every design decision is filtered through one question: does this make a 58-year-old retired government employee in Auraiya trust us enough to hand over his father's Fiat Padmini?

**The calculator is the conversion event, not the form.** The v1 architecture put the form first and the number second. v2 inverts this completely. The benefit number — broken down into scrap value, CD value, road tax concession, dealer discount — appears before any lead capture. The user earns the right to be asked for their phone number by seeing a real number first. The Tier 1 → Tier 2 → Tier 3 reveal is the product's primary UX pattern. The form is not the hero. The rupee number is. The form is the reward for believing the number. Every layout, every scroll direction, every CTA on every page pushes toward the calculator output and then pulls the user forward from it.

---

## 2. Brand application

### 2.1 Color tokens (CSS custom properties)

Add to `app/globals.css` inside `:root { }`:

```css
:root {
  /* Brand primaries */
  --brand-red:         #D92027;
  --brand-red-dark:    #A8161C;
  --brand-red-light:   #FCE5E6;
  --brand-red-xlight:  #FFF5F5;

  /* Neutrals */
  --brand-black:       #0A0A0A;
  --brand-gray-900:    #111827;
  --brand-gray-700:    #374151;
  --brand-gray-500:    #6B7280;
  --brand-gray-300:    #D1D5DB;
  --brand-gray-100:    #F3F4F6;
  --brand-white:       #FFFFFF;
  --brand-bg:          #FAFAFA;

  /* Status / functional */
  --status-success:    #10B981;
  --status-warning:    #F59E0B;
  --status-error:      #D92027;  /* same as brand-red — deliberate */
  --status-info:       #3B82F6;

  /* Lead quality badges */
  --badge-bronze:      #CD7F32;
  --badge-bronze-bg:   #FDF3E3;
  --badge-silver:      #8B949E;
  --badge-silver-bg:   #F0F3F6;
  --badge-gold:        #D4A017;
  --badge-gold-bg:     #FEF9E7;

  /* Tier unlock states */
  --tier-locked:       #9CA3AF;
  --tier-locked-bg:    #F9FAFB;
  --tier-unlocked:     #10B981;

  /* Coming Soon tiles */
  --coming-soon-bg:    #F3F4F6;
  --coming-soon-text:  #6B7280;
  --coming-soon-badge: #374151;

  /* Countdown urgency */
  --countdown-ok:      #10B981;
  --countdown-warn:    #F59E0B;  /* < 5 days remaining */
  --countdown-urgent:  #D92027;  /* < 2 days remaining */
}
```

| Token | Hex | Use case |
|---|---|---|
| `--brand-red` | `#D92027` | Primary CTA buttons, logo background, active nav states, required asterisks |
| `--brand-red-dark` | `#A8161C` | Hover/active on primary buttons |
| `--brand-red-light` | `#FCE5E6` | Soft highlight backgrounds, selected option pills |
| `--brand-red-xlight` | `#FFF5F5` | Page section tint behind the calculator |
| `--brand-black` | `#0A0A0A` | Headings, wordmark |
| `--brand-gray-700` | `#374151` | Body copy |
| `--brand-gray-500` | `#6B7280` | Subtext, placeholders, muted labels |
| `--brand-gray-300` | `#D1D5DB` | Borders, dividers, disabled states |
| `--brand-bg` | `#FAFAFA` | Page background |
| `--badge-gold` | `#D4A017` | Gold quality lead badge — used in both marketplace and calculator |
| `--badge-silver` | `#8B949E` | Silver quality lead badge |
| `--badge-bronze` | `#CD7F32` | Bronze quality lead badge |
| `--coming-soon-badge` | `#374151` | Dark pill badge on locked tiles |

### 2.2 Typography

**Primary font:** Inter (Variable) — already loaded in `app/layout.tsx`. Use for all UI text in the dummy.

**Secondary font:** Noto Sans Devanagari — loaded but not applied to any copy in the English-only dummy. Declare in `globals.css` as a `@font-face` or Google Fonts import, attach to a `.font-devanagari` utility class. The Frontend Dev should add it to the `<head>` in `layout.tsx` alongside Inter using `next/font/google` with `subsets: ['devanagari']` and `display: 'swap'`.

**Type scale (Tailwind class reference):**

| Token / Use | Class | Size | Weight | Line height |
|---|---|---|---|---|
| Landing hero headline | `text-4xl md:text-6xl` | 36px / 60px | 800 (ExtraBold) | 1.1 |
| Section heading | `text-2xl md:text-3xl` | 24px / 30px | 700 (Bold) | 1.2 |
| Card heading | `text-xl` | 20px | 700 | 1.3 |
| Calculator rupee output | `text-5xl md:text-7xl` | 48px / 72px | 800 | 1.0 |
| Body copy | `text-base` | 16px | 400 | 1.6 |
| Form labels | `text-sm` | 14px | 500 | 1.4 |
| Fine print / legal | `text-xs` | 12px | 400 | 1.5 |
| CTA button | `text-base` | 16px | 600 | 1.0 |
| Nav items | `text-sm` | 14px | 500 | 1.0 |

**Wordmark treatment:** `ScrapCentre.com` in Inter Bold (`font-weight: 700`). The `.com` suffix renders at Inter SemiBold weight 600, one size step smaller than "ScrapCentre" (e.g., if ScrapCentre is 20px, `.com` is 16px), color `--brand-red`. This mirrors the letterhead treatment where `.com` is visually subordinate but part of the brand.

**Hindi placeholder strings** (marked `[HINDI: ...]` in the microcopy section) will use `font-family: 'Noto Sans Devanagari', Inter, sans-serif` when the translator provides them. Design inputs, buttons, and labels with enough width slack to accommodate 20–30% longer Hindi strings.

### 2.3 Spacing & layout grid

**Base unit:** 8px. All spacing values are multiples of 4px (half-base) or 8px.

**Container widths:**
- Mobile: full width with 16px horizontal padding (`px-4`)
- Tablet: full width with 24px horizontal padding (`px-6`)
- Desktop: max-width 1200px, centred, 32px horizontal padding (`max-w-6xl mx-auto px-8`)
- Wide content (marketing sections): max-width 1400px (`max-w-7xl`)

**Breakpoints (Tailwind defaults, used as follows):**
- `sm` (640px): minor layout shifts, two-column grids
- `md` (768px): tablet — calculator side-by-side layout, nav changes
- `lg` (1024px): desktop — full sidebar visible in B2B portal
- `xl` (1280px): hero layout widens, more whitespace

**Section rhythm:** 64px (`py-16`) between major page sections on desktop; 40px (`py-10`) on mobile.

**Touch targets:** minimum 44×44px for all interactive elements. CTA buttons on mobile: minimum `h-14` (56px) height, full-width (`w-full`) on mobile, auto-width on desktop.

**Calculator card:** on mobile, occupies full viewport width minus 32px padding. On desktop, max-width 600px, centred or left-aligned in a two-column layout beside the trust signals column.

### 2.4 Component patterns

**Button variants** (extend shadcn `Button`):
```
variant="brand"       — bg-[--brand-red] text-white hover:bg-[--brand-red-dark], shadow-sm
variant="outline"     — border-2 border-[--brand-red] text-[--brand-red] hover:bg-[--brand-red-light]
variant="ghost"       — text-[--brand-gray-700] hover:bg-[--brand-gray-100]
variant="white"       — bg-white text-[--brand-black] shadow-md (for use on red hero backgrounds)
variant="unlock"      — bg-[--status-success] text-white — used on OTP/unlock CTAs only
```
All primary CTAs use `variant="brand"`. The "unlock" green is reserved exclusively for the OTP verification step to signal the state change from locked to unlocked.

**Card variants** (extend shadcn `Card`):
```
card-base     — bg-white rounded-2xl shadow-md border border-[--brand-gray-300] p-6
card-feature  — card-base + hover:shadow-lg hover:-translate-y-1 transition-all
card-lead     — card-base for marketplace lead cards, relative overflow-hidden
card-locked   — bg-[--coming-soon-bg] rounded-2xl border-dashed border-2 border-[--brand-gray-300]
```

**Badge variants** (extend shadcn `Badge`):
```
badge-bronze  — bg-[--badge-bronze-bg] text-[--badge-bronze] border border-[--badge-bronze]
badge-silver  — bg-[--badge-silver-bg] text-[--badge-silver] border border-[--badge-silver]
badge-gold    — bg-[--badge-gold-bg] text-[--badge-gold] border border-[--badge-gold]
badge-coming  — bg-[--coming-soon-badge] text-white rounded-full text-xs px-2 py-0.5
badge-verified — bg-emerald-50 text-emerald-700 border border-emerald-200
badge-ai-flag  — bg-amber-50 text-amber-700 border border-amber-200 (admin triage only)
```

**Blurred-image pattern** (for marketplace pre-purchase photos):
```
<div class="relative rounded-xl overflow-hidden">
  <img src="..." class="w-full h-48 object-cover blur-sm scale-105" alt="Vehicle photo — unlock to view" />
  <div class="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
    <div class="flex flex-col items-center gap-1 text-white text-center">
      <LockIcon class="w-6 h-6" />
      <span class="text-xs font-medium">Buy lead to unlock</span>
    </div>
  </div>
</div>
```
Alt text reads: "Vehicle photo — purchase lead to view full detail" — accessible and descriptive without revealing PII.

**Locked-tile pattern** ("Coming Soon" and "Verify to Unlock"):
Two distinct overlays on the same base `card-locked` component:

*Coming Soon overlay:*
```
<div class="relative card-locked flex flex-col gap-2 p-6 items-start opacity-70">
  <div class="badge-coming">Coming Soon</div>
  <p class="text-sm font-medium text-[--coming-soon-text]">[Feature name]</p>
  <p class="text-2xl font-bold text-[--brand-gray-300]">₹ — — —</p>
  <p class="text-xs text-[--brand-gray-500]">Estimated: ₹X–₹Y/year once live</p>
</div>
```

*Unlock overlay (Tier 1 blurred calculator rows):*
```
<div class="relative">
  <div class="blur-[3px] select-none pointer-events-none">
    [Actual value content, rendered but obscured]
  </div>
  <div class="absolute inset-0 flex items-center justify-start pl-4">
    <button class="btn-unlock text-sm">Verify number to unlock →</button>
  </div>
</div>
```

**Quality-tier badge component** (`<QualityBadge tier="bronze|silver|gold" />`):
```
Badge renders as:
  Bronze → [★] Bronze — mobile only + VAHAN verified
  Silver → [★★] Silver — + Aadhaar verified
  Gold   → [★★★] Gold — + Photos + AI condition score
```
Place in top-right corner of the lead card, absolutely positioned.

**Countdown component** (`<LeadCountdown expiresAt={Date} />`):
```
> 7 days: "12 days left" in --countdown-ok green
3–7 days: "5 days left" in --countdown-warn amber, bold
< 3 days: "2 days left" in --countdown-urgent red, bold, optionally pulsing dot
Expired:  "Revival queue" in --brand-gray-500, italic
```
Position below the lead card heading. On mobile, display inline with vehicle info. On desktop, right-align in the card header row.

---

## 3. The logo

### 3.1 Description for recreation

The ScrapCentre.com logo consists of two visual elements side by side: a **logomark** (left) and a **wordmark** (right).

**Logomark:** A square with strongly rounded corners (border-radius approximately 22% of width — roughly `rx="20"` on a 90×90 SVG canvas). Background fill: `#D92027` (brand red). Inside the square, vertically stacked:
1. A white stylised car silhouette, top-down or 3/4 front view — simple, bold, 2–3 stroke weight, not photorealistic. The car shape is a compact hatchback/sedan outline: rounded roof, distinct bonnet, four wheel arches suggested by curves at the bottom corners. Occupies roughly the top 55% of the interior square.
2. Below the car icon, two lines of white uppercase bold sans-serif text: "SCRAP" on the first line, "CENTRE" on the second line. Both lines centred. Font: Inter ExtraBold (or equivalent geometric sans). Letter-spacing: slightly tracked out (0.05em). The text occupies the bottom 35% of the interior, with 5% padding at the bottom edge.

**Wordmark (beside the logomark):** "ScrapCentre" in Inter Bold, `#D92027`, followed immediately by ".com" in Inter SemiBold, the same red but at ~75% the font size of "ScrapCentre". No space between "ScrapCentre" and ".com" — they are visually one string with a weight/size break at the period.

**Clearspace:** minimum logomark-width / 4 on all sides of the full lockup.

### 3.2 Inline SVG logomark

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" width="90" height="90" role="img" aria-label="ScrapCentre logo mark">
  <!-- Red rounded square background -->
  <rect width="90" height="90" rx="18" ry="18" fill="#D92027"/>

  <!-- Stylised car body — compact hatchback silhouette, white -->
  <!-- Roof + cabin -->
  <path d="M22 46 Q22 34 32 30 L42 26 Q48 24 52 26 L62 30 Q68 34 68 46 Z"
        fill="white" opacity="0.95"/>
  <!-- Lower body / chassis -->
  <rect x="18" y="46" width="54" height="14" rx="4" fill="white" opacity="0.95"/>
  <!-- Wheel arches (cutouts from body colour) -->
  <circle cx="31" cy="60" r="8" fill="#D92027"/>
  <circle cx="59" cy="60" r="8" fill="#D92027"/>
  <!-- Wheels (white rings) -->
  <circle cx="31" cy="60" r="7" fill="none" stroke="white" stroke-width="3"/>
  <circle cx="59" cy="60" r="7" fill="none" stroke="white" stroke-width="3"/>
  <!-- Windshield detail -->
  <path d="M33 44 Q34 35 41 31 L49 31 Q56 35 57 44 Z"
        fill="#D92027" opacity="0.6"/>

  <!-- "SCRAP" text -->
  <text x="45" y="75" text-anchor="middle"
        font-family="Inter, Helvetica, Arial, sans-serif"
        font-weight="800" font-size="9" fill="white" letter-spacing="1.5">SCRAP</text>
  <!-- "CENTRE" text -->
  <text x="45" y="84" text-anchor="middle"
        font-family="Inter, Helvetica, Arial, sans-serif"
        font-weight="800" font-size="8" fill="white" letter-spacing="1">CENTRE</text>
</svg>
```

Note to Frontend Dev: the SVG path for the car is a simplified geometric approximation. Refine the `path d` values to produce a cleaner silhouette on a real screen. The proportions are the spec — rounded square, white car above, two lines of white text below, everything centred.

### 3.3 Wordmark spec

```html
<a href="/" class="flex items-center gap-3 select-none">
  <!-- Logomark SVG here (40×40 on nav, 60×60 on footer) -->
  <span class="text-xl font-bold leading-none" style="color: #D92027;">
    ScrapCentre<span class="text-base font-semibold">.com</span>
  </span>
</a>
```

In the navbar: logomark at 40px square, wordmark at `text-xl` (20px). In the footer: logomark at 52px square, wordmark at `text-2xl`. Do not use a separate logotype image file — render the wordmark in HTML/CSS so it scales cleanly and remains searchable.

### 3.4 Favicon spec

- `favicon.ico`: 32×32 and 16×16 versions of the logomark (just the red square + car icon, no text).
- `apple-touch-icon.png`: 180×180, the full logomark with text.
- `favicon-32x32.png`: Export from the SVG above at 32px.
- Metadata in `app/layout.tsx`: `icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' }`.

---

## 4. Wireframes — page by page

---

### 4.1 Landing / homepage (`app/page.tsx`)

**Persona primary:** P1 Pragmatic Upgrader on desktop; P4 Two-Wheeler Owner on mobile. P2 Sentimental Owner is the secondary — their trust signal (founder face) appears as a secondary element below the calculator.

**ASCII layout sketch (mobile, scroll order):**

```
┌─────────────────────────────────┐
│  NAVBAR (sticky, white, shadow) │
│  [Logo]   ScrapCentre.com  [☰]  │
└─────────────────────────────────┘
│                                 │
│  ╔═══════════════════════════╗  │
│  ║   HERO SECTION (red bg)   ║  │
│  ║                           ║  │
│  ║  "Don't let the kabadi    ║  │
│  ║   steal ₹70,000 from you" ║  │
│  ║                           ║  │
│  ║  [Enter reg. number    ]  ║  │
│  ║  [Get My Car's Value →]   ║  │
│  ║                           ║  │
│  ║  ──── or select ────      ║  │
│  ║  [Car] [Bike] [Truck]     ║  │
│  ╚═══════════════════════════╝  │
│                                 │
│  ┌─ TRUST BAR ───────────────┐  │
│  │ ✓ Govt Authorised RVSF    │  │
│  │ ✓ 4,200+ vehicles scrapped│  │
│  │ ✓ Free Pickup, same week  │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌─ TWO QUESTIONS ───────────┐  │
│  │ Scrapping old vehicle?    │  │
│  │ [Yes] [No]                │  │
│  │ Buying new vehicle?       │  │
│  │ [Yes] [No]                │  │
│  │         [Show My Options] │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌─ FOUNDER TRUST BLOCK ─────┐  │
│  │ [Video thumbnail]         │  │
│  │ "Dr. Pranjal explains why │  │
│  │  the kabadi is the most   │  │
│  │  expensive option."       │  │
│  │ [Watch 45-second reel]    │  │
│  └───────────────────────────┘  │
│                                 │
│  HOW IT WORKS (3 steps)         │
│  1. Enter vehicle details       │
│  2. Get your exact value        │
│  3. Free pickup, cash + CD      │
│                                 │
│  REVIEWS (carousel)             │
│                                 │
│  COMING SOON TILES              │
│  [Green Finance] [Green Ins.]   │
│                                 │
│  PARTNER RVSF CTA               │
│  (GrowWithUs variant)           │
│                                 │
│  FOOTER                         │
└─────────────────────────────────┘
```

**Desktop layout:** Hero section becomes two columns. Left: headline + entry questionnaire. Right: immediate calculator widget (reg number input + vehicle type toggles). This removes one navigation step — the landing page IS the calculator entry. The "two questions" block moves below the fold.

**Key components:**
- `Navbar` (redesigned — see 4.13)
- Hero: new `HeroSection` component (replaces `HomexHero`)
- Trust bar: new `TrustBar` component (shadcn-free, simple flex row)
- Entry questionnaire: `EntryQuestionnaire` (new, see 4.2–4.3)
- Founder video block: `FounderVideoBlock` — YouTube embed wrapped in `Card`, placeholder thumbnail until real video exists
- How it works: `HowItWorksSection` — three `Card` components in a row/stack
- `ReviewSection` (KEEP, restyle to brand-red)
- Coming-soon tiles: `ComingSoonTile` × 3
- `GrowWithUs` (RESTYLE, change green to brand-red)
- `Footer` (redesigned — see 4.12)

**Microcopy:**
- Hero headline: "Don't let the kabadi steal ₹70,000 from you."
- Hero subheadline: "Your old vehicle has government-backed value. We calculate the exact number — for free."
- Reg input placeholder: "Enter vehicle registration (e.g., UP32 AB 1234)"
- Reg input helper: "We look up your vehicle details automatically."
- Primary CTA: "Get My Vehicle's Value →"
- Fallback link below input: "Don't have the registration number? Select your vehicle manually →"
- Vehicle type pills: "Car", "Bike", "Truck / Commercial"
- Trust bar items: "Government-authorised RVSF", "4,200+ vehicles scrapped", "Free pickup within 48 hrs"
- Entry questions heading: "Tell us about your situation"
- Q1: "Are you scrapping an old vehicle?" — [Yes, I am] / [No]
- Q2: "Are you buying a new vehicle?" — [Yes, I am] / [No]
- Questionnaire CTA: "Show me what I get →"
- Founder block heading: "Why I started ScrapCentre.com"
- Founder block body: "The kabadi offered my neighbour ₹12,000 for his 2007 Honda City. The government scheme was worth ₹84,000. Nobody told him. That changes now."
- Watch reel CTA: "Watch the 45-second explanation →"
- [HINDI: "कबाड़ी आपसे ₹70,000 चुरा रहा है। हम बताते हैं कितना।"]

**CTAs and routing:**
- "Get My Vehicle's Value" → goes directly to Tier 1 calculator with reg number pre-filled
- "Show me what I get" → reads question answers, routes to Type A / B / C landing (§4.5/4.6/4.7)
- "Watch 45-second explanation" → opens YouTube embed in shadcn `Dialog`

**Notes for Frontend Dev:**
- Remove the 800ms artificial loader (`app/page.tsx:19-27`) entirely.
- Remove `WelcomePopup` from this page — it adds confusion and isn't needed with the new IA.
- The hero background is `--brand-red`. All text within it is white. The reg number input has a white background.
- The "two questions" block is an `EntryQuestionnaire` component with local state. When both questions are answered and "Show me what I get" is clicked, derive type (A/B/C/browse) and `router.push` to the appropriate route.
- Animate hero entrance with a simple `fade-in` + `translate-y` on mount (Framer Motion `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`). No canvas, no GSAP, no Three.js.

---

### 4.2 Entry questionnaire — screen 1 ("Scrap your old vehicle?")

This screen exists as a standalone full-screen modal or page for users who arrive via a direct link or WhatsApp redirect. It is also embedded inline in the homepage below the hero.

**ASCII sketch (mobile, full-screen modal variant):**

```
┌─────────────────────────────────┐
│  ← Back        1 of 2          │
├─────────────────────────────────┤
│                                 │
│  "Are you scrapping an old      │
│   vehicle?"                     │
│                                 │
│  [Vehicle icon — old car]       │
│                                 │
│  ┌─────────────────────────┐    │
│  │  ✓  Yes, I have an old  │    │
│  │     vehicle to scrap    │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │     No, I don't         │    │
│  └─────────────────────────┘    │
│                                 │
│  ─── Special situations ───     │
│  [ ] Commercial vehicle owner   │
│  [ ] Scrapping a fleet / batch  │
│                                 │
│          [Continue →]           │
└─────────────────────────────────┘
```

**Microcopy:**
- Heading: "Are you scrapping an old vehicle?"
- Option A: "Yes — I have an old vehicle I want to scrap"
- Option B: "No — I'm just researching or buying"
- Special situation: "This is a commercial vehicle (truck, bus, auto)"
- Special situation: "I want to scrap multiple vehicles / a fleet"
- Continue CTA: "Continue →"
- Progress indicator: "Step 1 of 2"

**Component:** shadcn `Dialog` or a dedicated `/questionnaire` route. Use `RadioGroup` for the Yes/No options. Checkboxes for the sub-options (can co-select with Yes/No). State is held in parent (or URL params).

---

### 4.3 Entry questionnaire — screen 2 ("Buy a new vehicle?")

```
┌─────────────────────────────────┐
│  ← Back        2 of 2          │
├─────────────────────────────────┤
│                                 │
│  "Are you planning to buy a     │
│   new vehicle?"                 │
│                                 │
│  [Vehicle icon — new shiny car] │
│                                 │
│  ┌─────────────────────────┐    │
│  │  ✓  Yes, I'm buying a   │    │
│  │     new vehicle too     │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │     No, just scrapping  │    │
│  └─────────────────────────┘    │
│                                 │
│  "Not sure? We'll help you      │
│   figure out your best options" │
│                                 │
│          [Show My Options →]    │
└─────────────────────────────────┘
```

**Microcopy:**
- Heading: "And are you planning to buy a new vehicle?"
- Option A: "Yes — I want to buy a new vehicle (car or bike)"
- Option B: "No — I just want to scrap my old one"
- Helper copy: "Your answer affects your total savings. Scrapping + buying gives you the highest combined benefit through the Certificate of Deposit."
- CTA: "Show My Options →"

**Routing logic:**
- Yes + Yes → Type B (`/calculator?type=B`)
- Yes + No → Type A (`/calculator?type=A`)
- No + Yes → Type C (`/calculator?type=C`)
- No + No → Return to homepage, show general info

---

### 4.4 Sub-option screen — commercial / fleet

Renders after screen 1 if the user checked "commercial vehicle" or "fleet".

```
┌─────────────────────────────────┐
│  Commercial / Fleet Enquiry     │
├─────────────────────────────────┤
│                                 │
│  "Commercial scrapping is       │
│   handled differently."         │
│                                 │
│  Number of vehicles:            │
│  [ 1 vehicle ] [ 2–10 ] [ 10+ ] │
│                                 │
│  Vehicle type:                  │
│  [Truck] [Bus] [Auto] [LCV]     │
│                                 │
│  Your name: [____________]      │
│  Phone: [____________]          │
│  Company / fleet name:          │
│  [____________]                 │
│                                 │
│  [Submit Fleet Enquiry]         │
│                                 │
│  "We'll call you within 4 hours │
│   with a tailored quote."       │
└─────────────────────────────────┘
```

**Component:** Simple form, shadcn `Input`, `Select`, `RadioGroup`. Posts to a new `/api/fleet-enquiry` endpoint (Frontend Dev: mock the POST, show success toast).

**Microcopy:**
- Heading: "Great — let's get your fleet scrapped properly."
- Subhead: "We handle everything from a single truck to a 100-vehicle fleet. Same process, faster timeline."
- Submit CTA: "Request Fleet Quote →"
- Success message: "Done. Our team will call you within 4 hours with a tailored quote."
- [HINDI: "बड़े बेड़े के लिए भी हम सब संभालते हैं।"]

---

### 4.5 Type A landing — "You're selling your old vehicle"

Route: `/calculator?type=A` or `/sell`

```
┌─────────────────────────────────┐
│  NAVBAR                         │
├─────────────────────────────────┤
│                                 │
│  "Here's what your old vehicle  │
│   is actually worth."           │
│                                 │
│  CALCULATOR WIDGET              │
│  (Tier 1 state — see §4.8)      │
│                                 │
│  BENEFIT BREAKDOWN              │
│  (blurred rows for locked tiers)│
│                                 │
│  OPTIONAL CD RESALE TILE        │
│  ┌─────────────────────────┐    │
│  │ Sell your CD for extra  │    │
│  │ ₹15,000–₹25,000         │    │
│  │ [Tell me more]          │    │
│  └─────────────────────────┘    │
│                                 │
│  HOW SCRAPPING WORKS            │
│  (3 steps: verify → pickup →   │
│   cash + CD)                    │
│                                 │
│  SENTIMENTAL OWNER BLOCK        │
│  "This was a family vehicle?"   │
│  "We handle it with respect."   │
│                                 │
│  INHERITOR BLOCK                │
│  "Vehicle in deceased name?"    │
│  [We handle the paperwork →]    │
│                                 │
│  FOOTER                         │
└─────────────────────────────────┘
```

**Persona:** P1 primary, P2 and P3 secondary. The sentimental and inheritor blocks are trust signals for P2/P3 — they show ScrapCentre understands their situation.

**Microcopy:**
- Page headline: "Here's what your old vehicle is actually worth."
- Subhead: "Most people get 20% of this. You're about to get all of it."
- CD resale tile heading: "Also: sell your Certificate of Deposit"
- CD resale tile body: "You'll receive a CD when we scrap your vehicle. You can keep it for your next purchase — or sell it to another buyer for ₹15,000–₹25,000 extra."
- Sentimental block: "This was more than just a vehicle, wasn't it? We handle every scrapping with the same respect you'd show a family member. Final photo, proper paperwork, your vehicle's last journey documented."
- Inheritor block: "Is the vehicle registered in a deceased relative's name? We handle the succession paperwork, RC transfer, and RTO requirements. You sign once. We handle everything else."
- Inheritor CTA: "Learn how we handle inherited vehicles →"

---

### 4.6 Type B landing — "You're selling and buying"

Route: `/calculator?type=B` or `/sell-and-buy`

```
┌─────────────────────────────────┐
│  "You're upgrading. Here's your │
│   total savings."               │
├─────────────────────────────────┤
│                                 │
│  COMBINED SAVINGS CALCULATOR    │
│  ┌─────────────────────────┐    │
│  │ Old vehicle scrap value │    │
│  │ + CD savings on new car │    │
│  │ ─────────────────────── │    │
│  │ Total: ₹X,XX,XXX        │    │
│  └─────────────────────────┘    │
│                                 │
│  NEW VEHICLE PICKER             │
│  [What new vehicle? ▼]          │
│  (updates CD calculation)       │
│                                 │
│  DEALER DISCOUNT TILE           │
│  [Coming Soon]                  │
│                                 │
│  GREEN FINANCE TILE             │
│  [Coming Soon]                  │
│                                 │
│  CALCULATOR UNLOCK FLOW         │
│  (Tier 1 → 2 → 3)               │
└─────────────────────────────────┘
```

**Persona:** P1 primary (Pragmatic Upgrader — this is their dream screen). The combined savings number is what they have been calculating on the back of an envelope.

**Microcopy:**
- Headline: "You're scrapping one vehicle and buying another. Here's your full financial picture."
- Combined total label: "Total money you keep, compared to the kabadi route:"
- Old vehicle row: "Scrap value of your old vehicle"
- CD row: "CD savings on your new vehicle purchase"
- New vehicle picker label: "What's your new vehicle?"
- New vehicle picker placeholder: "E.g., Maruti Brezza ZXi, Tata Nexon XZ+"
- Helper under picker: "Your CD value changes based on the new vehicle's on-road price and your state."
- Dealer discount coming-soon: "Dealer discount (3–5%) — launching in Phase 2. Estimated: ₹18,000–₹45,000."
- Green Finance coming-soon: "Green Loan rate reduction (0.25–0.5%) — launching once banking partners are live. Estimated: ₹12,000–₹28,000 over 5 years."

---

### 4.7 Type C landing — "You're buying a new vehicle"

Route: `/calculator?type=C` or `/buy-cd`

```
┌─────────────────────────────────┐
│  "Buying a new car? You're      │
│   leaving ₹50,000 on the table" │
├─────────────────────────────────┤
│                                 │
│  CD BUYER CALCULATOR            │
│  New vehicle: [______________]  │
│  State: [__________]            │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Road tax saving: ₹XX,XXX│    │
│  │ Reg. fee waiver:  ₹X,XXX│    │
│  │ CD purchase cost: -₹X,XX│    │
│  │ ─────────────────────── │    │
│  │ NET SAVING: ₹XX,XXX     │    │
│  └─────────────────────────┘    │
│                                 │
│  HOW CD PURCHASE WORKS          │
│  (3 steps: find CD → buy →     │
│   present at dealer)            │
│                                 │
│  LEGALITY BLOCK                 │
│  "Is this legal? Yes."          │
│  [Government circular link]     │
│                                 │
│  [Help me buy a CD →]           │
└─────────────────────────────────┘
```

**Persona:** P6 CD Buyer exclusively. The tone shifts to Hinglish/English, money-math forward. No emotional imagery. Clean comparison table UX.

**Microcopy:**
- Headline: "Buying a new car? You're leaving ₹50,000 on the table."
- Subhead: "A Certificate of Deposit costs ₹10,000–₹15,000. It unlocks road tax + registration savings worth ₹50,000–₹80,000 on most vehicles. We help you get one."
- Calculator heading: "Calculate your saving"
- Net saving label: "Your net saving with a CD:"
- Legality block heading: "Is this legal?"
- Legality block body: "Yes. The Certificate of Deposit is issued by the government-authorised DigiELV platform (MMCM) under the Vehicle Scrappage Policy. Road tax and registration concessions are mandated by MoRTH notification dated [date]. We are an authorised RVSF — we issue these certificates legally."
- Primary CTA: "Help me buy a Certificate of Deposit →"
- [HINDI: "नई गाड़ी खरीद रहे हैं? ₹50,000 बचाइए।"]

---

### 4.8 Tier 1 calculator — anonymous estimate (half blurred)

Route: `/calculator` (all types pass through this)

```
┌─────────────────────────────────────────────────────────┐
│  CALCULATOR HERO — full-width red background section     │
│                                                         │
│  Headline: "Your [2010 Honda City]'s value: ₹87,400"   │
│  (or "Enter your vehicle details to get started")       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ INPUT ROW                                        │   │
│  │ [Reg number input]      [Look up →]              │   │
│  │ — or manually select —                           │   │
│  │ [Brand ▼] [Model ▼] [Year ▼] [State ▼]          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  BENEFIT BREAKDOWN CARD (white card on red bg)          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ✓ Scrap value        ₹22,000–₹28,000 (±20%)     │   │
│  │ ✓ CD value           ₹52,000       ← VISIBLE     │   │
│  │ ░ Road tax saving    ██████████    ← BLURRED     │   │
│  │ ░ Dealer discount    ██████████    ← BLURRED     │   │
│  │ ░ Green Finance      [Coming Soon]               │   │
│  │ ░ Green Insurance    [Coming Soon]               │   │
│  │ ─────────────────────────────────────            │   │
│  │ TOTAL ESTIMATE:    ₹X,XX,XXX ±20%               │   │
│  │ (shows partial total — blurred rows hidden)      │   │
│  │                                                  │   │
│  │ ┌────────────────────────────────────────────┐   │   │
│  │ │ 🔒 Verify your number to unlock full total │   │   │
│  │ │    "Enter your mobile → OTP → full picture" │   │   │
│  │ │    [Verify Now — It's Free]                 │   │   │
│  │ └────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  TRUST SIGNAL ROW                                       │
│  [Aadhaar verified] [Govt RVSF] [4,200 vehicles done]  │
└─────────────────────────────────────────────────────────┘
```

**Component breakdown:**
- `RegistrationInput` — shadcn `Input` with a right-aligned `Button`, auto-capitalise, regex validation for Indian reg formats
- `VehicleManualSelect` — cascading shadcn `Select`: Brand → Model → Year → State (each unlocks next)
- `BenefitBreakdown` — custom component, each row is a `BenefitRow` with a `locked` prop. Locked rows use the blurred-overlay pattern from §2.4.
- `UnlockPromptBanner` — prominent card with lock icon, shadcn `Button variant="unlock"`

**Microcopy:**
- Reg input placeholder: "UP32 AB 1234"
- Reg input helper: "We look up make, model, year, and owner state automatically."
- Manual select fallback label: "Select your vehicle manually"
- Scrap value label: "Scrap value of your vehicle (estimated)"
- Scrap value subtext: "Based on current scrap metal rates. Pickup cost already deducted."
- CD value label: "Certificate of Deposit value"
- Blurred row label: "Road tax concession"
- Blurred row placeholder text: "Verify to see your state's exact amount"
- Unlock banner heading: "You're seeing 2 of 6 benefit lines."
- Unlock banner body: "Verify your mobile number to unlock your full breakdown — including road tax, dealer discount, and total."
- Unlock CTA: "Verify My Number — It's Free →"
- Total row: "Total benefit (partial, 2 of 6 lines): ₹XX,XXX+"
- Honesty note: "Estimate ±20%. Final value confirmed at pickup."
- [HINDI: "पूरा फायदा देखने के लिए अपना नंबर वेरिफाई करें।"]

**Data shown:** scrap value and CD value are mocked (use lookup tables in `lib/india-data` or a static seed). Other rows blurred. The ±20% honesty band is shown on the scrap value row.

**Mobile considerations:** On screens < 768px, the breakdown card is a scrollable list below the input. The unlock banner is sticky at the bottom of the viewport (fixed position, above the keyboard). Touch target on "Verify Now" is minimum 56px tall.

---

### 4.9 Tier 2 calculator — OTP unlock + full estimate

Triggered by clicking "Verify My Number" from Tier 1.

```
┌─────────────────────────────────┐
│  STEP 1: Enter your mobile      │
│                                 │
│  [+91 │ 98765 43210    ]        │
│  [Send OTP →]                   │
│                                 │
│  ─── after OTP sent ───         │
│                                 │
│  STEP 2: Enter the OTP          │
│                                 │
│  [_ _ _ _ _ _] ← input-otp     │
│  [Verify →]                     │
│  "Resend OTP in 0:45"           │
│                                 │
│  ─── after verify ───           │
│                                 │
│  ✓ FULL BREAKDOWN UNLOCKED      │
│  ─────────────────────────────  │
│  Scrap value:    ₹24,500        │
│  CD value:       ₹52,000        │
│  Road tax (UP):  ₹8,400         │
│  Dealer discount: ₹5,000 est.   │
│  Green Finance:  [Coming Soon]  │
│  Green Insurance:[Coming Soon]  │
│  ─────────────────────────────  │
│  TOTAL:          ₹89,900        │
│  (vs kabadi: ~₹15,000)          │
│                                 │
│  "This is ₹74,900 more than     │
│   what the kabadi would give."  │
│                                 │
│  [Arrange Free Pickup →]        │
└─────────────────────────────────┘
```

**Components:**
- `PhoneInput` — shadcn `Input` with `+91` prefix, numeric only
- `OTPInput` — shadcn `input-otp` (6-digit, auto-submit on last digit entry)
- `BenefitBreakdown` — same component as Tier 1, now with `locked={false}` on all rows
- Comparison footnote — shows kabadi reference number for emotional contrast

**Microcopy:**
- Phone label: "Your mobile number"
- Phone helper: "We send a 6-digit OTP. No spam, no marketing calls without consent."
- Send OTP CTA: "Send OTP →"
- OTP label: "Enter the 6-digit code we sent to +91 XXXXX XXXXX"
- OTP helper: "Didn't receive? Resend in 45 seconds."
- Resend link: "Resend OTP"
- Verify CTA: "Verify →"
- Unlock success toast: "Number verified. Here's your full breakdown."
- Total label: "Your total benefit from the government scheme:"
- Comparison text: "The kabadi would give you approximately ₹12,000–₹20,000. You're entitled to ₹89,900."
- Primary CTA after unlock: "Arrange Free Pickup — I Want This →"
- Secondary link: "What happens next? →" (scrolls to a 3-step explainer)

**OTP autofill note for Frontend Dev:** Use `autocomplete="one-time-code"` on the OTP input. This enables Android SMS-autofill for many devices. On iOS Safari the same attribute triggers the suggestions bar.

---

### 4.10 Tier 3 calculator — documents + Aadhaar upload

Triggered by "Arrange Free Pickup" from Tier 2.

```
┌─────────────────────────────────┐
│  TIER 3: Complete Your Request  │
│  (3 documents needed)           │
├─────────────────────────────────┤
│                                 │
│  STEP 1: Vehicle Photos         │
│  ┌─────────────────────────┐    │
│  │ Upload 3 photos:        │    │
│  │ [Front] [Side] [Rear]   │    │
│  │ Tap to take or upload   │    │
│  └─────────────────────────┘    │
│                                 │
│  STEP 2: RC Document            │
│  ┌─────────────────────────┐    │
│  │ [Upload RC photo]       │    │
│  │ or [Link DigiLocker →]  │    │
│  └─────────────────────────┘    │
│                                 │
│  STEP 3: Aadhaar KYC            │
│  ┌─────────────────────────┐    │
│  │ [Link Aadhaar via       │    │
│  │  DigiLocker →]          │    │
│  │ or upload Aadhaar photo │    │
│  └─────────────────────────┘    │
│                                 │
│  OWNERSHIP NOTE                 │
│  "Vehicle not in your name?"    │
│  [Tell us the situation →]      │
│                                 │
│  [Submit — Confirm Pickup →]    │
│                                 │
│  Fine print: "AI-verified in    │
│  minutes. Human team reviews    │
│  and schedules pickup within    │
│  24 hours."                     │
└─────────────────────────────────┘
```

**Components:**
- `DocumentUploader` — custom component wrapping a hidden `<input type="file" accept="image/*" capture="environment">` with a styled card overlay. Renders upload progress using shadcn `Progress`. Shows thumbnail on success.
- `DigiLockerLink` — placeholder button for now (opens in a new tab to DigiLocker — mock URL in dummy). Shows "Link DigiLocker" with a padlock icon.
- `OwnershipMismatchToggle` — accordion (shadcn `Collapsible`) revealed by "Vehicle not in your name?" CTA.
- `SubmitButton` — `variant="brand"`, full width, disabled until all three upload slots are filled.

**Microcopy:**
- Section heading: "Three things, and we take it from here."
- Vehicle photos label: "Upload clear photos of your vehicle — front, side, and rear"
- Photos helper: "Natural light works best. No need for professional photos."
- RC label: "Upload your Registration Certificate (RC book or smart card)"
- RC helper: "A photo of the front page is enough. Readable, not blurry."
- Aadhaar label: "Verify your identity via Aadhaar"
- Aadhaar helper: "We use this once, to confirm ownership. Stored securely."
- Ownership toggle: "The vehicle is not in my name (inherited, gifted, or transferred)"
- Ownership expand copy: "No problem. If the vehicle is in a deceased relative's name, upload the death certificate and your succession/legal heir document. If it was gifted or transferred, upload the gift deed or NOC. We'll guide you through the rest."
- Submit CTA: "Confirm Pickup Request →"
- Post-submit note: "Our AI checks your documents in minutes. Our team calls you within 24 hours to schedule pickup."
- [HINDI: "दस्तावेज़ अपलोड करें, हम बाकी सब करते हैं।"]

**Mobile considerations:** Each upload slot occupies full width. "Take photo" and "Upload from gallery" are two distinct buttons (not one file picker) — use `capture="environment"` for camera and remove it for gallery. Show file size warning if image > 5MB. Client-side compress before upload (use `browser-image-compression` library).

---

### 4.11 Confirmation / thank-you screen

```
┌─────────────────────────────────┐
│                                 │
│  ✓ (large green checkmark)      │
│                                 │
│  "Your request is confirmed."   │
│                                 │
│  Reference: SC-2026-04721       │
│                                 │
│  "Our team will call you at     │
│   +91 98765 43210 within        │
│   24 hours to confirm pickup."  │
│                                 │
│  ─── What happens next ───      │
│  1. We call to confirm date     │
│  2. Free pickup from your home  │
│  3. Vehicle assessed on arrival │
│  4. Cash + CD issued same day   │
│                                 │
│  [Add to WhatsApp for updates]  │
│                                 │
│  "Questions? Call us:"          │
│  9839447733                     │
│                                 │
│  [Back to Home]                 │
└─────────────────────────────────┘
```

**Microcopy:**
- Headline: "Your request is confirmed. We'll take it from here."
- Reference label: "Your reference number:"
- Next steps heading: "What happens in the next 24–48 hours:"
- Step 1: "We call you to confirm pickup date and time"
- Step 2: "Our team comes to your location — free pickup, no cost to you"
- Step 3: "Vehicle is assessed at our facility — we explain the final price"
- Step 4: "Cash paid, CD issued, RC deregistration filed on the same day"
- WhatsApp CTA: "Add ScrapCentre to WhatsApp for status updates →"
- Phone note: "Or call us directly: 9839447733"
- [HINDI: "आपका अनुरोध पक्का हो गया। अगले 24 घंटों में हम संपर्क करेंगे।"]

---

### 4.12 Footer (used everywhere)

```
┌────────────────────────────────────────────────────────┐
│  [Logo]  ScrapCentre.com                               │
│  A Unit of RestoreHealth Medicare Pvt. Ltd.            │
│                                                        │
│  OFFICES              CONTACT          LINKS           │
│  Head Office:         9839447733       About Us        │
│  26-A & B, Block-E,   9839336644       How It Works    │
│  Panki, Kalpi Road,   8795886699       Sell My Vehicle │
│  Kanpur — 208020                       Buy a CD        │
│                       info@restore..   For RVSF Partners│
│  RVSF Facility:       scrap@gmail.com  Terms & Conditions│
│  Dibiyapur, Auraiya                    Contact Us      │
│                                                        │
│  Branch: Kaushalpuri, Kanpur                           │
│                                                        │
│  ────────────────────────────────────────────────────  │
│  © 2026 ScrapCentre.com · Government-authorised RVSF  │
│  Registered: RestoreHealth Medicare Pvt. Ltd.          │
└────────────────────────────────────────────────────────┘
```

**Components:** Rewrite `Footer.tsx` (remove animated raining icons — they are bandwidth-costly and tonally wrong for the scrap audience). Use a clean 3-column grid (collapses to 1 column on mobile). Phone numbers must be `<a href="tel:9839447733">` links — large, tappable, prominent for P2 audience.

**Note:** Remove all social handle placeholders until founder confirms handles. Show an empty row with `[Social links coming soon]` text or omit entirely.

---

### 4.13 Navbar (used everywhere)

**Mobile (< 768px):**
```
┌─────────────────────────────────┐
│ [Logo] ScrapCentre.com    [☰]  │
└─────────────────────────────────┘
[Drawer opens from right:]
  Get Value →
  Sell My Vehicle →
  Buy a CD →
  For RVSF Partners →
  About Us →
  ─────────────
  [Login / My Account]
  [Contact: 9839447733]
```

**Desktop (≥ 768px):**
```
┌────────────────────────────────────────────────────────────┐
│ [Logo] ScrapCentre.com  │ Sell │ Buy CD │ Partners │ About │
│                                            [Login] [Phone]  │
└────────────────────────────────────────────────────────────┘
```

**Component:** Rewrite `Navbar.tsx` (686L → target ~200L). Remove mega-dropdowns — replace with simple nav links. Remove GSAP ScrollTrigger. Keep session-aware login/profile state using `useSession`. Sticky with `bg-white/95 backdrop-blur-sm shadow-sm` on scroll.

**Nav links:**
- "Sell My Vehicle" → `/calculator?type=A`
- "Buy a CD" → `/calculator?type=C`
- "RVSF Partners" → `/rvsf` (partner landing — not built in dummy, link to `/contact`)
- "About" → `/about`
- Login/profile via shadcn `DropdownMenu`

**Phone number:** always visible on mobile nav (below the hamburger or as a sticky bar). `Call Now: 9839447733` — for P2 who will call rather than form-fill.

---

### 4.14 Login page redesign (`app/login/page.tsx`)

**Target: reduce from 647 lines to ~200 lines.** Single clear purpose: phone OTP (primary), email/password (secondary), B2B login (separate URL `/b2b` or second tab, but visually distinct).

```
┌─────────────────────────────────┐
│  [Logo] ScrapCentre.com         │
│                                 │
│  "Sign in to continue"          │
│                                 │
│  Tabs: [Customer] [RVSF Partner]│
│                                 │
│  ── Customer tab ──             │
│  Mobile number                  │
│  [+91 │ ____________]           │
│  [Send OTP]                     │
│                                 │
│  ── or ──                       │
│                                 │
│  Email: [____________]          │
│  Password: [____________] [👁]   │
│  [Sign In]                      │
│                                 │
│  [Continue with Google]         │
│                                 │
│  ── RVSF Partner tab ──         │
│  User ID: [____________]        │
│  Password: [____________]       │
│  [Sign In as Partner]           │
│                                 │
│  ─────────────────────────────  │
│  No account? [Register here]    │
└─────────────────────────────────┘
```

**Remove from current implementation:** the "Use demo OTP 1234" label in the UI (acceptable in code, not acceptable on screen). Remove the fake OTP hardcode from the visible UI; keep it in `lib/auth.ts` for demo purposes only.

**Component:** shadcn `Tabs`, `Input`, `Button`. OTP panel reuses the same `OTPInput` component from the calculator flow.

**Microcopy:**
- Heading: "Sign in to ScrapCentre.com"
- Phone tab label: "Enter your mobile number"
- Phone helper: "We'll send a 6-digit verification code."
- Send OTP: "Send OTP →"
- Email section divider: "Or sign in with email"
- Google button: "Continue with Google"
- B2B tab label: "RVSF Partner Login"
- B2B user ID label: "Your partner ID (e.g., B2X001)"
- Footer: "New customer? Start by getting your vehicle's value →"

---

### 4.15 Admin triage queue page (NEW — `app/admin/triage/page.tsx`)

This is the new page for human-in-the-loop lead routing. Accessible at `/admin/triage`. Admin role required.

```
┌────────────────────────────────────────────────────────┐
│  ADMIN SIDEBAR (existing)   │  TRIAGE QUEUE            │
│                             │                          │
│                             │  "Pending Quality Leads" │
│                             │  (12 awaiting decision)  │
│                             │                          │
│                             │  [Filter: All / Auraiya  │
│                             │   radius / National]     │
│                             │                          │
│                             │  LEAD CARD × N:          │
│                             │  ┌──────────────────┐    │
│                             │  │ [Gold ★★★]        │    │
│                             │  │ 2010 Honda City  │    │
│                             │  │ Kanpur, UP       │    │
│                             │  │ ~850 kg          │    │
│                             │  │ Aadhaar ✓ RC ✓   │    │
│                             │  │ AI: Condition B+ │    │
│                             │  │ [AI flag: Haze   │    │
│                             │  │  in photo, verify│    │
│                             │  │  rear bumper]    │    │
│                             │  │                  │    │
│                             │  │ [Approve Auraiya]│    │
│                             │  │ [Approve Mktplc] │    │
│                             │  │ [Reject]         │    │
│                             │  └──────────────────┘    │
└────────────────────────────────────────────────────────┘
```

**Components:**
- `TriageLeadCard` — `card-base` with three action buttons. Three buttons use `variant="brand"` (Auraiya), `variant="outline"` (Marketplace), and `variant="ghost"` with destructive colour text (Reject).
- `AIFlagChip` — `badge-ai-flag` (amber). Displays the AI concern text. The AI verification is mocked in dummy — hardcode 1–2 flag types per card (e.g., "Photo haze", "Mileage inconsistency", "RC OCR partial").
- `QualityBadge` — as defined in §2.4.
- `AntiHoardingBanner` (admin-side only, not customer-facing) — above the lead list if any RVSF in the target area has not acted on a comparable lead in 7+ days. Yellow `alert` (shadcn `Alert`) with bell icon: "Kanpur RVSFs have not picked up a 4W lead in 9 days. Consider direct outreach."

**Microcopy:**
- Page heading: "Triage Queue — Quality Leads"
- Subhead: "These leads have completed Tier-3 verification. Route each to Auraiya, the marketplace, or reject."
- Empty state: "No pending leads. You're all caught up."
- Approve Auraiya: "Route to Auraiya →"
- Approve Marketplace: "List on Marketplace →"
- Reject: "Reject Lead"
- Reject confirm (shadcn `AlertDialog`): "Reject this lead? The customer will be notified and offered a re-submission option." — [Cancel] [Confirm Rejection]
- AI flag chip prefix: "AI flag:"
- Anti-hoarding banner text: "[RVSF name or region] has not engaged with leads in [N] days. This may be a relationship-building opportunity."

**Bulk select:** optional for dummy. Add a checkbox column and a "Approve selected for marketplace" button above the list if time allows. Mark as v1.1 in hand-off notes.

---

### 4.16 Partner marketplace page redesign (`app/b2b/marketplace/page.tsx`)

```
┌──────────────────────────────────────────────────────────┐
│  PARTNER SIDEBAR  │  MARKETPLACE                         │
│                   │                                      │
│                   │  "Available leads in your area"      │
│                   │  [Filter: All / 4W / 2W / Distance]  │
│                   │  [Sort: Newest / Price / Distance]   │
│                   │                                      │
│                   │  LEAD CARD (4W example):             │
│                   │  ┌───────────────────────────────┐   │
│                   │  │ [★★★ Gold]        [12 days ⏱] │   │
│                   │  │                               │   │
│                   │  │ [BLURRED PHOTO ×3]            │   │
│                   │  │ [🔒 lock icon centered]       │   │
│                   │  │                               │   │
│                   │  │ 4W • 2010 Honda City          │   │
│                   │  │ Kanpur, UP-32xx               │   │
│                   │  │ ~850 kg · 44 km away          │   │
│                   │  │ [✓ Aadhaar verified]          │   │
│                   │  │                               │   │
│                   │  │ Purchase price: ₹850          │   │
│                   │  │ (850 kg × ₹1/kg)              │   │
│                   │  │                               │   │
│                   │  │ [★ Watch]  [Buy This Lead →]  │   │
│                   │  └───────────────────────────────┘   │
│                   │                                      │
│                   │  [RE-LISTED lead card, amber border]  │
│                   │  "Previously offered — returned       │
│                   │   to marketplace. Not yet scrapped." │
└──────────────────────────────────────────────────────────┘
```

**Components:**
- `LeadCard` — `card-lead` with blurred photos (see §2.4 pattern), `QualityBadge`, `LeadCountdown`, `VerifiedBadge`, watch/buy actions
- `WatchButton` — heart/bookmark icon, toggles local state (not persisted in dummy), shows count
- `BuyButton` — `variant="brand"`, opens shadcn `AlertDialog` for purchase confirmation
- `RelistedBanner` — amber left-border stripe on `card-lead` for re-listed leads, with a small `badge-ai-flag`-styled note
- `FilterBar` — shadcn `Tabs` or toggle group for vehicle type; shadcn `Select` for sort

**Purchase confirmation dialog microcopy:**
- Heading: "Buy this lead?"
- Body: "You'll pay ₹850 for this lead. The purchase is non-refundable. Customer contact, RC, and sharp photos will be unlocked immediately. If the pickup does not complete, the lead returns to the marketplace — no credit issued."
- Confirm: "Confirm Purchase — ₹850 →"
- Cancel: "Go Back"

**Lead card microcopy:**
- Distance: "44 km from your facility"
- Aadhaar badge: "Aadhaar verified"
- Photos locked text: "Sharp photos unlock after purchase"
- Price format: "Lead price: ₹850 (850 kg × ₹1/kg, 4-wheeler rate)"
- Watch button tooltip: "Watch this lead — get notified if status changes"
- Re-listed note: "This lead was previously purchased and returned. Vehicle not yet scrapped."

---

### 4.17 Chat thread page (NEW — `app/b2b/chat/[leadId]/page.tsx`)

```
┌──────────────────────────────────────────────┐
│  PARTNER SIDEBAR  │  CHAT: [Lead ref SC-04721]│
│                   │  2010 Honda City · Kanpur  │
│                   │  ─────────────────────────│
│                   │                           │
│                   │  [Thu 8 May, 2:12 PM]     │
│                   │  ┌─────────────────────┐  │
│                   │  │ Customer:           │  │
│                   │  │ "Kab aayenge pickup │  │
│                   │  │  ke liye?"          │  │
│                   │  └─────────────────────┘  │
│                   │                           │
│                   │         ┌──────────────┐  │
│                   │         │You (RVSF):   │  │
│                   │         │"Kal subah 10 │  │
│                   │         │baje aa sakte │  │
│                   │         │hain."        │  │
│                   │         └──────────────┘  │
│                   │                           │
│                   │  ─── [Photo message] ───  │
│                   │  [thumbnail]              │
│                   │                           │
│                   │  ───────────────────────  │
│                   │  [    Type a message   ]  │
│                   │  [📷] [Send →]            │
└──────────────────────────────────────────────┘
```

**Component:** `ChatThread` — uses a polled fetch (every 5 seconds, `setInterval`) to load new messages from a mock API endpoint (`GET /api/b2b/chat/[leadId]/messages`). Not real-time in dummy. Messages are stored in state. Scroll to bottom on new message.

**Photo upload in chat:** clicking the camera icon opens `<input type="file" accept="image/*">`. On selection, upload to Cloudinary and send the URL as a message. Show upload progress inline.

**Lead info banner (top of chat):**
- Shows lead reference, vehicle type, customer first name (PII unlocked post-purchase)
- Shows customer phone number with `<a href="tel:...">` — partner can call directly (per product decision: off-platform contact is RVSF's discretion)

**Microcopy:**
- Chat heading: "Chat — Lead SC-04721"
- Lead info bar: "2010 Honda City · Kanpur · Priya S. · +91 98765 43210"
- Input placeholder: "Type your message..."
- Photo upload button label: "Send photo"
- Empty state: "No messages yet. Start the conversation to arrange pickup details."
- Info note (below lead info bar): "You may contact the customer directly using the details above. Off-platform communication is at your discretion."
- Photo message caption: "[Photo shared]"

---

### 4.18 Static pages — about / contact / terms

These pages receive a brand-color refresh only. No structural redesign.

**About (`/about`):**
- Replace the "About AutoScrap" heading with "About ScrapCentre.com"
- Add founder block at the top: photo placeholder + "Dr. Pranjal Patel, Founder — physician turned RVSF operator, Auraiya, UP."
- Replace current green accent colors with `--brand-red`
- Remove GSAP particle effects from the about page hero

**Contact (`/contact`):**
- Display all three offices from `brand-guide.md §5` in a clean grid
- All three phone numbers as tappable `<a href="tel:">` links — large, 20px minimum
- Email addresses as `<a href="mailto:">` links
- Contact form (existing) — restyle to brand-red Submit button
- Add a large WhatsApp CTA: "Or WhatsApp us directly: 9839447733" with the WhatsApp green icon (keep the colour — it's a universal signal)

**Terms (`/terms`):**
- No structural change. Add ScrapCentre.com branding (logo in header, brand-red links).
- Update domain references from `scrapcenter.in` to `scrapcentre.com`.

---

## 5. Microcopy library (English, first-person founder voice)

### CTAs (by location)

| Location | CTA Text | Notes |
|---|---|---|
| Homepage hero | "Get My Vehicle's Value →" | Primary — red bg |
| Homepage questionnaire | "Show Me What I Get →" | After both questions answered |
| Tier 1 unlock prompt | "Verify My Number — It's Free →" | Green unlock variant |
| Tier 2 OTP | "Send OTP →" | |
| Tier 2 verify | "Verify →" | Enabled after 6-digit entry |
| Tier 2 post-unlock | "Arrange Free Pickup — I Want This →" | Highest intent CTA |
| Tier 3 submit | "Confirm Pickup Request →" | |
| Confirmation | "Add to WhatsApp for updates →" | |
| Admin triage | "Route to Auraiya →" | |
| Admin triage | "List on Marketplace →" | |
| Marketplace buy | "Buy This Lead →" | |
| Chat | "Send →" | |

### Form labels

| Field | Label | Helper / Placeholder |
|---|---|---|
| Registration | "Vehicle registration number" | "UP32 AB 1234 — we look it up automatically" |
| Brand | "Vehicle brand" | "Maruti, Honda, Hero..." |
| Model | "Model" | "Select brand first" |
| Year | "Year of manufacture" | "Registration year" |
| State | "Your state" | "For road tax calculation" |
| Mobile | "Your mobile number" | "+91 XXXXX XXXXX" |
| OTP | "6-digit code" | "Sent to +91 XXXXX XXXXX" |
| Name | "Your name" | "As on Aadhaar" |
| Address | "Pickup address" | "House/flat, street, city" |
| Pincode | "Pincode" | "For distance calculation" |

### Error messages (honest, not bureaucratic)

| Error | Message |
|---|---|
| Invalid reg number | "That doesn't look like a valid Indian registration. Try the format: XX00 AA 0000" |
| OTP expired | "The code has expired. Request a fresh one below." |
| OTP wrong | "That code doesn't match. Try again, or request a new one." |
| Upload too large | "This photo is over 10 MB. Compress it a bit — or take a new one in normal daylight." |
| Upload failed | "Upload failed — probably a connection issue. Check your signal and try again." |
| Required field | "This is required to continue." |
| API error (generic) | "Something went wrong on our end. Your data is safe — please try again or call 9839447733." |

### Empty states

| Screen | Empty state message |
|---|---|
| Marketplace (no leads) | "No leads available in your filter area right now. Adjust your filters, or check back tomorrow — we post new leads daily." |
| Chat (no messages) | "No messages yet. Send the first one to get the conversation started." |
| Triage queue (empty) | "No leads pending triage. You're up to date." |
| User profile (no requests) | "You haven't submitted a vehicle yet. Start by getting your vehicle's value." |

### Success messages (toasts)

| Event | Toast text |
|---|---|
| OTP sent | "OTP sent to +91 XXXXX XXXXX. Check your messages." |
| OTP verified | "Verified. Here's your full breakdown." |
| Documents uploaded | "Documents received. Our team will review within minutes." |
| Lead purchased | "Lead purchased. Customer details are now unlocked." |
| Chat message sent | "Sent." |
| Lead approved (admin) | "Lead routed to [destination]." |
| Lead rejected (admin) | "Lead rejected. Customer will be notified." |

**Hindi placeholder strings (mark with [HINDI: ] in source code comments):**
```
[HINDI: कबाड़ी को मत दें। हम ज़्यादा देते हैं।]
[HINDI: अपना नंबर वेरिफाई करें, पूरा फायदा देखें।]
[HINDI: आपकी गाड़ी का असली मूल्य जानिए।]
[HINDI: मुफ़्त पिकअप, सब कागज़ हम करते हैं।]
[HINDI: दस्तावेज़ अपलोड करें, हम बाकी सब करते हैं।]
[HINDI: नई गाड़ी खरीद रहे हैं? ₹50,000 बचाइए।]
```

---

## 6. Existing components — change list

| Component | Action | Reason |
|---|---|---|
| `HomexHero.tsx` | DELETE / REPLACE | 537L carousel is the wrong paradigm. Replace with `HeroSection` (new) — single state, calculator-forward |
| `ServicesSection.tsx` | DELETE | 359L tab widget is the v1 paradigm — four-route problem. Replaced by `EntryQuestionnaire` |
| `ValuationWizardCard.tsx` | DELETE | 673L — replaced by the Tier 1 calculator widget |
| `SellOldWizardCard.tsx` | DELETE | 738L — same |
| `BuyNewWizardCard.tsx` | DELETE | 596L — same |
| `ValuationModals.tsx` | REPURPOSE | 390L — the modal skeleton is reusable for OTP flow (Tier 2). Extract the OTP panel, discard the rest |
| `QuoteForm.tsx` | DELETE | 738L — replaced by the Tier 1/2/3 calculator flow |
| `SellVehicleForm.tsx` | DELETE | 570L — replaced by Tier 3 document upload |
| `ExchangeVehicleForm.tsx` | DELETE | "Exchange" as a concept is retired in v2 |
| `BuyNewVehicleForm.tsx` | DELETE | Pure buy flow is now Type C (CD Buyer) |
| `eKYCForm.tsx` | REPURPOSE | 529L — the file upload logic is reusable in Tier 3. Extract `DocumentUploader` component, refactor the KYC form to the new 3-step layout |
| `BenefitsForm.tsx` | DELETE | Absorbed into the Tier 1/2 calculator |
| `ValuationPage.tsx` | DELETE | No importer; dead code |
| `CTASection.tsx` | DELETE | No importer; dead code |
| `LoginPopup.tsx` | DELETE | Dead code; `LoginRequiredModal` covers intent |
| `ServicesCard.tsx` | DELETE | Dead code |
| `FeaturesSection.tsx` | RESTYLE | Keep structure, replace green accent with brand-red, reduce animation |
| `FAQSection.tsx` | KEEP + RESTYLE | Good component. Change `variant="green"` to `variant="red"` as default on homepage |
| `ReviewSection.tsx` | KEEP + RESTYLE | Restyle with brand-red accent for active dot/arrow |
| `GrowWithUs.tsx` | KEEP + RESTYLE | Change green to brand-red. Update copy to "Partner RVSF" framing |
| `ValuationCTA.tsx` | REPURPOSE | Keep the visual structure, rewrite microcopy and CTA to calculator hook |
| `WelcomePopup.tsx` | DELETE | Remove from homepage entirely |
| `AdminAwareLayout.tsx` | KEEP | Works correctly; suppress footer/nav for portal routes |
| `Navbar.tsx` | REWRITE | 686L → ~200L. Remove mega-dropdowns and GSAP. New link structure (§4.13) |
| `Footer.tsx` | REWRITE | 187L → ~150L. Remove animated raining icons. Add 3-office layout |
| `WhatsAppFloatingButton.tsx` | KEEP | Correct phone number, correct pattern — keep as-is |
| `AuthGuard.tsx` | KEEP | Correct pattern |
| `LoginRequiredModal.tsx` | KEEP | Used in many forms — keep |
| `UserRequestList.tsx` | KEEP | Profile page component — keep |
| `PartnerClientLayout.tsx` | KEEP + EXTEND | Add "Chat" link to sidebar nav pointing to `/b2b/chat/[leadId]` |
| `AdminApprovedTable.tsx` | KEEP | |
| `StatusSidebar.tsx` | KEEP | |
| `NotificationBox.tsx` | KEEP | |
| `ExportCSVButton.tsx` | KEEP | |
| `admin/SubcontractingFeed.tsx` | KEEP | |
| `admin/DashboardOverview.tsx` | KEEP | |
| **NEW: `HeroSection.tsx`** | NEW | Calculator-forward hero. Red bg, reg input, vehicle type toggles |
| **NEW: `EntryQuestionnaire.tsx`** | NEW | Two-question routing widget |
| **NEW: `BenefitBreakdown.tsx`** | NEW | Tier-aware breakdown rows with lock/unlock state |
| **NEW: `DocumentUploader.tsx`** | NEW | Reusable file upload with progress, thumbnail preview, camera vs gallery |
| **NEW: `TriageLeadCard.tsx`** | NEW | Admin triage card with 3 action buttons and AI flag chips |
| **NEW: `LeadCard.tsx`** | NEW | Partner marketplace card with blurred photos, quality badge, countdown |
| **NEW: `ChatThread.tsx`** | NEW | Chat UI with polled messages, photo upload |
| **NEW: `QualityBadge.tsx`** | NEW | Bronze/Silver/Gold badge |
| **NEW: `LeadCountdown.tsx`** | NEW | 2-week countdown with colour states |
| **NEW: `ComingSoonTile.tsx`** | NEW | Locked tile for Green Finance, Green Insurance, Dealer Discount |
| **NEW: `TrustBar.tsx`** | NEW | Simple horizontal trust signal row |

---

## 7. Persona-driven design choices

**P2 Sentimental Owner vs P6 CD Buyer** require the most divergent treatment within a unified brand.

P2 arrives with emotional weight, low digital comfort, and distrust of institutions. The design choices for P2: the founder video block appears high on the homepage (not below the fold); phone numbers are large, bold, and tappable at every scroll position; the WhatsApp button fades in at 2 seconds (not 3 — P2 will not wait); the confirmation screen includes "final photo of your vehicle" as a named step, acknowledging the vehicle's history; the inheritance mismatch flow uses plain conversational language ("your relative's name is on the RC — here's how we handle it"), not legal jargon; review testimonials use regional identifiers ("Vijay Singh, Kanpur", "Sunita Devi, Lucknow").

P6 arrives with financial intent, high digital literacy, and legal skepticism. The design choices for P6: the `/calculator?type=C` page opens directly to a comparison table with rupee math; the legality block is above the fold (P6 will ask "is this real?" in the first 10 seconds); the tone shifts from Hindi-first to Hinglish/English ("Your net saving on a Brezza ZXi:"); social proof testimonials cite tier-1 city buyers and specific vehicle models ("Saved ₹52,000 on my Tata Nexon — Bengaluru"); there is no emotional vehicle story copy on the Type C page; the CD purchase process is explained step-by-step with a DigiELV government-platform reference.

**P3 Inheritor** — the inheritance edge case is surfaced as a first-class feature, not an FAQ item. The "Vehicle in deceased relative's name?" toggle in Tier 3 appears without the user having to hunt for it. The legal copy in that section is the one place where slightly more formal language builds trust (P3 is reading for legal authority, not warmth).

**P4 Two-Wheeler Owner** — the vehicle type selection on the landing page includes "Bike" as an equal-weight option to "Car" (not a smaller sub-option). The two-wheeler path skips several steps that are irrelevant (CD resale tile is less prominent; dealer discount is not shown). Page weight matters: no video autoplay on the two-wheeler path, simpler animations.

---

## 8. Mobile-first specifics

**Breakpoints actually used:**
- Mobile default (0–767px): single-column, full-width inputs, bottom-sheet overlays
- `md` (768px): two-column calculator layout, nav switches from hamburger to inline
- `lg` (1024px): B2B partner sidebar becomes visible (desktop-only portal)
- `xl` (1280px): hero section max-width kicks in

**Touch targets:**
- All buttons: minimum `h-14` (56px) on mobile. Do not use `h-10` (40px) on primary CTAs.
- Bottom-of-screen CTAs: add `pb-safe` (env(safe-area-inset-bottom)) for iOS notch compatibility.
- Input fields: minimum `h-12` (48px), `text-base` (16px) to prevent iOS Safari auto-zoom.

**Calculator on mobile:**
Use progressive disclosure — one question at a time, not all inputs visible simultaneously. As user fills each field, the next field slides up with a gentle transition. The rupee output is sticky at the bottom of the calculator card as a persistent banner ("Your estimate: ₹XX,XXX") while the user fills in more inputs. On mobile the breakdown table collapses to an accordion — tap to expand each line item.

**Document upload on mobile:**
- Separate "Take photo" and "Upload from gallery" buttons (do not rely on the system picker to show both options — iOS camera roll order is unreliable).
- `capture="environment"` on the "Take photo" button to open rear camera.
- Client-side image compression before upload: target < 2MB per image (use `browser-image-compression` npm package).
- Show upload progress with shadcn `Progress` bar (0–100%).
- If upload fails: clear error state with retry button — do not wipe other completed uploads.
- File size warning if the selected file > 8MB before compression.

**OTP autofill:**
- `autocomplete="one-time-code"` on the OTP input field.
- `inputmode="numeric"` on the OTP digits.
- On Android, SMS autofill will suggest the code. On iOS, the keyboard suggestions bar will show it.
- The 6 separate digit boxes (shadcn `input-otp`) are faster to fill with autofill than a single text field — use them.

**Loading states:**
- Every async operation (reg lookup, OTP send, document upload) must show an in-element spinner, not a full-page loader.
- The reg number lookup shows a small spinner inside the input right-border area (`lucide-react Loader2` icon, animated).
- Never disable the page scroll during a loading state.

---

## 9. Accessibility notes

**Color contrast on red CTAs:** `#D92027` (brand-red) against white text (`#FFFFFF`) has a contrast ratio of approximately 4.9:1, which passes WCAG AA (4.5:1 minimum for normal text). However, at small text sizes (< 14px) it fails WCAG AAA. Apply to button text at 16px+ only. For fine print on red backgrounds, use white at opacity 90% — recheck contrast after any background adjustment.

**Red on red:** Never use `--brand-red` text on `--brand-red-light` backgrounds without checking contrast (they are too close in lightness).

**Focus ring:** shadcn's default `ring-2 ring-offset-2 ring-ring` applies on keyboard focus. Override `ring-ring` to `--brand-red` in `globals.css` for brand consistency. Do not remove focus rings.

**Keyboard navigation:**
- The entry questionnaire (radio buttons) must be fully keyboard-navigable: arrow keys to move between Yes/No options.
- The OTP input (6 digits): after entering digit 6, auto-submit should also fire on Tab-to-Submit-button for keyboard users who do not rely on the auto-submit behaviour.
- The marketplace lead cards: Tab to "Watch" → Tab to "Buy". Enter on "Buy" opens the `AlertDialog`, Escape closes it.
- The chat input: Enter to send (prevent default form submit). Shift+Enter for newline.

**Screen reader:**
- Blurred marketplace photos: alt text = "Vehicle photo — purchase lead to unlock full view". Do not use `alt=""` (empty alt) as that hides the element from screen readers who may still want to know a photo exists.
- The rupee breakdown rows that are blurred/locked: use `aria-label="Road tax concession amount — verify your number to unlock"` on the locked row's container.
- The countdown component: `aria-live="polite"` if the number changes dynamically. For static display (page load), no live region needed.
- Founder video block: caption/transcript link below the YouTube embed.

**Font sizes:** minimum 12px (`text-xs`) for fine print. No text below 12px anywhere in the UI. Form labels at minimum 14px (`text-sm`).

---

## 10. Hand-off notes for Frontend Developer

### Build order (prioritised)

1. **Design tokens + globals.css** — set up all CSS custom properties from §2.1. Apply Inter font properly in `layout.tsx`. This unblocks everything else.
2. **Navbar rewrite** — every page needs the new nav. Keep it simple: logo, 4 links, login state, phone number. ~200 lines.
3. **Footer rewrite** — same priority. Three offices, tappable phone numbers, clean grid.
4. **HeroSection + EntryQuestionnaire** — the landing page hero and the two routing questions. These are the primary conversion entry points.
5. **Tier 1 calculator** — `BenefitBreakdown` with locked rows, `RegistrationInput`, `VehicleManualSelect`. Mock all data (static lookup table in `lib/india-data` or a local seed file).
6. **Tier 2 OTP** — reuse and refactor the OTP panel from `ValuationModals.tsx`. `PhoneInput` + `OTPInput` (shadcn `input-otp`) + unlock state transition.
7. **Tier 3 document upload** — `DocumentUploader` ×3, submission to existing Cloudinary upload endpoint.
8. **Confirmation screen** — simple, static. Mocked reference number.
9. **Admin triage page** — `TriageLeadCard`, three buttons, AI flag chips, anti-hoarding banner.
10. **Marketplace redesign** — `LeadCard` with blurred photos, `QualityBadge`, `LeadCountdown`, buy flow.
11. **Chat thread** — `ChatThread` with polled messages, photo upload.
12. **Login page cleanup** — reduce to ~200 lines, remove the "demo OTP 1234" label from visible UI.
13. **Static page rebrands** — about, contact, terms. Brand colours only.

### Component dependencies

```
BenefitBreakdown
  └── BenefitRow (locked/unlocked variant)
      └── ComingSoonTile (for Green Finance/Insurance rows)

LeadCard (marketplace)
  ├── QualityBadge
  ├── LeadCountdown
  └── BlurredPhoto (inline pattern)

TriageLeadCard (admin)
  ├── QualityBadge
  └── AIFlagChip

ChatThread
  └── DocumentUploader (reused from Tier 3)
```

### Where shadcn primitives suffice

- `Button` — cover all variants from §2.4 with the `className` prop; no new component needed.
- `Input`, `Select`, `RadioGroup`, `Checkbox` — use directly for all form fields.
- `Dialog` — use for purchase confirmation and founder video embed.
- `AlertDialog` — use for lead rejection confirmation.
- `Tabs` — use for Login page (Customer / Partner tabs) and marketplace filter bar.
- `Accordion` / `Collapsible` — use for FAQ and the ownership mismatch toggle in Tier 3.
- `Sheet` — use for mobile hamburger nav drawer.
- `Toast` / `Sonner` — use for all success/error messages. Keep the single global `Toaster` in `layout.tsx`.
- `Progress` — use for document upload progress.
- `input-otp` — use for the 6-digit OTP field (already installed).
- `Badge` — base for all badge variants. Extend with custom `className` or wrap in `QualityBadge` component.
- `Skeleton` — use as loading placeholder for lead cards in the marketplace while the fetch resolves.

### Where new components must be written

- `HeroSection` — the red hero with calculator input. No shadcn equivalent.
- `BenefitBreakdown` + `BenefitRow` — the calculator output table with locked/blurred states.
- `RegistrationInput` — the reg number field with the auto-lookup spinner and validation logic.
- `DocumentUploader` — the photo upload card with camera/gallery split and progress.
- `LeadCard` — the marketplace card with blurred photo overlay.
- `TriageLeadCard` — the admin triage card.
- `ChatThread` — the polled chat view.
- `QualityBadge` — the Bronze/Silver/Gold badge.
- `LeadCountdown` — the 2-week countdown with colour states.

### Image / icon asset list

**Required placeholder images (add to `public/brand/`):**
- `placeholder-car-front.jpg` — used in Tier 3 "take front photo" slot before upload
- `placeholder-car-side.jpg`
- `placeholder-car-rear.jpg`
- `placeholder-rc.jpg` — RC document slot placeholder
- `placeholder-aadhaar.jpg` — Aadhaar slot placeholder
- `founder-placeholder.jpg` — 400×400 headshot placeholder for founder block (use a gray rectangle until real photo is provided)
- `founder-video-thumbnail.jpg` — YouTube video thumbnail placeholder

**Icons (use `lucide-react` which is already a dependency):**
- `Lock` — for Tier 1 blurred rows and marketplace photo overlay
- `CheckCircle` — for verified states and confirmation screen
- `Clock` — for lead countdown
- `Star` — for quality badge (filled/outline variants)
- `Camera` — for document upload (take photo option)
- `Upload` — for document upload (gallery option)
- `MessageCircle` — for chat nav link
- `Phone` — for contact / navbar phone number
- `MapPin` — for location fields
- `AlertTriangle` — for AI flag chips
- `X` — close dialog/modal
- `ChevronRight` — all "continue" directions

**Logo files to create:**
- `public/brand/logo-mark.svg` — the SVG from §3.2
- `public/brand/logo-full.svg` — logomark + wordmark combined
- `public/brand/logo-white.svg` — white version for dark backgrounds (invert the SVG fill)

---

## 11. Open questions for the PM

1. **Vehicle weight lookup table:** The calculator mocks scrap value as `weight × ₹/kg`. What weight estimate do we show for each make/model/year in the dummy? Should we seed a lookup table with 20–30 common Indian vehicles (Maruti 800, Honda City, Hero Splendor...) or is a rough approximation by vehicle type (2W ~110kg, small hatchback ~800kg, sedan ~1000kg) acceptable for dummy validation?

2. **CD value by state:** The CD value shown in Tier 1 and Tier 2 is the core hook. In the dummy, what value do we display? Is it a fixed sample (₹52,000 for 4W, ₹5,500 for 2W) or a state-specific lookup? If state-specific, do we have the data to seed a table for UP, Delhi, Maharashtra, Karnataka, and 2–3 other states?

3. **Founder video:** The design assumes a YouTube embed in the homepage hero block. Is a real video available for the dummy, or should the Frontend Dev show a static image placeholder with a "Watch Now" button that opens a dialog saying "Video coming soon"?

4. **DigiLocker link in Tier 3:** The "Link Aadhaar via DigiLocker" button points to `https://digilocker.gov.in`. Is the application approved yet? If not, should the dummy show the button as disabled with a tooltip ("DigiLocker integration coming soon — upload Aadhaar photo for now") or hide it entirely?

5. **Real phone number for WhatsApp:** The floating WhatsApp button currently uses 9839447733. Is this the correct number for the dummy too, or a different demo number that won't generate real customer inquiries during the review?

6. **Type B new vehicle picker:** The Type B calculator needs a "select your new vehicle" input. For the dummy, is a free-text input with mocked output acceptable, or do we need at least a static list of 10–15 popular new vehicles to select from?

7. **Admin triage: AI flags in the dummy:** The AI verification is mocked. Should we seed 3–5 hardcoded flag types (e.g., "Photo haze", "Mileage inconsistency detected", "RC text partially legible", "Ownership mismatch flagged") and assign them randomly to triage cards, or should every card in the demo show one specific flag for review purposes?

8. **Marketplace mock data volume:** How many mock lead cards should the partner marketplace show for the dummy review? Suggested: 8–12 cards across Gold/Silver/Bronze quality levels, 2W and 4W mixed, 1–2 re-listed leads for the re-listing transparency pattern.

9. **Chat pre-populated thread:** Should the dummy chat `/b2b/chat/[leadId]` show a pre-seeded conversation (3–5 mock messages between customer and RVSF) to demonstrate the UI, or start empty?

10. **Domain in `app/layout.tsx`:** Multiple `scrapcenter.in` references exist in metadata. Confirm: replace all with `scrapcentre.com` in the dummy build, including the canonical URL, OpenGraph URL, and Twitter card domain?

---

*Document authored by: Lead UI/UX Designer, ScrapCentre.com. Version: Dummy v1. Date: 2026-05-12. Source of truth: `product-decisions.md` (2026-05-11), `brand-guide.md`, `scrapcentre_strategy.txt` (v2). Read alongside `architect-understanding.md` for system design alignment.*
