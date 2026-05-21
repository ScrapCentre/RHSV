// POST /api/admin/reseed-demo — runs the demo-data seed in-process so the
// founder can re-seed from the browser via /admin/demo-leads instead of
// SSHing to VM 221 to run `npx tsx scripts/seed-demo-leads.ts`.
//
// Admin-only. Idempotent — the underlying seed wipes prior demo leads first.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import { seedDemoLeads, DemoSeedPrerequisiteError } from "@/lib/services/demo/seed"

export const POST = withAuth(["admin"], async (_req, _ctx) => {
  try {
    const result = await seedDemoLeads()
    return NextResponse.json({
      ok: true,
      cleanedUp: result.cleanedUp,
      leadAId: result.leadAId,
      leadBId: result.leadBId,
      leadCId: result.leadCId,
      rvsfDisplayName: result.rvsfDisplayName,
    })
  } catch (err: any) {
    if (err instanceof DemoSeedPrerequisiteError) {
      return NextResponse.json({ error: err.message }, { status: 409 })
    }
    console.error("[reseed-demo] failed:", err)
    return NextResponse.json({ error: err?.message ?? "Seed failed" }, { status: 500 })
  }
})
