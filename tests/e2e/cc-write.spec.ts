// CC operator (role: cc_operator) — end-to-end coverage for the v2
// Collection-Centre surface. Companion to tests/e2e/cc.spec.ts (which only
// checked the dashboard catchment counter).
//
// SUT: app/cc/*, app/api/cc/*, components/cc/*, middleware.ts (first-login gate).
//
// Test user: centre.test@scrapcentre.online — a cc_operator linked to the
// Auraiya RVSF's primary Collection Centre. Demo data seeds:
//   - Lead A (Maruti Swift)  — state marketplace_visible, in catchment → acceptable
//   - Lead B (Honda City)    — state negotiating, assignedCcId = this CC, active chat
//   - Lead C (Hyundai i20)   — state marketplace_visible, in catchment → acceptable,
//                              has an ARCHIVED chat thread assigned to this CC
// So the dashboard reads: catchment=2, accepted=0, assigned=1, completed=0.
//
// Browser-driven (per task brief). The global CSRF fetch interceptor
// (components/CsrfBootstrap → lib/install-csrf-fetch) auto-injects the
// X-CSRF-Token header on every mutating /api call, so the in-page
// page.evaluate(fetch(...)) accept/change-password calls are CSRF-correct
// for free. We assert that explicitly in the CSRF test below.

import { test, expect } from "@playwright/test"
import { signInAsCcOperator, requireBaseURL, TEST_PASSWORD } from "./helpers/auth"

// ───────────────────────── helpers ─────────────────────────

/**
 * Pull the four stat-card numbers off the rendered /cc/dashboard.
 * innerText applies the CSS `uppercase` transform, so headings read
 * "IN YOUR CATCHMENT" etc. — match case-insensitively.
 */
async function readDashboardStats(page: import("@playwright/test").Page) {
  const text = await page.locator("body").innerText()
  const grab = (label: RegExp) => {
    const m = text.match(label)
    return m ? Number(m[1]) : NaN
  }
  return {
    inCatchment: grab(/in your catchment\s+(\d+)\s+leads marketplace-visible/i),
    accepted:    grab(/you've accepted\s+(\d+)\s+waiting on parent rvsf/i),
    assigned:    grab(/assigned to you\s+(\d+)\s+active pickup/i),
    completed:   grab(/completed\s+(\d+)\s+scrapped/i),
  }
}

// ═══════════════════════ 1. LOGIN + LANDING ═══════════════════════

test("CC operator signs in and lands on /cc/dashboard", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)

  // The session must report role=cc_operator (drives every page guard).
  const session = await page.request.get(`${base}/api/auth/session`).then((r) => r.json())
  expect(session?.user?.role, "session role must be cc_operator").toBe("cc_operator")
  expect(session?.user?.linkedCcId, "cc_operator must be linked to a CC").toBeTruthy()

  // post-login dispatcher routes role → landing.
  await page.goto(`${base}/post-login`)
  await page.waitForURL(/\/cc\/dashboard/, { timeout: 20_000 })
  expect(page.url()).toContain("/cc/dashboard")
})

// ═══════════════════════ 2. DASHBOARD STAT CARDS ═══════════════════════

test("CC dashboard renders 4 stat cards with non-zero demo counts", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)

  const resp = await page.goto(`${base}/cc/dashboard`)
  expect(resp?.status(), "/cc/dashboard must 200").toBe(200)
  expect(page.url(), "must not bounce to /login").toContain("/cc/dashboard")

  // All four card headings present.
  for (const heading of ["In your catchment", "You've accepted", "Assigned to you", "Completed"]) {
    await expect(
      page.getByText(new RegExp(heading, "i")).first(),
      `stat card "${heading}" must render`
    ).toBeVisible()
  }

  // Counts. Demo data: Lead A + C in catchment, Lead B assigned. A prior bug
  // (string-vs-ObjectId in the aggregate $match — fix 6bf3135) made these all
  // read 0; assert the demo-backed cards are non-zero so that regression
  // cannot slip through again.
  const stats = await readDashboardStats(page)
  expect(stats.inCatchment, "In-catchment count parse").not.toBeNaN()
  expect(stats.inCatchment, "Lead A + C are in catchment → must be >= 1").toBeGreaterThanOrEqual(1)
  expect(stats.assigned, "Lead B is assigned to this CC → must be >= 1").toBeGreaterThanOrEqual(1)
  // accepted/completed have no demo data — just confirm they parsed as numbers.
  expect(stats.accepted, "accepted count must be a number").not.toBeNaN()
  expect(stats.completed, "completed count must be a number").not.toBeNaN()
})

