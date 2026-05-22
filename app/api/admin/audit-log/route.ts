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
  // Rows authored by the env-fallback admin have actorUserId=null and carry
  // their human label on `actorLabel` (see lib/middleware/userIdCast.ts +
  // hotfix 2026-05-22). The User lookup naturally skips those rows.
  const actorIds = Array.from(new Set(rows.map((r: any) => r.actorUserId?.toString()).filter(Boolean)))
  const actors = await User.find({ _id: { $in: actorIds } }, { email: 1, name: 1 }).lean()
  const actorMap = new Map<string, { email?: string; name?: string }>()
  for (const a of actors as any[]) {
    actorMap.set(a._id.toString(), { email: a.email, name: a.name })
  }

  return NextResponse.json({
    entries: rows.map((r: any) => {
      const a = actorMap.get(r.actorUserId?.toString() ?? "") ?? {}
      // Display preference: looked-up User email > looked-up User name >
      // persisted actorLabel (env-admin path, or User row since deleted)
      // > raw ObjectId string > em-dash.
      const actor =
        a.email ??
        a.name ??
        (typeof r.actorLabel === "string" && r.actorLabel.length > 0 ? r.actorLabel : null) ??
        r.actorUserId?.toString() ??
        "—"
      return {
        _id: r._id.toString(),
        action: r.action,
        actor,
        actorLabel: r.actorLabel ?? null,  // exposed so the UI can badge env-admin rows
        targetCollection: r.targetCollection,
        targetId: r.targetId?.toString() ?? "—",
        reason: r.reason ?? "",
        createdAt: r.createdAt,
      }
    }),
  })
})
