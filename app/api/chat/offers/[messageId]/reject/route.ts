// M12 — POST /api/chat/offers/[messageId]/reject
// Marks the open offer as rejected. No money movement (always; offers are signal-only per L44).
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import ChatMessage from "@/models/ChatMessage"
import ChatThread from "@/models/ChatThread"

export const POST = withAuth(["client", "rvsf_admin", "rvsf_executive", "admin"], async (req, { user }) => {
  await connectToDatabase()
  const url = new URL(req.url)
  const segments = url.pathname.split("/")
  const messageId = segments[segments.length - 2]

  const updated = await ChatMessage.findOneAndUpdate(
    { _id: messageId, "offer.status": "open" },
    {
      $set: {
        "offer.status": "rejected",
        "offer.decidedAt": new Date(),
        "offer.decidedByUserId": user.id,
      },
    },
    { new: true }
  ) as any
  if (!updated) return NextResponse.json({ error: "Offer is no longer open" }, { status: 409 })

  // Post a small system event noting the rejection (helps thread flow)
  await ChatMessage.create({
    threadId: updated.threadId,
    senderUserId: null,
    senderRole: "system",
    type: "system_event",
    text: `Offer of ₹${(updated.offer.amountPaise / 100).toLocaleString("en-IN")} was rejected. Either party can post a fresh offer.`,
  })

  await ChatThread.updateOne({ _id: updated.threadId }, { $set: { lastMessageAt: new Date() } })

  return NextResponse.json({ ok: true })
})
