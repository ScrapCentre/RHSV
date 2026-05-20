// M17 — POST /api/cron/refresh-urls (daily)
// Re-signs Cloudinary URLs for chat-attachment DocumentRecord rows whose
// signedUrlExpiresAt is approaching. Placeholder until M19 polish wires
// the real signed-URL helper.
import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import DocumentRecord from "@/models/DocumentRecord"

function cronAuth(req: Request): boolean {
  const e = process.env.CRON_SECRET
  if (!e) return true
  return req.headers.get("x-cron-secret") === e
}

export async function POST(req: Request) {
  if (!cronAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  await connectToDatabase()
  const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const stale = await DocumentRecord.countDocuments({
    signedUrlExpiresAt: { $lt: cutoff },
  })
  // TODO M19: re-sign URLs in bulk
  return NextResponse.json({ ok: true, stale })
}
