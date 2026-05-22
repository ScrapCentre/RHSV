/**
 * customer-write.spec.ts — ScrapCentre.com v2 CUSTOMER-surface write coverage.
 *
 * Exercises every mutating action a `role: client` user can perform:
 *   1. Login via the EMAIL/PASS tab → lands on /me
 *   2. /me dashboard renders the lead list + thread count + new-quote link
 *   3. /me/lead/[id] renders for all 3 demo leads, no client-side crash
 *   4. THE NEGOTIATION WIDGET on Lead B — fresh-offer render, Counter, Reject,
 *      Accept (the founder's #1 reported bug). Companion to negotiation.spec.ts
 *      which owns the exhaustive offer-state-machine matrix; this file proves
 *      the CUSTOMER widget (components/me/OfferActions.tsx on /me/lead/[id])
 *      drives all four actions end-to-end through the browser.
 *   5. /me/chat inbox + /me/chat/[threadId] — open a thread, send a message
 *   6. The "I need to change something" LeadHelpForm — submit it
 *   7. 3-tier calculator — reg → OTP → tier-2 breakdown → tier-3 upload page
 *   8. Customer logout
 *
 * ALL write actions are driven through the BROWSER (page.click / page.fill)
 * so the global CSRF fetch interceptor (lib/install-csrf-fetch.ts) applies —
 * a direct request.post() would 403 without a hand-attached X-CSRF-Token.
 *
 * NEGOTIATION-WIDGET ISOLATION:
 *   The negotiation tests share a single demo lead (Lead B has exactly one
 *   chat thread). To keep them independent + re-runnable:
 *     - The whole negotiation block runs SERIALLY.
 *     - `beforeAll` re-seeds ONCE — this clears any stale `Lead.agreedPrice`
 *       (set by a prior Accept run) so the active-offer card renders again,
 *       and waits until the live server actually sees the fresh open offer.
 *     - Each test then posts its OWN fresh RVSF offer (as partner.test) and
 *       acts on the newest one — so leftover offers from a prior test never
 *       interfere (the lead page selects the most-recent open offer).
 *     - Accept runs LAST: it is the only action that pins `agreedPrice`
 *       permanently, so nothing after it depends on a clear lead.
 *   Re-seed shells out locally (the Playwright box IS VM 221, where the
 *   seeder + .env.local live); off that host the block self-skips.
 *
 * Pre-req: scripts/seed-demo-leads.ts has been run at least once (Lead A/B/C
 * exist for client.test@scrapcentre.online; Lead B is `negotiating`).
 */
import { test, expect, type Browser } from "@playwright/test"
import { execSync } from "node:child_process"
import {
  signInAsClient,
  signInAsPartner,
  signInAsAdmin,
  requireBaseURL,
  TEST_PASSWORD,
} from "./helpers/auth"
import {
  resolveLeadByReg,
  fetchMyLeads,
  getCsrfToken,
  LEAD_A_REG,
  LEAD_B_REG,
  LEAD_C_REG,
} from "./helpers/customer"

const CLIENT_EMAIL = "client.test@scrapcentre.online"

// ───────────────────────── re-seed helper ─────────────────────────
// The suite runs ON VM 221 where the repo + seeder live. Re-seed resets the
// demo leads to a clean state (Lead B = `negotiating`, agreedPrice unset,
// one open ₹14,500 RVSF offer). Off that host (e.g. a dev laptop) the
// negotiation block self-skips — it is destructive + staging-only.
const VM_REPO = "/opt/scrapcentre"

function onSeedHost(): boolean {
  try {
    execSync(
      `test -f ${VM_REPO}/scripts/seed-demo-leads.ts && test -f ${VM_REPO}/.env.local`,
      { stdio: "ignore" }
    )
    return true
  } catch {
    return false
  }
}
const SEED_HOST = onSeedHost()

