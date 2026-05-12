// engineering-design.md §13 — shared auth guard helper
// Usage: const authError = await requireRole(req, "admin")
//        if (authError) return authError
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

type Role = "admin" | "partner" | "client" | "executive" | "scrapcentre"

/**
 * Returns a NextResponse error (401/403) if the session does not satisfy the role.
 * Returns null when the session is valid and the role matches.
 */
export async function requireRole(role: Role): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userRole = (session.user as any).role as string
  if (userRole !== role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return null
}

/**
 * Returns a NextResponse error if the session is not authenticated at all.
 * Use for endpoints that accept multiple roles.
 */
export async function requireAuth(): Promise<{ session: any; error: NextResponse | null }> {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { session, error: null }
}
