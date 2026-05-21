// Edge middleware — force CC operator first-login interstitial.
//
// What it does:
//   - For any authenticated cc_operator with `mustChangePassword: true` in
//     their JWT, redirects every page request to /cc/first-login.
//   - Allowlists the change-password page itself, the change-password API,
//     /api/auth/* (sign-out + session refresh), and Next internal assets so
//     the user can complete the flow + log out + load the page chrome.
//
// Why JWT in middleware (not a DB lookup)?
//   - This file runs on the Edge runtime; Mongoose can't run here.
//   - The flag is already stamped onto the JWT by the auth.ts session callback
//     (and refreshed via NextAuth's `update()` after the password change), so
//     no DB hit is needed at request-time.
//
// Why redirect at the framework layer instead of a per-page guard?
//   - The brief calls for "redirect EVERY page request", which catches the
//     case where a CC operator deep-links to /me, /admin/foo, /cc/leads, etc.
//     with a stale "mustChange = true" session. The per-page guards in
//     /cc/dashboard + /cc/leads stay as belt-and-braces.

import { getToken } from "next-auth/jwt"
import { NextResponse, NextRequest } from "next/server"

const ALLOWLIST_PATHS = [
  "/cc/first-login",
  "/api/cc/change-password",
  // NextAuth surfaces — needed for sign-out + session refresh + CSRF token
  "/api/auth",
]

function isAllowlisted(pathname: string) {
  return ALLOWLIST_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Note: `matcher` already excludes _next/, public assets, and the like; this
  // guard is for the path-based allowlist (login flow + auth API).
  if (isAllowlisted(pathname)) return NextResponse.next()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.next()

  if (token.role === "cc_operator" && token.mustChangePassword === true) {
    const url = req.nextUrl.clone()
    url.pathname = "/cc/first-login"
    url.search = ""  // strip any callbackUrl; we'll route to /cc/dashboard after change
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Skip Next internals, image optimisation, favicon, and any file with an
  // extension (assets in /public). Apply the middleware to everything else
  // so the CC operator gate is enforced across the whole app.
  matcher: ["/((?!_next/|favicon\\.ico|.*\\..*).*)"],
}