function reseed(): void {
  execSync(
    `cd ${VM_REPO} && sudo -u scrap bash -lc "set -a && source .env.local && set +a && ` +
      `ALLOW_PROD_SEED=1 npx tsx scripts/seed-demo-leads.ts"`,
    { stdio: "pipe", timeout: 120_000 }
  )
}

/**
 * Post a fresh OPEN offer from the RVSF side into Lead B's chat thread, using
 * a throwaway partner.test API context (separate cookie jar — the customer's
 * browser context is untouched). The RVSF-posted offer has actor "rvsf" and
 * senderUserId = partner, so the customer is NOT the poster and may legally
 * Accept it (the accept route forbids self-accept by senderUserId).
 *
 * Returns the new offer's messageId.
 */
async function postFreshRvsfOffer(
  browser: Browser,
  base: string,
  leadBId: string,
  amountRupees: number
): Promise<string> {
  const partnerCtx = await browser.newContext()
  try {
    await signInAsPartner(partnerCtx, base)
    const csrf = await getCsrfToken(partnerCtx.request, base)

    // Retry on 404 ("No active thread") — immediately after a re-seed the
    // staging server can briefly serve a read-after-write-lagged view where
    // the fresh active thread isn't visible to the write-mode lookup yet.
    let res: import("@playwright/test").APIResponse | null = null
    for (let attempt = 1; attempt <= 6; attempt++) {
      res = await partnerCtx.request.post(
        `${base}/api/chat/threads/${leadBId}/messages`,
        {
          headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
          data: { type: "offer", offerAmountPaise: amountRupees * 100 },
        }
      )
      if (res.ok()) break
      if (res.status() !== 404) break // a real error — surface it below
      await new Promise((r) => setTimeout(r, 1500))
    }
    expect(
      res!.ok(),
      `partner offer POST failed: ${res!.status()} ${await res!.text()}`
    ).toBeTruthy()
    const body = await res!.json()
    expect(body.message?._id, "offer messageId missing from response").toBeTruthy()
    return body.message._id as string
  } finally {
    await partnerCtx.close()
  }
}

// ───────────────────────────────────────────────────────────────────────────
// 1. LOGIN via the EMAIL/PASS tab → /me
// ───────────────────────────────────────────────────────────────────────────
test("customer login via EMAIL/PASS tab lands on /me", async ({ page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await page.goto(`${base}/login`)

  // User tab is the default ("standard"). Click the "EMAIL / PASS" toggle so
  // the email+password form replaces the phone-OTP form.
  await page.getByRole("button", { name: /email \/ pass/i }).click()

  await page.getByPlaceholder("email@example.com").fill(CLIENT_EMAIL)
  await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD)
  await page.getByRole("button", { name: /^sign in$/i }).click()

  // Credentials login redirects via landingForRole("client") === "/me".
  await page.waitForURL(/\/me(\/|$|\?)/, { timeout: 30_000 })
  await expect(
    page.getByText("Welcome to your ScrapCentre.com dashboard")
  ).toBeVisible({ timeout: 15_000 })
})

// ───────────────────────────────────────────────────────────────────────────
// 2. /me DASHBOARD — lead list + thread count + new-quote link
// ───────────────────────────────────────────────────────────────────────────
test("/me dashboard shows leads, thread count, and new-quote link", async ({
  context,
  page,
  baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)

  await page.goto(`${base}/me`)
  await expect(
    page.getByText("Welcome to your ScrapCentre.com dashboard")
  ).toBeVisible({ timeout: 15_000 })

  // The 3 demo leads must each surface as a clickable card.
  for (const reg of [LEAD_A_REG, LEAD_B_REG, LEAD_C_REG]) {
    await expect(page.getByText(reg, { exact: true })).toBeVisible()
  }

  // "Get a new quote" link points at /calculator.
  const quoteLink = page.getByRole("link", { name: /get a new quote/i })
  await expect(quoteLink).toHaveAttribute("href", "/calculator")

  // Thread count card — Lead B has a thread, so "My conversations" must say
  // "N active thread(s)" (not "No threads yet").
  await expect(page.getByText(/active thread/i)).toBeVisible()
})

