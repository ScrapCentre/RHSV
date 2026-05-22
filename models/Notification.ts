// v2 Notification — multi-channel queue + audit (per L27 Option D).
// Channels: email + in-app + WhatsApp. Each fires independently;
// channelStatus tracks per-channel success/failure for retry.
import mongoose, { Schema, model, models } from "mongoose"

// Per-channel send evidence appended by the dispatcher after invoking the
// matching channel adapter. The admin /admin/notifications viewer reads this
// to demonstrate "the mock WhatsApp landed at 14:32, here's the body". When
// the real adapters land in M18 the same field carries the provider
// messageId so we have an audit trail for delivery disputes.
export type NotificationChannelName = "email" | "inapp" | "whatsapp" | "sms"

export interface ChannelDeliveryLogEntry {
  channel: NotificationChannelName
  at: Date
  to?: string                   // resolved recipient (phone / email / userId)
  adapter: "mock" | "real"
  preview?: string              // short body excerpt for the admin viewer
  providerMessageId?: string    // AiSensy / Postmark / Firebase id when known
  error?: string                // only set when the adapter throws
}

const ChannelDeliveryLogSchema = new Schema<ChannelDeliveryLogEntry>(
  {
    channel:           { type: String, enum: ["email","inapp","whatsapp","sms"], required: true },
    at:                { type: Date, required: true },
    to:                { type: String },
    adapter:           { type: String, enum: ["mock","real"], required: true },
    preview:           { type: String },
    providerMessageId: { type: String },
    error:             { type: String },
  },
  { _id: false }
)

const NotificationSchema = new Schema(
  {
    recipientUserId: { type: Schema.Types.ObjectId, ref: "User" },
    recipientRvsfId: { type: Schema.Types.ObjectId, ref: "RVSF" },
    recipientCcId:   { type: Schema.Types.ObjectId, ref: "CollectionCenter" },
    kind:            { type: String, required: true },
    subject:         { type: String, required: true },
    bodyMarkdown:    { type: String, required: true },
    deeplinkUrl:     { type: String },
    channels:        { type: [String], enum: ["email","inapp","whatsapp"], required: true },
    channelStatus: {
      email:    { type: String, enum: ["pending","sent","failed","skipped"], default: "pending" },
      inapp:    { type: String, enum: ["pending","sent","failed","skipped"], default: "pending" },
      whatsapp: { type: String, enum: ["pending","sent","failed","skipped"], default: "pending" },
    },
    whatsappTemplateName: { type: String },
    whatsappTemplateVars: { type: [String] },
    // Append-only evidence trail; one entry per adapter invocation
    // (success OR failure). Read by /admin/notifications.
    channelDeliveryLog: { type: [ChannelDeliveryLogSchema], default: [] },
    dispatchedAt:    { type: Date },
    lastError:       { type: String },
    readByUserAt:    { type: Date },
    leadId:          { type: Schema.Types.ObjectId, ref: "Lead" },
    correlationId:   { type: String },
  },
  { timestamps: true }
)

NotificationSchema.index({ recipientUserId: 1, readByUserAt: 1, createdAt: -1 })  // in-app badge
NotificationSchema.index({ channels: 1, dispatchedAt: 1 })

const Notification =
  (models.Notification as mongoose.Model<any>) || model("Notification", NotificationSchema)
export default Notification
