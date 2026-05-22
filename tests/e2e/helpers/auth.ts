// Shared sign-in helpers for the v2 e2e suite.
//
// We bypass the visual /login + /rvsf forms and drive NextAuth directly via
// its credentials callback, then attach the resulting session cookies to the
// browser context. This keeps each spec independent (per the task brief — no
// shared state between specs) and resilient to UI churn on the login pages
// themselves (which aren't the system under test for 5/6 of the flows).
//
// NextAuth's credentials callback requires:
//   1. A CSRF token (GET /api/auth/csrf returns { csrfToken })
//   2. A form-encoded POST to /api/auth/callback/<providerId>?json=true
//      with { csrfToken, callbackUrl, ...credentialFields }
//   3. The Set-Cookie response carries next-auth.session-token, which we
//      port onto the browser context.
//
// Provider IDs (from lib/auth.ts):
//   - "credentials"             — universal (admin / executive / client)  field: email
//   - "scrapcentre-credentials" — CC operator (v2 + legacy)               field: email
//   - "rvsf-credentials"        — RVSF admin/exec (v2 + legacy partner)   field: rvsfId
//   - "executive-credentials"   — executive portal                        field: email
//
// We expose one helper per role to keep call-sites readable.

import { APIRequestContext, BrowserContext, expect } from "@playwright/test"

const TEST_PASSWORD = "NovalytixTest2026!"

type ProviderId =
  | "credentials"
  | "scrapcentre-credentials"
  | "rvsf-credentials"
  | "executive-credentials"

interface CookieToTransfer {
  name: string
  value: string
  domain: string
  path: string
  expires: number
  httpOnly: boolean
  secure: boolean
  sameSite: "Strict" | "Lax" | "None"
}

/**
 * Drive a NextAuth credentials sign-in over the API and graft the resulting
 * session cookies onto the supplied browser context. After this resolves,
 * `context.newPage()` will see the user as authenticated.
 *
 * @param context  the BrowserContext for the spec
 * @param request  an APIRequestContext (we create a fresh one so the CSRF
 *                 cookie + session cookie live in the same jar)
 * @param baseURL  resolved from playwright config (typed; never null at runtime)
 * @param provider one of the four credential providers above
 * @param credentials role-appropriate fields ({ email | rvsfId, password })
 */
async function signInWithCredentials(
  context: BrowserContext,
  baseURL: string,
  provider: ProviderId,
  credentials: Record<string, string>
): Promise<void> {
  // Use a fresh request context so the CSRF cookie + session cookie share a
  // single jar — then we copy the jar onto the browser context at the end.
  // (BrowserContext.request shares cookies with the page, but cookie scoping
  // across hostnames is fiddlier than just attaching the cookies ourselves.)
  const { request } = context

  // 1. CSRF token
  const csrfRes = await request.get(`${baseURL}/api/auth/csrf`)
  expect(csrfRes.ok(), `CSRF fetch failed: ${csrfRes.status()}`).toBeTruthy()
  const { csrfToken } = await csrfRes.json()
  expect(csrfToken, "CSRF token missing from /api/auth/csrf").toBeTruthy()

  // 2. POST to the credentials callback, form-encoded (NOT JSON).
  //    `json=true` so NextAuth returns JSON instead of a 302; without it we'd
  //    have to chase the redirect chain ourselves.
  const callbackRes = await request.post(
    `${baseURL}/api/auth/callback/${provider}?json=true`,
    {
      form: {
        csrfToken,
        callbackUrl: `${baseURL}/post-login`,
        json: "true",
        ...credentials,
      },
      // Don't follow the redirect — we just want the Set-Cookie header.
      maxRedirects: 0,
    }
  )
  expect(
    callbackRes.ok() || callbackRes.status() === 302,
    `Credentials POST failed: status=${callbackRes.status()} body=${await callbackRes.text()}`
  ).toBeTruthy()

  // 3. Confirm we actually got a session.
  const sessionRes = await request.get(`${baseURL}/api/auth/session`)
  expect(sessionRes.ok(), "/api/auth/session fetch failed").toBeTruthy()
  const session = await sessionRes.json()
  expect(
    session?.user,
    `Sign-in did not establish a session for ${provider} ${JSON.stringify(credentials)}; raw=${JSON.stringify(session)}`
  ).toBeTruthy()

  // 4. Now that cookies are in the request jar, mirror them onto the
  //    browser context so page navigations see the same auth state.
  const cookies = await context.cookies()
  // We may also need to copy NextAuth cookies set on the request jar that
  // didn't end up on the context — pull from request.storageState() and
  // re-add anything we're missing.
  const storage = await request.storageState()
  const existingNames = new Set(cookies.map((c) => `${c.name}|${c.domain}`))
  const toAdd: CookieToTransfer[] = []
  for (const c of storage.cookies) {
    const key = `${c.name}|${c.domain}`
    if (!existingNames.has(key)) toAdd.push(c as CookieToTransfer)
  }
  if (toAdd.length > 0) {
    await context.addCookies(toAdd)
  }
}

export async function signInAsAdmin(context: BrowserContext, baseURL: string): Promise<void> {
  await signInWithCredentials(context, baseURL, "credentials", {
    email: "admin.test@scrapcentre.online",
    password: TEST_PASSWORD,
  })
}

export async function signInAsClient(context: BrowserContext, baseURL: string): Promise<void> {
  await signInWithCredentials(context, baseURL, "credentials", {
    email: "client.test@scrapcentre.online",
    password: TEST_PASSWORD,
  })
}

export async function signInAsPartner(context: BrowserContext, baseURL: string): Promise<void> {
  // RVSF Portal — field name is `rvsfId` (NOT `email`), per provider config.
  // The v2 unified User-table lookup accepts the email as the `rvsfId` value.
  await signInWithCredentials(context, baseURL, "rvsf-credentials", {
    rvsfId: "partner.test@scrapcentre.online",
    password: TEST_PASSWORD,
  })
}

export async function signInAsCcOperator(context: BrowserContext, baseURL: string): Promise<void> {
  // CC operator routed through `scrapcentre-credentials` per task brief.
  // Underlying provider also accepts email in the `email` field.
  await signInWithCredentials(context, baseURL, "scrapcentre-credentials", {
    email: "centre.test@scrapcentre.online",
    password: TEST_PASSWORD,
  })
}

/**
 * Resolve the baseURL Playwright will hand to specs. Centralised so each spec
 * doesn't repeat the same dance. Throws (test-fails) if no baseURL is set.
 */
export function requireBaseURL(baseURL: string | undefined): string {
  if (!baseURL) throw new Error("baseURL missing from Playwright config")
  return baseURL.replace(/\/$/, "")
}

export { TEST_PASSWORD }
