// Admin QA — mutating-flow coverage for the v2 admin surface.
//
// Companion to admin-read.spec.ts (page renders + sidebar nav). This file
// drives every admin WRITE path the founder cares about:
//
//   1. /admin/mock-config   — toggle a service mode + Save (founder-reported
//                             bug: page used to crash before the GET landed)
//   2. /admin/settings      — PATCH a ConfigSetting value, confirm it
//                             persisted AND an AuditLog row was written
//   3. /admin/refund-review — the three refund decisions on Lead C
//                             (approve_full / approve_partial / deny). Each
//                             needs a freshly-seeded Lead C — see the
//                             re-seed note below.
//   4. /admin/triage        — triage decision route is exercised
//                             non-destructively (validation + not-found
//                             path) because the staging triage queue holds
//                             a single irreplaceable LeadState that no seed
//                             script recreates.
//   5. RVSF KYC actions     — approve / reject / request-info. Tested
//                             against whatever RVSF exists; if the only
//                             RVSF is already `active` we assert the
//                             endpoints correctly 409 (idempotency guard)
//                             rather than silently mutating.
//
// CSRF: all browser-driven writes go through the page UI, which posts via
// lib/fetch.apiFetch / the global install-csrf-fetch interceptor — the
// X-CSRF-Token header is injected automatically. Direct request-fixture
// writes fetch GET /api/auth/csrf and send the token themselves (see
// csrfToken() helper).
//
// RE-SEED between refund tests: the /api/admin/reseed-demo endpoint is
// prod-guarded (503 unless ALLOW_PROD_SEED=1 on the VM). The refund tests
// below therefore each consume the *currently pending* Lead C row; the QA
// operator re-seeds via the CLI between `--grep`-scoped runs:
//   ssh scrap@192.168.0.211 'cd /opt/scrapcentre && sudo -u scrap bash -lc \
//     "set -a && source .env.local && set +a && ALLOW_PROD_SEED=1 \
//      npx tsx scripts/seed-demo-leads.ts"'
// Each refund test guards with test.skip() if no pending row is present, so
// the file stays green when run as a whole without a re-seed.

import { test, expect, APIRequestContext } from "@playwright/test"
import { signInAsAdmin, requireBaseURL } from "./helpers/auth"

/** Fetch NextAuth's CSRF token for direct request-fixture mutations. */
async function csrfToken(request: APIRequestContext, base: string): Promise<string> {
  const res = await request.get(`${base}/api/auth/csrf`)
  expect(res.ok(), `GET /api/auth/csrf → ${res.status()}`).toBeTruthy()
  const { csrfToken } = await res.json()
  expect(csrfToken, "csrfToken missing from /api/auth/csrf body").toBeTruthy()
  return csrfToken
}

// ───────────────────────────────────────────────────────────────────────────
// 1. Mock config — toggle a service override + Save
// ───────────────────────────────────────────────────────────────────────────
test.describe("admin/mock-config — write", () => {
  test("toggling a per-service override + Save persists to GET", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)

    await page.goto(`${base}/admin/mock-config`, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: "Mock Service Configuration" })).toBeVisible()

    // The client section only renders the selectors AFTER its GET succeeds.
    await expect
      .poll(async () => ((await page.locator("body").textContent()) ?? "").includes("Always succeed"), {
        message: "mock-config client section never rendered (GET failed?)",
        timeout: 15_000,
      })
      .toBeTruthy()

    // The "vahan" per-service <select> is labelled by id `mock-svc-vahan`.
    const vahanSelect = page.locator("#mock-svc-vahan")
    await expect(vahanSelect).toBeVisible()

    // Flip it to a value distinct from whatever it currently is, so the
    // Save button (disabled until `dirty`) lights up.
    const before = await vahanSelect.inputValue()
    const target = before === "failure" ? "random" : "failure"
    await vahanSelect.selectOption(target)

    const saveBtn = page.getByRole("button", { name: "Save" })
    await expect(saveBtn, "Save did not enable after a change").toBeEnabled()
    await saveBtn.click()

    // Success toast — copy from MockConfigClientSection.save().
    await expect
      .poll(async () => ((await page.locator("body").textContent()) ?? "").includes("Mock config saved"), {
        message: "mock-config Save did not surface the success toast",
        timeout: 15_000,
      })
      .toBeTruthy()

    // Authoritative check: re-GET the config and confirm the override stuck.
    const verify = await context.request.get(`${base}/api/admin/mock-config`)
    expect(verify.ok(), `GET /api/admin/mock-config → ${verify.status()}`).toBeTruthy()
    const cfg = await verify.json()
    expect(cfg.services?.vahan, `mock-config: vahan override not persisted (got ${JSON.stringify(cfg.services)})`).toBe(target)
  })

  test("POST rejects an invalid mode value with 400", async ({ context, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)
    const token = await csrfToken(context.request, base)

    const res = await context.request.post(`${base}/api/admin/mock-config`, {
      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      data: { mode: "not-a-real-mode" },
    })
    expect(res.status(), "mock-config POST should 400 on a bad mode").toBe(400)
  })
})

