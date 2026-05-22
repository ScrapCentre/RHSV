/**
 * csrf — shared guard for state-changing API endpoints.
 *
 * Claude P2 (security review, 2026-05-22): every mutating endpoint under
 * /api/* relied on NextAuth's session cookie alone. NextAuth's session
 * cookie is `SameSite=lax` by default, which blocks naïve cross-site
 * <form method="POST"> submissions but doesn't defend against:
 *   - GET→302→POST redirect chains on older browsers
 *   - Token-style auth in environments where the session JWT leaks via
 *     XSS or a subdomain cache
 *   - `image/`/`fetch()` requests from same-site untrusted iframes (e.g.
 *     a future blog post embedding a third-party widget)
 *
 * Fix: require a CSRF token (double-submit pattern) on every mutating
 * verb. NextAuth already issues a CSRF token via `GET /api/auth/csrf`
 * and stores it in a cookie of the form `<token>|<hmac>`. The client
 * echoes the raw `<token>` part in an `X-CSRF-Token` header; we compare
 * it (constant-time) against the same half of the cookie.
 *
 * Skip list (handled elsewhere):
 *   - /api/auth/*                    NextAuth manages its own CSRF state
 *   - /api/cron/*                    Gated by CRON_SECRET header
 *   - /api/payments/razorpay/webhook Gated by Razorpay HMAC signature
 *   - /api/otp/issue, /api/otp/verify Anonymous + rate-limited
 *
 * Wiring:
 *   - `withAuth(...)` in lib/middleware/requireRole.ts calls `requireCsrf`
 *     automatically on POST/PATCH/PUT/DELETE, so every endpoint using
 *     `withAuth(...)` is protected for free.
 *   - Routes that call `requireRole(req, ...)` directly (without the
 *     `withAuth` wrapper) must add an explicit `requireCsrf(req)` check
 *     at the top of their handler.
 */
import { NextResponse, type NextRequest } from "next/server"
import { timingSafeEqual } from "node:crypto"

// In production NextAuth uses the secure-prefixed cookie; in dev it
// uses the plain name. We check both so the same code works in both
// environments without a `NODE_ENV` branch.
const CSRF_COOKIE_NAMES = [
  "__Host-next-auth.csrf-token",
  "next-auth.csrf-token",
]

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

/**
 * Extract the raw token half of NextAuth's CSRF cookie. The cookie value
 * is stored URL-encoded as `<token>|<hmac>` (the `|` becomes `%7C` when
 * the cookie is round-tripped through Set-Cookie / document.cookie).
 */
function extractCookieToken(req: NextRequest): string | null {
  for (const name of CSRF_COOKIE_NAMES) {
    const raw = req.cookies.get(name)?.value
    if (!raw) continue
    // The cookie store typically decodes the value, but tolerate the
    // raw URL-encoded form (`%7C`) too — different runtimes differ.
    const decoded = raw.includes("|") ? raw : decodeURIComponent(raw)
    const [token] = decoded.split("|")
    if (token) return token
  }
  return null
}

function constantTimeEqual(a: string, b: string): boolean {
  // timingSafeEqual requires equal-length buffers; pad to the longer
  // side so we never short-circuit on length and leak the token length.
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) {
    // Still run the compare against a same-length dummy so the timing
    // is uniform with respect to the secret.
    timingSafeEqual(ba, Buffer.alloc(ba.length))
    return false
  }
  return timingSafeEqual(ba, bb)
}

/**
 * Returns a 403 NextResponse if the request fails CSRF validation, or
 * `null` if the request is safe to process.
 *
 * Safe verbs (GET / HEAD / OPTIONS) always return null — CSRF only
 * matters for state-changing requests.
 */
export function requireCsrf(req: NextRequest): NextResponse | null {
  if (SAFE_METHODS.has(req.method)) return null

  const cookieToken = extractCookieToken(req)
  if (!cookieToken) {
    return NextResponse.json(
      { error: "CSRF token missing — fetch /api/auth/csrf first." },
      { status: 403 },
    )
  }

  // Prefer the header; fall back to a form field for legacy
  // <form action="..." method="post"> submissions that haven't been
  // migrated to fetch yet. The header is the canonical path.
  const headerToken = req.headers.get("x-csrf-token")
  if (headerToken && constantTimeEqual(headerToken, cookieToken)) return null

  // Inspecting the body would consume the request stream and break
  // downstream `await req.json()` calls in handlers. We only support
  // header-based double-submit; legacy form posts are not supported
  // (and the codebase has none — every mutating call uses fetch).
  return NextResponse.json(
    { error: "CSRF token invalid or missing." },
    { status: 403 },
  )
}
