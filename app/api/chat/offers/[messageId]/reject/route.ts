// M12 — POST /api/chat/offers/[messageId]/reject
// Marks the open offer as rejected. No money movement (always; offers are signal-only per L44).
//
// HOTFIX (Backend code-review §6): now includes party-check on the parent
// thread. Previously vulnerable to IDOR — any authenticated session could
// reject offers in unrelated chat threads by guessing messageIds.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import ChatMessage from "@/models/ChatMessage"
import ChatThread from "@/models/ChatThread"

function isParty(thread: any, user: any): boolean {
  if (!thread) return false
  if (user.role === "admin") return true
  if (user.role === "client" && thread.customerUserId?.toString() === user.id) return true
  if ((user.role === "rvsf_admin" || user.role === "rvsf_executive") && thread.rvsfId?.toString() === user.linkedRvsfId) return true
  if (user.role === "cc_operator" && thread.assignedCcId?.toString() === user.linkedCcId) return true
  return false
}

export const POST = withAuth(["client", "rvsf_admin", "rvsf_executive", "admin"], async (req, { user }) => {
  await connectToDatabase()
  const url = new URL(req.url)
  const segments = url.pathname.split("/")
  const messageId = segments[segments.length - 2]

  // Party check BEFORE mutation
  const msg = await ChatMessage.findById(messageId).lean() as any
  if (!msg) return NextResponse.json({ error: "Offer not found" }, { status: 404 })
  const thread = await ChatThread.findById(msg.threadId).lean() as any
  if (!isParty(thread, user)) {
    return NextResponse.json({ error: "Not a party to this thread" }, { status: 403 })
  }
  // HOTFIX 2026-05-22 (Codex P2 — chat archived-thread access):
  // Refuse to act on offers in an archived thread. The thread is read-only,
  // so no negotiation primitive (accept/counter/reject) may run. The accept
  // + counter handlers already guard on this; we now mirror in reject for
  // parity (Codex flagged the asymmetric guard while reviewing this hotfix).
  if (!thread || thread.status !== "active") {
    return NextResponse.json({ error: "Thread is archived" }, { status: 409 })
  }

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
