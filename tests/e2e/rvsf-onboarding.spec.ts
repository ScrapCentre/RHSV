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
// Each wizard run uses a unique email + slug so the idempotent-on-email
// /api/rvsf/apply endpoint always takes the "new application" branch and
// never collides with a prior run. The CC create uses a unique city for the
// same reason (one-CC-per-city uniqueness on {rvsfId, city}).

import { test, expect } from "@playwright/test"
import { signInAsPartner, requireBaseURL } from "./helpers/auth"

// A 1x1 PNG — smallest valid image payload to satisfy the upload mime check.
const TINY_PNG = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4" +
  "890000000a49444154789c6360000000020001e221bc330000000049454e44ae426082",
  "hex"
)

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
  const fill = (label: string | RegExp, value: string) =>
    page.getByRole("textbox", { name: label }).fill(value)
  await fill(/Legal name/, "QA Test Recyclers Pvt Ltd")
  await fill(/Display name/, "QA Test Recyclers")
  await fill(/URL slug/, slug)
  await fill(/GST number/, "22AAAAA0000A1Z5")
  await fill(/PAN number/, "AAAAA0000A")
  await fill(/CPCB authorisation number/, "CPCB-QA-2026-001")
  await fill(/Contact email/, email)
  await fill(/Contact phone/, "+919876500001")
  await fill(/Full name/, "QA Signatory")
  await fill(/Designation/, "Director")
  await page.getByRole("button", { name: /Next/ }).click()

  // ── Step 2 · Primary yard address ──
  await expect(
    page.getByRole("heading", { name: /Primary yard address/ })
  ).toBeVisible()
  await fill(/Address line 1/, "Plot 12, Industrial Area")
  await fill(/City/, "Kanpur")
  await fill(/State/, "Uttar Pradesh")
  await fill(/Pincode/, "208001")
  await fill(/Latitude/, "26.45")
  await fill(/Longitude/, "80.35")
  await page.getByRole("button", { name: /Next/ }).click()

  // ── Step 3 · KYC documents (7 uploads, mock mode) ──
  await expect(
    page.getByRole("heading", { name: /KYC documents/ })
  ).toBeVisible()
  // Each FileUploader renders one <input type=file>. Upload to all of them;
  // wait for the "✓ uploaded" badge count to reach 7 before advancing.
  const kycInputs = page.locator('input[type="file"]')
  const kycCount = await kycInputs.count()
  expect(kycCount).toBe(7)
  for (let i = 0; i < kycCount; i++) {
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
  await fill(/Account holder name/, "QA Test Recyclers Pvt Ltd")
  await fill(/Account number/, "001122334455")
  await fill(/IFSC/, "HDFC0001234")
  await fill(/Bank name/, "HDFC Bank")
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
  await expect(page.getByText("QA Test Recyclers Pvt Ltd")).toBeVisible()
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
  await expect(page.getByRole("link", { name: /Add (new|your first) CC/ }).first())
    .toBeVisible()
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

  const fill = (label: string | RegExp, value: string) =>
    page.getByRole("textbox", { name: label }).fill(value)
  await fill("City", city)
  await fill("State", "Uttar Pradesh")
  await fill(/Line 1/, "Plot 9, CC Industrial Estate")
  await fill("Pincode", "208002")
  await fill(/Center latitude/, "26.50")
  await fill(/Center longitude/, "80.40")
  await fill(/Operator name/, "QA CC Operator")
  await fill(/Phone/, "+919876500099")
  await fill(/Email/, `qa-cc-${Date.now()}@example.com`)

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
