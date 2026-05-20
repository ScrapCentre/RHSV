// v2 TriageDecision — cherry-picked from v1 fork.
// One row per Auraiya / Marketplace / Reject decision.
// Carries reviewer notes + AI flags acted on.
import mongoose, { Schema, model, models } from "mongoose"

const TriageDecisionSchema = new Schema(
  {
    leadId:           { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    decidedByUserId:  { type: Schema.Types.ObjectId, ref: "User", required: true },
    decision:         { type: String, enum: ["approve_auraiya","approve_marketplace","reject"], required: true },
    decisionNotes:    { type: String },
    aiFlagsAtDecision:{ type: [String], default: [] },
  },
  { timestamps: true }
)

TriageDecisionSchema.index({ leadId: 1, createdAt: -1 })
TriageDecisionSchema.index({ decidedByUserId: 1, createdAt: -1 })

const TriageDecision =
  (models.TriageDecision as mongoose.Model<any>) || model("TriageDecision", TriageDecisionSchema)
export default TriageDecision
