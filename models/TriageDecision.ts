import mongoose, { Schema, Document } from "mongoose"

// engineering-design.md §3.2 — audit log of triage actions
export interface ITriageDecision extends Document {
  leadStateId: string
  decidedBy: string             // admin user email
  decision: "auraiya" | "marketplace" | "rejected"
  notes: string | null
  decidedAt: Date
  aiVerificationFlags: string[] // surfaced from LeadState for convenience

  createdAt: Date
  updatedAt: Date
}

const TriageDecisionSchema = new Schema<ITriageDecision>(
  {
    leadStateId:          { type: String, required: true },
    decidedBy:            { type: String, required: true },
    decision:             { type: String, enum: ["auraiya","marketplace","rejected"], required: true },
    notes:                { type: String, default: null },
    decidedAt:            { type: Date, required: true },
    aiVerificationFlags:  [{ type: String }],
  },
  { timestamps: true, collection: "triage_decisions" }
)

// Indexes per engineering-design.md §12
TriageDecisionSchema.index({ leadStateId: 1 })
TriageDecisionSchema.index({ decidedAt: -1 })

const TriageDecision = mongoose.models.TriageDecision || mongoose.model<ITriageDecision>("TriageDecision", TriageDecisionSchema)
export default TriageDecision
