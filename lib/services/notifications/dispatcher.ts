/**
 * Notification dispatcher.
 *
 * Locked 2026-05-20 (L27, Option D): every notification trigger fans out
 * to EMAIL + IN-APP + WHATSAPP channels per the matrix in
 * v2-build-plan.md §16.1 + §25.20.
 *
 * 2026-05-22 — M15 wiring (founder demo): after persisting the Notification
 *   row, we synchronously invoke the matching channel adapter for each entry
 *   in `notification.channels`, updating `channelStatus[channel]` to "sent"
 *   on success / "failed" on throw and appending an evidence entry to
 *   `channelDeliveryLog[]`. Today every adapter is a mock that logs +
 *   returns a synthetic providerMessageId. The cron `notification-flush`
 *   route still exists as a retry loop for rows that ended in "failed".
 *
 * Why synchronous (not queued):
 *   - At v2 staging volume (<50 notifications/day) the overhead is
 *     negligible — the dispatcher is already called inside the request
 *     handler, and the mock adapters return in ~0ms.
 *   - It gives the founder demo immediate confirmation: the same request
 *     that triggers the action also records the delivery. No "wait for
 *     cron to run".
 *   - Each adapter call is wrapped in try/catch so a single channel
 *     failure doesn't cascade.
 */
import connectToDatabase from "@/lib/db"
import Notification, { type ChannelDeliveryLogEntry, type NotificationChannelName } from "@/models/Notification"
import User from "@/models/User"
import RVSF from "@/models/RVSF"
import CollectionCenter from "@/models/CollectionCenter"
import { sendWhatsapp, sendEmail } from "./channels"

export type NotificationChannel = "email" | "inapp" | "whatsapp"

export type NotificationKind =
  | "lead_unlocked_customer"
  | "lead_unlocked_rvsf"
  | "lead_in_catchment"
  | "stale_lead_alert"
  | "lead_returned_to_marketplace_customer"
  | "lead_relisted_to_in_catchment_rvsfs"
  | "offer_accepted"
  | "offer_expired"
  | "cod_uploaded"
  | "cvs_uploaded"
  | "dsc_pending_nudge"
  | "weight_trueup_debit"
  | "weight_trueup_credit"
  | "rvsf_kyc_approved"
  | "cc_credentials_created"
  | "refund_auto_approved"
  | "refund_admin_decision_approved"
  | "refund_admin_decision_denied"
  | "auto_refund_failed_admin_alert"
  | "engaged_phase_refund_review_admin_alert"  // 2026-05-22 P0-2: engaged-window reject → admin queue
  | "ping_pong_flag_admin"
  | "customer_number_revealed_to_customer"

export type EnqueueArgs = {
  kind: NotificationKind
  recipientUserId?: string
  recipientRvsfId?: string
  recipientCcId?: string
  subject: string
  bodyMarkdown: string
  whatsappTemplateName?: string
  whatsappTemplateVars?: string[]
  channels?: NotificationChannel[]
  deeplinkUrl?: string
  leadId?: string
  correlationId?: string
}

const DEFAULT_CHANNELS: NotificationChannel[] = ["email", "inapp", "whatsapp"]

/**
 * Resolves the recipient's contact details (email + phone) by looking up
 * whichever recipient ref was provided. Returns nulls if the lookup fails
 * — adapters tolerate "—" as a recipient string and the founder demo will
 * still see a row in /admin/notifications with `to: "—"`.
 */
async function resolveRecipient(args: Pick<EnqueueArgs, "recipientUserId" | "recipientRvsfId" | "recipientCcId">): Promise<{
  email: string | null
  phone: string | null
  label: string
}> {
  try {
    if (args.recipientUserId) {
      const u = await User.findById(args.recipientUserId, { email: 1, phone: 1, name: 1 }).lean() as any
      return { email: u?.email ?? null, phone: u?.phone ?? null, label: u?.email ?? u?.phone ?? args.recipientUserId }
    }
    if (args.recipientRvsfId) {
      // RVSF doesn't have a direct email/phone — look up its admin user.
      // Fall back to nulls (the admin viewer will show "—") rather than block dispatch.
      const r = await RVSF.findById(args.recipientRvsfId, { displayName: 1, contactEmail: 1, contactPhone: 1 }).lean() as any
      const adminUser = await User.findOne({ linkedRvsfId: args.recipientRvsfId, role: { $in: ["rvsf_admin", "rvsf"] } }, { email: 1, phone: 1 }).lean() as any
      return {
        email: adminUser?.email ?? r?.contactEmail ?? null,
        phone: adminUser?.phone ?? r?.contactPhone ?? null,
        label: r?.displayName ?? args.recipientRvsfId,
      }
    }
    if (args.recipientCcId) {
      const c = await CollectionCenter.findById(args.recipientCcId, { displayName: 1, "contact.email": 1, "contact.phone": 1 }).lean() as any
      return {
        email: c?.contact?.email ?? null,
        phone: c?.contact?.phone ?? null,
        label: c?.displayName ?? args.recipientCcId,
      }
    }
  } catch (err: any) {
    console.error(`[notify] resolveRecipient failed: ${err?.message}`)
  }
  return { email: null, phone: null, label: "—" }
}

