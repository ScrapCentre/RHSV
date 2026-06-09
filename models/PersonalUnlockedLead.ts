import mongoose, { Schema, Document } from "mongoose"

export interface IPersonalUnlockedLead extends Document {
    leadId: string
    leadSource: string // "Valuation" | "ExchangeVehicle" | "BuyVehicle" | "WizardLead"
    partnerId: string
    customerId?: string
    customerName?: string
    customerEmail?: string
    customerPhone?: string
    vehicleInfo?: string
    unlockedAt: Date
    status: string
    rejectionReason?: string
    assignedCcId?: string
    assignedCcName?: string
    assignedAt?: Date
    pickupStatus?: string
    createdAt: Date
    updatedAt: Date
}

const PersonalUnlockedLeadSchema: Schema = new Schema(
    {
        leadId: { type: String, required: true },
        leadSource: { type: String, required: true, enum: ["Valuation", "ExchangeVehicle", "BuyVehicle", "WizardLead"] },
        partnerId: { type: String, required: true },
        customerId: { type: String },
        customerName: { type: String },
        customerEmail: { type: String },
        customerPhone: { type: String },
        vehicleInfo: { type: String },
        unlockedAt: { type: Date, default: Date.now },
        assignedCcId: { type: String },
        assignedCcName: { type: String },
        assignedAt: { type: Date },
        pickupStatus: { type: String },
        status: {
            type: String,
            default: "pending_decision",
        },
        rejectionReason: { type: String },
    },
    {
        timestamps: true,
        collection: "personal_unlocked_leads",
    }
)

// Compound index: one partner can only unlock a lead once
PersonalUnlockedLeadSchema.index({ leadId: 1, partnerId: 1 }, { unique: true })

if (mongoose.models.PersonalUnlockedLead) {
    delete (mongoose.models as any).PersonalUnlockedLead;
}

export default mongoose.model<IPersonalUnlockedLead>("PersonalUnlockedLead", PersonalUnlockedLeadSchema)
