// M17 — POST /api/cron/ping-pong-flag (hourly)
// Belt-and-braces: the reject handler flips adminAttentionFlag inline;
// this cron catches edge cases where the inline flip was missed.
import { NextResponse } from "next/server"
import { checkCronSecret } from "@/lib/middleware/cronAuth"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import ConfigSetting from "@/models/ConfigSetting"

export async function POST(req: Request) {
  const auth = checkCronSecret(req); if (!auth.ok) return auth.response!
  await connectToDatabase()
  const setting = await ConfigSetting.findOne({ key: "pingPong.rejectionThreshold" }).lean() as any
  const threshold = setting?.value ?? 3
  const result = await Lead.updateMany(
    { rejectionCount: { $gte: threshold }, adminAttentionFlag: false },
    { $set: { adminAttentionFlag: true } }
  )
  return NextResponse.json({ ok: true, flagged: result.modifiedCount })
}
