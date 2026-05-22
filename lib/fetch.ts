/**
 * apiFetch — thin wrapper around `fetch()` that auto-injects the
 * NextAuth CSRF token on mutating verbs.
 *
 * Why: lib/middleware/csrf.ts (Claude P2 fix, 2026-05-22) requires every
 * POST / PATCH / PUT / DELETE to /api/* to send an `X-CSRF-Token`
 * header matching the token half of NextAuth's csrf cookie.
 *
 * IMPORTANT — why we do NOT read the cookie:
 *   NextAuth's CSRF cookie (`__Host-next-auth.csrf-token` in prod,
 *   `next-auth.csrf-token` in dev) is set with `httpOnly: true`, so
 *   `document.cookie` CANNOT see it from JavaScript. An earlier version
 *   of this file tried to read the cookie and always got null → no
 *   header was ever sent → every authenticated write 403'd
 *   ("CSRF token invalid or missing"). The correct source of the token
 *   on the client is the JSON body of `GET /api/auth/csrf`, which
 *   returns `{ csrfToken }` — exactly the value NextAuth's own
 *   `getCsrfToken()` uses, and exactly the token half stored in the
 *   cookie that the server compares against.
 *
 * Behaviour:
 *   - GET / HEAD / OPTIONS → identical to `fetch()`.
 *   - Other verbs → fetches + caches the csrf token once, stamps the
 *     `X-CSRF-Token` header. On a 403 CSRF rejection it invalidates the
 *     cached token and retries exactly once (covers a rotated session).
 *
 * Server-rendered components must NOT call this — use it only from
 * `"use client"` files.
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

let cachedToken: string | null = null
let inflight: Promise<string | null> | null = null

/**
 * Fetch (and memoise) NextAuth's CSRF token from `GET /api/auth/csrf`.
 * The response body is `{ csrfToken: "<hex>" }`. That `<hex>` is the
 * same value the server extracts from the `<token>|<hmac>` cookie, so
 * echoing it in the `X-CSRF-Token` header satisfies the double-submit
 * check in lib/middleware/csrf.ts.
 */
async function getCsrfToken(forceRefresh = false): Promise<string | null> {
  if (cachedToken && !forceRefresh) return cachedToken
  if (forceRefresh) {
    cachedToken = null
    inflight = null
  }
  if (!inflight) {
    inflight = fetch("/api/auth/csrf", {
      method: "GET",
      credentials: "same-origin",
      headers: { accept: "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        cachedToken = (d && typeof d.csrfToken === "string" && d.csrfToken) || null
        return cachedToken
      })
      .catch(() => null)
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

function isMutating(method: string): boolean {
  return !SAFE_METHODS.has(method.toUpperCase())
}

async function doFetch(
  input: RequestInfo | URL,
  init: RequestInit,
  token: string | null,
): Promise<Response> {
  const headers = new Headers(init.headers ?? {})
  if (token && !headers.has("X-CSRF-Token")) {
    headers.set("X-CSRF-Token", token)
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? "same-origin",
  })
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
  if (!isMutating(method)) {
    return fetch(input, { credentials: "same-origin", ...init })
  }

  let token = await getCsrfToken()
  let res = await doFetch(input, init, token)

  // A 403 here is most likely a stale/rotated csrf token. Refresh once
  // and retry — but only if the body actually says it's a CSRF failure,
  // so we don't mask a genuine authorization 403.
  if (res.status === 403) {
    const clone = res.clone()
    let isCsrf = false
    try {
      const body = await clone.json()
      isCsrf = typeof body?.error === "string" && /csrf/i.test(body.error)
    } catch {
      /* non-JSON body — leave isCsrf false */
    }
    if (isCsrf) {
      token = await getCsrfToken(true)
      if (token) res = await doFetch(input, init, token)
    }
  }

  return res
}
