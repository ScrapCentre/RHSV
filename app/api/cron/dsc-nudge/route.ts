// M17 — POST /api/cron/dsc-nudge (every 4h)
// Finds DocumentRecord{kind:cod, dscSigned:false, dscPendingSince<now-24h};
// enqueues a dsc_pending_nudge notification per record. Idempotent via
// a nudge counter (rough — improves in M19).
import { NextResponse } from "next/server"
import { checkCronSecret } from "@/lib/middleware/cronAuth"
import connectToDatabase from "@/lib/db"
import DocumentRecord from "@/models/DocumentRecord"
import Lead from "@/models/Lead"
import ConfigSetting from "@/models/ConfigSetting"
import { enqueueNotification } from "@/lib/services/notifications/dispatcher"

export async function POST(req: Request) {
  const auth = checkCronSecret(req); if (!auth.ok) return auth.response!
  await connectToDatabase()
  const setting = await ConfigSetting.findOne({ key: "dsc.nudgeAfterHours" }).lean() as any
  const nudgeAfterHours = setting?.value ?? 24
  const cutoff = new Date(Date.now() - nudgeAfterHours * 60 * 60 * 1000)

  const pending = await DocumentRecord.find({
    kind: "cod",
    dscSigned: false,
    dscPendingSince: { $lt: cutoff },
  }).limit(100).lean()

  let nudged = 0
  for (const doc of pending as any[]) {
    const lead = await Lead.findById(doc.leadId).lean() as any
    if (!lead?.unlock?.unlockedByRvsfId) continue
    await enqueueNotification({
      kind: "dsc_pending_nudge",
      recipientRvsfId: lead.unlock.unlockedByRvsfId.toString(),
      subject: `COD pending DSC signature — ${lead.vehicle?.registrationNumber}`,
      bodyMarkdown: `Your COD for **${lead.vehicle?.registrationNumber}** has been pending DSC signature for over ${nudgeAfterHours} hours. Sign it via your DSC USB and upload to the chat.`,
      channels: ["email", "inapp", "whatsapp"],
      whatsappTemplateName: "dsc_nudge",
      leadId: lead._id.toString(),
    })
    nudged++
  }
  return NextResponse.json({ ok: true, nudged })
}
