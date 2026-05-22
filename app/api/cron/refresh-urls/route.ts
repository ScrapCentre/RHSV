// M17 — POST /api/cron/refresh-urls (daily)
// Re-signs Cloudinary URLs for chat-attachment DocumentRecord rows whose
// signedUrlExpiresAt is approaching. Placeholder until M19 polish wires
// the real signed-URL helper.
import { NextResponse } from "next/server"
import { checkCronSecret } from "@/lib/middleware/cronAuth"
import connectToDatabase from "@/lib/db"
import DocumentRecord from "@/models/DocumentRecord"

export async function POST(req: Request) {
  const auth = checkCronSecret(req); if (!auth.ok) return auth.response!
  await connectToDatabase()
  const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const stale = await DocumentRecord.countDocuments({
    signedUrlExpiresAt: { $lt: cutoff },
  })
  // TODO M19: re-sign URLs in bulk
  return NextResponse.json({ ok: true, stale })
}
