// M16 — POST /api/leads/[id]/reveal-customer-number
//
// Founder-locked rule (2026-05-20): once an RVSF reveals the customer's
// number, AUTOMATIC refund is permanently disabled on this lead. Every
// future refund request goes through admin review with a red "⚠ Customer
// number was revealed before this rejection" badge.
//
// On confirm:
//   1. Set Lead.customerNumberRevealed = {atTime, byUserId}  (one-way)
//   2. Post a system message in the chat so the customer is informed
//   3. Fire notification to customer (email + inapp + whatsapp)
//   4. Audit log entry
//   5. Return the customer phone in the response (one-time reveal to RVSF)
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import ChatThread from "@/models/ChatThread"
import ChatMessage from "@/models/ChatMessage"
import AuditLog from "@/models/AuditLog"
import RVSF from "@/models/RVSF"
import { enqueueNotification } from "@/lib/services/notifications/dispatcher"

export const POST = withAuth(["rvsf_admin", "rvsf_executive"], async (req, { user }) => {
  await connectToDatabase()
  const url = new URL(req.url)
  const segments = url.pathname.split("/")
  const leadId = segments[segments.length - 2]

  const lead = await Lead.findById(leadId)
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  if (lead.unlock?.unlockedByRvsfId?.toString() !== user.linkedRvsfId) {
    return NextResponse.json({ error: "This lead is not unlocked by your RVSF" }, { status: 403 })
  }

  const alreadyRevealed = !!lead.customerNumberRevealed
  if (!alreadyRevealed) {
    lead.customerNumberRevealed = { atTime: new Date(), byUserId: user.id }
    await lead.save()

    const rvsf = await RVSF.findById(lead.unlock.unlockedByRvsfId).lean() as any
    const thread = await ChatThread.findOne({ leadId, status: "active" }).lean() as any
    if (thread) {
      await ChatMessage.create({
        threadId: thread._id,
        senderUserId: null,
        senderRole: "system",
        type: "system_event",
        text: `${rvsf?.displayName ?? "The RVSF"} has unlocked your phone number to contact you directly.`,
      })
    }

    if (lead.customerUserId) {
      await enqueueNotification({
        kind: "customer_number_revealed_to_customer",
        recipientUserId: lead.customerUserId.toString(),
        subject: `Update on your scrap job — ${rvsf?.displayName ?? "the RVSF"} will call you`,
        bodyMarkdown: `**${rvsf?.displayName ?? "The RVSF"}** has unlocked your phone number to call you about your ${lead.vehicle?.year ?? ""} ${lead.vehicle?.make ?? ""} ${lead.vehicle?.model ?? ""}. Expect a call shortly. You can still chat with them on ScrapCentre too.`,
        channels: ["email", "inapp", "whatsapp"],
        whatsappTemplateName: "customer_number_revealed_to_customer",
        leadId: lead._id.toString(),
      })
    }

    await AuditLog.create({
      actorUserId: user.id,
      action: "lead.customer_number.revealed",
      targetCollection: "leads",
      targetId: lead._id,
      before: null,
      after: { atTime: lead.customerNumberRevealed.atTime, byUserId: user.id },
    })
  }

  return NextResponse.json({
    phone: lead.customerPhone,
    revealedAt: lead.customerNumberRevealed?.atTime,
    note: "Refunds on this lead are now admin-reviewed (automatic refund disabled).",
  })
})
