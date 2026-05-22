/**
 * install-csrf-fetch — global `window.fetch` interceptor that auto-injects
 * NextAuth's CSRF token on every same-origin mutating `/api` request.
 *
 * Why a global patch (not the apiFetch opt-in wrapper):
 *   lib/middleware/csrf.ts (security fix 2026-05-22) requires an
 *   `X-CSRF-Token` header on every mutating /api route. The original
 *   `apiFetch()` opt-in approach silently missed call sites — the chat,
 *   negotiation-offer, reject-lead, reveal-number and contact components
 *   all kept using bare `fetch()` and 403'd ("CSRF token invalid or
 *   missing"). The founder hit this on the negotiation widget.
 *
 *   A global patch is fail-safe: EVERY fetch() in the client bundle —
 *   bare or apiFetch — is covered, and no future component can forget.
 *
 * Scope (deliberately narrow so nothing else is affected):
 *   - Only string / URL inputs (Request objects pass straight through —
 *     those are Next.js internals and are GETs anyway).
 *   - Only same-origin `/api/*` paths.
 *   - Only mutating verbs (POST / PUT / PATCH / DELETE).
 *   - Never `/api/auth/*` — NextAuth owns its own CSRF state.
 *   Everything else is handed to the original fetch untouched.
 *
 * Token source: the JSON body of `GET /api/auth/csrf` (`{ csrfToken }`).
 * That is the exact value the server extracts from the `<token>|<hmac>`
 * cookie, and the only client-readable source — the cookie itself is
 * httpOnly. Token is memoised; a CSRF-flavoured 403 refreshes it and
 * retries the request once.
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

let installed = false
let origFetch: typeof fetch
let cachedToken: string | null = null
let inflight: Promise<string | null> | null = null

async function getCsrfToken(force = false): Promise<string | null> {
  if (cachedToken && !force) return cachedToken
  if (force) {
    cachedToken = null
    inflight = null
  }
  if (!inflight) {
    inflight = origFetch("/api/auth/csrf", {
      method: "GET",
      credentials: "same-origin",
      headers: { accept: "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        cachedToken =
          (d && typeof d.csrfToken === "string" && d.csrfToken) || null
        return cachedToken
      })
      .catch(() => null)
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

/**
 * Patch `window.fetch` exactly once. Safe to call repeatedly and on the
 * server (no-op when `window` is undefined).
 */
export function installCsrfFetch(): void {
  if (installed || typeof window === "undefined") return
  installed = true
  origFetch = window.fetch.bind(window)

  window.fetch = async function csrfPatchedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const isStringOrUrl = typeof input === "string" || input instanceof URL
    const method = (init?.method ?? "GET").toUpperCase()

    // Fast path — anything we don't need to touch.
    if (!isStringOrUrl || SAFE_METHODS.has(method)) {
      return origFetch(input, init)
    }

    const rawUrl = typeof input === "string" ? input : (input as URL).href
    let path: string
    try {
      path = new URL(rawUrl, window.location.origin).pathname
    } catch {
      return origFetch(input, init)
    }

    const sameOrigin =
      rawUrl.startsWith("/") || rawUrl.startsWith(window.location.origin)
    if (
      !sameOrigin ||
      !path.startsWith("/api/") ||
      path.startsWith("/api/auth/")
    ) {
      return origFetch(input, init)
    }

    let token = await getCsrfToken()
    const headers = new Headers(init?.headers ?? {})
    if (token && !headers.has("X-CSRF-Token")) {
      headers.set("X-CSRF-Token", token)
    }

    const opts: RequestInit = {
      ...init,
      headers,
      credentials: init?.credentials ?? "same-origin",
    }
    let res = await origFetch(input, opts)

    // One retry on a CSRF-flavoured 403 — covers a rotated session token.
    if (res.status === 403) {
      let isCsrf = false
      try {
        const body = await res.clone().json()
        isCsrf = typeof body?.error === "string" && /csrf/i.test(body.error)
      } catch {
        /* non-JSON body — leave isCsrf false */
      }
      if (isCsrf) {
        token = await getCsrfToken(true)
        if (token) {
          headers.set("X-CSRF-Token", token)
          res = await origFetch(input, { ...opts, headers })
        }
      }
    }

    return res
  }
}
