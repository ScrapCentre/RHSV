// v2 ChatThread — one per unlocked-lead pairing.
// status: "active" | "archived" (archived on RVSF reject per L55).
// Partial-unique index allows multiple archived threads + one active per lead.
import mongoose, { Schema, model, models } from "mongoose"

const ChatThreadSchema = new Schema(
  {
    leadId:               { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    customerUserId:       { type: Schema.Types.ObjectId, ref: "User", required: true },
    rvsfId:               { type: Schema.Types.ObjectId, ref: "RVSF", required: true },
    assignedCcId:         { type: Schema.Types.ObjectId, ref: "CollectionCenter" },
    participantUserIds:   { type: [Schema.Types.ObjectId], ref: "User", required: true },
    pinnedOfferMessageId: { type: Schema.Types.ObjectId, ref: "ChatMessage" },
    pinnedOfferAmountPaise: { type: Number },
    lastMessageAt:        { type: Date, required: true, default: Date.now },
    messageCount:         { type: Number, default: 0 },
    unreadByCustomer:     { type: Number, default: 0 },
    unreadByRvsf:         { type: Number, default: 0 },
    status:               { type: String, enum: ["active","archived"], default: "active", required: true },
    closedAt:             { type: Date },
    closedReason: {
      type: String,
      enum: ["rvsf_rejected","cvs_uploaded","cancelled","customer_unreachable","admin_archived"],
    },
  },
  { timestamps: true }
)

// Per §25.3 — one ACTIVE thread per lead (partial unique where status="active").
// Multiple archived threads OK (one per RVSF that rejected).
ChatThreadSchema.index(
  { leadId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
)
ChatThreadSchema.index({ participantUserIds: 1, lastMessageAt: -1 })
ChatThreadSchema.index({ rvsfId: 1, lastMessageAt: -1 })

const ChatThread =
  (models.ChatThread as mongoose.Model<any>) || model("ChatThread", ChatThreadSchema)
export default ChatThread
