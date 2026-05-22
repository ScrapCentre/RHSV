// M12 — GET /api/chat/threads/[leadId]
// Returns the ACTIVE thread for this lead, with party membership check.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import { validateObjectId } from "@/lib/middleware/objectId"
import connectToDatabase from "@/lib/db"
import ChatThread from "@/models/ChatThread"
import Lead from "@/models/Lead"

const PARTY_ROLES = ["client", "rvsf_admin", "rvsf_executive", "admin", "cc_operator"] as const

export const GET = withAuth([...PARTY_ROLES], async (req, { user }) => {
  await connectToDatabase()
  const url = new URL(req.url)
  const segments = url.pathname.split("/")
  const leadId = segments[segments.length - 1]
  // Precheck ObjectId shape — bad id was leaking Mongo CastError as 500
  // (E2E walker §1.4).
  const badId = validateObjectId(leadId, "leadId")
  if (badId) return badId

  const thread = await ChatThread.findOne({ leadId, status: "active" }).lean() as any
  if (!thread) return NextResponse.json({ error: "No active thread for this lead" }, { status: 404 })

  // Party check: customer ↔ thread.customerUserId, rvsf user ↔ thread.rvsfId, admin ↔ all
  const isParty =
    user.role === "admin" ||
    (user.role === "client" && thread.customerUserId?.toString() === user.id) ||
    ((user.role === "rvsf_admin" || user.role === "rvsf_executive") && thread.rvsfId?.toString() === user.linkedRvsfId) ||
    (user.role === "cc_operator" && thread.assignedCcId?.toString() === user.linkedCcId)
  if (!isParty) return NextResponse.json({ error: "Not a party to this thread" }, { status: 403 })

  // Also check for archived threads on the same lead (history view)
  const archived = await ChatThread.find({ leadId, status: "archived" }).sort({ createdAt: -1 }).lean()

  // Sanitise outbound
  const out = (t: any) => ({
    _id: t._id.toString(),
    leadId: t.leadId.toString(),
    rvsfId: t.rvsfId.toString(),
    status: t.status,
    pinnedOfferMessageId: t.pinnedOfferMessageId?.toString(),
    pinnedOfferAmountPaise: t.pinnedOfferAmountPaise,
    lastMessageAt: t.lastMessageAt,
    closedAt: t.closedAt,
    closedReason: t.closedReason,
  })

  return NextResponse.json({
    active: out(thread),
    archived: archived.map((t: any) => out(t)),
  })
})
