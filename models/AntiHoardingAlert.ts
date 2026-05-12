import mongoose, { Schema, Document } from "mongoose"

// engineering-design.md §3.2 — soft alerting for the ops team; no automated enforcement
export interface IAntiHoardingAlert extends Document {
  marketplaceLeadId: string
  partnerId: string
  partnerName: string
  partnerCity: string
  alertType: "nearby_lead_ignored"  // expandable enum
  alertedAt: Date
  resolvedAt: Date | null
  resolutionNote: string | null

  createdAt: Date
  updatedAt: Date
}

const AntiHoardingAlertSchema = new Schema<IAntiHoardingAlert>(
  {
    marketplaceLeadId: { type: String, required: true },
    partnerId:         { type: String, required: true },
    partnerName:       { type: String, required: true },
    partnerCity:       { type: String, required: true },
    alertType:         { type: String, enum: ["nearby_lead_ignored"], required: true },
    alertedAt:         { type: Date, required: true },
    resolvedAt:        { type: Date, default: null },
    resolutionNote:    { type: String, default: null },
  },
  { timestamps: true, collection: "anti_hoarding_alerts" }
)

// Index for unresolved alerts query — engineering-design.md §12
AntiHoardingAlertSchema.index({ resolvedAt: 1 })

const AntiHoardingAlert = mongoose.models.AntiHoardingAlert || mongoose.model<IAntiHoardingAlert>("AntiHoardingAlert", AntiHoardingAlertSchema)
export default AntiHoardingAlert
