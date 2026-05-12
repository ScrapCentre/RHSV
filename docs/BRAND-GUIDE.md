# ScrapCentre.com Brand Guide

Source of truth for visual identity, brand assets, and contact information used anywhere in the ScrapCentre.com codebase, marketing, or partner-facing materials.

**Source:** founder-supplied corporate letterhead (received 2026-05-11). High-resolution logo asset still pending from founder.

---

## 1. Brand identity

| | |
|---|---|
| **Brand name** | **ScrapCentre.com** (single word, capital S + capital C, `.com` is part of the wordmark) |
| **Logo word-treatment** | "SCRAP CENTRE" appears as two words inside the logo box; "ScrapCentre.com" appears as one word in the wordmark next to it. Treat both as canonical for their context. |
| **Subtitle / RVSF line** | Registered Vehicle Scrapping Facility (RVSF) |
| **Parent company line** | A Unit of RESTOREHEALTH MEDICARE PVT. LTD. |
| **Tagline (provisional, marketing-led — not yet on letterhead)** | TBD — pull from marketing strategy v2: "Don't sell to the kabadi. He's stealing more than you think." (Hindi-belt anchor) |

---

## 2. Color palette

Estimated from the letterhead — **founder to confirm or supply exact values from designer**.

| Token | Approx. Hex | Use |
|---|---|---|
| `--brand-red` | `#D92027` (estimated) | Primary brand color. Logo background, primary CTAs, brand accents. |
| `--brand-red-dark` | `#A8161C` (derived) | Hover / active states for primary buttons. |
| `--brand-red-light` | `#FCE5E6` (derived) | Soft backgrounds, subtle highlights. |
| `--brand-black` | `#0A0A0A` | Wordmark, headings, dark text. |
| `--brand-gray` | `#4B5563` | Body text, sub-headings. |
| `--brand-gray-light` | `#9CA3AF` | Muted text, placeholders. |
| `--brand-white` | `#FFFFFF` | Backgrounds, logo icon, button text on red. |
| `--brand-bg` | `#FAFAFA` or `#F9FAFB` | Page background, alternate to pure white. |

