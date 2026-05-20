// engineering-design.md §4.1 — Initiates document collection; requires calcSession JWT
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { randomUUID } from "crypto"
import connectToDatabase from "@/lib/db"
import LeadState from "@/models/LeadState"

function getCalcSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET not configured")
  return new TextEncoder().encode(secret + ":calc")
}

async function verifyCalcSession(authHeader: string | null): Promise<{ phone: string; leadStateId: string } | null> {
  if (!authHeader?.startsWith("Bearer ")) return null
  const token = authHeader.slice(7)
  try {
    const { payload } = await jwtVerify(token, getCalcSecret())
    return { phone: payload.phone as string, leadStateId: payload.leadStateId as string }
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const payload = await verifyCalcSession(req.headers.get("authorization"))
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized — valid calcSession required" }, { status: 401 })
  }

  try {
    const { leadStateId } = await req.json()

    if (!leadStateId || leadStateId !== payload.leadStateId) {
      return NextResponse.json({ error: "leadStateId required and must match session" }, { status: 400 })
    }

    await connectToDatabase()
    const leadState = await LeadState.findById(leadStateId)
    if (!leadState) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    if (leadState.tier !== "tier2") {
      return NextResponse.json({ error: "Lead must be at tier2 to start verification" }, { status: 400 })
    }

    const uploadToken = randomUUID()
    return NextResponse.json({ uploadToken, leadStateId })
  } catch (err: any) {
    console.error("[verify/start] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