/**
 * Fires the appropriate adapter for one channel. The `inapp` channel is a
 * no-op at the adapter layer (the row in Mongo IS the in-app surface — the
 * /api/notifications endpoint that powers the bell icon reads from it).
 */
async function dispatchOne(
  channel: NotificationChannel,
  args: EnqueueArgs,
  recipient: { email: string | null; phone: string | null }
): Promise<{ status: "sent" | "failed"; logEntry: ChannelDeliveryLogEntry }> {
  try {
    if (channel === "inapp") {
      // The Notification row itself IS the in-app delivery; just log evidence.
      return {
        status: "sent",
        logEntry: {
          channel: "inapp",
          at: new Date(),
          to: args.recipientUserId ?? args.recipientRvsfId ?? args.recipientCcId ?? "—",
          adapter: "mock",
          preview: args.subject,
        },
      }
    }
    if (channel === "whatsapp") {
      const entry = await sendWhatsapp({
        to: recipient.phone ?? "—",
        template: args.whatsappTemplateName,
        params: args.whatsappTemplateVars,
        bodyPreview: args.subject,
      })
      return { status: "sent", logEntry: entry }
    }
    if (channel === "email") {
      const entry = await sendEmail({
        to: recipient.email ?? "—",
        subject: args.subject,
        body: args.bodyMarkdown,
      })
      return { status: "sent", logEntry: entry }
    }
    // Unknown channel — record as failed so it shows up in the viewer.
    return {
      status: "failed",
      logEntry: {
        channel: channel as NotificationChannelName,
        at: new Date(),
        adapter: "mock",
        error: `unknown channel "${channel}"`,
      },
    }
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(`[notify] channel=${channel} adapter throw: ${err?.message}`)
    return {
      status: "failed",
      logEntry: {
        channel: channel as NotificationChannelName,
        at: new Date(),
        adapter: process.env.AISENSY_API_KEY || process.env.POSTMARK_API_TOKEN ? "real" : "mock",
        error: err?.message ?? "Unknown adapter error",
      },
    }
  }
}

export async function enqueueNotification(args: EnqueueArgs): Promise<void> {
  await connectToDatabase()

  const channels = args.channels ?? DEFAULT_CHANNELS
  const initialStatus: Record<string, "pending" | "skipped"> = {
    email:    channels.includes("email")    ? "pending" : "skipped",
    inapp:    channels.includes("inapp")    ? "pending" : "skipped",
    whatsapp: channels.includes("whatsapp") ? "pending" : "skipped",
  }

  let notificationId: string | null = null
  try {
    const doc = await Notification.create({
      kind: args.kind,
      recipientUserId: args.recipientUserId,
      recipientRvsfId: args.recipientRvsfId,
      recipientCcId:   args.recipientCcId,
      subject:         args.subject,
      bodyMarkdown:    args.bodyMarkdown,
      deeplinkUrl:     args.deeplinkUrl,
      channels,
      channelStatus:   initialStatus,
      channelDeliveryLog: [],
      whatsappTemplateName: args.whatsappTemplateName,
      whatsappTemplateVars: args.whatsappTemplateVars,
      leadId:          args.leadId,
      correlationId:   args.correlationId,
    })
    notificationId = doc._id.toString()
  } catch (err: any) {
    // Don't crash the caller if the row write fails — log + bail (no point
    // dispatching if we can't record the result).
    console.error(`[notify] Notification.create failed for kind=${args.kind}: ${err?.message}`)
    return
  }

  // eslint-disable-next-line no-console
  console.log(`[notify] kind=${args.kind} recipient=${args.recipientUserId ?? args.recipientRvsfId ?? args.recipientCcId ?? "—"} subject="${args.subject}" channels=${channels.join(",")}`)

  // Fan out. Resolve recipient contact details once, then iterate.
  const recipient = await resolveRecipient(args)
  const finalStatus: Record<string, string> = { ...initialStatus }
  const deliveryLog: ChannelDeliveryLogEntry[] = []

  for (const ch of channels) {
    const result = await dispatchOne(ch, args, recipient)
    finalStatus[ch] = result.status
    deliveryLog.push(result.logEntry)
  }

  try {
    await Notification.updateOne(
      { _id: notificationId },
      {
        $set: {
          channelStatus: finalStatus,
          dispatchedAt: new Date(),
        },
        $push: { channelDeliveryLog: { $each: deliveryLog } },
      }
    )
  } catch (err: any) {
    console.error(`[notify] Notification.update (post-dispatch) failed for id=${notificationId}: ${err?.message}`)
  }
}
