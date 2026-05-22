// RVSF onboarding e2e — the anonymous /rvsf/apply wizard + CC management.
//
// Covers:
//   • /rvsf/apply — the 5-step public onboarding wizard (anonymous), walked
//     end to end through submit. KYC uploads run in mock mode (the deploy has
//     no Cloudinary creds → /api/rvsf/apply/upload-doc returns placeholder
//     URLs), so we can drive real <input type=file> elements with tiny
//     in-memory buffers.
//   • /rvsf/apply/status — the application-status lookup page.
//   • /rvsf/ccs + /rvsf/ccs/new — the RVSF-admin Collection-Center list and
//     the create-CC form (auth'd as partner.test).
//
// Selector strategy: both forms render `<div><label>X</label><input/></div>`.
// The htmlFor/id association is an accessibility fix committed alongside this
// suite — but the live deploy may still run the pre-fix build. So instead of
// getByRole("textbox", {name}) (which needs the association), we locate the
// input as the descendant of the div whose <label> has the wanted text. That
// works on both the pre-fix (sibling) and post-fix (associated) markup.
//
// Each wizard run uses a unique email + slug so the idempotent-on-email
// /api/rvsf/apply endpoint always takes the "new application" branch. The CC
// create uses a unique city for the same reason ({rvsfId, city} uniqueness).

import { test, expect, Page, Locator } from "@playwright/test"
import { signInAsPartner, requireBaseURL } from "./helpers/auth"

// A 1x1 PNG — smallest valid image payload to satisfy the upload mime check.
const TINY_PNG = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4" +
  "890000000a49444154789c6360000000020001e221bc330000000049454e44ae426082",
  "hex"
)

/**
 * Resolve a form input by the visible text of its <label>.
 * Both the apply wizard (`Field`) and the new-CC form render each control as
 * `<div><label>…</label><input/></div>` — the <input> is the immediate
 * sibling of the <label>. The CSS adjacent-sibling combinator targets it
 * precisely and is association-independent, so it works on both the pre-fix
 * (no htmlFor) and post-fix (htmlFor/id) markup. `:has-text` is a
 * case-insensitive substring match, which tolerates the parenthetical
 * suffixes some labels carry ("URL slug (e.g. …)").
 */
function fieldByLabel(page: Page, labelText: string): Locator {
  return page.locator(`label:has-text("${labelText}") + input`).first()
}

// ─── /rvsf/apply — full anonymous wizard walk-through ────────────────────────

test("RVSF apply wizard — anonymous applicant completes all 5 steps", async ({
  page, baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  const uniq = Date.now()
  const email = `qa-rvsf-${uniq}@example.com`
  const slug = `qa-rvsf-${uniq}`

  await page.goto(`${base}/rvsf/apply`)

  // ── Intro step ──
  await expect(
    page.getByRole("heading", { name: /Apply to become an RVSF partner/ })
  ).toBeVisible()
  await page.getByRole("button", { name: /Start application/ }).click()

  // ── Step 1 · Organisation basics ──
  await expect(
    page.getByRole("heading", { name: /Organisation basics/ })
  ).toBeVisible()
  await fieldByLabel(page, "Legal name").fill("QA Test Recyclers Pvt Ltd")
  await fieldByLabel(page, "Display name").fill("QA Test Recyclers")
  await fieldByLabel(page, "URL slug").fill(slug)
  await fieldByLabel(page, "GST number").fill("22AAAAA0000A1Z5")
  await fieldByLabel(page, "PAN number").fill("AAAAA0000A")
  await fieldByLabel(page, "CPCB authorisation number").fill("CPCB-QA-2026-001")
  await fieldByLabel(page, "Contact email").fill(email)
  await fieldByLabel(page, "Contact phone").fill("+919876500001")
  await fieldByLabel(page, "Full name").fill("QA Signatory")
  await fieldByLabel(page, "Designation").fill("Director")
  await page.getByRole("button", { name: /Next/ }).click()

  // ── Step 2 · Primary yard address ──
  await expect(
    page.getByRole("heading", { name: /Primary yard address/ })
  ).toBeVisible()
  await fieldByLabel(page, "Address line 1").fill("Plot 12, Industrial Area")
  await fieldByLabel(page, "City").fill("Kanpur")
  await fieldByLabel(page, "State").fill("Uttar Pradesh")
  await fieldByLabel(page, "Pincode").fill("208001")
  await fieldByLabel(page, "Latitude").fill("26.45")
  await fieldByLabel(page, "Longitude").fill("80.35")
  await page.getByRole("button", { name: /Next/ }).click()

  // ── Step 3 · KYC documents (7 uploads, mock mode) ──
  await expect(
    page.getByRole("heading", { name: /KYC documents/ })
  ).toBeVisible()
  // Each FileUploader renders one <input type=file>. Upload to all of them;
  // wait for the "✓ uploaded" badge count to reach 7 before advancing.
  const kycInputs = page.locator('input[type="file"]')
  await expect(kycInputs).toHaveCount(7)
  for (let i = 0; i < 7; i++) {
    await kycInputs.nth(i).setInputFiles({
      name: `kyc-${i}.png`,
      mimeType: "image/png",
      buffer: TINY_PNG,
    })
  }
  await expect(page.getByText("✓ uploaded")).toHaveCount(7, { timeout: 30_000 })
  const kycNext = page.getByRole("button", { name: /Next/ })
  await expect(kycNext).toBeEnabled()
  await kycNext.click()

  // ── Step 4 · Bank account ──
  await expect(page.getByRole("heading", { name: /Bank account/ })).toBeVisible()
  await fieldByLabel(page, "Account holder name").fill("QA Test Recyclers Pvt Ltd")
  await fieldByLabel(page, "Account number").fill("001122334455")
  await fieldByLabel(page, "IFSC").fill("HDFC0001234")
  await fieldByLabel(page, "Bank name").fill("HDFC Bank")
  // The 8th uploader (cancelled cheque) is the only file input on this step.
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "cheque.png",
    mimeType: "image/png",
    buffer: TINY_PNG,
  })
  await expect(page.getByText("✓ uploaded")).toHaveCount(1, { timeout: 30_000 })
  const reviewBtn = page.getByRole("button", { name: /Review/ })
  await expect(reviewBtn).toBeEnabled()
  await reviewBtn.click()

  // ── Step 5 · Review & submit ──
  await expect(
    page.getByRole("heading", { name: /Review & submit/ })
  ).toBeVisible()
  // Sanity: the review surface echoes the entered legal name.
  await expect(page.getByText("QA Test Recyclers Pvt Ltd").first()).toBeVisible()
  await page.getByRole("button", { name: /Submit application/ }).click()

  // ── Done step ──
  await expect(
    page.getByRole("heading", { name: /Application received/ })
  ).toBeVisible({ timeout: 20_000 })
  await expect(page.getByText(email)).toBeVisible()
})

