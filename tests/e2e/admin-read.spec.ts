// Admin QA — read / render coverage for every v2 admin surface.
//
// Companion to admin-write.spec.ts (which exercises the mutating flows:
// mock-config save, settings PATCH, refund decisions, RVSF KYC actions).
//
// This file proves every admin page in the v2 sidebar renders WITHOUT a
// client-side crash and that its backing GET /api endpoint responds 200 to
// an admin session. The founder's complaint was "bugs slipping through" —
// a page that 500s or renders a blank error card is exactly that class of
// bug, so each assertion below is deliberately strict: we look for the
// page's own header copy AND assert no error/crash markers.
//
// Auth: every test signs in fresh via helpers/auth.signInAsAdmin (no shared
// state — per the suite convention).

import { test, expect, Page } from "@playwright/test"
import { signInAsAdmin, requireBaseURL } from "./helpers/auth"

// Markers that mean the admin layout's error boundary (app/admin/error.tsx)
// caught a render crash, or a route returned a server error.
const CRASH_MARKERS = [
  "System Encountered an Issue",   // app/admin/error.tsx
  "Application error",             // Next.js default error
  "Internal Server Error",
  "Unhandled Runtime Error",
]

async function bodyText(page: Page): Promise<string> {
  return (await page.locator("body").textContent()) ?? ""
}

async function assertNoCrash(page: Page, where: string) {
  const txt = await bodyText(page)
  for (const m of CRASH_MARKERS) {
    expect(txt.includes(m), `${where}: crash marker "${m}" present on page`).toBeFalsy()
  }
}

test.describe("admin v2 — page renders + sidebar nav", () => {
  test("/admin landing renders the v2 tile grid (no error boundary)", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)

    await page.goto(`${base}/admin`, { waitUntil: "domcontentloaded" })

    // AdminV2Nav heading. CSS `uppercase` means innerText() returns
    // "ADMIN V2" — match case-insensitively on textContent.
    await expect
      .poll(async () => /admin v2/i.test(await bodyText(page)), {
        message: "AdminV2Nav tile grid did not render on /admin",
        timeout: 15_000,
      })
      .toBeTruthy()

    // The Novalytix DashboardOverview should still co-exist below it.
    // It mounts a beat after AdminV2Nav (framer-motion stagger), so poll
    // rather than asserting on the same instant the "admin v2" poll resolved.
    await expect
      .poll(async () => /admin dashboard/i.test(await bodyText(page)), {
        message: "DashboardOverview missing from /admin",
        timeout: 15_000,
      })
      .toBeTruthy()
    await assertNoCrash(page, "/admin")
  })

  // Every v2 sidebar link, driven by clicking the actual <a> in the layout
  // sidebar — this is the "verify all nav links work" requirement. We assert
  // the URL changed AND the destination page rendered its own <h1> header.
  // (We match the heading via getByRole rather than a body-text regex: the
  // pages inline a theme-init <script> whose source text pollutes
  // textContent, so anchored regexes are unreliable.)
  const NAV = [
    { link: "Triage Queue",   url: "/admin/triage",          heading: /triage queue/i },
    { link: "Needs Attention",url: "/admin/needs-attention",  heading: "Needs attention" },
    { link: "Refund Review",  url: "/admin/refund-review",    heading: "Refund review queue" },
    { link: "DSC Pending",    url: "/admin/dsc-pending",      heading: "DSC pending" },
    { link: "RVSFs",          url: "/admin/rvsfs",            heading: "RVSFs" },
    { link: "Settings",       url: "/admin/settings",         heading: "Settings" },
    { link: "Mock Config",    url: "/admin/mock-config",      heading: "Mock Service Configuration" },
    { link: "Audit Log",      url: "/admin/audit-log",        heading: "Audit log" },
    { link: "Notif. Queue",   url: "/admin/notifications",    heading: "Notification queue" },
  ] as const

  for (const nav of NAV) {
    test(`sidebar link "${nav.link}" navigates to ${nav.url}`, async ({ context, page, baseURL }) => {
      const base = requireBaseURL(baseURL)
      await signInAsAdmin(context, base)

      await page.goto(`${base}/admin`, { waitUntil: "domcontentloaded" })
      // The sidebar renders the link text exactly once. Click it.
      const link = page.getByRole("link", { name: nav.link, exact: true })
      await expect(link, `sidebar link "${nav.link}" not found`).toBeVisible()
      await link.click()

      await page.waitForURL(`**${nav.url}`, { timeout: 20_000 })
      await expect(
        page.getByRole("heading", { name: nav.heading }),
        `${nav.url} did not render its header`
      ).toBeVisible({ timeout: 15_000 })
      await assertNoCrash(page, nav.url)
    })
  }
})

