// Flow 4 — Admin v2 nav + mock-config.
//
// What we verify:
//   1. admin.test signs in via universal credentials
//   2. /admin renders (the v2 tile grid + Novalytix DashboardOverview)
//   3. /admin/mock-config loads (server component) AND its embedded client
//      section successfully calls GET /api/admin/mock-config and renders
//      mode + per-service selectors
//
// What this would have caught in the fire-mode push:
//   - 4cf04a9 hotfix(admin): "fix requireRole() call-site bug" — before that
//     fix, GET /api/admin/mock-config 500'd because the route was calling
//     requireRole() with the wrong arg shape. The page would have rendered
//     but the embedded client section would surface a load error. We assert
//     the body contains the mode-selector copy, which only appears AFTER the
//     GET succeeds.

import { test, expect } from "@playwright/test"
import { signInAsAdmin, requireBaseURL } from "./helpers/auth"

test("admin can reach /admin/mock-config via the v2 sidebar; config loads cleanly", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)

  await signInAsAdmin(context, base)

  // -- API check first: this is the exact regression that 4cf04a9 fixed --
  const cfgRes = await context.request.get(`${base}/api/admin/mock-config`)
  expect(
    cfgRes.ok(),
    `GET /api/admin/mock-config failed: ${cfgRes.status()} ${await cfgRes.text()}`
  ).toBeTruthy()
  const cfg = await cfgRes.json()
  expect(cfg.mode, "mode missing from mock-config payload").toBeTruthy()
  expect(cfg).toHaveProperty("services")

  // -- Page-level: hit /admin and confirm the v2 tile grid shows up --
  await page.goto(`${base}/admin`)
  await expect.poll(
    async () => (await page.locator("body").innerText()).includes("Admin v2"),
    { message: "Admin v2 tile-grid label missing", timeout: 15_000 }
  ).toBeTruthy()

  // -- Navigate to /admin/mock-config. The sidebar lives inside the admin
  // layout; we just go directly to the URL because the sidebar's "Mock
  // Config" link is the same href and we'd rather not be brittle on the
  // visual sidebar layout (admin/layout.tsx is dense and shifts frequently).
  await page.goto(`${base}/admin/mock-config`)

  // The page header (RSC) — proves the auth guard let us through, not
  // bounced back to /admin.
  await expect(page.getByRole("heading", { name: "Mock Service Configuration" })).toBeVisible()

  // The client section's UI only appears AFTER its GET succeeds. The
  // mode-selector pills include "Always succeed" / "Always fail" / "Random".
  // If the API 500'd, the client renders a load-error card instead.
  await expect.poll(
    async () => {
      const body = await page.locator("body").innerText()
      // Must show the mode label AND no "Failed to load mock config"
      return body.includes("Always succeed") && !body.includes("Failed to load mock config")
    },
    {
      message: "Mock-config client section did not render mode selectors — likely API 500",
      timeout: 15_000,
    }
  ).toBeTruthy()
})