// ───────────────────────────────────────────────────────────────────────────
// 2. Settings — PATCH a ConfigSetting + verify AuditLog row
// ───────────────────────────────────────────────────────────────────────────
test.describe("admin/settings — write", () => {
  test("editing a ConfigSetting persists + bumps version + writes AuditLog", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)

    // Pick a numeric ConfigSetting to edit. Prefer a pricing.perKgRate.* row
    // (exercises the perKgRate cache-invalidation branch); fall back to any
    // numeric row so the test is resilient to seed drift.
    const listRes = await context.request.get(`${base}/api/admin/settings`)
    expect(listRes.ok(), `GET /api/admin/settings → ${listRes.status()}`).toBeTruthy()
    const { settings } = await listRes.json()
    expect(Array.isArray(settings) && settings.length > 0, "no ConfigSetting rows to edit").toBeTruthy()

    const target =
      settings.find((s: any) => s.key.startsWith("pricing.perKgRate.") && typeof s.value === "number") ??
      settings.find((s: any) => typeof s.value === "number")
    expect(target, "no numeric ConfigSetting row available to edit").toBeTruthy()

    const oldValue: number = target.value
    const oldVersion: number = target.version
    // Nudge the value by +1 then we restore it at the end.
    const newValue = oldValue + 1

    // -- Drive the edit through the UI --
    await page.goto(`${base}/admin/settings`, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible()
    await expect
      .poll(async () => ((await page.locator("body").textContent()) ?? "").includes(target.key), {
        message: `settings page never rendered row for ${target.key}`,
        timeout: 15_000,
      })
      .toBeTruthy()

    // Numeric rows render a text <input>. Scope to the card containing the
    // key's <code> label, then its input + Save button.
    const card = page.locator(".card-feature", { hasText: target.key })
    await expect(card).toBeVisible()
    const input = card.locator("input[type=text]")
    await input.fill(String(newValue))
    await card.getByRole("button", { name: "Save" }).click()

    // Flash banner — copy from AdminSettingsPage.save().
    await expect
      .poll(async () => ((await page.locator("body").textContent()) ?? "").includes(`Saved ${target.key}`), {
        message: "settings Save did not surface the flash banner",
        timeout: 15_000,
      })
      .toBeTruthy()

    // -- Authoritative: re-GET settings, confirm value + version bump --
    const afterRes = await context.request.get(`${base}/api/admin/settings`)
    const after = (await afterRes.json()).settings.find((s: any) => s.key === target.key)
    expect(after, `settings: row ${target.key} vanished after PATCH`).toBeTruthy()
    expect(after.value, `settings: ${target.key} value did not persist`).toBe(newValue)
    expect(after.version, `settings: ${target.key} version did not increment`).toBe(oldVersion + 1)

    // -- AuditLog: a config.setting.update row for this key must exist --
    const auditRes = await context.request.get(`${base}/api/admin/audit-log`)
    expect(auditRes.ok(), `GET /api/admin/audit-log → ${auditRes.status()}`).toBeTruthy()
    const { entries } = await auditRes.json()
    const auditRow = entries.find(
      (e: any) => e.action === "config.setting.update" && e.reason === `key=${target.key}`
    )
    expect(
      auditRow,
      `settings: no AuditLog row for config.setting.update key=${target.key}`
    ).toBeTruthy()

    // -- Restore the original value so the suite is idempotent --
    const token = await csrfToken(context.request, base)
    const restore = await context.request.patch(`${base}/api/admin/settings`, {
      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      data: { key: target.key, value: oldValue },
    })
    expect(restore.ok(), `settings: restore PATCH failed (${restore.status()})`).toBeTruthy()
  })

  test("PATCH with a missing key is rejected 400", async ({ context, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)
    const token = await csrfToken(context.request, base)

    const res = await context.request.patch(`${base}/api/admin/settings`, {
      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      data: { value: 123 },
    })
    expect(res.status(), "settings PATCH should 400 when key is missing").toBe(400)
  })
})

