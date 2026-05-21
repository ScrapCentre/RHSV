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
import connectToDatabase from "@/lib/db"
import ConfigSetting from "@/models/ConfigSetting"
import AuditLog from "@/models/AuditLog"

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

  const doc = await ConfigSetting.findOneAndUpdate(
    { key },
    {
      $set: { value: coerced, lastUpdatedByUserId: user.id },
      $inc: { version: 1 },
      $setOnInsert: { description: "" },
    },
    { upsert: true, new: true }
  ).lean() as any

  await AuditLog.create({
    actorUserId: user.id,
    action: "config.setting.update",
    targetCollection: "configsettings",
    targetId: doc._id,
    before: { value: beforeValue, version: beforeVersion },
    after:  { value: doc.value, version: doc.version },
    reason: `key=${key}`,
  })

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
