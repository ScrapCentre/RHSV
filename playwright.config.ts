// Playwright config for the ScrapCentre.com v2 e2e suite.
//
// Defaults to the live staging deploy (https://scrapcentre.online). Override
// via env when working locally:
//
//   E2E_BASE_URL=http://localhost:3000 npm run test:e2e
//
// We deliberately do NOT spin up a webServer here — tests are designed to be
// runnable against the deployed surface so the founder can re-run after every
// push without booting Next locally. To run against a local dev server, just
// start `npm run dev` in another tab and set E2E_BASE_URL.
//
// Chromium only (per task brief — no Firefox/Webkit matrix yet). One project,
// no shared state between specs — every spec performs its own sign-in.
//
// Trace/screenshot on first retry only, so a failed CI run drops a debuggable
// artifact without bloating the success path.

import { defineConfig, devices } from "@playwright/test"

const BASE_URL = process.env.E2E_BASE_URL ?? "https://scrapcentre.online"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  expect: {
    // expect.poll() defaults — give server-rendered pages a generous window
    // to hydrate and surface client-driven stat cards (CC dashboard).
    timeout: 15_000,
  },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    // Honor the staging cookie consent etc. — no special headers needed.
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