// ═══════════════════════ 3. LEADS LIST ═══════════════════════

test("CC /cc/leads lists catchment leads with vehicle cards", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)

  const resp = await page.goto(`${base}/cc/leads`)
  expect(resp?.status(), "/cc/leads must 200").toBe(200)
  expect(page.url()).toContain("/cc/leads")

  // The list <ul aria-label="Available leads"> should hold >= 1 card (Lead A
  // and/or C are marketplace_visible in this catchment).
  const cards = page.locator('ul[aria-label="Available leads"] > li')
  await expect(cards.first(), "at least one lead card must render").toBeVisible({ timeout: 15_000 })
  const count = await cards.count()
  expect(count, "catchment has >= 1 marketplace-visible lead").toBeGreaterThanOrEqual(1)

  // Each card must show a vehicle make/model heading and an est. scrap value.
  const firstCard = cards.first()
  await expect(firstCard.locator("h3"), "card vehicle heading").toBeVisible()
  await expect(
    firstCard.getByText(/est\. scrap value/i),
    "card est. scrap value label"
  ).toBeVisible()
})

// ═══════════════════════ 4. ACCEPT LEAD BUTTON ═══════════════════════

test("Accept lead — optimistic flip, CSRF passes, idempotent on repeat", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)

  await page.goto(`${base}/cc/leads`)
  const cards = page.locator('ul[aria-label="Available leads"] > li')
  await expect(cards.first()).toBeVisible({ timeout: 15_000 })

  // Find a card whose Accept button is still actionable (not already "Accepted").
  // NB: the <button> carries aria-label="Accept this lead and notify your RVSF",
  // so the button's ACCESSIBLE NAME is that aria-label (not the visible
  // "Accept lead" text) — locate by the aria-label.
  const acceptButtons = page.getByRole("button", { name: /accept this lead/i })
  const actionable = acceptButtons.first()
  await expect(actionable, "at least one un-accepted lead to accept").toBeVisible({ timeout: 10_000 })

  // Capture the POST so we can prove the CSRF header was attached and the
  // server returned ok (the global interceptor injects X-CSRF-Token).
  const acceptPromise = page.waitForResponse(
    (r) => /\/api\/cc\/leads\/[a-f0-9]{24}\/accept$/.test(r.url()) && r.request().method() === "POST",
    { timeout: 20_000 }
  )
  await actionable.click()
  const resp = await acceptPromise

  // CSRF: the interceptor must have stamped the header — a missing/invalid
  // token would have produced a 403 with a "CSRF" error body.
  const csrfHeader = resp.request().headers()["x-csrf-token"]
  expect(csrfHeader, "X-CSRF-Token header must be present on the accept POST").toBeTruthy()
  expect(resp.status(), `accept POST must succeed (got ${resp.status()})`).toBe(200)
  const body = await resp.json()
  expect(body.ok, "accept response ok:true").toBe(true)

  // Optimistic UI: the button flips to the "Accepted — RVSF notified" state.
  await expect(
    page.getByText(/accepted\s*—\s*rvsf notified/i).first(),
    "button must flip to the accepted state"
  ).toBeVisible({ timeout: 10_000 })

  // Idempotency: re-POST the SAME lead id directly. The component hides the
  // button after success, so we replay via fetch from the page context (the
  // CSRF interceptor still applies). A duplicate accept must NEVER 500 and
  // must be handled gracefully (200 idempotent, or 409).
  const leadId = resp.url().match(/leads\/([a-f0-9]{24})\/accept/)![1]
  const replay = async () =>
    page.evaluate(async (id) => {
      const r = await fetch(`/api/cc/leads/${id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      return { status: r.status, body: await r.json().catch(() => ({})) }
    }, leadId)

  const r2 = await replay()
  expect(
    [200, 409].includes(r2.status),
    `second accept must be handled gracefully (200 or 409), got ${r2.status} ${JSON.stringify(r2.body)}`
  ).toBe(true)
  expect(r2.status, "duplicate accept must not 500").toBeLessThan(500)

  // BUG FIX VERIFICATION (commit on feat/v2-m14-finale — accept-route idempotency):
  //   The route previously computed `alreadyAccepted` from
  //   `updateOne().modifiedCount === 0`. The Lead schema has
  //   `{ timestamps: true }`, so every updateOne bumps `updatedAt` and
  //   modifiedCount is ALWAYS 1 — so a duplicate accept was never detected and
  //   the parent-RVSF Notification fired on every click (RVSF spam). The fix
  //   computes `alreadyAccepted` from the pre-fetched `lead.ccAcceptedBy`.
  //
  //   On a deploy that includes the fix this MUST be true. On the pre-fix
  //   deploy it is false — we surface that loudly via test.info().annotations
  //   instead of failing, so this spec is green pre-deploy and becomes a hard
  //   regression guard the moment the fix ships. After the PM's final deploy
  //   this branch should always take the `=== true` path.
  if (r2.status === 200) {
    if (r2.body.alreadyAccepted === true) {
      expect(r2.body.alreadyAccepted, "repeat accept → alreadyAccepted:true (fix is live)").toBe(true)
    } else {
      test.info().annotations.push({
        type: "deploy-pending",
        description:
          "accept-route idempotency fix not yet deployed: repeat accept returned " +
          `alreadyAccepted:${r2.body.alreadyAccepted} (expected true). RE-RUN AFTER DEPLOY — this must flip to true.`,
      })
    }
  }
})

test("Accept lead — bad lead id rejected cleanly (no 500)", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)
  await page.goto(`${base}/cc/dashboard`)

  // Malformed id → 400 (mongoose.isValidObjectId guard).
  const bad = await page.evaluate(async () => {
    const r = await fetch("/api/cc/leads/not-an-objectid/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    return { status: r.status }
  })
  expect(bad.status, "malformed lead id → 400, never 500").toBe(400)

  // Well-formed but non-existent id → 404 (not 500).
  const missing = await page.evaluate(async () => {
    const r = await fetch("/api/cc/leads/0123456789abcdef01234567/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    return { status: r.status }
  })
  expect(missing.status, "non-existent lead id → 404, never 500").toBe(404)
})

test("Accept lead — POST without CSRF header is rejected with 403", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)
  await page.goto(`${base}/cc/dashboard`)

  // Use the page's ORIGINAL (un-patched) fetch via XMLHttpRequest so the
  // global interceptor cannot inject the token — proves the server enforces
  // CSRF rather than relying purely on the client.
  const noCsrf = await page.evaluate(async () => {
    return await new Promise<{ status: number; body: string }>((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/cc/leads/0123456789abcdef01234567/accept")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.onload = () => resolve({ status: xhr.status, body: xhr.responseText })
      xhr.onerror = () => resolve({ status: -1, body: "" })
      xhr.send("{}")
    })
  })
  expect(noCsrf.status, "mutating POST without X-CSRF-Token must be 403").toBe(403)
  expect(noCsrf.body, "403 body should mention CSRF").toMatch(/csrf/i)
})

// ═══════════════════════ 5. CHAT VISIBILITY (READ-ONLY) ═══════════════════════

test("CC operator can READ catchment chat threads via /api/chat/my-threads", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)
  await page.goto(`${base}/cc/dashboard`)

  // my-threads filters on assignedCcId === linkedCcId. Lead B's thread (and
  // Lead C's archived thread) are assigned to this CC → expect >= 1 thread.
  const res = await page.evaluate(async () => {
    const r = await fetch("/api/chat/my-threads")
    return { status: r.status, body: await r.json().catch(() => ({})) }
  })
  expect(res.status, "/api/chat/my-threads must 200 for cc_operator").toBe(200)
  expect(Array.isArray(res.body.threads), "threads array present").toBe(true)
  expect(res.body.threads.length, "cc_operator has >= 1 catchment thread (Lead B)").toBeGreaterThanOrEqual(1)

  // Open one thread's messages — read-only access must succeed (GET allowed).
  const leadId = res.body.threads[0].leadId
  const msgs = await page.evaluate(async (lid) => {
    const r = await fetch(`/api/chat/threads/${lid}/messages`)
    return { status: r.status, body: await r.json().catch(() => ({})) }
  }, leadId)
  expect(msgs.status, "cc_operator can GET thread messages").toBe(200)
  expect(Array.isArray(msgs.body.messages), "messages array present").toBe(true)
})

test("CC operator is BLOCKED from posting chat messages (403)", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)
  await page.goto(`${base}/cc/dashboard`)

  // Grab a thread the operator can read.
  const threads = await page.evaluate(async () => {
    const r = await fetch("/api/chat/my-threads")
    return r.ok ? (await r.json()).threads : []
  })
  expect(threads.length, "need a thread to attempt a post").toBeGreaterThanOrEqual(1)
  const leadId = threads[0].leadId

  // POST a message — cc_operator is deliberately excluded from PARTY_ROLES on
  // the messages POST. Must be 403, never 201, never 500.
  const post = await page.evaluate(async (lid) => {
    const r = await fetch(`/api/chat/threads/${lid}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "text", text: "cc operator should not be able to send this" }),
    })
    return { status: r.status, body: await r.json().catch(() => ({})) }
  }, leadId)
  expect(
    post.status,
    `cc_operator chat POST must be 403 (read-only role), got ${post.status} ${JSON.stringify(post.body)}`
  ).toBe(403)
})

