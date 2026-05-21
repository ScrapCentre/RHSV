// GET /api/chat/my-threads — list active + archived chat threads for the caller.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import ChatThread from "@/models/ChatThread"

export const GET = withAuth(["client", "rvsf_admin", "rvsf_executive", "admin", "cc_operator"], async (_req, { user }) => {
  await connectToDatabase()
  let filter: any = {}
  if (user.role === "admin") {
    // Admin sees all threads
  } else if (user.role === "client") {
    filter.customerUserId = user.id
  } else if (user.role === "rvsf_admin" || user.role === "rvsf_executive") {
    filter.rvsfId = user.linkedRvsfId
  } else if (user.role === "cc_operator") {
    filter.assignedCcId = user.linkedCcId
  }
  const threads = await ChatThread.find(filter).sort({ lastMessageAt: -1 }).limit(50).lean() as any[]
  return NextResponse.json({
    threads: threads.map((t) => ({
      _id: t._id.toString(),
      leadId: t.leadId.toString(),
      status: t.status,
      lastMessageAt: t.lastMessageAt,
      pinnedOfferAmountPaise: t.pinnedOfferAmountPaise,
      messageCount: t.messageCount,
    })),
  })
})