test.describe("admin v2 — read-only queues render cleanly", () => {
  test("/admin/audit-log renders recent privileged actions", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)

    // API contract first.
    const res = await context.request.get(`${base}/api/admin/audit-log`)
    expect(res.ok(), `GET /api/admin/audit-log → ${res.status()}`).toBeTruthy()
    const json = await res.json()
    expect(Array.isArray(json.entries), "audit-log: entries is not an array").toBeTruthy()

    await page.goto(`${base}/admin/audit-log`, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible()
    // Either the table or the explicit empty-state — never a crash, never
    // a stuck "Loading...".
    await expect
      .poll(
        async () => {
          const t = await bodyText(page)
          return t.includes("No audit log entries yet") || t.includes("Action")
        },
        { message: "audit-log: neither table nor empty-state settled", timeout: 15_000 }
      )
      .toBeTruthy()
    await assertNoCrash(page, "/admin/audit-log")
  })

  test("/admin/needs-attention renders (queue or empty-state)", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)

    const res = await context.request.get(`${base}/api/admin/needs-attention`)
    expect(res.ok(), `GET /api/admin/needs-attention → ${res.status()}`).toBeTruthy()
    const json = await res.json()
    expect(Array.isArray(json.leads), "needs-attention: leads is not an array").toBeTruthy()

    await page.goto(`${base}/admin/needs-attention`, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: "Needs attention" })).toBeVisible()
    await expect
      .poll(
        async () => {
          const t = await bodyText(page)
          return t.includes("No leads need attention") || t.includes("rejected")
        },
        { message: "needs-attention: page never settled", timeout: 15_000 }
      )
      .toBeTruthy()
    await assertNoCrash(page, "/admin/needs-attention")
  })

  test("/admin/dsc-pending renders the DigiELV worklist", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)

    const res = await context.request.get(`${base}/api/admin/dsc-pending`)
    expect(res.ok(), `GET /api/admin/dsc-pending → ${res.status()}`).toBeTruthy()
    const json = await res.json()
    expect(Array.isArray(json.rows), "dsc-pending: rows is not an array").toBeTruthy()

    await page.goto(`${base}/admin/dsc-pending`, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: "DSC pending" })).toBeVisible()
    await expect
      .poll(
        async () => {
          const t = await bodyText(page)
          return t.includes("No pending DSC signatures") || t.includes("CD #")
        },
        { message: "dsc-pending: page never settled", timeout: 15_000 }
      )
      .toBeTruthy()
    await assertNoCrash(page, "/admin/dsc-pending")
  })

  test("/admin/notifications renders the dispatched-notification queue", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)

    const res = await context.request.get(`${base}/api/admin/notifications/queue`)
    expect(res.ok(), `GET /api/admin/notifications/queue → ${res.status()}`).toBeTruthy()
    const json = await res.json()
    expect(Array.isArray(json.entries), "notifications: entries is not an array").toBeTruthy()

    await page.goto(`${base}/admin/notifications`, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: "Notification queue" })).toBeVisible()
    // The page surfaces a "Failed to load: ..." line on API error — assert
    // it is NOT present.
    await expect
      .poll(
        async () => {
          const t = await bodyText(page)
          const settled =
            t.includes("No dispatched notifications yet") || t.includes("When")
          return settled
        },
        { message: "notifications: page never settled", timeout: 15_000 }
      )
      .toBeTruthy()
    expect((await bodyText(page)).includes("Failed to load:"), "notifications: surfaced a load error").toBeFalsy()
    await assertNoCrash(page, "/admin/notifications")
  })

  test("/admin/demo-leads renders; re-seed button is confirm-guarded (not triggered)", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)

    const res = await context.request.get(`${base}/api/admin/demo-leads`)
    expect(res.ok(), `GET /api/admin/demo-leads → ${res.status()}`).toBeTruthy()

    await page.goto(`${base}/admin/demo-leads`, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: "Demo data" })).toBeVisible()

    // The re-seed button must exist. We deliberately DO NOT click it — the
    // window.confirm() it raises plus the destructive seed are out of scope
    // for an automated run. We only assert it is present + enabled, proving
    // the client island mounted.
    const reseedBtn = page.getByRole("button", { name: /re-seed demo data/i })
    await expect(reseedBtn, "demo-leads: re-seed button missing").toBeVisible()
    await expect(reseedBtn).toBeEnabled()
    await assertNoCrash(page, "/admin/demo-leads")
  })

  test("/admin/rvsfs lists facilities and links into the KYC review screen", async ({ context, page, baseURL }) => {
    const base = requireBaseURL(baseURL)
    await signInAsAdmin(context, base)

    const res = await context.request.get(`${base}/api/admin/rvsfs`)
    expect(res.ok(), `GET /api/admin/rvsfs → ${res.status()}`).toBeTruthy()
    const json = await res.json()
    expect(Array.isArray(json.rvsfs), "rvsfs: rvsfs is not an array").toBeTruthy()

    await page.goto(`${base}/admin/rvsfs`, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: "RVSFs" })).toBeVisible()
    await expect
      .poll(
        async () => {
          const t = await bodyText(page)
          return t.includes("No RVSFs match this filter") || t.includes("Display name")
        },
        { message: "rvsfs: list never settled", timeout: 15_000 }
      )
      .toBeTruthy()
    await assertNoCrash(page, "/admin/rvsfs")

    // If at least one RVSF exists, open its detail page and assert the KYC
    // review screen renders (Organisation / KYC documents sections).
    if (json.rvsfs.length > 0) {
      const rvsfId = json.rvsfs[0]._id
      await page.goto(`${base}/admin/rvsfs/${rvsfId}`, { waitUntil: "domcontentloaded" })
      await expect
        .poll(async () => /KYC documents/i.test(await bodyText(page)), {
          message: `rvsf detail ${rvsfId}: KYC review screen did not render`,
          timeout: 15_000,
        })
        .toBeTruthy()
      await assertNoCrash(page, `/admin/rvsfs/${rvsfId}`)
    }
  })
})
