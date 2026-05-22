// v2 admin ConfigSetting CRUD — minimum viable.
// GET   /api/admin/settings           → { settings: [{ key, value, description, version, updatedAt }] }
// PATCH /api/admin/settings           → body { key, value }  writes single row, bumps version,
//                                       records actor + AuditLog row for tamper evidence.
//
// No optimistic concurrency check in this minimum-viable version (overwrites win); the
// `version` counter still increments so future UIs can show conflicts. AuditLog captures
// before/after so an accidental clobber is recoverable.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import { toUserObjectId, toActorLabel } from "@/lib/middleware/userIdCast"
import connectToDatabase from "@/lib/db"
import ConfigSetting from "@/models/ConfigSetting"
import AuditLog from "@/models/AuditLog"
import { invalidatePerKgRateCache } from "@/lib/services/pricing/perKgRate"

export const dynamic = "force-dynamic"

export const GET = withAuth(["admin"], async (_req, _ctx) => {
  await connectToDatabase()
  const docs = await ConfigSetting.find({}).sort({ key: 1 }).lean()
  return NextResponse.json({
    settings: docs.map((d: any) => ({
      _id: d._id.toString(),
      key: d.key,
      value: d.value,
      description: d.description ?? "",
      version: d.version ?? 1,
      updatedAt: d.updatedAt,
    })),
  })
})

export const PATCH = withAuth(["admin"], async (req, { user }) => {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const { key, value } = body ?? {}
  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "Missing 'key' (string)" }, { status: 400 })
  }
  if (value === undefined) {
    return NextResponse.json({ error: "Missing 'value'" }, { status: 400 })
  }

  await connectToDatabase()

  // Try to coerce common string inputs back into native types so the form
  // can post raw <input> strings.
  let coerced: any = value
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (trimmed === "true") coerced = true
    else if (trimmed === "false") coerced = false
    else if (trimmed !== "" && !isNaN(Number(trimmed))) coerced = Number(trimmed)
    else {
      // Try JSON for objects/arrays
      try {
        const parsed = JSON.parse(trimmed)
        if (typeof parsed === "object" && parsed !== null) coerced = parsed
      } catch { /* keep as string */ }
    }
  }

  const before = await ConfigSetting.findOne({ key }).lean() as any
  const beforeValue = before?.value
  const beforeVersion = before?.version ?? 0

  // Project the session user.id onto our Mongo fields safely. The env-admin
  // path (lib/auth.ts: id === "env-admin") must NOT trigger an ObjectId
  // CastError here — the helper returns null for non-ObjectId-shaped ids
  // and `actorLabel` preserves the trail.
  const actorObjectId = toUserObjectId(user.id)
  const actorLabel    = toActorLabel(user)

  const doc = await ConfigSetting.findOneAndUpdate(
    { key },
    {
      $set: {
        value: coerced,
        lastUpdatedByUserId: actorObjectId,
        lastUpdatedByLabel:  actorLabel,
      },
      $inc: { version: 1 },
      $setOnInsert: { description: "" },
    },
    { upsert: true, new: true }
  ).lean() as any

  await AuditLog.create({
    actorUserId: actorObjectId,
    actorLabel,
    action: "config.setting.update",
    targetCollection: "configsettings",
    targetId: doc._id,
    before: { value: beforeValue, version: beforeVersion },
    after:  { value: doc.value, version: doc.version },
    reason: `key=${key}`,
  })

  // Invalidate in-process pricing cache so admin edits to pricing.perKgRate.*
  // take effect on the very next request instead of waiting up to 60 s for
  // the TTL to expire. Cheap; safe to call on every settings edit.
  if (key.startsWith("pricing.perKgRate.")) {
    invalidatePerKgRateCache()
  }

  return NextResponse.json({
    ok: true,
    setting: {
      _id: doc._id.toString(),
      key: doc.key,
      value: doc.value,
      description: doc.description ?? "",
      version: doc.version,
      updatedAt: doc.updatedAt,
    },
  })
})
