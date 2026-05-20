// v2 RejectionEvent — one row per RVSF rejection (per L53-L56 + reveal-number rule).
// Drives the admin /refund-review queue and the ping-pong-flag cron.
// Extended per §25.2: chatFlaggedPatterns has structured shape, customerNumberRevealed
// added, refundDecision enum extended with auto_full_but_refund_failed + auto_denied_number_revealed.
import mongoose, { Schema, model, models } from "mongoose"

const FlaggedPatternSchema = new Schema(
  {
    patternName:     { type: String, required: true },  // e.g. "phone_number_e164"
    messageId:       { type: Schema.Types.ObjectId, ref: "ChatMessage", required: true },
    matchedSubstring:{ type: String, required: true },
  },
  { _id: false }
)

const RejectionEventSchema = new Schema(
  {
    leadId:                  { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    unlockId:                { type: Schema.Types.ObjectId, ref: "LeadUnlock", required: true, unique: true },
    rejectedByRvsfId:        { type: Schema.Types.ObjectId, ref: "RVSF", required: true },
    rejectedByUserId:        { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: {
      type: String,
      enum: ["out_of_catchment","vehicle_mismatch","customer_unreachable","pricing_disagreement","other"],
      required: true,
    },
    reasonNote: { type: String, required: true },

    // ── Snapshot at reject time (immutable) ──
    chatMessageCountAtReject:   { type: Number, required: true },
    minutesElapsedSinceUnlock:  { type: Number, required: true },
    gracePhaseEligible:         { type: Boolean, required: true },
    customerNumberRevealed:     { type: Boolean, required: true, default: false },  // §25.1
    rejectionCountAtReject:     { type: Number, required: true },
    archivedThreadId:           { type: Schema.Types.ObjectId, ref: "ChatThread", required: true },
    relistedLeadStateBefore:    { type: String, required: true },
    notifiedRvsfIds:            { type: [Schema.Types.ObjectId], ref: "RVSF", default: [] },

    // Auto-scan results from lib/services/chat/leakage-scanner.ts (computed at reject time)
    chatFlaggedPatterns: { type: [FlaggedPatternSchema], default: [] },

    // ── Refund decision ──
    refundDecision: {
      type: String,
      enum: [
        "auto_full",
        "auto_full_but_refund_failed",     // Razorpay refund API errored
        "auto_denied_engaged_phase",
        "auto_denied_number_revealed",     // §25.1 — three-condition model
        "admin_approved_full",
        "admin_approved_partial",
        "admin_denied",
        "admin_pending",
      ],
      default: "admin_pending",
      required: true,
    },
    refundAmountPaise:        { type: Number },
    refundPaymentId:          { type: Schema.Types.ObjectId, ref: "Payment" },
    razorpayRefundId:         { type: String },
    refundFailureReason:      { type: String },
    adminReviewedByUserId:    { type: Schema.Types.ObjectId, ref: "User" },
    adminReviewedAt:          { type: Date },
    adminReviewNotes:         { type: String },
  },
  { timestamps: true }
)

// Indexes per §25.3
RejectionEventSchema.index({ leadId: 1, createdAt: -1 })
RejectionEventSchema.index({ rejectedByRvsfId: 1, createdAt: -1 })
RejectionEventSchema.index({ rejectedByRvsfId: 1, refundDecision: 1, createdAt: -1 })  // live quota query
RejectionEventSchema.index(
  { refundDecision: 1, adminReviewedAt: 1 },
  { partialFilterExpression: { refundDecision: "admin_pending" } }
)  // drives /admin/refund-review queue
RejectionEventSchema.index(
  { customerNumberRevealed: 1, createdAt: -1 },
  { partialFilterExpression: { customerNumberRevealed: true } }
)  // RVSF-pattern detection (high-risk-partner flag)

const RejectionEvent =
  (models.RejectionEvent as mongoose.Model<any>) || model("RejectionEvent", RejectionEventSchema)
export default RejectionEvent
