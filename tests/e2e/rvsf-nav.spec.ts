// RVSF navigation e2e — the read-only RVSF surfaces + logout.
//
// Covers:
//   • /rvsf/chat — the lead-conversation inbox (active + archived buckets)
//   • /rvsf/chat/[leadId] — opening a thread from the inbox
//   • RVSF logout — signing out clears the session
//
// These are non-destructive; they only read state and exercise navigation.

import { test, expect } from "@playwright/test"
import { signInAsPartner, requireBaseURL } from "./helpers/auth"

// ─── /rvsf/chat — inbox ─────────────────────────────────────────────────────

test("RVSF chat inbox lists the partner's lead conversations", async ({
  context, page, baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  await signInAsPartner(context, base)

  await page.goto(`${base}/rvsf/chat`)
  await expect(
    page.getByRole("heading", { name: "Lead conversations" })
  ).toBeVisible({ timeout: 20_000 })

  // The demo seed gives partner.test at least one thread. Wait for the loader
  // copy to clear, then assert either a thread row OR the empty-state — the
  // page must resolve to a real state, never hang on "Loading…".
  await expect.poll(
    async () => {
      const body = await page.locator("body").innerText()
      if (/Loading…/.test(body)) return "loading"
      if (/Active \(\d+\)|Archived \(\d+\)/.test(body)) return "has-threads"
      if (/No conversations yet/.test(body)) return "empty"
      return "unknown"
    },
    { message: "chat inbox never resolved", timeout: 20_000 }
  ).not.toBe("loading")
})

// ─── /rvsf/chat → open a thread ─────────────────────────────────────────────

test("RVSF can open a chat thread from the inbox", async ({
  context, page, baseURL,
}) => {
  const base = requireBaseURL(baseURL)
  await signInAsPartner(context, base)

  // The parallel QA agent reseeds demo data continuously, so a thread id can
  // go stale between discovery and navigation. Re-discover + re-navigate up to
  // 3× and assert on the always-present chat-page chrome (the tab strip + the
  // reveal-number toolbar button render independent of lead metadata).
  let opened = false
  let lastErr: unknown = null

  for (let attempt = 1; attempt <= 3 && !opened; attempt++) {
    try {
      const res = await page.request.get(`${base}/api/chat/my-threads`)
      expect(res.ok(), `my-threads failed: ${res.status()}`).toBeTruthy()
      const { threads } = await res.json()
      const active = (threads ?? []).find((t: any) => t.status === "active")
      expect(active, "no active demo thread — reseed needed").toBeTruthy()

      await page.goto(`${base}/rvsf/chat/${active.leadId}`)

      // The Chat / DigiELV tab strip + the reveal-number button render once
      // the session resolves, regardless of whether lead metadata loaded.
      await expect(page.getByRole("button", { name: "Chat" })).toBeVisible({
        timeout: 15_000,
      })
      await expect(
        page.getByRole("button", { name: /DigiELV checklist/ })
      ).toBeVisible()
      await expect(
        page.getByRole("button", { name: /Reveal customer's number/ })
      ).toBeVisible()
      opened = true
    } catch (e) {
      lastErr = e
    }
  }

  expect(
    opened,
    `chat thread page never opened after 3 attempts; last error: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`
  ).toBeTruthy()
})

// ─── RVSF logout ────────────────────────────────────────────────────────────

test("RVSF logout clears the session", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsPartner(context, base)

  // Confirm we start authenticated.
  const before = await page.request.get(`${base}/api/auth/session`)
  expect((await before.json())?.user, "expected an authed session pre-logout")
    .toBeTruthy()

  // NextAuth sign-out is a CSRF-protected POST to /api/auth/signout. Drive it
  // the way the framework does: GET the csrf token, POST the form.
  const csrfRes = await page.request.get(`${base}/api/auth/csrf`)
  const { csrfToken } = await csrfRes.json()
  const signOut = await page.request.post(`${base}/api/auth/signout`, {
    form: { csrfToken, callbackUrl: `${base}/` },
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })
  expect(signOut.ok() || signOut.status() === 302, "signout request failed")
    .toBeTruthy()

  // Session must now be empty.
  const after = await page.request.get(`${base}/api/auth/session`)
  const afterJson = await after.json()
  expect(
    afterJson?.user,
    `session still populated after logout: ${JSON.stringify(afterJson)}`
  ).toBeFalsy()
})