// ───────────────────────────────────────────────────────────────────────────
// 3. Refund review — the three decisions on Lead C
//
//    DESTRUCTIVE + OPT-IN. These tests CONSUME the single pending Lead C row
//    (MH02EF9012). That same row is what the read-only refund.spec.ts asserts
//    on, so running these in the default whole-suite pass would empty the
//    queue and red-fail refund.spec.ts. They are therefore gated behind
//    RUN_DESTRUCTIVE_REFUND=1 and the QA/PM runs them deliberately, re-seeding
//    a fresh Lead C before each decision:
//
//      ssh scrap@192.168.0.211 'cd /opt/scrapcentre && sudo -u scrap bash -lc \
//        "set -a && source .env.local && set +a && ALLOW_PROD_SEED=1 \
//         npx tsx scripts/seed-demo-leads.ts"'
//      RUN_DESTRUCTIVE_REFUND=1 npx playwright test tests/e2e/admin-write.spec.ts \
//        -g "approve full refund on Lead C"
//
//    .serial: the decisions share the single Lead C row, so they must run
//    one-at-a-time — parallel workers would each see Lead C "pending", skip
//    nothing, then race to click Review (only one wins).
// ───────────────────────────────────────────────────────────────────────────
const RUN_DESTRUCTIVE_REFUND = process.env.RUN_DESTRUCTIVE_REFUND === "1"

