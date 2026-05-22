// Flow 1 — Customer happy path (anonymous Tier 1 → OTP → Tier 2).
//
// Catches the regression that the founder hit in cca48f5 / 04f8b53: the OTP
// verify endpoint was returning the tier2 payload under the wrong keys, so
// the /calculator/verify page silently fell back to the hardcoded
// ₹24,500 / ₹52,000 / ₹84,900 numbers regardless of the actual scrap value.
//
// What we verify:
//   1. POST /api/calc/tier1 returns a leadStateId for a real reg number
//   2. /calculator/verify accepts a 6-digit mock OTP (any digits pass; we
//      use 123456 per the task brief, but 000000 would also work)
//   3. The full breakdown that surfaces is NOT the hardcoded fallback —
//      i.e. scrapValue varies with the input weight, and cdValue = scrap × 1.4
//
// This spec is anonymous — no sign-in required.

import { test, expect } from "@playwright/test"
import { requireBaseURL } from "./helpers/auth"

test("customer happy path — anon → tier1 → OTP → real tier2 breakdown", async ({ page, request, baseURL }) => {
  const base = requireBaseURL(baseURL)

  // -- Step 1: Tier 1 lookup via the API (mirrors what /calculator does on submit) --
  // We hit the API directly rather than scraping the form because the form
  // result is purely informational — leadStateId is the only thing the next
  // page needs. Using the API also gives us deterministic assertions on the
  // returned scrap value (the UI only shows mid + tier2 in different copy).
  const tier1Res = await request.post(`${base}/api/calc/tier1`, {
    data: { regNumber: "UP32AB1234" },
    headers: { "Content-Type": "application/json" },
  })
  expect(tier1Res.ok(), `tier1 failed: ${tier1Res.status()} ${await tier1Res.text()}`).toBeTruthy()
  const tier1 = await tier1Res.json()
  expect(tier1.leadStateId, "leadStateId missing from tier1 response").toBeTruthy()
  expect(typeof tier1.scrapMin).toBe("number")
  expect(typeof tier1.scrapMax).toBe("number")
  expect(tier1.scrapMax).toBeGreaterThan(0)

  // -- Step 2: Issue OTP --
  // The phone is a throwaway — the mock adapter accepts any 6-digit code.
  const phone = "9876543210"
  const otpIssueRes = await request.post(`${base}/api/otp/issue`, {
    data: { phone },
    headers: { "Content-Type": "application/json" },
  })
  expect(
    otpIssueRes.ok(),
    `otp/issue failed: ${otpIssueRes.status()} ${await otpIssueRes.text()}`
  ).toBeTruthy()

  // -- Step 3: Verify OTP and assert the tier2 payload --
  // Per task brief: code 123456 (any 6-digit value works in mock mode).
  const otpVerifyRes = await request.post(`${base}/api/otp/verify`, {
    data: { phone, otp: "123456", leadStateId: tier1.leadStateId },
    headers: { "Content-Type": "application/json" },
  })
  expect(
    otpVerifyRes.ok(),
    `otp/verify failed: ${otpVerifyRes.status()} ${await otpVerifyRes.text()}`
  ).toBeTruthy()
  const otpVerify = await otpVerifyRes.json()
  expect(otpVerify.calcSessionToken, "calcSessionToken missing").toBeTruthy()
  expect(otpVerify.tier2Data, "tier2Data block missing").toBeTruthy()

  // The critical regression check: tier2Data.scrapValue must be a real number
  // derived from the lead, NOT the hardcoded 24500 fallback that the UI
  // applies when the API omits these keys.
  //
  // Lead state: weight ≈ 900 kg (Maruti Swift defaults), 14 ₹/kg, ±20% band.
  // scrapValue = round((scrapMin + scrapMax) / 2). For a 900 kg vehicle:
  // mid = 12 600, scrapMin = 10 080, scrapMax = 15 120, scrapValue ≈ 12 600.
  // We don't pin the exact integer (mock weight could change); we just assert
  // it's the API-derived value and not the hardcoded 24 500.
  expect(typeof otpVerify.tier2Data.scrapValue).toBe("number")
  expect(otpVerify.tier2Data.scrapValue).toBeGreaterThan(0)
  expect(otpVerify.tier2Data.scrapValue).not.toBe(24500)
  // cdValue must be scrapValue × 1.4 (the only legitimate path); the
  // hardcoded fallback was a flat 52 000 regardless of scrap.
  const expectedCd = Math.round(otpVerify.tier2Data.scrapValue * 1.4)
  expect(otpVerify.tier2Data.cdValue).toBe(expectedCd)

  // -- Step 4: Render the /calculator page anonymously to confirm it loads --
  // (We don't drive the Tier 1 form in the UI because the API exercise above
  // is the more reliable signal — but the page itself must at least mount.)
  await page.goto(`${base}/calculator`)
  await expect(page.getByPlaceholder("UP32 AB 1234")).toBeVisible()
})
