/**
 * customer-write.spec.ts — ScrapCentre.com v2 CUSTOMER-surface write coverage.
 *
 * Exercises every mutating action a `role: client` user can perform:
 *   1. Login via the EMAIL/PASS tab → lands on /me
 *   2. /me dashboard renders the lead list + thread count
 *   3. /me/lead/[id] renders for all 3 demo leads, no client-side crash
 *   4. THE NEGOTIATION WIDGET on Lead B — Accept / Counter / Reject + a fresh
 *      RVSF offer renders. (Founder's #1 bug.)
 *   5. /me/chat inbox + /me/chat/[threadId] — open a thread, send a message
 *   6. The "I need to change something" LeadHelpForm — submit it
 *   7. 3-tier calculator — reg → OTP → tier-2 → tier-3
 *   8. Customer logout
 *
 * ALL write actions are driven through the BROWSER (page.click / page.fill)
 * so the global CSRF fetch interceptor (lib/install-csrf-fetch.ts) applies —
 * a direct request.post() would 403 without a hand-attached X-CSRF-Token.
 *
 * Negotiation independence: Accept and Reject CONSUME the open offer, so each
 * negotiation test posts its OWN fresh RVSF offer (as partner.test) before
 * acting on it. This makes every test independent + re-runnable without an
 * external reseed between runs. Counter is non-destructive (it leaves a new
 * open offer) but still uses a self-posted offer for isolation.
 *
 * Pre-req: scripts/seed-demo-leads.ts has been run (Lead A/B/C exist for
 * client.test@scrapcentre.online; Lead B is `negotiating` with a thread).
 */
