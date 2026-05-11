// engineering-design.md §4.1 / §9 — Poll + post messages (polled every 5s by client)
// Both partner (NextAuth session) and customer (calcSessionToken) can access
import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import ChatThread from "@/models/ChatThread"
import ChatMessage from "@/models/ChatMessage"

function getCalcSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET not configured")
  return new TextEncoder().encode(secret + ":calc")
}

type CallerIdentity =
  | { role: "partner"; id: string }
  | { role: "admin";   id: string }
  | { role: "customer"; phone: string; leadStateId: string }
  | null

async function resolveCaller(req: NextRequest): Promise<CallerIdentity> {
  const session = await getServerSession(authOptions)
  if (session) {
    const role   = (session.user as any).role as string
    const id     = (session.user as any).id as string
    if (role === "partner") return { role: "partner", id }
    if (role === "admin")   return { role: "admin", id }
  }

  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    try {
      const { payload } = await jwtVerify(token, getCalcSecret())
      return { role: "customer", phone: payload.phone as string, leadStateId: payload.leadStateId as string }
    } catch { /* fall through */ }
  }
  return null
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const caller = await resolveCaller(req)
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { threadId } = await params
    await connectToDatabase()

    const thread = await ChatThread.findById(threadId)
    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 })

    // Access control
    if (caller.role === "partner" && thread.partnerId !== caller.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (caller.role === "customer" && thread.leadStateId !== caller.leadStateId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    // admin can read all

    const { searchParams } = new URL(req.url)
    const since = searchParams.get("since")

    const query: Record<string, any> = { threadId }
    if (since) {
      query.createdAt = { $gt: new Date(since) }
    }

    const messages = await ChatMessage.find(query).sort({ createdAt: 1 }).lean()
    return NextResponse.json(messages)
  } catch (err: any) {
    console.error("[chat/messages GET] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const caller = await resolveCaller(req)
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { threadId } = await params
    await connectToDatabase()

    const thread = await ChatThread.findById(threadId)
    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 })

    if (caller.role === "partner" && thread.partnerId !== caller.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (caller.role === "customer" && thread.leadStateId !== caller.leadStateId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { type, textContent, photoUrl } = body

    if (!type || !["text","photo"].includes(type)) {
      return NextResponse.json({ error: "type must be 'text' or 'photo'" }, { status: 400 })
    }
    if (type === "text" && !textContent?.trim()) {
      return NextResponse.json({ error: "textContent required for text messages" }, { status: 400 })
    }

    const senderId   = caller.role === "customer" ? caller.phone : caller.id
    const senderRole = caller.role === "customer" ? "customer" : "partner"

    const message = await ChatMessage.create({
      threadId,
      senderRole,
      senderId,
      messageType: type,
      textContent:  type === "text" ? textContent : null,
      photoUrl:     type === "photo" ? photoUrl : null,
    })

    await ChatThread.findByIdAndUpdate(threadId, { lastMessageAt: new Date() })

    return NextResponse.json({ message })
  } catch (err: any) {
    console.error("[chat/messages POST] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