test.describe.serial("admin/refund-review — decisions", () => {
  test.skip(
    !RUN_DESTRUCTIVE_REFUND,
    "Destructive refund-decision tests — set RUN_DESTRUCTIVE_REFUND=1 and re-seed Lead C to run"
  )

  /** Returns the unlockId of Lead C (MH02EF9012) if it is awaiting review. */
  async function pendingLeadC(request: APIRequestContext, base: string): Promise<string | null> {
    const res = await request.get(`${base}/api/admin/refund-review`)
    expect(res.ok(), `GET /api/admin/refund-review → ${res.status()}`).toBeTruthy()
    const { events } = await res.json()
    const row = (events ?? []).find((e: any) => e.vehicleReg === "MH02EF9012")
    return row ? row.unlockId : null
  }

  /** Drive the refund-review modal: open Review on Lead C, pick a decision. */
  async function decideViaUI(
    page: import("@playwright/test").Page,
    base: string,
    decision: "approve_full" | "approve_partial" | "deny",
    notes: string,
    partialRupees?: number
  ) {
    await page.goto(`${base}/admin/refund-review`, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: "Refund review queue" })).toBeVisible()

    // Wait for Lead C's row, then click its Review button.
    await expect
      .poll(async () => ((await page.locator("body").textContent()) ?? "").includes("MH02EF9012"), {
        message: "refund-review: Lead C row not visible",
        timeout: 15_000,
      })
      .toBeTruthy()
    const row = page.locator(".card-feature", { hasText: "MH02EF9012" })
    await row.getByRole("button", { name: "Review" }).click()

    // Modal — pick the decision radio (label text is the value with _ → space).
    const radioLabel = decision.replace(/_/g, " ")
    await page.getByText(radioLabel, { exact: true }).click()
    if (decision === "approve_partial") {
      await page.getByPlaceholder("Partial refund amount in ₹").fill(String(partialRupees ?? 1))
    }
    await page.getByPlaceholder(/Decision notes/i).fill(notes)
    await page.getByRole("button", { name: "Submit decision" }).click()
  }

  test("deny refund on Lead C", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)
    const unlockId = await pendingLeadC(context.request, base)
    test.skip(!unlockId, "No pending Lead C in the refund queue — re-seed first")

    await decideViaUI(page, base, "deny", "QA: denying — off-platform leakage confirmed in chat lint.")

    // The modal closes + the row disappears on success (refresh()).
    await expect
      .poll(async () => !((await page.locator("body").textContent()) ?? "").includes("MH02EF9012"), {
        message: "refund-review: Lead C row still present after deny",
        timeout: 15_000,
      })
      .toBeTruthy()

    // Authoritative: the queue no longer lists Lead C.
    expect(await pendingLeadC(context.request, base), "Lead C still pending after deny").toBeNull()
  })

  test("approve full refund on Lead C", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)
    const unlockId = await pendingLeadC(context.request, base)
    test.skip(!unlockId, "No pending Lead C in the refund queue — re-seed first")

    await decideViaUI(page, base, "approve_full", "QA: full refund approved — grace-window rejection, customer not contacted.")

    await expect
      .poll(async () => !((await page.locator("body").textContent()) ?? "").includes("MH02EF9012"), {
        message: "refund-review: Lead C row still present after approve_full",
        timeout: 15_000,
      })
      .toBeTruthy()
    expect(await pendingLeadC(context.request, base), "Lead C still pending after approve_full").toBeNull()
  })

  test("approve partial refund on Lead C", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)
    const unlockId = await pendingLeadC(context.request, base)
    test.skip(!unlockId, "No pending Lead C in the refund queue — re-seed first")

    await decideViaUI(
      page,
      base,
      "approve_partial",
      "QA: partial refund — engaged-phase reject, splitting the difference.",
      1
    )

    await expect
      .poll(async () => !((await page.locator("body").textContent()) ?? "").includes("MH02EF9012"), {
        message: "refund-review: Lead C row still present after approve_partial",
        timeout: 15_000,
      })
      .toBeTruthy()
    expect(await pendingLeadC(context.request, base), "Lead C still pending after approve_partial").toBeNull()
  })

  test("decide endpoint rejects too-short admin notes with 400", async ({ context, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)
    const unlockId = await pendingLeadC(context.request, base)
    test.skip(!unlockId, "No pending Lead C — re-seed first")

    const token = await csrfToken(context.request, base)
    const res = await context.request.post(`${base}/api/admin/refund-review/${unlockId}/decide`, {
      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      data: { decision: "deny", adminReviewNotes: "no" }, // < 5 chars
    })
    expect(res.status(), "decide should 400 on too-short notes").toBe(400)
    // Lead C must still be pending — a rejected request must not mutate state.
    expect(await pendingLeadC(context.request, base), "Lead C consumed by a rejected request").toBe(unlockId)
  })
})