// ───────────────────────────────────────────────────────────────────────────
// 3. /me/lead/[id] — renders for all 3 demo leads, no client-side crash
// ───────────────────────────────────────────────────────────────────────────
test("/me/lead/[id] renders cleanly for all 3 demo leads", async ({
  context,
  page,
  baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)

  const leads = await fetchMyLeads(context.request, base)
  const demo = leads.filter((l) =>
    [LEAD_A_REG, LEAD_B_REG, LEAD_C_REG].includes(
      l.vehicle?.registrationNumber ?? ""
    )
  )
  expect(demo.length, "expected 3 demo leads").toBeGreaterThanOrEqual(3)

  for (const lead of demo) {
    const pageErrors: string[] = []
    page.on("pageerror", (e) => pageErrors.push(e.message))

    await page.goto(`${base}/me/lead/${lead._id}`)
    // Hero (reg number) + the always-present "Your quote", "Documents", and
    // "Activity" sections must all render.
    await expect(
      page.getByText(lead.vehicle!.registrationNumber!, { exact: true }).first()
    ).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole("heading", { name: "Your quote" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible()

    expect(
      pageErrors,
      `client-side crash on /me/lead/${lead._id} (${lead.vehicle?.registrationNumber}): ${pageErrors.join("; ")}`
    ).toHaveLength(0)
    page.removeAllListeners("pageerror")
  }
})

// ───────────────────────────────────────────────────────────────────────────
// 4. THE NEGOTIATION WIDGET — fresh-offer render + Counter + Reject + Accept
//    (founder's #1 bug). Serial block; re-seeds once up front; each test
//    self-posts its own RVSF offer; Accept runs LAST. See file header.
// ───────────────────────────────────────────────────────────────────────────
test.describe("negotiation widget on /me/lead/[B]", () => {
  test.skip(
    !SEED_HOST,
    "negotiation block re-seeds shared demo data — only runs on the seeded host (VM 221)"
  )
  test.describe.configure({ mode: "serial" })

  // One re-seed up front: clears any stale Lead.agreedPrice from a prior
  // Accept run (which would otherwise suppress the active-offer card), and
  // we then wait until the live server actually sees the fresh open offer
  // (guards against the brief read-after-write lag on the staging replica).
  test.beforeAll(async ({ browser, baseURL }) => {
    const base = requireBaseURL(baseURL)
    reseed()

    // Poll the live API until the freshly-seeded Lead B shows up `negotiating`
    // with no agreedPrice and exactly one open offer — i.e. the reseed is
    // visible to the server the tests will hit.
    const verifyCtx = await browser.newContext()
    try {
      await signInAsClient(verifyCtx, base)
      await expect
        .poll(
          async () => {
            const leads = await fetchMyLeads(verifyCtx.request, base)
            const b: any = leads.find(
              (l) => l.vehicle?.registrationNumber === LEAD_B_REG
            )
            if (!b || b.state !== "negotiating" || b.agreedPrice) return "not-ready"
            // The thread must be present AND active (not archived) — a write
            // (offer POST) requires status:"active". /api/chat/threads/[id]
            // surfaces isReadOnly so we can distinguish.
            const t = await verifyCtx.request.get(
              `${base}/api/chat/threads/${b._id}`
            )
            if (!t.ok()) return "no-thread"
            const tBody = await t.json()
            if (tBody.active?.status !== "active" || tBody.active?.isReadOnly) {
              return "thread-not-active"
            }
            const m = await verifyCtx.request.get(
              `${base}/api/chat/threads/${b._id}/messages`
            )
            if (!m.ok()) return "no-messages"
            const { messages } = await m.json()
            const open = (messages as any[]).filter(
              (x) => x.type === "offer" && x.offer?.status === "open"
            )
            return open.length === 1 ? "ready" : `open=${open.length}`
          },
          {
            message: "reseed did not settle to a clean open-offer state",
            timeout: 30_000,
            intervals: [1000, 2000, 3000],
          }
        )
        .toBe("ready")
    } finally {
      await verifyCtx.close()
    }
  })

  // ── 4a: a fresh RVSF offer renders the active-offer card ──
  test("a fresh RVSF offer renders the active-offer card with all 3 actions", async ({
    context,
    page,
    baseURL,
  }) => {
    const base = requireBaseURL(baseURL)
    await signInAsClient(context, base)
    const leadB = await resolveLeadByReg(context.request, base, LEAD_B_REG)

    const amount = 13700
    await postFreshRvsfOffer(context.browser()!, base, leadB._id, amount)

    await page.goto(`${base}/me/lead/${leadB._id}`)
    await expect(page.getByText(/offer from rvsf/i)).toBeVisible({
      timeout: 15_000,
    })
    await expect(
      page.getByText(`₹${amount.toLocaleString("en-IN")}`).first()
    ).toBeVisible()
    // The customer is the non-poster → all three actions present + enabled.
    await expect(
      page.getByRole("button", { name: /accept ₹/i })
    ).toBeVisible()
    await expect(page.getByRole("button", { name: /^counter$/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /^reject$/i })).toBeVisible()
  })

  // ── 4b: COUNTER an RVSF offer (non-destructive) ──
  test("customer COUNTERs an RVSF offer", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsClient(context, base)
    const leadB = await resolveLeadByReg(context.request, base, LEAD_B_REG)

    await postFreshRvsfOffer(context.browser()!, base, leadB._id, 13900)

    await page.goto(`${base}/me/lead/${leadB._id}`)
    await expect(page.getByText(/offer from rvsf/i)).toBeVisible({
      timeout: 15_000,
    })

    // Click "Counter" → the inline counter-amount input appears.
    await page.getByRole("button", { name: /^counter$/i }).click()
    const counterAmount = 15250
    const counterInput = page.getByPlaceholder("e.g. 15000")
    await expect(counterInput).toBeVisible()
    await counterInput.fill(String(counterAmount))
    await page.getByRole("button", { name: /^send$/i }).click()

    // OfferActions calls router.refresh() on success. The new offer is now a
    // CUSTOMER offer → the page shows "Your open offer" with the countered
    // amount, and the customer can no longer act (waiting on the RVSF).
    await expect(page.getByText(/your open offer/i)).toBeVisible({
      timeout: 15_000,
    })
    await expect(
      page.getByText(`₹${counterAmount.toLocaleString("en-IN")}`).first()
    ).toBeVisible()
    await expect(page.getByText(/you posted this offer/i)).toBeVisible()

    // Server truth: a new open CUSTOMER offer of the countered amount exists.
    const csrf = await getCsrfToken(context.request, base)
    const msgsRes = await context.request.get(
      `${base}/api/chat/threads/${leadB._id}/messages`,
      { headers: { "X-CSRF-Token": csrf } }
    )
    expect(msgsRes.ok()).toBeTruthy()
    const { messages } = await msgsRes.json()
    const openCustomerOffer = (messages as any[]).find(
      (m) =>
        m.type === "offer" &&
        m.offer?.status === "open" &&
        m.offer?.actor === "customer" &&
        m.offer?.amountPaise === counterAmount * 100
    )
    expect(
      openCustomerOffer,
      "countered offer not found as an open customer offer in the thread"
    ).toBeTruthy()
  })

  // ── 4c: REJECT an RVSF offer (non-destructive — lead stays negotiating) ──
  test("customer REJECTs an RVSF offer", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsClient(context, base)
    const leadB = await resolveLeadByReg(context.request, base, LEAD_B_REG)

    const offerId = await postFreshRvsfOffer(
      context.browser()!,
      base,
      leadB._id,
      13300
    )

    await page.goto(`${base}/me/lead/${leadB._id}`)
    await expect(page.getByText(/offer from rvsf/i)).toBeVisible({
      timeout: 15_000,
    })

    // handleReject() fires a window.confirm() — auto-accept the dialog.
    page.once("dialog", (d) => d.accept())
    await page.getByRole("button", { name: /^reject$/i }).click()

    // Server truth is the reliable signal: the offer's status flips to
    // "rejected". (The card visually disappears too, but the lead may still
    // carry an open CUSTOMER counter from 4b, so we assert on the offer id.)
    await expect
      .poll(
        async () => {
          const csrf = await getCsrfToken(context.request, base)
          const r = await context.request.get(
            `${base}/api/chat/threads/${leadB._id}/messages`,
            { headers: { "X-CSRF-Token": csrf } }
          )
          if (!r.ok()) return "fetch-failed"
          const { messages } = await r.json()
          const o = (messages as any[]).find((m) => m._id === offerId)
          return o?.offer?.status ?? "missing"
        },
        {
          message: "rejected offer status did not flip to 'rejected'",
          timeout: 15_000,
        }
      )
      .toBe("rejected")
  })

  // ── 4d: ACCEPT an RVSF offer (DESTRUCTIVE — pins agreedPrice; runs LAST) ──
  test("customer ACCEPTs an RVSF offer", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsClient(context, base)
    const leadB = await resolveLeadByReg(context.request, base, LEAD_B_REG)

    const amount = 14250
    await postFreshRvsfOffer(context.browser()!, base, leadB._id, amount)

    await page.goto(`${base}/me/lead/${leadB._id}`)
    await expect(page.getByText(/offer from rvsf/i)).toBeVisible({
      timeout: 15_000,
    })

    // OfferActions.handleAccept() fires a window.confirm() — auto-accept it.
    page.once("dialog", (d) => d.accept())
    await page.getByRole("button", { name: /accept ₹/i }).click()

    // After accept, the page re-renders with the green "Agreed price" banner
    // (lead.agreedPrice is now set) and the active-offer card disappears.
    await expect(
      page.getByText("Agreed price", { exact: true })
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      page.getByText(`₹${amount.toLocaleString("en-IN")}`).first()
    ).toBeVisible()

    // Server truth: Lead.agreedPrice.amountPaise is pinned to the accepted amt.
    const leadsAfter = await fetchMyLeads(context.request, base)
    const leadBAfter: any = leadsAfter.find(
      (l) => l.vehicle?.registrationNumber === LEAD_B_REG
    )
    expect(
      leadBAfter?.agreedPrice?.amountPaise,
      "Lead.agreedPrice not pinned after accept"
    ).toBe(amount * 100)
  })
})