// ─── /rvsf/apply/status — anonymous status lookup ───────────────────────────

test("RVSF apply-status page renders the lookup form", async ({
  page, baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  await page.goto(`${base}/rvsf/apply/status`)
  // The page is anonymous; it must at least mount its lookup UI without
  // bouncing to a login wall.
  await expect.poll(
    async () => {
      const body = await page.locator("body").innerText()
      return /application/i.test(body) && !/log\s?in to continue/i.test(body)
    },
    { message: "apply-status page did not render", timeout: 15_000 }
  ).toBeTruthy()
})

// ─── /rvsf/ccs — Collection-Center list ─────────────────────────────────────

test("RVSF CC list page renders for an authenticated rvsf_admin", async ({
  context, page, baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  await signInAsPartner(context, base)

  await page.goto(`${base}/rvsf/ccs`)
  await expect(
    page.getByRole("heading", { name: "Collection Centers" })
  ).toBeVisible({ timeout: 20_000 })
  // The "+ Add new CC" CTA must be present (header or empty-state).
  await expect(
    page.getByRole("link", { name: /Add (new|your first) CC/ }).first()
  ).toBeVisible()
  // No error copy.
  await expect(page.locator(".text-status-error")).toHaveCount(0)
})

// ─── /rvsf/ccs/new — create a Collection Center ─────────────────────────────

test("RVSF admin can create a new Collection Center", async ({
  context, page, baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  await signInAsPartner(context, base)

  // Unique city per run — {rvsfId, city} is unique, so reruns must not collide.
  const city = `QA City ${Date.now()}`

  await page.goto(`${base}/rvsf/ccs/new`)
  await expect(
    page.getByRole("heading", { name: /Add a new Collection Center/ })
  ).toBeVisible({ timeout: 20_000 })

  await fieldByLabel(page, "City").fill(city)
  await fieldByLabel(page, "State").fill("Uttar Pradesh")
  await fieldByLabel(page, "Line 1").fill("Plot 9, CC Industrial Estate")
  await fieldByLabel(page, "Pincode").fill("208002")
  await fieldByLabel(page, "Center latitude").fill("26.50")
  await fieldByLabel(page, "Center longitude").fill("80.40")
  await fieldByLabel(page, "Operator name").fill("QA CC Operator")
  await fieldByLabel(page, "Phone").fill("+919876500099")
  await fieldByLabel(page, "Email").fill(`qa-cc-${Date.now()}@example.com`)

  await page
    .getByRole("button", { name: /Create CC \+ generate operator login/ })
    .click()

  // On success the page shows the one-time operator credentials screen.
  await expect(page.getByRole("heading", { name: /CC created/ })).toBeVisible({
    timeout: 20_000,
  })
  await expect(page.getByText(/Login email/)).toBeVisible()
  await expect(page.getByText(/One-time password/)).toBeVisible()
})
