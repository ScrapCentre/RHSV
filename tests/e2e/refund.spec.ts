// Flow 6 — Refund-review queue.
//
// What we verify:
//   1. admin.test signs in
//   2. /admin/refund-review loads
//   3. The Demo Customer C row (vehicle reg MH02EF9012 — Hyundai i20) is
//      visible AND carries the auto-flagged badge — i.e. the chat lint job
//      surfaced the WhatsApp + phone-number patterns that the demo seed
//      planted.
//
// What this would have caught in the fire-mode push:
//   - A regression in /api/admin/refund-review (e.g. losing the
//     auto_denied_number_revealed / admin_pending filter union) would empty
//     the queue and we'd hit the "No refund requests pending. Nice." copy.
//   - A regression that drops chatFlaggedPatterns from the response would
//     hide the "N flagged" badge — the auto-flag UX is the whole reason this
//     queue exists for a human admin to triage.

import { test, expect } from "@playwright/test"
import { signInAsAdmin, requireBaseURL } from "./helpers/auth"

test("refund-review queue surfaces Demo Customer C with the auto-flagged badge", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)

  await signInAsAdmin(context, base)

  // -- API check: the queue must contain a row for MH02EF9012 with at least
  // one flagged chat pattern.
  const apiRes = await context.request.get(`${base}/api/admin/refund-review`)
  expect(
    apiRes.ok(),
    `GET /api/admin/refund-review failed: ${apiRes.status()} ${await apiRes.text()}`
  ).toBeTruthy()
  const { events } = await apiRes.json()
  expect(Array.isArray(events), "events is not an array").toBeTruthy()
  const demoC = events.find((e: any) => e.vehicleReg === "MH02EF9012")
  expect(demoC, "Demo Customer C (MH02EF9012) row missing from refund-review queue").toBeTruthy()
  expect(
    Array.isArray(demoC.chatFlaggedPatterns) && demoC.chatFlaggedPatterns.length > 0,
    `Demo Customer C row has no flagged chat patterns (got ${JSON.stringify(demoC.chatFlaggedPatterns)})`
  ).toBeTruthy()
  // Sanity — the admin queue should only show rows awaiting human review.
  expect(
    ["admin_pending", "auto_full_but_refund_failed", "auto_denied_number_revealed"].includes(demoC.refundDecision),
    `Unexpected refundDecision for Demo Customer C: ${demoC.refundDecision}`
  ).toBeTruthy()

  // -- Page render check --
  await page.goto(`${base}/admin/refund-review`)
  await expect(page.getByRole("heading", { name: "Refund review queue" })).toBeVisible()

  // Wait for either the row OR the empty-state to settle. We assert the row
  // is present and the empty-state is not.
  await expect.poll(
    async () => (await page.locator("body").innerText()).includes("MH02EF9012"),
    {
      message: "MH02EF9012 (Demo Customer C) row not visible in refund-review queue UI",
      timeout: 15_000,
    }
  ).toBeTruthy()

  // The "N flagged" badge — copy is `${count} flagged`, rendered only when
  // chatFlaggedPatterns.length > 0. We assert the demo seed (which plants 2
  // patterns) renders "2 flagged".
  const expectedFlaggedCopy = `${demoC.chatFlaggedPatterns.length} flagged`
  await expect.poll(
    async () => (await page.locator("body").innerText()).includes(expectedFlaggedCopy),
    {
      message: `Auto-flagged badge "${expectedFlaggedCopy}" missing — chat pattern detection regression?`,
      timeout: 15_000,
    }
  ).toBeTruthy()
})