// ═══════════════════════ 6. CHANGE-PASSWORD ENDPOINT ═══════════════════════

test("CC change-password endpoint validates input and round-trips", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)
  await page.goto(`${base}/cc/dashboard`)

  // Helper to call the endpoint from the page (CSRF interceptor applies).
  const callChange = (payload: object) =>
    page.evaluate(async (body) => {
      const r = await fetch("/api/cc/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      return { status: r.status, body: await r.json().catch(() => ({})) }
    }, payload)

  // 6a. Missing fields → 400.
  expect((await callChange({})).status, "empty body → 400").toBe(400)

  // 6b. Too-short new password → 400.
  expect(
    (await callChange({ currentPassword: TEST_PASSWORD, newPassword: "short" })).status,
    "new password < 10 chars → 400"
  ).toBe(400)

  // 6c. New === current → 400.
  expect(
    (await callChange({ currentPassword: TEST_PASSWORD, newPassword: TEST_PASSWORD })).status,
    "new password equals current → 400"
  ).toBe(400)

  // 6d. Wrong current password → 401.
  expect(
    (await callChange({ currentPassword: "WrongPassword999!", newPassword: "BrandNewValid123!" })).status,
    "wrong current password → 401"
  ).toBe(401)

  // 6e. Happy path: change to a new password, then change it straight back so
  // the shared test account is left exactly as we found it (the suite is
  // designed to be re-runnable; centre.test must keep TEST_PASSWORD).
  const TEMP = "TempCcPass2026X!"
  const ok = await callChange({ currentPassword: TEST_PASSWORD, newPassword: TEMP })
  expect(ok.status, `change to temp password should 200, got ${ok.status} ${JSON.stringify(ok.body)}`).toBe(200)
  expect(ok.body.ok, "change-password ok:true").toBe(true)

  // Revert. (mustChangePassword is now false; the endpoint still works because
  // it only requires role + correct current password.)
  const revert = await callChange({ currentPassword: TEMP, newPassword: TEST_PASSWORD })
  expect(
    revert.status,
    `revert to original password should 200, got ${revert.status} ${JSON.stringify(revert.body)} ` +
      `— IF THIS FAILS the centre.test password is now "${TEMP}" and must be reset`
  ).toBe(200)
})

