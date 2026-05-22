/**
 * apiFetch — thin wrapper around `fetch()` that auto-injects the
 * NextAuth CSRF token on mutating verbs.
 *
 * Why: lib/middleware/csrf.ts (Claude P2 fix, 2026-05-22) requires every
 * POST / PATCH / PUT / DELETE to /api/* to send an `X-CSRF-Token`
 * header matching the `next-auth.csrf-token` cookie. Rather than
 * sprinkle that boilerplate into every client component, we centralise
 * it here and gradually migrate `fetch(...)` call sites to
 * `apiFetch(...)`.
 *
 * Behaviour:
 *   - GET / HEAD / OPTIONS → identical to `fetch()`.
 *   - Other verbs → reads the cookie, calls `/api/auth/csrf` exactly
 *     once if it's missing (e.g. user just signed in and the cookie
 *     hasn't been issued yet), and stamps the header.
 *
 * Server-rendered components must NOT call this — `document.cookie`
 * doesn't exist on the server. Use it only from `"use client"` files.
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

const CSRF_COOKIE_NAMES = [
  "__Host-next-auth.csrf-token",
  "next-auth.csrf-token",
]

/**
 * Read the token half of NextAuth's CSRF cookie from `document.cookie`.
 * Returns null if no cookie is set (e.g. user hasn't visited
 * /api/auth/csrf or any NextAuth page yet).
 */
function readCsrfCookie(): string | null {
  if (typeof document === "undefined") return null
  const jar = document.cookie.split(";").map((c) => c.trim())
  for (const name of CSRF_COOKIE_NAMES) {
    const prefix = `${name}=`
    const hit = jar.find((c) => c.startsWith(prefix))
    if (!hit) continue
    const raw = decodeURIComponent(hit.slice(prefix.length))
    const [token] = raw.split("|")
    if (token) return token
  }
  return null
}

let csrfPrimePromise: Promise<void> | null = null

/**
 * Force NextAuth to mint a CSRF cookie if one isn't set. The response
 * body contains `{ csrfToken: "..." }` but we ignore it — we always
 * read from the cookie so the cookie is the source of truth.
 */
async function primeCsrfCookie(): Promise<void> {
  if (!csrfPrimePromise) {
    csrfPrimePromise = fetch("/api/auth/csrf", {
      method: "GET",
      credentials: "same-origin",
    }).then(
      () => undefined,
      () => undefined, // swallow; the subsequent header check will surface a clear 403
    )
  }
  return csrfPrimePromise
}

/**
 * Drop-in replacement for `fetch()` that injects `X-CSRF-Token` on
 * mutating requests. Identical signature to `fetch()`.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase()
  if (SAFE_METHODS.has(method)) return fetch(input, init)

  let token = readCsrfCookie()
  if (!token) {
    await primeCsrfCookie()
    token = readCsrfCookie()
  }

  // Build a header bag that preserves whatever the caller passed in.
  // Using the Headers constructor normalises mixed shapes
  // (HeadersInit can be a plain object, an array of pairs, or Headers).
  const headers = new Headers(init.headers ?? {})
  if (token && !headers.has("X-CSRF-Token")) {
    headers.set("X-CSRF-Token", token)
  }

  return fetch(input, { ...init, headers })
}
