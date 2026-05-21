// GET /api/leads/mine — the customer's own leads
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"

export const GET = withAuth(["client", "admin"], async (_req, { user }) => {
  await connectToDatabase()
  const filter = user.role === "admin" ? {} : { customerUserId: user.id }
  const leads = await Lead.find(filter).sort({ createdAt: -1 }).limit(50).lean()
  return NextResponse.json({ leads })
})
