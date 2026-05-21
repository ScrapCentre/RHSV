// engineering-design.md §4.1 / §5 — Read/write mock toggle
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import Setting from "@/models/Setting"
import { invalidateMockConfigCache } from "@/lib/services/mock-config"

export async function GET() {
  const authError = await requireRole("admin")
  if (authError) return authError

  try {
    await connectToDatabase()
    const doc = await Setting.findOne({ key: "mockConfig" }).lean()
    if (!doc) {
      return NextResponse.json({ mode: "success", services: {} })
    }
    return NextResponse.json((doc as any).value)
  } catch (err: any) {
    console.error("[admin/mock-config GET] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const authError = await requireRole("admin")
  if (authError) return authError

  try {
    const body = await req.json()
    const { mode, services } = body

    const validModes = ["success", "failure", "random"]
    if (mode && !validModes.includes(mode)) {
      return NextResponse.json({ error: "Invalid mode value" }, { status: 400 })
    }

    await connectToDatabase()

    const existing = await Setting.findOne({ key: "mockConfig" }).lean()
    const current  = (existing as any)?.value ?? { mode: "success", services: {} }

    const updated = {
      mode:     mode ?? current.mode,
      services: { ...current.services, ...(services ?? {}) },
    }

    await Setting.findOneAndUpdate(
      { key: "mockConfig" },
      { $set: { value: updated, description: "Mock service toggle. Per-service overrides take precedence over global mode." } },
      { upsert: true }
    )

    // Invalidate module-level cache
    invalidateMockConfigCache()

    return NextResponse.json({ success: true, config: updated })
  } catch (err: any) {
    console.error("[admin/mock-config POST] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