**Status colors (functional, not brand):**
- Success: `#10B981` (emerald-500) — keep current shadcn green
- Warning: `#F59E0B` (amber-500)
- Destructive: stays as `--brand-red` (since it's already red, the destructive state can be slightly darker)

**Tier / quality badge colors (lead quality scoring per `product-decisions.md` §4):**
- Bronze: `#CD7F32`
- Silver: `#C0C0C0`
- Gold: `#FFD700`

❓ **Founder confirmation needed:** exact brand red hex value from your designer (if you have one), or do we lock the estimate above and refine later?

---

## 3. Typography

❓ **No brand fonts specified on letterhead.** Letterhead text appears to be Helvetica / Arial Bold (sans-serif geometric).

Recommended path:
- **Keep current Inter** (already in `app/layout.tsx`) for body text — wide language support including Devanagari, free, performant
- **Add Noto Sans Devanagari** for Hindi content rendering (Inter's Devanagari coverage is partial)
- For the brand wordmark on web: render **ScrapCentre.com** in Inter Bold or Inter ExtraBold to mirror the letterhead's weight, OR use the actual logo asset wherever it appears

❓ **Founder decision:** keep Inter or specify a brand display font?

---

## 4. Logo

✅ **Original logo found and locked** *(2026-05-12)*. The official ScrapCentre logo files are already in the repo and the user's Downloads — **do NOT recreate**. AI-recreated versions don't match the original's polish.

**Canonical asset locations in the repo (use these everywhere):**
- `public/brand/logo.png` (1536×545, RGBA, ~1 MB) — primary horizontal logo: red rounded rectangle with white car-being-lifted icon and white "SCRAP CENTRE" wordmark inside the rectangle. Use for navbar, footer, hero, social cards.
- `public/brand/logo.pdf` (vector source, from the 2023 design file) — for any future SVG export or print use.
- `public/logo.png` — same file as `public/brand/logo.png`, kept at top level for backwards compatibility with existing imports.

**Wordmark for inline text** (when the image logo isn't appropriate, e.g. inline in copy):
- Render as **ScrapCentre.com** in Inter Bold, brand-red color. The `.com` portion can stay the same weight/color — keep it readable rather than stylised.

**Favicon set** (already in `public/`, keep using these unless rebranded):
- `public/favicon.ico` + `public/favicon-16x16.png` + `public/favicon-32x32.png` + `public/apple-touch-icon.jpeg`

**Treatment rules:**
- The logo is designed for a white or light background. On a red/dark background, surround with a white card or use the (yet-to-be-cropped) icon-only mark.
- Maintain a clear-space margin around the logo equal to the height of the "S" in SCRAP.
- Don't recolor it. Don't stretch it. Don't add effects.

❓ **Future founder action:** if you ever want a transparent SVG version (sharper at any zoom, smaller file), the PDF source can be exported via Illustrator / Inkscape / Figma. Not blocking for v1.

---

## 5. Contact information (for footer / contact page / outreach)

### Offices

| Type | Address |
|---|---|
| **Head Office (H.O.)** | 26-A & B, Block-E, Panki, Kalpi Road, Kanpur — 208020 |
| **RVSF Facility** | A-4, UPSIDC Industrial Area, Plasticity, Dibiyapur, Auraiya (UP) |
| **Branch Office (Kanpur B.O.)** | Ratanzone, 118/54, 55, 2nd Floor, Kaushalpuri, Kanpur |

### Phones (in order)

- 9839447733
- 9839336644
- 8795886699

### Emails

- **Corporate:** info@restorehealthmedicare.com
- **Web-facing / customer support:** scrapcentre.com@gmail.com

### Website

- **Production:** https://scrapcentre.com (live site, hosted by Novalytix)
- **Staging / Dummy preview:** https://scrapcentre.online (registered 2026-05-11; for the dummy implementation Novalytix reviews before promoting to production. Hosting target TBD — see `product-decisions.md` §9.)

### Social handles

❓ Not on letterhead — founder to specify Instagram / Facebook / YouTube / LinkedIn handles when registered.

---

## 6. Voice and tone

Inherited from `/tmp/scrapcentre_strategy.txt` Part 9 ("Brand Voice"):

1. **Specific over general.** ₹17,500 not "thousands of rupees".
2. **Hindi-friendly, not Sanskritised.** Talk like a knowledgeable older brother.
3. **Name the kabadi.** Don't soften. The kabadi is the antagonist of the brand story.
4. **Pro-customer, not pro-system.** Frame even customer mistakes as "here's how the system tricked you".
5. **No corporate hedging.** "You will" not "you may potentially".
6. **Show the math, every time.**
7. **Respect the vehicle.** Never "junk" or "scrap" in customer-facing copy. It's "your old car" or "the vehicle".

**Audience-by-audience register:**
- Scrap-side consumers (P1–P5): Hindi (everyday, not Sanskritised), Hinglish for IG captions
- CD Buyer (P6): Hinglish, English for tier-1 cities
- Partner RVSFs (PP1): English + Hindi mixed, peer-to-peer
- Enterprise (B1–B4): English, ESG/compliance grade

---

## 7. Naming conventions in code

- **Wordmark in UI** → `ScrapCentre.com` (one word, capital S, capital C, `.com` part of brand)
- **CSS class prefixes** → no special brand prefix; use Tailwind defaults + the color tokens above
- **CSS variable names** → `--brand-red`, `--brand-black`, etc. (defined in `app/globals.css`)
- **Asset folder** → `public/brand/` for logo, `public/brand/icons/` for icon variants
- **Domain in code** → `scrapcentre.com` (NOT `scrapcenter.in` which is the legacy in `app/layout.tsx:27` — to be updated)
- **Repo name** → still `RHSV` on GitHub (legacy, rename to `RVSF` later — separate task)

---

## 8. Quick checklist for any UI / page change

When touching anything customer-facing:

- [ ] Use `--brand-red` for primary CTAs (not Tailwind default green)
- [ ] Wordmark renders as `ScrapCentre.com` (not "ScrapCenter India" or other variants)
- [ ] Footer uses the offices, phones, emails from §5
- [ ] Domain references say `scrapcentre.com`, not `scrapcenter.in`
- [ ] Body copy follows the voice principles in §6
- [ ] Hindi/Hinglish supported (Devanagari font loaded if Hindi present)
- [ ] Founder-face / RVSF-team photography preferred over stock images
