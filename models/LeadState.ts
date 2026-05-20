import mongoose, { Schema, Document } from "mongoose"

// engineering-design.md §3.2 — state-machine document for the 3-tier calculator
export interface ILeadState extends Document {
  anonymousToken: string
  tier: "tier1" | "tier2" | "tier3" | "triage" | "routed" | "rejected"
  routing: "auraiya" | "marketplace" | "rejected" | null

  vehicleType: "2W" | "4W" | "truck" | null
  registrationNumber: string | null
  brand: string | null
  model: string | null
  year: string | null
  state: string | null
  estimatedWeightKg: number | null

  scrapValueMin: number | null
  scrapValueMax: number | null
  pickupCost: number | null

  phone: string | null
  phoneVerifiedAt: Date | null
  cdValueMin: number | null
  cdValueMax: number | null

  photoUrls: string[]
  rcUrl: string | null
  aadhaarConsent: boolean
  verificationStatus: "pending" | "verified" | "flagged" | "rejected"
  verificationConfidence: number | null
  verificationFlags: string[]
  qualityScore: "bronze" | "silver" | "gold" | null

  triageDecisionId: string | null

  downstreamLeadId: string | null
  downstreamLeadType: string | null

  expiresAt: Date | null

  createdAt: Date
  updatedAt: Date
}

const LeadStateSchema = new Schema<ILeadState>(
  {
    anonymousToken:     { type: String, required: true, unique: true, index: true },
    tier:               { type: String, enum: ["tier1","tier2","tier3","triage","routed","rejected"], default: "tier1" },
    routing:            { type: String, enum: ["auraiya","marketplace","rejected", null], default: null },

    vehicleType:        { type: String, enum: ["2W","4W","truck", null], default: null },
    registrationNumber: { type: String },
    brand:              { type: String },
    model:              { type: String },
    year:               { type: String },
    state:              { type: String },
    estimatedWeightKg:  { type: Number },

    scrapValueMin:      { type: Number },
    scrapValueMax:      { type: Number },
    pickupCost:         { type: Number },

    phone:              { type: String, index: true },
    phoneVerifiedAt:    { type: Date },
    cdValueMin:         { type: Number },
    cdValueMax:         { type: Number },

    photoUrls:          [{ type: String }],
    rcUrl:              { type: String },
    aadhaarConsent:     { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ["pending","verified","flagged","rejected"], default: "pending" },
    verificationConfidence: { type: Number },
    verificationFlags:  [{ type: String }],
    qualityScore:       { type: String, enum: ["bronze","silver","gold", null], default: null },

    triageDecisionId:   { type: String },
    downstreamLeadId:   { type: String },
    downstreamLeadType: { type: String },

    expiresAt:          { type: Date },
  },
  { timestamps: true, collection: "lead_states" }
)

// Additional indexes per engineering-design.md §12
LeadStateSchema.index({ tier: 1, createdAt: -1 })

const LeadState = mongoose.models.LeadState || mongoose.model<ILeadState>("LeadState", LeadStateSchema)
export default LeadState
