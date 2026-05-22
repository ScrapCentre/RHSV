// Flow 2 — Partner login + marketplace.
//
// What we verify:
//   1. partner.test signs in via the rvsf-credentials provider (field name
//      `rvsfId`, NOT `email`)
//   2. /rvsf/marketplace loads and surfaces at least one demo lead
//   3. The first demo lead row mentions one of the seeded demo vehicles
//      (Maruti Suzuki Swift / Honda City / Hyundai i20)
//
// What this would have caught in the recent fire-mode push:
//   - fb114d7 (unbreak /rvsf_leads buy-flow): a regression that bounced
//     legitimate RVSF buyers away from their landing page would have failed
//     the redirect-then-expect-lead-card chain here.
//   - cc89fed (M11 marketplace): a 500 on /api/marketplace/leads would have
//     surfaced as "Failed to load marketplace" copy with no lead cards.

import { test, expect } from "@playwright/test"
import { signInAsPartner, requireBaseURL } from "./helpers/auth"

test("partner login + marketplace surfaces at least one demo lead", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)

  await signInAsPartner(context, base)

  // Navigate to the marketplace; the page is client-rendered and loads leads
  // via fetch on mount. We poll for visibility because cold-Lambda + Mongo
  // round-trip can take a couple seconds on staging.
  await page.goto(`${base}/rvsf/marketplace`)
  await expect(page.getByRole("heading", { name: "Marketplace" })).toBeVisible()

  // Wait for the loader copy ("Loading leads…") to disappear, then expect at
  // least one LeadCard. Each lead card carries the year + makeModel as an
  // <h3> (e.g. "2017 Maruti Suzuki Swift"). We don't pin a specific lead
  // because the demo set is allowed to evolve, but we DO require that one of
  // the three known demo vehicles is present.
  await expect.poll(
    async () => {
      const body = await page.locator("body").innerText()
      return /Maruti Suzuki Swift|Honda City|Hyundai i20/.test(body)
    },
    {
      message: "Expected at least one Demo Lead on /rvsf/marketplace",
      timeout: 20_000,
    }
  ).toBeTruthy()

  // Sanity: the "No leads in your radius right now." empty-state should NOT
  // be the prominent message. (If it were, the regex above would have failed,
  // but a belt-and-braces check makes failure messages easier to grok.)
  await expect(page.getByText("No leads in your radius right now.")).toHaveCount(0)
})
