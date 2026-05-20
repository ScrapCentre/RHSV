// M12 — POST /api/chat/offers/[messageId]/counter
// Mark the existing offer as `countered` + post a new offer message with
// `counterOfMessageId` linking back to the parent.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import ChatMessage from "@/models/ChatMessage"
import ChatThread from "@/models/ChatThread"
import ConfigSetting from "@/models/ConfigSetting"

export const POST = withAuth(["client", "rvsf_admin", "rvsf_executive", "admin"], async (req, { user }) => {
  await connectToDatabase()
  const url = new URL(req.url)
  const segments = url.pathname.split("/")
  const messageId = segments[segments.length - 2]

  const body = await req.json().catch(() => ({}))
  const { counterAmountPaise } = body
  if (!counterAmountPaise || counterAmountPaise < 100) {
    return NextResponse.json({ error: "counterAmountPaise (≥100) required" }, { status: 400 })
  }

  const parent = await ChatMessage.findOneAndUpdate(
    { _id: messageId, "offer.status": "open" },
    {
      $set: {
        "offer.status": "countered",
        "offer.decidedAt": new Date(),
        "offer.decidedByUserId": user.id,
      },
    },
    { new: true }
  ) as any
  if (!parent) return NextResponse.json({ error: "Parent offer is no longer open" }, { status: 409 })

  const thread = await ChatThread.findById(parent.threadId).lean() as any
  if (!thread || thread.status !== "active") {
    return NextResponse.json({ error: "Thread is archived" }, { status: 409 })
  }

  const expiryHoursSetting = await ConfigSetting.findOne({ key: "offers.expiryHours" }).lean() as any
  const expiryHours = expiryHoursSetting?.value ?? 48

  const senderRole = user.role === "client" ? "customer" : "rvsf_executive"
  const newOffer = await ChatMessage.create({
    threadId: parent.threadId,
    senderUserId: user.id,
    senderRole,
    type: "offer",
    offer: {
      amountPaise: counterAmountPaise,
      actor: senderRole === "customer" ? "customer" : "rvsf",
      status: "open",
      expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
      counterOfMessageId: parent._id,
    },
  })

  await ChatThread.updateOne(
    { _id: thread._id },
    {
      $set: { lastMessageAt: newOffer.createdAt },
      $inc: { messageCount: 1, ...(senderRole === "customer" ? { unreadByRvsf: 1 } : { unreadByCustomer: 1 }) },
    }
  )

  return NextResponse.json({ ok: true, counterOfferId: newOffer._id.toString() }, { status: 201 })
})