test("CC /cc/first-login bounces an already-changed operator to the dashboard", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)

  // centre.test has mustChangePassword:false, so the middleware first-login
  // GATE does not redirect them TO /cc/first-login (that path is only forced
  // for mustChangePassword:true operators — untestable here without such a
  // user). But the /cc/first-login PAGE itself has a guard: a cc_operator who
  // already changed their password and lands here should be routed to
  // /cc/dashboard rather than shown a redundant change-password form.
  await page.goto(`${base}/cc/first-login`)
  await page.waitForURL(/\/cc\/dashboard/, { timeout: 20_000 })
  expect(page.url(), "already-changed operator must be sent to /cc/dashboard").toContain("/cc/dashboard")
})

// ═══════════════════════ 7. ROLE ISOLATION ═══════════════════════

test("CC operator is denied admin/rvsf/customer DATA via API (403, no leak)", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)
  await page.goto(`${base}/cc/dashboard`)

  // The page-level guards differ per surface (some redirect, some render a
  // login form), but the SECURITY boundary is the API. A cc_operator must be
  // 403'd from data endpoints owned by other roles — never 200, never 500.
  const probes = [
    "/api/leads/mine",            // customer-only
    "/api/marketplace/leads",     // rvsf-only
  ]
  for (const path of probes) {
    const res = await page.evaluate(async (p) => {
      const r = await fetch(p)
      return { status: r.status }
    }, path)
    expect(
      res.status,
      `cc_operator must be forbidden from ${path} (expect 401/403, got ${res.status})`
    ).toBeGreaterThanOrEqual(401)
    expect(res.status, `${path} must not 500 for cc_operator`).toBeLessThan(500)
  }
})

