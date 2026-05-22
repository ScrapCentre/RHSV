/**
 * requireRole middleware helper — single point of role-gating for API routes.
 * Cherry-picked from the v1 fork. Used by every /api/* route in v2.
 *
 * Usage:
 *   export async function POST(req: NextRequest) {
 *     const session = await requireRole(req, "rvsf_admin", "rvsf_executive")
 *     // ... handler logic; session.user.role is guaranteed to be one of the listed roles
 *   }
 *
 * Throws Response objects with appropriate status codes; route handlers
 * should let these propagate (Next.js App Router will catch and forward).
 */
import { getServerSession } from "next-auth"
import type { NextRequest } from "next/server"
import { authOptions } from "@/lib/auth"
import { requireCsrf } from "@/lib/middleware/csrf"

export type Role =
  | "client"
  | "admin"
  | "executive"
  | "rvsf_admin"
  | "rvsf_executive"
  | "scrapcentre"        // legacy CC operator role per Novalytix's enum
  | "cc_operator"        // v2 canonical CC operator role
  | "partner"            // legacy B2B partner role
  | "rvsf"               // legacy RVSF role (Novalytix's RVSFUser)

export class AuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message)
    this.name = "AuthError"
  }
}

export async function requireRole(_req: NextRequest, ...allowedRoles: Role[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new AuthError(401, "Authentication required")
  }
  const role = (session.user as any).role as Role | undefined
  if (!role || !allowedRoles.includes(role)) {
    throw new AuthError(403, `Forbidden — required role: ${allowedRoles.join(" | ")}`)
  }
  return { session, user: session.user as any & { role: Role; id: string } }
}

/**
 * Wraps a route handler to translate AuthError into a clean JSON response.
 *
 * Also enforces CSRF (lib/middleware/csrf.ts) on every mutating verb —
 * POST / PATCH / PUT / DELETE. Safe verbs (GET / HEAD / OPTIONS) skip
 * the check. Endpoints that opt out of `withAuth` (raw `requireRole`
 * call inside the handler) must add an explicit `requireCsrf(req)`
 * themselves; see `app/api/admin/triage/alerts/route.ts` for the
 * pattern.
 */
export function withAuth(
  allowedRoles: Role[],
  handler: (req: NextRequest, ctx: { session: any; user: any }) => Promise<Response>
) {
  return async (req: NextRequest) => {
    try {
      // CSRF runs BEFORE auth so we don't even tell an attacker whether
      // they had a valid session (no observable diff between
      // "no session" + "no CSRF" and "good session" + "no CSRF").
      const csrfFail = requireCsrf(req)
      if (csrfFail) return csrfFail

      const ctx = await requireRole(req, ...allowedRoles)
      return handler(req, ctx)
    } catch (err) {
      if (err instanceof AuthError) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: err.status,
          headers: { "Content-Type": "application/json" },
        })
      }
      throw err
    }
  }
}