// ───────────────────────────────────────────────────────────────────────────
// 5. /me/chat INBOX + /me/chat/[threadId] — open a thread, send a message
// ───────────────────────────────────────────────────────────────────────────
test("/me/chat inbox lists threads + customer can send a chat message", async ({
  context,
  page,
  baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)
  const leadB = await resolveLeadByReg(context.request, base, LEAD_B_REG)

  // Inbox lists at least Lead B's thread.
  await page.goto(`${base}/me/chat`)
  await expect(page.getByText("My conversations")).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText(`Lead ${leadB._id.slice(-6)}`)).toBeVisible({
    timeout: 15_000,
  })

  // Open Lead B's thread.
  await page.goto(`${base}/me/chat/${leadB._id}`)
  await expect(page.getByText("Conversation with your RVSF")).toBeVisible({
    timeout: 15_000,
  })

  // Send a text message via the composer.
  const unique = `E2E customer message ${Date.now()}`
  const composer = page.getByPlaceholder(/ask a question or share a detail/i)
  await expect(composer).toBeVisible({ timeout: 15_000 })
  await composer.fill(unique)
  await page.getByRole("button", { name: /^send$/i }).click()

  // ChatThread calls refresh() after a successful POST — the sent message
  // bubble must appear in the scroll area.
  await expect(page.getByText(unique)).toBeVisible({ timeout: 15_000 })
})

