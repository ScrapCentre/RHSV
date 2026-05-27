import mongoose, { Schema, Document } from "mongoose"

export interface IRefundRequest extends Document {
    leadId: string
    rvsfId: string
    amount: number
    rejectionReason: string
    unlockPaymentId: string
    razorpayOrderId?: string
    status: "pending_admin_review" | "refund_approved" | "refund_processed" | "refund_denied" | "refunded" | "denied"
    adminNotes?: string
    createdAt: Date
    updatedAt: Date
}

const RefundRequestSchema: Schema = new Schema(
    {
        leadId: { type: String, required: true },
        rvsfId: { type: String, required: true },
        amount: { type: Number, required: true },
        rejectionReason: { type: String, required: true },
        unlockPaymentId: { type: String, required: true },
        razorpayOrderId: { type: String },
        status: {
            type: String,
            enum: ["pending_admin_review", "refund_approved", "refund_processed", "refund_denied", "refunded", "denied"],
            default: "pending_admin_review",
        },
        adminNotes: { type: String },
    },
    {
        timestamps: true,
        collection: "refund_requests",
    }
)

export default mongoose.models.RefundRequest || mongoose.model<IRefundRequest>("RefundRequest", RefundRequestSchema)
