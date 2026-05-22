// v2 AuditLog — tamper-evidence on every privileged action.
// Written by reject handler (lead.rejected.by_rvsf), accept handler
// (lead.price.agreed), admin refund decisions, KYC approvals, config writes.
import mongoose, { Schema, model, models } from "mongoose"

const AuditLogSchema = new Schema(
  {
    // `actorUserId` is nullable so the env-fallback admin (lib/auth.ts;
    // id === "env-admin" — not an ObjectId) can write audit rows without
    // throwing a CastError. When null, the sibling `actorLabel` carries
    // the human-readable actor (typically the env admin's email, or the
    // literal "env-admin").  See lib/middleware/userIdCast.ts.
    actorUserId:     { type: Schema.Types.ObjectId, ref: "User", default: null },
    actorLabel:      { type: String, default: null },
    action:          { type: String, required: true },  // e.g. "lead.rejected.by_rvsf"
    targetCollection:{ type: String, required: true },
    targetId:        { type: Schema.Types.ObjectId, required: true },
    before:          { type: Schema.Types.Mixed },
    after:           { type: Schema.Types.Mixed },
    reason:          { type: String },  // required for *.override actions
    ipAddress:       { type: String },
  },
  { timestamps: true }
)

AuditLogSchema.index({ actorUserId: 1, createdAt: -1 })
AuditLogSchema.index({ targetCollection: 1, targetId: 1, createdAt: -1 })

const AuditLog = (models.AuditLog as mongoose.Model<any>) || model("AuditLog", AuditLogSchema)
export default AuditLog