import { test, expect, BrowserContext } from "@playwright/test"
import {
  signInAsClient,
  signInAsPartner,
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

/**
 * Post a fresh OPEN offer from the RVSF side into Lead B's chat thread.
 *
 * Uses a throwaway partner.test API context (separate cookie jar) so the
 * customer's browser context is untouched. The RVSF-posted offer has
 * `offer.actor: "rvsf"` and `senderUserId = partner` → the customer is NOT
 * the poster, so the customer can legitimately Accept it (the accept route
 * forbids self-accept by senderUserId).
 *
 * Returns the new offer's messageId.
 */
async function postFreshRvsfOffer(
  browser: BrowserContext["browser"],
  base: string,
  leadBId: string,
  amountRupees: number
): Promise<string> {
  const partnerCtx = await browser!.newContext()
  try {
    await signInAsPartner(partnerCtx, base)
    const csrf = await getCsrfToken(partnerCtx.request, base)
    const res = await partnerCtx.request.post(
      `${base}/api/chat/threads/${leadBId}/messages`,
      {
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        data: { type: "offer", offerAmountPaise: amountRupees * 100 },
      }
    )
    expect(
      res.ok(),
      `partner offer POST failed: ${res.status()} ${await res.text()}`
    ).toBeTruthy()
    const body = await res.json()
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

  // Email-or-ID + Password fields.
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

  // Thread count card — Lead B + Lead C threads exist, so "My conversations"
  // must say "N active thread(s)" (not "No threads yet").
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
    [LEAD_A_REG, LEAD_B_REG, LEAD_C_REG].includes(l.vehicle?.registrationNumber ?? "")
  )
  expect(demo.length, "expected 3 demo leads").toBeGreaterThanOrEqual(3)

  for (const lead of demo) {
    const pageErrors: string[] = []
    page.on("pageerror", (e) => pageErrors.push(e.message))

    await page.goto(`${base}/me/lead/${lead._id}`)
    // Hero (reg number) + stepper labels + the always-present "Your quote"
    // and "Activity" sections must all render.
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
// 4a. NEGOTIATION WIDGET — a fresh RVSF offer renders on the lead detail page
// ───────────────────────────────────────────────────────────────────────────
test("negotiation: a fresh RVSF offer renders on /me/lead/[B]", async ({
  context,
  page,
  baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)
  const leadB = await resolveLeadByReg(context.request, base, LEAD_B_REG)

  // Post a distinctive fresh offer from the RVSF side.
  const amount = 13700
  await postFreshRvsfOffer(context.browser(), base, leadB._id, amount)

  await page.goto(`${base}/me/lead/${leadB._id}`)
  // The active-offer card shows "OFFER FROM RVSF" + the rupee amount.
  await expect(page.getByText(/offer from rvsf/i)).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(`₹${amount.toLocaleString("en-IN")}`).first()).toBeVisible()
  // And the action buttons exist (customer may act on an RVSF-posted offer).
  await expect(page.getByRole("button", { name: new RegExp(`accept ₹`, "i") })).toBeVisible()
  await expect(page.getByRole("button", { name: /^counter$/i })).toBeVisible()
  await expect(page.getByRole("button", { name: /^reject$/i })).toBeVisible()
})

// ───────────────────────────────────────────────────────────────────────────
// 4b. NEGOTIATION WIDGET — COUNTER an RVSF offer (non-destructive)
// ───────────────────────────────────────────────────────────────────────────
test("negotiation: customer COUNTERs an RVSF offer on /me/lead/[B]", async ({
  context,
  page,
  baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)
  const leadB = await resolveLeadByReg(context.request, base, LEAD_B_REG)

  await postFreshRvsfOffer(context.browser(), base, leadB._id, 13900)

  await page.goto(`${base}/me/lead/${leadB._id}`)
  await expect(page.getByText(/offer from rvsf/i)).toBeVisible({ timeout: 15_000 })

  // Click "Counter" → the inline counter-amount input appears.
  await page.getByRole("button", { name: /^counter$/i }).click()
  const counterAmount = 15250
  const counterInput = page.getByPlaceholder("e.g. 15000")
  await expect(counterInput).toBeVisible()
  await counterInput.fill(String(counterAmount))
  await page.getByRole("button", { name: /^send$/i }).click()

  // OfferActions calls router.refresh() on success. The new offer is now a
  // CUSTOMER offer → the page shows "Your open offer" with the countered
  // amount, and the customer can no longer act (waiting on RVSF).
  await expect(page.getByText(/your open offer/i)).toBeVisible({ timeout: 15_000 })
  await expect(
    page.getByText(`₹${counterAmount.toLocaleString("en-IN")}`).first()
  ).toBeVisible()
  await expect(page.getByText(/you posted this offer/i)).toBeVisible()

  // Verify server-side: a new open offer of the countered amount, posted by
  // the customer, now exists in the thread.
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

// ───────────────────────────────────────────────────────────────────────────
// 4c. NEGOTIATION WIDGET — ACCEPT an RVSF offer (destructive → self-seeded)
// ───────────────────────────────────────────────────────────────────────────
test("negotiation: customer ACCEPTs an RVSF offer on /me/lead/[B]", async ({
  context,
  page,
  baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)
  const leadB = await resolveLeadByReg(context.request, base, LEAD_B_REG)

  const amount = 14250
  await postFreshRvsfOffer(context.browser(), base, leadB._id, amount)

  await page.goto(`${base}/me/lead/${leadB._id}`)
  await expect(page.getByText(/offer from rvsf/i)).toBeVisible({ timeout: 15_000 })

  // OfferActions.handleAccept() fires a window.confirm() — auto-accept it.
  page.once("dialog", (d) => d.accept())
  await page.getByRole("button", { name: /accept ₹/i }).click()

  // After accept, the page re-renders with the green "Agreed price" banner
  // (lead.agreedPrice is now set) and the offer card disappears.
  await expect(page.getByText(/agreed price/i)).toBeVisible({ timeout: 15_000 })
  await expect(
    page.getByText(`₹${amount.toLocaleString("en-IN")}`).first()
  ).toBeVisible()

  // Server-side confirmation: Lead.agreedPrice.amountPaise is pinned.
  const leadsAfter = await fetchMyLeads(context.request, base)
  const leadBAfter: any = leadsAfter.find(
    (l) => l.vehicle?.registrationNumber === LEAD_B_REG
  )
  expect(leadBAfter?.agreedPrice?.amountPaise, "Lead.agreedPrice not pinned").toBe(
    amount * 100
  )
})

// ───────────────────────────────────────────────────────────────────────────
// 4d. NEGOTIATION WIDGET — REJECT an RVSF offer (destructive → self-seeded)
// ───────────────────────────────────────────────────────────────────────────
test("negotiation: customer REJECTs an RVSF offer on /me/lead/[B]", async ({
  context,
  page,
  baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)
  const leadB = await resolveLeadByReg(context.request, base, LEAD_B_REG)

  const amount = 13300
  const offerId = await postFreshRvsfOffer(context.browser(), base, leadB._id, amount)

  await page.goto(`${base}/me/lead/${leadB._id}`)
  await expect(page.getByText(/offer from rvsf/i)).toBeVisible({ timeout: 15_000 })

  // handleReject() also fires a window.confirm() — auto-accept the dialog.
  page.once("dialog", (d) => d.accept())
  await page.getByRole("button", { name: /^reject$/i }).click()

  // After reject, OfferActions calls router.refresh(); the offer is no longer
  // open so the active-offer card disappears. (The lead stays `negotiating`,
  // so the badge reverts to "Negotiating" with no open offer.)
  await expect(page.getByText(/offer from rvsf/i)).not.toBeVisible({
    timeout: 15_000,
  })

  // Server-side: the offer's status is now "rejected".
  const csrf = await getCsrfToken(context.request, base)
  const msgsRes = await context.request.get(
    `${base}/api/chat/threads/${leadB._id}/messages`,
    { headers: { "X-CSRF-Token": csrf } }
  )
  expect(msgsRes.ok()).toBeTruthy()
  const { messages } = await msgsRes.json()
  const rejected = (messages as any[]).find((m) => m._id === offerId)
  expect(rejected?.offer?.status, "rejected offer status not updated").toBe(
    "rejected"
  )
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
  await expect(page.getByText("My conversations")).toBeVisible({ timeout: 15_000 })
  await expect(
    page.getByText(`Lead ${leadB._id.slice(-6)}`)
  ).toBeVisible({ timeout: 15_000 })

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

  // The ChatThread component calls refresh() after a successful POST — the
  // sent message bubble must appear in the scroll area.
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

  // Name / email / phone are prefilled from the session; phone may be empty,
  // so fill all three defensively. The message textarea is required.
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
// 7. 3-TIER CALCULATOR — reg → OTP → tier-2 breakdown → tier-3
// ───────────────────────────────────────────────────────────────────────────
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
  await page.getByRole("button", { name: /get value/i }).click()

  // Tier-1 result band renders the unlock CTA.
  const unlockBtn = page.getByRole("button", { name: /verify my number|unlock/i })
  await expect(unlockBtn).toBeVisible({ timeout: 20_000 })
  await unlockBtn.click()

  // -- Tier 2: OTP gate --
  await page.waitForURL(/\/calculator\/verify/, { timeout: 15_000 })
  await page.getByPlaceholder("98765 43210").fill("9876543210")
  await page.getByRole("button", { name: /send otp/i }).click()

  // Mock mode accepts any 6-digit code. The OTP field is the `input-otp`
  // library's single hidden <input> (autocomplete="one-time-code"), overlaid
  // on 6 visual slot divs. pressSequentially drives it digit-by-digit so the
  // library's controlled onChange fires for each character.
  const otpInput = page.locator('input[autocomplete="one-time-code"]')
  await expect(otpInput).toBeAttached({ timeout: 15_000 })
  await otpInput.focus()
  await otpInput.pressSequentially("123456", { delay: 100 })

  // OTPInput auto-submits onComplete (6th digit). The verify page ALSO has its
  // own "Verify →" button below — click whichever is still enabled, harmless
  // if verification already fired (button disables while verifying).
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
  await expect(page.getByText(/number verified/i)).toBeVisible({ timeout: 20_000 })
  await expect(page.getByText(/here's your full breakdown/i)).toBeVisible()

  // -- Tier 3: proceed to the document-upload page --
  await page
    .getByRole("button", { name: /arrange free pickup/i })
    .click()
  await page.waitForURL(/\/calculator\/upload/, { timeout: 15_000 })
  await expect(
    page.getByText(/three things, and we take it from here/i)
  ).toBeVisible({ timeout: 15_000 })
})

// ───────────────────────────────────────────────────────────────────────────
// 8. CUSTOMER LOGOUT
// ───────────────────────────────────────────────────────────────────────────
test("customer logout clears the session", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)

  // Confirm we're authenticated first.
  let sessionRes = await context.request.get(`${base}/api/auth/session`)
  expect((await sessionRes.json())?.user, "not signed in before logout").toBeTruthy()

  // NextAuth sign-out: POST /api/auth/signout with the CSRF token (this is a
  // NextAuth route, so it uses NextAuth's own CSRF, not the app interceptor).
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

  // And /me must bounce an unauthenticated visitor (the client component
  // renders the "Please log in" fallback when status !== authenticated).
  await page.goto(`${base}/me`)
  await expect(page.getByText(/please.*log in/i)).toBeVisible({ timeout: 15_000 })
})
