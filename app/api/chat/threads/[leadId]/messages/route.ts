// M12 — chat messages (GET paginated; POST new text/image/document/offer).
//
// ROLE ASYMMETRY (hotfix 2026-05-22, P1 v2-codereview §P1-2 + §P2-5):
//   - GET allows: client, rvsf_admin, rvsf_executive, admin, cc_operator
//     The cc_operator gets READ-ONLY visibility on the chat for their
//     assigned lead — they need to see pickup-logistics negotiated between
//     customer ↔ RVSF (VISION.md §3 line 80 "pickup logistics negotiated
//     in chat … vehicle arrives at the CC"). Previously, /api/chat/my-threads
//     listed the threads for cc_operator but this route's PARTY_ROLES did NOT
//     include cc_operator — so the operator clicked a thread and got 403.
//   - POST allows ONLY: client, rvsf_admin, rvsf_executive, admin
//     CC operator is deliberately excluded from posting. VISION.md §7 + L19
//     scope the CC operator to "manage the physical scrap workflow at their
//     yard" — they are not a negotiation party. The negotiation (offers,
//     pricing) is strictly customer ↔ rvsf_executive (per L37, L53).
//   - ChatMessage.senderRole enum has no `cc_operator` value either; allowing
//     POST would force us to either coerce them to rvsf_executive (misleading
//     audit trail) or extend the enum (out of scope for a hotfix).
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import { validateObjectId } from "@/lib/middleware/objectId"
import connectToDatabase from "@/lib/db"
import ChatThread from "@/models/ChatThread"
import ChatMessage from "@/models/ChatMessage"
import Lead from "@/models/Lead"
import ConfigSetting from "@/models/ConfigSetting"

// Posting (write) roles — CC operator deliberately excluded; see header comment.
const PARTY_ROLES = ["client", "rvsf_admin", "rvsf_executive", "admin"] as const
// Reading roles — same as PARTY_ROLES + cc_operator (read-only visibility on
// the thread for the lead assigned to their CC). See header comment + the
// `isParty` branch in `loadThreadAndAuthorize`.
const READ_ROLES = ["client", "rvsf_admin", "rvsf_executive", "admin", "cc_operator"] as const

// HOTFIX 2026-05-22 (Codex P2 — chat archived-thread access):
// `mode: "read"` loads any-status thread (read-only history access);
// `mode: "write"` retains the strict active-only filter so the POST handler
// can never accept new messages on a closed thread.
async function loadThreadAndAuthorize(req: Request, user: any, mode: "read" | "write" = "read") {
  const url = new URL(req.url)
  const segments = url.pathname.split("/")
  const leadId = segments[segments.length - 2]  // /api/chat/threads/<leadId>/messages
  // Precheck ObjectId shape — bad id was leaking Mongo CastError as 500
  // (E2E walker §1.4).
  if (!leadId || !/^[a-fA-F0-9]{24}$/.test(leadId)) {
    return { error: "Invalid leadId", status: 400 } as any
  }
  await connectToDatabase()
  let thread: any = null
  if (mode === "write") {
    // Writes require an active thread — never post into an archived one.
    thread = await ChatThread.findOne({ leadId, status: "active" }).lean()
    if (!thread) return { error: "No active thread", status: 404 } as any
  } else {
    // Read path: prefer active, else most recent archived (history view).
    thread = await ChatThread.findOne({ leadId, status: "active" }).lean()
    if (!thread) {
      thread = await ChatThread.findOne({ leadId, status: "archived" }).sort({ createdAt: -1 }).lean()
    }
    if (!thread) return { error: "No thread", status: 404 } as any
  }
  const isParty =
    user.role === "admin" ||
    (user.role === "client" && thread.customerUserId?.toString() === user.id) ||
    ((user.role === "rvsf_admin" || user.role === "rvsf_executive") && thread.rvsfId?.toString() === user.linkedRvsfId) ||
    // cc_operator: only the operator whose CC the thread is assigned to can read.
    // Mirror of the `assignedCcId === user.linkedCcId` check in
    // app/api/chat/threads/[leadId]/route.ts so the two endpoints stay in lockstep.
    (user.role === "cc_operator" && thread.assignedCcId?.toString() === user.linkedCcId)
  if (!isParty) return { error: "Forbidden", status: 403 } as any
  return { thread } as any
}

export const GET = withAuth([...READ_ROLES], async (req, { user }) => {
  // Read mode → allows archived-thread history view (Codex P2 hotfix).
  const r = await loadThreadAndAuthorize(req, user, "read")
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status })

  const url = new URL(req.url)
  const beforeCursor = url.searchParams.get("before")  // ISO date string
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100)

  const q: any = { threadId: r.thread._id }
  if (beforeCursor) q.createdAt = { $lt: new Date(beforeCursor) }

  const messages = await ChatMessage.find(q).sort({ createdAt: -1 }).limit(limit).lean()
  // Reverse so client gets chronological order
  return NextResponse.json({
    messages: messages.reverse(),
    isReadOnly: r.thread.status !== "active",
  })
})

// POST intentionally uses PARTY_ROLES (cc_operator excluded — see header).
// Write mode → strict `status === "active"` filter (no posting on closed threads).
export const POST = withAuth([...PARTY_ROLES], async (req, { user }) => {
  const r = await loadThreadAndAuthorize(req, user, "write")
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
