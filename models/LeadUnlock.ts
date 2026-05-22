// v2 LeadUnlock — canonical ledger row per unlock attempt.
// The WINNING attempt wires back into Lead.unlock. Used for accounting /
// Razorpay reconciliation. Partial-unique index on {leadId, status:"paid"}
// enforces "one paid unlock per lead" race-safely (per Backend §3).
//
// Status `paid_rejected` was added per §25.2 to allow the next RVSF to
// re-unlock after a rejection (the partial-unique index only matches "paid").
import mongoose, { Schema, model, models } from "mongoose"

const TrueUpSchema = new Schema(
  {
    actualWeightKg:    { type: Number },
    deltaPercent:      { type: Number },
    deltaAmountPaise:  { type: Number },
    refundId:          { type: String },
    topUpOrderId:      { type: String },
    settledAt:         { type: Date },
    // Hotfix 2026-05-22 (P1 cron-trueup): retry-attempt counter. The weight-trueup
    // cron increments this each time it tries to issue a Razorpay refund/topup;
    // once it crosses the escalation threshold (5) the lead is flipped to the
    // adminAttentionFlag queue so a human can reconcile manually instead of the
    // cron re-firing every 6h forever.
    attempts:          { type: Number, default: 0 },
    lastAttemptAt:     { type: Date },
    lastError:         { type: String },
  },
  { _id: false }
)

const LeadUnlockSchema = new Schema(
  {
    leadId:             { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    rvsfId:             { type: Schema.Types.ObjectId, ref: "RVSF", required: true },
    triggeredByUserId:  { type: Schema.Types.ObjectId, ref: "User", required: true },
    weightKgAtUnlock:   { type: Number, required: true },
    pricePerKgAtUnlock: { type: Number, required: true },
    baseAmountPaise:    { type: Number, required: true },
    razorpayOrderId:    { type: String, required: true, unique: true },
    razorpayPaymentId:  { type: String, unique: true, sparse: true },
    razorpaySignature:  { type: String },
    status: {
      type: String,
      enum: ["order_created","payment_pending","paid","paid_rejected","failed","refunded_partial","refunded_full","topped_up"],
      default: "order_created",
      required: true,
    },
    trueUp:         { type: TrueUpSchema },
    failureReason:  { type: String },
    idempotencyKey: { type: String, required: true, unique: true },
  },
  { timestamps: true }
)

// THE critical partial-unique index per Backend §3 + §25.3 — race-safe single-unlock guarantee.
LeadUnlockSchema.index(
  { leadId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "paid" } }
)
LeadUnlockSchema.index({ rvsfId: 1, createdAt: -1 })
LeadUnlockSchema.index({ razorpayOrderId: 1 }, { unique: true })

const LeadUnlock =
  (models.LeadUnlock as mongoose.Model<any>) || model("LeadUnlock", LeadUnlockSchema)
export default LeadUnlock
