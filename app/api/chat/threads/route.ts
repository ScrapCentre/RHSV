// engineering-design.md §4.1 / §9 — List chat threads (partner OR client via calcSessionToken)
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import ChatThread from "@/models/ChatThread"

function getCalcSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET not configured")
  return new TextEncoder().encode(secret + ":calc")
}

export async function GET(req: Request) {
  await connectToDatabase()

  const session = await getServerSession(authOptions)
  const authHeader = req.headers.get("authorization")

  if (session) {
    const role   = (session.user as any).role as string
    const userId = (session.user as any).id as string

    if (role === "partner") {
      const threads = await ChatThread.find({ partnerId: userId }).sort({ lastMessageAt: -1 }).lean()
      return NextResponse.json(threads)
    }

    if (role === "admin") {
      const threads = await ChatThread.find({}).sort({ lastMessageAt: -1 }).limit(100).lean()
      return NextResponse.json(threads)
    }

    if (role === "client") {
      // TODO[backend-dev]: refine once customer account model is aligned with LeadState.phone
      // For now clients access threads via calcSessionToken
      return NextResponse.json([])
    }
  }

  // Customer access via calcSessionToken
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    try {
      const { payload } = await jwtVerify(token, getCalcSecret())
      const threads = await ChatThread.find({ leadStateId: payload.leadStateId as string })
        .sort({ lastMessageAt: -1 })
        .lean()
      return NextResponse.json(threads)
    } catch {
      // invalid calcSession token
    }
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