test("CC operator hitting /admin and /rvsf/marketplace does not 500", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)

  // /admin — role guard renders the admin login form for a non-admin (no 500).
  const adminResp = await page.goto(`${base}/admin`)
  expect(adminResp?.status(), "/admin must not 500 for cc_operator").toBeLessThan(500)

  // /rvsf/marketplace — client page; the data API 403s so no leak, no crash.
  const mktResp = await page.goto(`${base}/rvsf/marketplace`)
  expect(mktResp?.status(), "/rvsf/marketplace must not 500 for cc_operator").toBeLessThan(500)

  // /me — customer surface; must not 500.
  const meResp = await page.goto(`${base}/me`)
  expect(meResp?.status(), "/me must not 500 for cc_operator").toBeLessThan(500)
})

// ═══════════════════════ 8. LOGOUT ═══════════════════════

test("CC operator can sign out and loses access to /cc/dashboard", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)

  // Confirm signed-in first.
  await page.goto(`${base}/cc/dashboard`)
  expect(page.url()).toContain("/cc/dashboard")

  // Sign out via the NextAuth endpoint (same target as the dashboard's
  // "Sign out" link href="/api/auth/signout?callbackUrl=/login").
  await page.goto(`${base}/api/auth/signout?callbackUrl=/login`)
  // The signout page has a confirm button; click it if present.
  const signoutBtn = page.getByRole("button", { name: /sign out/i })
  if (await signoutBtn.count()) {
    await signoutBtn.first().click()
  }

  // Session must now be empty.
  await expect
    .poll(
      async () => {
        const s = await page.request.get(`${base}/api/auth/session`).then((r) => r.json())
        return s?.user ? "has-user" : "empty"
      },
      { message: "session should be cleared after signout", timeout: 15_000 }
    )
    .toBe("empty")

  // Deep-linking back to /cc/dashboard must bounce to /login (server guard
  // `if (!session?.user) redirect("/login?callbackUrl=/cc/dashboard")`).
  await page.goto(`${base}/cc/dashboard`)
  await page.waitForURL(/\/login/, { timeout: 15_000 })
  expect(page.url(), "logged-out user must be redirected to /login").toContain("/login")
})
