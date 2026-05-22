// M12 — chat messages (GET paginated; POST new text/image/document/offer).
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import { validateObjectId } from "@/lib/middleware/objectId"
import connectToDatabase from "@/lib/db"
import ChatThread from "@/models/ChatThread"
import ChatMessage from "@/models/ChatMessage"
import Lead from "@/models/Lead"
import ConfigSetting from "@/models/ConfigSetting"

const PARTY_ROLES = ["client", "rvsf_admin", "rvsf_executive", "admin"] as const

async function loadThreadAndAuthorize(req: Request, user: any) {
  const url = new URL(req.url)
  const segments = url.pathname.split("/")
  const leadId = segments[segments.length - 2]  // /api/chat/threads/<leadId>/messages
  // Precheck ObjectId shape — bad id was leaking Mongo CastError as 500
  // (E2E walker §1.4).
  if (!leadId || !/^[a-fA-F0-9]{24}$/.test(leadId)) {
    return { error: "Invalid leadId", status: 400 } as any
  }
  await connectToDatabase()
  const thread = await ChatThread.findOne({ leadId, status: "active" }).lean() as any
  if (!thread) return { error: "No active thread", status: 404 } as any
  const isParty =
    user.role === "admin" ||
    (user.role === "client" && thread.customerUserId?.toString() === user.id) ||
    ((user.role === "rvsf_admin" || user.role === "rvsf_executive") && thread.rvsfId?.toString() === user.linkedRvsfId)
  if (!isParty) return { error: "Forbidden", status: 403 } as any
  return { thread } as any
}

export const GET = withAuth([...PARTY_ROLES], async (req, { user }) => {
  const r = await loadThreadAndAuthorize(req, user)
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status })

  const url = new URL(req.url)
  const beforeCursor = url.searchParams.get("before")  // ISO date string
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100)

  const q: any = { threadId: r.thread._id }
  if (beforeCursor) q.createdAt = { $lt: new Date(beforeCursor) }

  const messages = await ChatMessage.find(q).sort({ createdAt: -1 }).limit(limit).lean()
  // Reverse so client gets chronological order
  return NextResponse.json({ messages: messages.reverse() })
})

export const POST = withAuth([...PARTY_ROLES], async (req, { user }) => {
  const r = await loadThreadAndAuthorize(req, user)
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status })

  const body = await req.json().catch(() => ({}))
  const { type, text, attachment, offerAmountPaise } = body
  if (!["text", "image", "pdf", "offer"].includes(type)) {
    return NextResponse.json({ error: "Invalid message type" }, { status: 400 })
  }

  // Coerce to ChatMessage.senderRole enum ["customer","rvsf_executive","system","admin"].
  // RVSF-side users (rvsf_admin + rvsf_executive) all post AS rvsf_executive in
  // chat — there's no rvsf_admin variant in the chat-message enum (Backend P1).
  const senderRole = user.role === "client" ? "customer" :
                     user.role === "admin"  ? "admin" :
                     "rvsf_executive"  // both rvsf_admin and rvsf_executive land here

  const doc: any = {
    threadId: r.thread._id,
    senderUserId: user.id,
    senderRole,
    type,
  }

  if (type === "text") {
    if (!text || typeof text !== "string" || text.length > 2000) {
      return NextResponse.json({ error: "text required (max 2000 chars)" }, { status: 400 })
    }
    doc.text = text
  } else if (type === "image" || type === "pdf") {
    if (!attachment?.url || !attachment?.mime || !attachment?.sizeBytes) {
      return NextResponse.json({ error: "attachment.url, mime, sizeBytes required" }, { status: 400 })
    }
    doc.attachment = attachment
  } else if (type === "offer") {
    if (!offerAmountPaise || offerAmountPaise < 100) {
      return NextResponse.json({ error: "offerAmountPaise (>= 100) required" }, { status: 400 })
    }
    const expiryHoursSetting = await ConfigSetting.findOne({ key: "offers.expiryHours" }).lean() as any
    const expiryHours = expiryHoursSetting?.value ?? 48
    doc.offer = {
      amountPaise: offerAmountPaise,
      actor: senderRole === "customer" ? "customer" : "rvsf",
      status: "open",
      expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
    }
  }

  const created = await ChatMessage.create(doc)
  await ChatThread.updateOne(
    { _id: r.thread._id },
    {
      $set: { lastMessageAt: created.createdAt },
      $inc: { messageCount: 1, ...(senderRole === "customer" ? { unreadByRvsf: 1 } : { unreadByCustomer: 1 }) },
    }
  )

  return NextResponse.json({ message: created }, { status: 201 })
})