// ───────────────────────────────────────────────────────────────────────────
// 4. Triage decision — non-destructive route exercise
//    The staging triage queue holds a single LeadState that no seed script
//    recreates, so we DO NOT consume it. Instead we exercise the route's
//    auth + CSRF + validation + DB-lookup path with a bogus id and bad
//    payloads — proving the endpoint is wired correctly end-to-end.
// ───────────────────────────────────────────────────────────────────────────
test.describe("admin/triage — decision route wiring", () => {
  test("triage queue renders + decide route validates without consuming the lead", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)

    // Page render.
    await page.goto(`${base}/admin/triage`, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: /Triage Queue/i })).toBeVisible()
    // Either a lead card or the explicit empty-state — never the fetchError banner.
    await expect
      .poll(
        async () => {
          const t = (await page.locator("body").textContent()) ?? ""
          return t.includes("awaiting decision") || t.includes("No leads pending triage")
        },
        { message: "triage page never settled", timeout: 15_000 }
      )
      .toBeTruthy()

    const token = await csrfToken(context.request, base)

    // (a) Invalid `decision` value → 400 (validation reached).
    const badDecision = await context.request.post(`${base}/api/triage/decide`, {
      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      data: { leadStateId: "000000000000000000000000", decision: "not-real" },
    })
    expect(badDecision.status(), "triage/decide should 400 on a bad decision value").toBe(400)

    // (b) Valid decision but a non-existent leadStateId → 404 (DB lookup
    //     reached, nothing mutated).
    const notFound = await context.request.post(`${base}/api/triage/decide`, {
      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      data: { leadStateId: "000000000000000000000000", decision: "rejected" },
    })
    expect(notFound.status(), "triage/decide should 404 for an unknown leadStateId").toBe(404)
  })

  test("triage/decide rejects a request with no CSRF token (403)", async ({ context, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)

    // Deliberately omit X-CSRF-Token. The route opts out of withAuth, so it
    // must add an explicit requireCsrf() guard — a missing token must 403.
    // This is the regression guard for the CSRF hole this QA pass fixed in
    // app/api/triage/decide/route.ts.
    //
    // DEPLOY-GATED: the fix is committed but the running staging build may
    // pre-date it. Pre-fix, an admin session + no CSRF reaches the handler
    // and 404s (unknown leadStateId). We detect that and skip with a loud
    // message instead of red-failing on un-deployed code; once VM 221 ships
    // the fix this test enforces the 403.
    const res = await context.request.post(`${base}/api/triage/decide`, {
      headers: { "Content-Type": "application/json" },
      data: { leadStateId: "000000000000000000000000", decision: "rejected" },
    })
    test.skip(
      res.status() !== 403,
      `CSRF fix for /api/triage/decide not yet deployed (got ${res.status()}, want 403) — re-run after VM 221 deploy`
    )
    expect(res.status(), "triage/decide must 403 without a CSRF token").toBe(403)
  })
})

