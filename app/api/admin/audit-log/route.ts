// v2 admin AuditLog viewer — chronological tail of recent privileged actions.
// 100-row cap; no filter UI yet (founder-MVP).
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import AuditLog from "@/models/AuditLog"
import User from "@/models/User"

export const dynamic = "force-dynamic"

export const GET = withAuth(["admin"], async (_req, _ctx) => {
  await connectToDatabase()
  const rows = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100).lean()

  // Lookup actor labels (email/name) — small N, sequential is fine.
  const actorIds = Array.from(new Set(rows.map((r: any) => r.actorUserId?.toString()).filter(Boolean)))
  const actors = await User.find({ _id: { $in: actorIds } }, { email: 1, name: 1 }).lean()
  const actorMap = new Map<string, { email?: string; name?: string }>()
  for (const a of actors as any[]) {
    actorMap.set(a._id.toString(), { email: a.email, name: a.name })
  }

  return NextResponse.json({
    entries: rows.map((r: any) => {
      const a = actorMap.get(r.actorUserId?.toString() ?? "") ?? {}
      return {
        _id: r._id.toString(),
        action: r.action,
        actor: a.email ?? a.name ?? r.actorUserId?.toString() ?? "—",
        targetCollection: r.targetCollection,
        targetId: r.targetId?.toString() ?? "—",
        reason: r.reason ?? "",
        createdAt: r.createdAt,
      }
    }),
  })
})
