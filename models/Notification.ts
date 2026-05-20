// v2 Notification — multi-channel queue + audit (per L27 Option D).
// Channels: email + in-app + WhatsApp. Each fires independently;
// channelStatus tracks per-channel success/failure for retry.
import mongoose, { Schema, model, models } from "mongoose"

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
