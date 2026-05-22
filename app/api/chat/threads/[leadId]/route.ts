// M12 — GET /api/chat/threads/[leadId]
// Returns the chat thread for this lead, with party membership check.
//
// HOTFIX 2026-05-22 (Codex P2 — chat archived-thread access):
// Previously this route hard-filtered on `status: "active"`, so clicking an
// archived thread in the inbox 404'd. The inbox lists archived threads (a
// customer or RVSF can see "Closed" rows), so the 404 was a UX deadend.
// We now load the most recent thread regardless of status and surface
// `isReadOnly = thread.status !== "active"`. The detail page renders
// read-only when true (composer hidden, banner shown). Write endpoints
// (POST messages, offer accept/counter/reject) continue to enforce
// `status === "active"` so no new traffic can land on a closed thread.
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

  // Prefer the active thread if one exists; otherwise fall back to the most
  // recently-archived thread on this lead so users can read history.
  // (Schema invariant: at most one active thread per leadId; multiple archived
  // are possible — one per RVSF that rejected, per ChatThread.ts §25.3.)
  let thread = await ChatThread.findOne({ leadId, status: "active" }).lean() as any
  let archived: any[] = []
  if (thread) {
    archived = await ChatThread.find({ leadId, status: "archived" }).sort({ createdAt: -1 }).lean()
  } else {
    // No active thread → fall back to archived history. The page is still
    // useful as a read-only audit trail.
    archived = await ChatThread.find({ leadId, status: "archived" }).sort({ createdAt: -1 }).lean()
    if (archived.length > 0) thread = archived[0]
  }
  if (!thread) return NextResponse.json({ error: "No thread for this lead" }, { status: 404 })

  // Party check: customer ↔ thread.customerUserId, rvsf user ↔ thread.rvsfId, admin ↔ all
  const isParty =
    user.role === "admin" ||
    (user.role === "client" && thread.customerUserId?.toString() === user.id) ||
    ((user.role === "rvsf_admin" || user.role === "rvsf_executive") && thread.rvsfId?.toString() === user.linkedRvsfId) ||
    (user.role === "cc_operator" && thread.assignedCcId?.toString() === user.linkedCcId)
  if (!isParty) return NextResponse.json({ error: "Not a party to this thread" }, { status: 403 })

  // Sanitise outbound
  const out = (t: any) => ({
    _id: t._id.toString(),
    leadId: t.leadId.toString(),
    rvsfId: t.rvsfId.toString(),
    status: t.status,
    isReadOnly: t.status !== "active",
    pinnedOfferMessageId: t.pinnedOfferMessageId?.toString(),
    pinnedOfferAmountPaise: t.pinnedOfferAmountPaise,
    lastMessageAt: t.lastMessageAt,
    closedAt: t.closedAt,
    closedReason: t.closedReason,
  })

  return NextResponse.json({
    active: out(thread),  // the focused thread (active if any, else the latest archived)
    archived: archived.map((t: any) => out(t)),
    isReadOnly: thread.status !== "active",  // convenience top-level flag for clients
  })
})
