import mongoose, { Schema, Document } from "mongoose"

export interface IUnlockedLead extends Document {
    leadId: string
    leadSource: string // "Valuation" | "ExchangeVehicle" | "BuyVehicle" | "WizardLead"
    rvsfId: string
    customerId?: string
    customerName?: string
    customerEmail?: string
    customerPhone?: string
    vehicleInfo?: string
    unlockPaymentId: string
    razorpayOrderId?: string
    amount: number
    unlockedAt: Date
    status: "pending_decision" | "accepted" | "rejected"
    rejectionReason?: string
    createdAt: Date
    updatedAt: Date
}

const UnlockedLeadSchema: Schema = new Schema(
    {
        leadId: { type: String, required: true },
        leadSource: { type: String, required: true, enum: ["Valuation", "ExchangeVehicle", "BuyVehicle", "WizardLead"] },
        rvsfId: { type: String, required: true },
        customerId: { type: String },
        customerName: { type: String },
        customerEmail: { type: String },
        customerPhone: { type: String },
        vehicleInfo: { type: String },
        unlockPaymentId: { type: String, required: true },
        razorpayOrderId: { type: String },
        amount: { type: Number, required: true },
        unlockedAt: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ["pending_decision", "accepted", "rejected"],
            default: "pending_decision",
        },
        rejectionReason: { type: String },
    },
    {
        timestamps: true,
        collection: "unlocked_leads",
    }
)

// Compound index: one RVSF can only unlock a lead once
UnlockedLeadSchema.index({ leadId: 1, rvsfId: 1 }, { unique: true })

export default mongoose.models.UnlockedLead || mongoose.model<IUnlockedLead>("UnlockedLead", UnlockedLeadSchema)
