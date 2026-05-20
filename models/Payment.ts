// v2 Payment — generalised Razorpay record (broader than LeadUnlock).
// Covers unlock + true-up top-ups + refunds (auto-grace + admin-approved).
// purpose enum extended per §25.2 with reject_refund_* variants.
import mongoose, { Schema, model, models } from "mongoose"

const PaymentSchema = new Schema(
  {
    purpose: {
      type: String,
      enum: [
        "lead_unlock",
        "trueup_topup",
        "trueup_refund",
        "reject_refund_auto",          // grace-window auto-refund
        "reject_refund_admin_partial", // admin-approved partial
        "reject_refund_admin_full",    // admin-approved full
        "manual_adjustment",
      ],
      required: true,
    },
    leadUnlockId:        { type: Schema.Types.ObjectId, ref: "LeadUnlock" },
    rvsfId:              { type: Schema.Types.ObjectId, ref: "RVSF", required: true },
    amountPaise:         { type: Number, required: true }, // signed: + = charge, − = refund
    razorpayOrderId:     { type: String, unique: true, sparse: true },
    razorpayPaymentId:   { type: String, unique: true, sparse: true },
    razorpayRefundId:    { type: String, unique: true, sparse: true },
    status:              { type: String, enum: ["initiated","success","failed"], default: "initiated", required: true },
    webhookEventId:      { type: String, unique: true, sparse: true },
    metadata:            { type: Schema.Types.Mixed },
  },
  { timestamps: true }
)

PaymentSchema.index({ rvsfId: 1, createdAt: -1 })
PaymentSchema.index({ status: 1, createdAt: 1 })

const Payment = (models.Payment as mongoose.Model<any>) || model("Payment", PaymentSchema)
export default Payment
