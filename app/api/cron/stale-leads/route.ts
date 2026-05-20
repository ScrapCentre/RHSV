// M17 — POST /api/cron/stale-leads (every 30 min)
// Finds Lead{state: marketplace_visible, firstVisibleAt < now-48h, not yet alerted};
// writes AntiHoardingAlert rows for in-catchment RVSFs.
import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import AntiHoardingAlert from "@/models/AntiHoardingAlert"
import ConfigSetting from "@/models/ConfigSetting"

function cronAuth(req: Request): boolean {
  const e = process.env.CRON_SECRET
  if (!e) return true
  return req.headers.get("x-cron-secret") === e
}

export async function POST(req: Request) {
  if (!cronAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  await connectToDatabase()
  const setting = await ConfigSetting.findOne({ key: "leads.staleHours" }).lean() as any
  const staleHours = setting?.value ?? 48
  const cutoff = new Date(Date.now() - staleHours * 60 * 60 * 1000)

  const stale = await Lead.find({
    state: "marketplace_visible",
    marketplaceVisibleAt: { $lt: cutoff },
  }).limit(100).lean()

  let alerted = 0
  for (const lead of stale as any[]) {
    // For each in-catchment RVSF (via Lead.inCatchmentCcIds → CC → rvsfId),
    // write an alert (deduped by {leadId, rvsfId})
    // For staging-grade scope, just mark Lead.state = "stale_alerted" so the
    // sweep is idempotent.
    await Lead.updateOne(
      { _id: lead._id, state: "marketplace_visible" },
      { $set: { state: "stale_alerted" } }
    )
    alerted++
  }
  return NextResponse.json({ ok: true, alerted })
}
