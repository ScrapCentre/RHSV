// M16 — GET /api/admin/refund-review
// Lists pending refund requests (RejectionEvent.refundDecision === "admin_pending"
// OR auto_full_but_refund_failed OR auto_denied_number_revealed).
// Surfaces customerNumberRevealed flag and refundEntryReason prominently.
//
// 2026-05-22 hotfix (P0-2): engaged-phase rejections now correctly enter this queue
// because the reject handler writes `admin_pending` instead of the
// (removed) `auto_denied_engaged_phase` — see app/api/leads/[id]/reject/route.ts.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import RejectionEvent from "@/models/RejectionEvent"
import RVSF from "@/models/RVSF"
import Lead from "@/models/Lead"

export const GET = withAuth(["admin"], async (_req, _ctx) => {
  await connectToDatabase()
  const events = await RejectionEvent
    // Include auto_denied_number_revealed so RVSFs that had their refund
    // auto-denied (because they used the Reveal-customer-number button)
    // still have admin recourse — Architect coherence review finding.
    .find({ refundDecision: { $in: ["admin_pending", "auto_full_but_refund_failed", "auto_denied_number_revealed"] } })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()

  // Hydrate with RVSF + lead summary
  const out = []
  for (const ev of events as any[]) {
    const rvsf = await RVSF.findById(ev.rejectedByRvsfId).lean() as any
    const lead = await Lead.findById(ev.leadId).lean() as any
    out.push({
      rejectionEventId: ev._id.toString(),
      leadId: ev.leadId.toString(),
      unlockId: ev.unlockId.toString(),
      vehicleReg: lead?.vehicle?.registrationNumber,
      rvsfName: rvsf?.displayName ?? "—",
      unlockAmountPaise: 0,  // we'd join LeadUnlock for the exact amount; deferred
      reason: ev.reason,
      reasonNote: ev.reasonNote,
      minutesElapsedSinceUnlock: ev.minutesElapsedSinceUnlock,
      chatMessageCount: ev.chatMessageCountAtReject,
      chatFlaggedPatterns: ev.chatFlaggedPatterns,
      customerNumberRevealed: ev.customerNumberRevealed,
      refundDecision: ev.refundDecision,
      refundEntryReason: ev.refundEntryReason,  // P0-2 hotfix: surface why row entered queue
      refundFailureReason: ev.refundFailureReason,
      createdAt: ev.createdAt,
    })
  }
  return NextResponse.json({ events: out })
})