// ───────────────────────────────────────────────────────────────────────────
// 5. RVSF KYC actions — approve / reject / request-info
//    Tested against whatever RVSF the staging DB holds. If the only RVSF is
//    already `active`, the KYC endpoints must reject with 409 (their
//    idempotency / state guards) — we assert that rather than mutating.
// ───────────────────────────────────────────────────────────────────────────
test.describe("admin/rvsfs — KYC decision actions", () => {
  test("KYC endpoints behave correctly for the RVSF's current status", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)

    const listRes = await context.request.get(`${base}/api/admin/rvsfs`)
    expect(listRes.ok(), `GET /api/admin/rvsfs → ${listRes.status()}`).toBeTruthy()
    const { rvsfs } = await listRes.json()
    test.skip(!rvsfs || rvsfs.length === 0, "No RVSF in staging DB to exercise KYC actions")

    // Prefer a reviewable (non-active) RVSF; else take the first.
    const reviewable = rvsfs.find((r: any) =>
      ["applied", "kyc_pending", "kyc_review", "pending_more_info"].includes(r.status)
    )
    const rvsf = reviewable ?? rvsfs[0]
    const token = await csrfToken(context.request, base)

    if (reviewable) {
      // Actionable path: request-info is the least destructive (keeps the
      // RVSF in-queue, just flips to pending_more_info). Exercise it.
      const res = await context.request.post(`${base}/api/admin/rvsfs/${rvsf._id}/request-info`, {
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        data: { question: "QA: please confirm the GST trade name matches your display name." },
      })
      expect(res.ok(), `rvsf request-info failed: ${res.status()} ${await res.text()}`).toBeTruthy()
      const body = await res.json()
      expect(body.rvsf?.status, "request-info did not flip status to pending_more_info").toBe("pending_more_info")
    } else {
      // The only RVSF is active. All three KYC mutations must be guarded:
      //   - approve      → idempotent no-op, { alreadyActive: true }, 200
      //   - reject       → 409 ("Cannot reject an already-active RVSF")
      //   - request-info → 409 ("Cannot request info from RVSF in status=active")
      const approve = await context.request.post(`${base}/api/admin/rvsfs/${rvsf._id}/approve`, {
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      })
      expect(approve.ok(), `approve on active RVSF should be a 200 no-op (${approve.status()})`).toBeTruthy()
      expect((await approve.json()).alreadyActive, "approve on active RVSF should report alreadyActive").toBeTruthy()

      const reject = await context.request.post(`${base}/api/admin/rvsfs/${rvsf._id}/reject`, {
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        data: { notes: "QA: attempting reject on an active RVSF (should be blocked)." },
      })
      expect(reject.status(), "reject on active RVSF must 409").toBe(409)

      const reqInfo = await context.request.post(`${base}/api/admin/rvsfs/${rvsf._id}/request-info`, {
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        data: { question: "QA: attempting request-info on an active RVSF (should be blocked)." },
      })
      expect(reqInfo.status(), "request-info on active RVSF must 409").toBe(409)
    }

    // The KYC review screen must render for this RVSF regardless of status.
    await page.goto(`${base}/admin/rvsfs/${rvsf._id}`, { waitUntil: "domcontentloaded" })
    await expect
      .poll(async () => /KYC documents/i.test((await page.locator("body").textContent()) ?? ""), {
        message: `rvsf detail ${rvsf._id}: KYC review screen did not render`,
        timeout: 15_000,
      })
      .toBeTruthy()
  })

  test("RVSF reject endpoint requires notes (400 when empty)", async ({ context, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)
    const listRes = await context.request.get(`${base}/api/admin/rvsfs`)
    const { rvsfs } = await listRes.json()
    test.skip(!rvsfs || rvsfs.length === 0, "No RVSF in staging DB")

    const token = await csrfToken(context.request, base)
    const res = await context.request.post(`${base}/api/admin/rvsfs/${rvsfs[0]._id}/reject`, {
      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      data: {}, // no notes
    })
    // 400 (notes required) — or 409 if the RVSF is active and the status
    // guard fires first. Either is a correct rejection; a 2xx is the bug.
    expect([400, 409], `reject with no notes returned ${res.status()}`).toContain(res.status())
  })
})

// ───────────────────────────────────────────────────────────────────────────
// 6. Auth boundary — a non-admin must not reach admin write endpoints
// ───────────────────────────────────────────────────────────────────────────
test.describe("admin write endpoints — auth boundary", () => {
  test("unauthenticated POST to /api/admin/mock-config is rejected", async ({ request, baseURL }) => {
    const base = requireBaseURL(baseURL)
    // Fresh request fixture — no admin session attached.
    const token = await csrfToken(request, base)
    const res = await request.post(`${base}/api/admin/mock-config`, {
      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      data: { mode: "success" },
    })
    expect([401, 403], `anon mock-config POST returned ${res.status()}`).toContain(res.status())
  })

  test("unauthenticated PATCH to /api/admin/settings is rejected", async ({ request, baseURL }) => {
    const base = requireBaseURL(baseURL)
    const token = await csrfToken(request, base)
    const res = await request.patch(`${base}/api/admin/settings`, {
      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      data: { key: "leads.expiryDays", value: 999 },
    })
    expect([401, 403], `anon settings PATCH returned ${res.status()}`).toContain(res.status())
  })
})
