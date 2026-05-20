// v2 CalcSession — DB-backed Tier 1/2/3 session state.
// Replaces v1's localStorage handoff. Mongo TTL auto-purges abandoned
// sessions after 14 days (per Backend §2.21).
import mongoose, { Schema, model, models } from "mongoose"

const CalcSessionSchema = new Schema(
  {
    anonId: { type: String, required: true, unique: true },  // UUIDv4, first-party cookie
    tier:   { type: Number, enum: [1, 2, 3], required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },     // populated after Tier-2 OTP
    phone:  { type: String },
    vehicle:{ type: Schema.Types.Mixed },                     // VehicleSchema shape; loose so we don't double-define
    calc:   { type: Schema.Types.Mixed },                     // CalcResultSchema shape
    leadId: { type: Schema.Types.ObjectId, ref: "Lead" },     // populated at Tier-3 commit
    expiresAt: { type: Date, required: true, index: { expires: 0 } },  // TTL — Mongo deletes when expired
    ipAtCreation: { type: String },
  },
  { timestamps: true }
)

const CalcSession =
  (models.CalcSession as mongoose.Model<any>) || model("CalcSession", CalcSessionSchema)
export default CalcSession
