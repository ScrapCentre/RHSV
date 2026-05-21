// engineering-design.md §4.1 — Resolve anti-hoarding alert
import { NextRequest, NextResponse } from "next/server"
import { requireRole, AuthError } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import AntiHoardingAlert from "@/models/AntiHoardingAlert"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireRole(req, "admin") } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status })
    throw e
  }

  try {
    const { id } = await params
    const { resolutionNote } = await req.json()

    await connectToDatabase()

    const updated = await AntiHoardingAlert.findByIdAndUpdate(
      id,
      {
        $set: {
          resolvedAt:     new Date(),
          resolutionNote: resolutionNote ?? null,
        }
      },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, alert: updated })
  } catch (err: any) {
    console.error("[admin/triage/alerts/id PATCH] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
