// POST /api/cc/leads/[id]/accept — CC operator signals interest on a lead.
//
// Behaviour:
//   - Auth: role === "cc_operator" only (per L19, L22).
//   - The lead must be in a CC-actionable state (visible in marketplace) AND
//     have this operator's CC in its inCatchmentCcIds. We deliberately do NOT
//     allow CC operators in non-catchment CCs to accept; L22 forbids cross-CC
//     visibility, and accepting implies visibility.
//   - We push the CC's ObjectId into Lead.ccAcceptedBy ($addToSet — idempotent).
//   - We fire a single Notification to the parent RVSF so an admin can decide
//     whether to unlock the lead from /rvsf/marketplace. Email + in-app channels
//     by default — WhatsApp is reserved for customer-facing flows.
//
// Non-goals:
//   - This does NOT mutate `state` or `assignedCcId`. Assignment is the parent
//     RVSF's call (post-unlock, M11/M13 flow). Accept is a soft preference signal.
//   - This does NOT issue a payment / unlock event. CC ops don't pay; the
//     billed entity is the RVSF.

import { NextResponse } from "next/server"
import mongoose from "mongoose"
import connectToDatabase from "@/lib/db"
import { requireRole, AuthError } from "@/lib/middleware/requireRole"
import { requireCsrf } from "@/lib/middleware/csrf"
import Lead from "@/models/Lead"
import CollectionCenter from "@/models/CollectionCenter"
import Notification from "@/models/Notification"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const ACCEPTABLE_STATES = [
  "approved_marketplace",
  "marketplace_visible",
  "stale_alerted",
  "rvsf_rejected",
]

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const csrfFail = requireCsrf(req)
  if (csrfFail) return csrfFail
  try {
    const { user } = await requireRole(req, "cc_operator")
    const { id } = await params

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid lead id" }, { status: 400 })
    }
    if (!user.linkedCcId) {
      return NextResponse.json(
        { error: "Your account is not linked to a Collection Centre." },
        { status: 409 }
      )
    }

    await connectToDatabase()

    // Pull the lead + verify catchment scope in one query.
    const lead = await Lead.findById(id).lean() as any
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    const ccIdStr = user.linkedCcId.toString()
    const inCatchment = (lead.inCatchmentCcIds ?? [])
      .map((c: any) => c?.toString?.())
      .includes(ccIdStr)
    if (!inCatchment) {
      // Per L22: no cross-CC visibility. Treat as 404 so we don't leak existence.
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }
    if (!ACCEPTABLE_STATES.includes(lead.state)) {
      return NextResponse.json(
        { error: `Lead is in state "${lead.state}" and is no longer acceptable.` },
        { status: 409 }
      )
    }

    // Idempotent push — duplicate clicks return { alreadyAccepted: true }.
    const updateRes = await Lead.updateOne(
      { _id: lead._id },
      { $addToSet: { ccAcceptedBy: user.linkedCcId } }
    )
    const alreadyAccepted = updateRes.modifiedCount === 0

    // Notify the parent RVSF — fire-and-forget on the response path.
    // Only emit a notification on the FIRST accept by this CC (not on dupes)
    // to avoid spamming the RVSF dashboard.
    if (!alreadyAccepted) {
      try {
        const cc = await CollectionCenter.findById(user.linkedCcId).lean() as any
        const vehicle = lead.vehicle ?? {}
        const veh = `${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim()
        const reg = vehicle.registrationNumber ?? "—"
        await Notification.create({
          recipientRvsfId: cc?.rvsfId ?? lead.unlock?.unlockedByRvsfId ?? null,
          recipientCcId:   user.linkedCcId,
          kind:            "cc_accepted_lead",
          subject:         `CC ${cc?.displayName ?? ""} accepted a lead`,
          bodyMarkdown:
            `Your collection centre **${cc?.displayName ?? "(unknown)"}** has ` +
            `signalled interest on lead **${veh}** (${reg}). ` +
            `Review and unlock from the marketplace if you want to proceed.`,
          deeplinkUrl:     `/rvsf/marketplace/${lead._id.toString()}`,
          channels:        ["inapp", "email"],
          leadId:          lead._id,
          correlationId:   `cc-accept:${lead._id.toString()}:${ccIdStr}`,
        })
      } catch (notifyErr: any) {
        // Don't fail the user's action because notification couldn't be queued.
        // It's a soft signal; the data write already succeeded.
        console.error("[cc/leads/accept] notification create failed:", notifyErr?.message)
      }
    }

    return NextResponse.json({
      ok: true,
      leadId: lead._id.toString(),
      alreadyAccepted,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("[cc/leads/accept] error:", (err as any)?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
