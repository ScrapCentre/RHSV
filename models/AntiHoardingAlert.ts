// v2 AntiHoardingAlert — soft alert when in-catchment RVSF hasn't acted
// on a lead within the stale window (48h per L28). Per L04 the v1 lock
// is "soft anti-hoarding via team-alerting, not penalty rules".
// Written by the stale-leads cron.
import mongoose, { Schema, model, models } from "mongoose"

const AntiHoardingAlertSchema = new Schema(
  {
    leadId:      { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    rvsfId:      { type: Schema.Types.ObjectId, ref: "RVSF", required: true },
    hoursElapsed:{ type: Number, required: true },
    alertedAt:   { type: Date, default: Date.now, required: true },
    resolvedAt:  { type: Date },  // when RVSF acted OR admin manually marked resolved
  },
  { timestamps: true }
)

AntiHoardingAlertSchema.index({ leadId: 1, rvsfId: 1 }, { unique: true })  // one alert per lead/rvsf pair
AntiHoardingAlertSchema.index({ rvsfId: 1, resolvedAt: 1 })

const AntiHoardingAlert =
  (models.AntiHoardingAlert as mongoose.Model<any>) || model("AntiHoardingAlert", AntiHoardingAlertSchema)
export default AntiHoardingAlert