// ───────────────────────────────────────────────────────────────────────────
// 6. "I need to change something" LeadHelpForm — submit it
// ───────────────────────────────────────────────────────────────────────────
test("LeadHelpForm submits a support request from the lead detail page", async ({
  context,
  page,
  baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)
  const leadA = await resolveLeadByReg(context.request, base, LEAD_A_REG)

  await page.goto(`${base}/me/lead/${leadA._id}`)

  // Open the drawer.
  await page
    .getByRole("button", { name: /i need to change something/i })
    .click()
  await expect(page.getByText("Tell us what needs to change")).toBeVisible()

  // Name / email are prefilled from the session; phone may be empty — fill all
  // three defensively. The message textarea is required.
  await page.getByPlaceholder("Your name").fill("Test Client")
  await page.getByPlaceholder("Email").fill(CLIENT_EMAIL)
  await page.getByPlaceholder("Phone").fill("9876500001")
  await page
    .getByPlaceholder(/pickup address has changed/i)
    .fill(`E2E support test ${Date.now()} — please ignore.`)

  await page.getByRole("button", { name: /send to support/i }).click()

  // Success state.
  await expect(page.getByText(/got it — we'll be in touch/i)).toBeVisible({
    timeout: 15_000,
  })
})

// ───────────────────────────────────────────────────────────────────────────
// 7. 3-TIER CALCULATOR — reg → OTP → tier-2 breakdown → tier-3 upload page
// ───────────────────────────────────────────────────────────────────────────
test.describe("3-tier calculator", () => {
  // The calculator's Tier-1 reg lookup goes through the VAHAN mock. If that
  // service is left in `failure` mode (Setting.mockConfig.services.vahan),
  // EVERY lookup 400s and the calculator is unusable. Force it back to
  // `success` up front so the customer flow is testable + the live demo
  // works. (Mock config — not customer data — so this is a safe global reset;
  // POST /api/admin/mock-config invalidates the 10s server-side cache, but we
  // also wait out the TTL to be safe across any PM2 workers.)
  test.beforeAll(async ({ browser, baseURL }) => {
    const base = requireBaseURL(baseURL)
    const adminCtx = await browser.newContext()
    try {
      await signInAsAdmin(adminCtx, base)
      const csrf = await getCsrfToken(adminCtx.request, base)
      const res = await adminCtx.request.post(`${base}/api/admin/mock-config`, {
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        data: { services: { vahan: "success", otp: "success" } },
      })
      expect(
        res.ok(),
        `mock-config reset failed: ${res.status()} ${await res.text()}`
      ).toBeTruthy()
    } finally {
      await adminCtx.close()
    }
    // Wait out the getMockConfig() 10s TTL cache so the next tier-1 lookup
    // reads the freshly-written `success` mode.
    await new Promise((r) => setTimeout(r, 11_000))
  })

  test("calculator: reg lookup → OTP → tier-2 breakdown → tier-3 upload page", async ({
    page,
    baseURL,
  }) => {
    const base = requireBaseURL(baseURL)

    // -- Tier 1: reg number lookup --
    await page.goto(`${base}/calculator`)
    const regInput = page.getByPlaceholder("UP32 AB 1234")
    await expect(regInput).toBeVisible()
    await regInput.fill("UP32XY7788")

    // Tier-1 result band renders the unlock CTA. The visible label is
    // "Verify My Number — It's Free →" but the button carries an aria-label
    // ("Verify your mobile number to unlock the full benefit breakdown"),
    // which is the accessible name getByRole matches. Retry the lookup a few
    // times to absorb any residual VAHAN-mock flakiness (beforeAll forces it
    // to `success`, but a leftover `random` mode would still occasionally
    // 400; re-clicking "Get Value" re-fires the lookup).
    const unlockBtn = page.getByRole("button", {
      name: /verify your mobile number to unlock/i,
    })
    let bandShown = false
    for (let attempt = 1; attempt <= 6 && !bandShown; attempt++) {
      await page.getByRole("button", { name: /get value/i }).click()
      bandShown = await unlockBtn
        .waitFor({ state: "visible", timeout: 8000 })
        .then(() => true)
        .catch(() => false)
    }
    expect(
      bandShown,
      "tier-1 result band never rendered — VAHAN mock likely still in failure mode"
    ).toBeTruthy()
    await unlockBtn.click()

    // -- Tier 2: OTP gate --
    await page.waitForURL(/\/calculator\/verify/, { timeout: 15_000 })
    // Use a UNIQUE 10-digit phone per run — /api/otp/issue is rate-limited to
    // 3 issues per phone per 10 min, so a fixed number flakes on repeat runs.
    const phone = `9${Math.floor(100_000_000 + Math.random() * 900_000_000)}`
    await page.getByPlaceholder("98765 43210").fill(phone)
    await page.getByRole("button", { name: /send otp/i }).click()

    // Mock mode accepts any 6-digit code. The OTP field is the `input-otp`
    // library's single hidden <input> (autocomplete="one-time-code"), overlaid
    // on 6 visual slot divs. pressSequentially drives it digit-by-digit so the
    // library's controlled onChange fires for each character.
    const otpInput = page.locator('input[autocomplete="one-time-code"]')
    await expect(otpInput).toBeAttached({ timeout: 15_000 })
    await otpInput.focus()
    await otpInput.pressSequentially("123456", { delay: 100 })

    // OTPInput auto-submits onComplete (6th digit). The verify page ALSO has
    // its own "Verify →" button below — click whichever is still enabled,
    // harmless if verification already fired (button disables while verifying).
    const verifyBtns = page.getByRole("button", { name: /^verify →$/i })
    const count = await verifyBtns.count()
    for (let i = 0; i < count; i++) {
      const b = verifyBtns.nth(i)
      if (await b.isEnabled().catch(() => false)) {
        await b.click().catch(() => {})
        break
      }
    }

    // -- Tier 2 breakdown surfaces --
    await expect(page.getByText(/number verified/i)).toBeVisible({
      timeout: 20_000,
    })
    // Target the section heading specifically — the same phrase also appears
    // in the success toast + its aria-live status node (strict-mode would
    // fail on a bare getByText match).
    await expect(
      page.getByRole("heading", { name: /here's your full breakdown/i })
    ).toBeVisible()

    // -- Tier 3: proceed to the document-upload page --
    await page.getByRole("button", { name: /arrange free pickup/i }).click()
    await page.waitForURL(/\/calculator\/upload/, { timeout: 15_000 })
    await expect(
      page.getByText(/three things, and we take it from here/i)
    ).toBeVisible({ timeout: 15_000 })
  })
})

// ───────────────────────────────────────────────────────────────────────────
// 8. CUSTOMER LOGOUT
// ───────────────────────────────────────────────────────────────────────────
test("customer logout clears the session", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)

  // Confirm we're authenticated first.
  let sessionRes = await context.request.get(`${base}/api/auth/session`)
  expect(
    (await sessionRes.json())?.user,
    "not signed in before logout"
  ).toBeTruthy()

  // NextAuth sign-out: POST /api/auth/signout with the CSRF token (this is a
  // NextAuth route — it uses NextAuth's own CSRF, not the app interceptor).
  const csrfRes = await context.request.get(`${base}/api/auth/csrf`)
  const { csrfToken } = await csrfRes.json()
  const signOutRes = await context.request.post(`${base}/api/auth/signout`, {
    form: { csrfToken, callbackUrl: `${base}/` },
  })
  expect(signOutRes.ok() || signOutRes.status() === 302).toBeTruthy()

  // Session must now be empty.
  sessionRes = await context.request.get(`${base}/api/auth/session`)
  const after = await sessionRes.json()
  expect(after?.user, "session still active after logout").toBeFalsy()

  // And /me must show the unauthenticated fallback (the client component
  // renders "Please log in" when status !== authenticated).
  await page.goto(`${base}/me`)
  await expect(page.getByText(/please.*log in/i)).toBeVisible({
    timeout: 15_000,
  })
})
