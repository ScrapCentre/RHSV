// Flow 5 — CC dashboard catchment counter.
//
// What we verify:
//   1. centre.test signs in via the scrapcentre-credentials provider
//   2. /cc/dashboard renders (RSC, force-dynamic) and the "In your catchment"
//      stat card shows a number ≥ 1 (demo seeds 2 marketplace-visible leads
//      in this CC's catchment — Maruti Swift + Hyundai i20)
//
// What this would have caught in the fire-mode push:
//   - 6bf3135 fix(cc): cast linkedCcId to ObjectId in aggregate pipeline.
//     Before that fix the $match silently matched nothing because the JWT
//     carried linkedCcId as a string and aggregate pipelines don't auto-cast.
//     The stat card would show 0 instead of 2. We assert >= 1 to stay robust
//     to a future demo-seed change that re-balances catchment assignments.

import { test, expect } from "@playwright/test"
import { signInAsCcOperator, requireBaseURL } from "./helpers/auth"

test("cc operator dashboard shows ≥1 lead in catchment (ObjectId-cast regression)", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)

  await signInAsCcOperator(context, base)

  await page.goto(`${base}/cc/dashboard`)

  // The "In your catchment" label is the stat-card heading. Its sibling is a
  // big <p> with the count. We grab the count from the rendered text and
  // assert it's a number ≥ 1.
  //
  // The card structure is:
  //   <p>In your catchment</p>
  //   <p>{visibleCount}</p>
  //   <p>leads marketplace-visible</p>
  //
  // We use a poll-and-parse approach to give SSR + any client-side
  // re-hydration a moment to settle. (The page is RSC + force-dynamic so the
  // count is server-rendered on first byte, but Cloudflare/edge cache can
  // briefly show a stale 0 on a cold deploy.)
  await expect.poll(
    async () => {
      const text = await page.locator("body").innerText()
      if (!text.includes("In your catchment")) return -1
      // Find the number immediately after "In your catchment" / before "leads marketplace-visible".
      const match = text.match(/In your catchment\s+(\d+)\s+leads marketplace-visible/i)
      if (!match) return -1
      return Number(match[1])
    },
    {
      message: "Could not parse 'In your catchment' counter — page may be bouncing to /login or aggregate may be returning 0",
      timeout: 20_000,
    }
  ).toBeGreaterThanOrEqual(1)
})
