/**
 * Notification dispatcher — stub. Full implementation lands in M15.
 *
 * Locked 2026-05-20 (L27, Option D): every notification trigger fans out
 * to EMAIL + IN-APP + WHATSAPP channels (recipient-dependent matrix in
 * v2-build-plan.md §16.1 + §25.20).
 *
 * This stub just persists a Notification row and logs intent. The cron
 * job /api/cron/notification-flush will actually dispatch in M15.
 */
import connectToDatabase from "@/lib/db"

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
  channels?: ("email" | "inapp" | "whatsapp")[]
  leadId?: string
  correlationId?: string
}

export async function enqueueNotification(args: EnqueueArgs): Promise<void> {
  await connectToDatabase()
  // TODO M15: persist into Notification collection + dispatch via channel adapters.
  // For staging until M15, we just log.
  // eslint-disable-next-line no-console
  console.log(`[notify] kind=${args.kind} recipient=${args.recipientUserId ?? args.recipientRvsfId ?? args.recipientCcId} subject="${args.subject}"`)
}
