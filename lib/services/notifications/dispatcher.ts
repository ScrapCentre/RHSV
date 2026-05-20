/**
 * Notification dispatcher.
 *
 * Locked 2026-05-20 (L27, Option D): every notification trigger fans out
 * to EMAIL + IN-APP + WHATSAPP channels per the matrix in
 * v2-build-plan.md §16.1 + §25.20.
 *
 * v2 staging behavior (M15 + Architect-review hotfix):
 *   - PERSISTS a Notification row to Mongo immediately (so the queue
 *     exists when M18 adapters come online to drain it)
 *   - Also logs to console for staging visibility
 *
 * Actual per-channel send happens in cron `notification-flush` once
 * the real AiSensy + Postmark adapters land in M18.
 */
import connectToDatabase from "@/lib/db"
import Notification from "@/models/Notification"

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

export async function enqueueNotification(args: EnqueueArgs): Promise<void> {
  await connectToDatabase()

  const channels = args.channels ?? DEFAULT_CHANNELS
  const channelStatus: Record<string, "pending" | "skipped"> = {
    email:    channels.includes("email")    ? "pending" : "skipped",
    inapp:    channels.includes("inapp")    ? "pending" : "skipped",
    whatsapp: channels.includes("whatsapp") ? "pending" : "skipped",
  }

  try {
    await Notification.create({
      kind: args.kind,
      recipientUserId: args.recipientUserId,
      recipientRvsfId: args.recipientRvsfId,
      recipientCcId:   args.recipientCcId,
      subject:         args.subject,
      bodyMarkdown:    args.bodyMarkdown,
      deeplinkUrl:     args.deeplinkUrl,
      channels,
      channelStatus,
      whatsappTemplateName: args.whatsappTemplateName,
      whatsappTemplateVars: args.whatsappTemplateVars,
      leadId:          args.leadId,
      correlationId:   args.correlationId,
    })
  } catch (err: any) {
    // Don't crash the caller if the row write fails — log + continue.
    // The notification is lost in this case but the underlying flow
    // (e.g. lead reject) still completes.
    console.error(`[notify] Notification.create failed for kind=${args.kind}: ${err?.message}`)
  }

  // eslint-disable-next-line no-console
  console.log(`[notify] kind=${args.kind} recipient=${args.recipientUserId ?? args.recipientRvsfId ?? args.recipientCcId ?? "—"} subject="${args.subject}"`)
}
