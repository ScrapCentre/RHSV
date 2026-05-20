// M12 — POST /api/chat/offers/[messageId]/accept
// Accept = signal + audit log (per L44 + §25.17).
// Pins agreed amount as Lead.agreedPrice. Money + scrap settled offline.
// Concurrency guards per §25.5: checks Lead.state ∈ unlockable-or-negotiating
// AND ChatThread.status === "active" inside same operation.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import ChatMessage from "@/models/ChatMessage"
import ChatThread from "@/models/ChatThread"
import Lead from "@/models/Lead"
import AuditLog from "@/models/AuditLog"

const NEGOTIABLE_STATES = ["unlocked", "assigned_to_cc", "negotiating", "cd_issued"]

export const POST = withAuth(["client", "rvsf_admin", "rvsf_executive", "admin"], async (req, { user }) => {
  await connectToDatabase()
  const url = new URL(req.url)
  const segments = url.pathname.split("/")
  // /api/chat/offers/<messageId>/accept
  const messageId = segments[segments.length - 2]

  // 1. Find + flip offer atomically; guards on offer.status: "open"
  const updated = await ChatMessage.findOneAndUpdate(
    { _id: messageId, "offer.status": "open" },
    {
      $set: {
        "offer.status": "accepted",
        "offer.decidedAt": new Date(),
        "offer.decidedByUserId": user.id,
      },
    },
    { new: true }
  ) as any
  if (!updated) {
    return NextResponse.json({ error: "Offer is no longer open" }, { status: 409 })
  }

  // 2. Load thread + lead with state guards
  const thread = await ChatThread.findById(updated.threadId).lean() as any
  if (!thread || thread.status !== "active") {
    // Rollback the accept since the thread is gone
    await ChatMessage.updateOne({ _id: messageId }, { $set: { "offer.status": "open" } })
    return NextResponse.json({ error: "Thread is archived" }, { status: 409 })
  }

  const lead = await Lead.findById(thread.leadId).lean() as any
  if (!lead || !NEGOTIABLE_STATES.includes(lead.state)) {
    await ChatMessage.updateOne({ _id: messageId }, { $set: { "offer.status": "open" } })
    return NextResponse.json({ error: `Lead is no longer negotiable (state=${lead?.state})` }, { status: 409 })
  }

  // 3. Forbid accepting one's own offer (poster cannot self-accept)
  if (updated.senderUserId?.toString() === user.id) {
    await ChatMessage.updateOne({ _id: messageId }, { $set: { "offer.status": "open" } })
    return NextResponse.json({ error: "Cannot accept your own offer; counter or wait for the other party" }, { status: 400 })
  }

  // 4. Pin to thread + write agreedPrice on Lead + AuditLog (per L44 + §25.17)
  const acceptedByRole = user.role === "client" ? "customer" :
                         user.role === "rvsf_admin" ? "rvsf_admin" :
                         user.role === "rvsf_executive" ? "rvsf_executive" :
                         "rvsf_executive"  // admin acting on behalf

  await ChatThread.updateOne(
    { _id: thread._id },
    {
      $set: {
        pinnedOfferMessageId: updated._id,
        pinnedOfferAmountPaise: updated.offer.amountPaise,
      },
    }
  )

  const beforeAgreedPrice = lead.agreedPrice
  await Lead.updateOne(
    { _id: lead._id },
    {
      $set: {
        agreedPrice: {
          amountPaise: updated.offer.amountPaise,
          acceptedAt: new Date(),
          threadId: thread._id,
          customerUserId: thread.customerUserId,
          rvsfId: thread.rvsfId,
          acceptedByUserId: user.id,
          acceptedByRole,
          sourceMessageId: updated._id,
        },
      },
    }
  )

  await AuditLog.create({
    actorUserId: user.id,
    action: "lead.price.agreed",
    targetCollection: "leads",
    targetId: lead._id,
    before: { agreedPrice: beforeAgreedPrice ?? null },
    after: {
      amount: updated.offer.amountPaise,
      threadId: thread._id.toString(),
      acceptedByRole,
    },
  })

  // 5. Post a system message announcing the acceptance
  await ChatMessage.create({
    threadId: thread._id,
    senderUserId: null,
    senderRole: "system",
    type: "system_event",
    text: `Offer of ₹${(updated.offer.amountPaise / 100).toLocaleString("en-IN")} accepted as the agreed price. Money + vehicle handover happen between you offline.`,
  })

  return NextResponse.json({
    ok: true,
    pinnedOfferMessageId: updated._id.toString(),
    agreedAmountPaise: updated.offer.amountPaise,
  })
})
