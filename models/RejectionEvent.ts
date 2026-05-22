// v2 RejectionEvent — one row per RVSF rejection (per L53-L56 + reveal-number rule).
// Drives the admin /refund-review queue and the ping-pong-flag cron.
// Extended per §25.2: chatFlaggedPatterns has structured shape, customerNumberRevealed
// added, refundDecision enum extended with auto_full_but_refund_failed + auto_denied_number_revealed.
//
// 2026-05-22 hotfix (P0-2 revenue defence): removed dead enum value
// `auto_denied_engaged_phase` — per VISION.md §4, condition 3 of the three-condition
// refund model goes to admin review, NOT auto-deny. Engaged-phase rejections now
// write `refundDecision: "admin_pending"` + `refundEntryReason: "engaged_phase"`
// so the audit trail still records how the row entered the queue.
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
    // NOTE: `auto_denied_engaged_phase` was REMOVED 2026-05-22 (P0-2). Engaged-phase
    // rejections must enter the admin-review queue per VISION.md §4 — they now write
    // `admin_pending` with `refundEntryReason: "engaged_phase"` below. Re-adding the
    // value here would silently break the platform's most important revenue defence.
    refundDecision: {
      type: String,
      enum: [
        "auto_full",
        "auto_full_but_refund_failed",     // Razorpay refund API errored
        "auto_denied_number_revealed",     // §25.1 — three-condition model
        "admin_approved_full",
        "admin_approved_partial",
        "admin_denied",
        "admin_pending",
      ],
      default: "admin_pending",
      required: true,
    },
    // Why this row entered the queue — informational/audit only, never user-facing.
    // Mirrors GracePhaseDecision.reason from lib/services/refund/computeGracePhase.ts.
    // NOT marked required: pre-hotfix RejectionEvent rows (and demo-fixture rows)
    // won't have this field. The reject handler always populates it on new rows;
    // the admin UI gracefully handles absence (entryReasonChip returns null).
    refundEntryReason: {
      type: String,
      enum: ["grace_phase", "engaged_phase", "number_revealed"],
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
