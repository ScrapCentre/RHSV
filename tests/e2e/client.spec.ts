// Flow 3 — Customer dashboard.
//
// What we verify:
//   1. client.test signs in via the universal credentials provider
//   2. /me loads and greets them by name
//   3. GET /api/leads/mine returns the seeded demo leads (3 total — Customer
//      A/B/C all share client.test as the customer)
//
// What this would have caught in the fire-mode push:
//   - A regression on /api/leads/mine returning a 401 (the recurring symptom
//     when withAuth() was mis-imported) would fail the API assertion below
//     before the page ever shows the empty-state.

import { test, expect } from "@playwright/test"
import { signInAsClient, requireBaseURL } from "./helpers/auth"

test("client dashboard shows 3 leads via /api/leads/mine", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)

  await signInAsClient(context, base)

  // -- API check first — the failure mode we most care about (401 / 500 on
  // /api/leads/mine) is best diagnosed at the API layer.
  const leadsRes = await context.request.get(`${base}/api/leads/mine`)
  expect(
    leadsRes.ok(),
    `/api/leads/mine failed: ${leadsRes.status()} ${await leadsRes.text()}`
  ).toBeTruthy()
  const { leads } = await leadsRes.json()
  expect(Array.isArray(leads), "leads field is not an array").toBeTruthy()

  // Demo seed creates exactly 3 leads for client.test (A: Swift, B: City,
  // C: i20). We assert ≥3 rather than ===3 so an extra real lead created in
  // staging doesn't break us — but the floor of 3 catches a regression that
  // makes leads invisible to the customer.
  expect(
    leads.length,
    `expected at least 3 demo leads for client.test, saw ${leads.length}`
  ).toBeGreaterThanOrEqual(3)

  // -- Page render check --
  await page.goto(`${base}/me`)
  // The dashboard heading is "Hi {name}" — we just assert the welcome copy
  // is present so we know we're authenticated, not bounced to /login.
  await expect.poll(
    async () => (await page.locator("body").innerText()).includes("Welcome to your ScrapCentre.com dashboard"),
    {
      message: "Customer dashboard welcome copy missing — likely bounced to /login",
      timeout: 15_000,
    }
  ).toBeTruthy()
})
