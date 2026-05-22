// v2 ConfigSetting — generalised key/value table for admin-tunable values.
// Replaces the v1 `Setting` model. New v2 keys live under namespaced strings
// (e.g. "pricing.scrapPricePerKg", "refund.gracePeriodMinutes").
// Cached 60s in lib/services/mock-config.ts and other readers.
import mongoose, { Schema, model, models } from "mongoose"

const ConfigSettingSchema = new Schema(
  {
    key:         { type: String, required: true, unique: true },
    value:       { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    lastUpdatedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    version:     { type: Number, default: 1, required: true },  // optimistic concurrency
  },
  { timestamps: true }
)

const ConfigSetting =
  (models.ConfigSetting as mongoose.Model<any>) || model("ConfigSetting", ConfigSettingSchema)
export default ConfigSetting

// Canonical key set (seeded by scripts/seed-settings-v2.ts):
// pricing.scrapPricePerKg               default 0.75       (L16, legacy universal rate)
// pricing.perKgRate.2W                  default 0.75       (L16, per-vehicle-type split)
// pricing.perKgRate.4W                  default 1.0        (L16, per-vehicle-type split)
// pricing.perKgRate.truck               default 1.0        (L16, per-vehicle-type split)
// marketplace.defaultRadiusKm           default 200        (L50)
// marketplace.minRadiusKm               default 50
// marketplace.maxRadiusKm               default 1000
// leads.staleHours                      default 48         (L28)
// leads.expiryDays                      default 14
// offers.expiryHours                    default 48         (L45)
// weight.trueUpTolerancePct             default 15         (L30)
// razorpay.feeAbsorbedPct               default 2          (L31)
// dsc.nudgeAfterHours                   default 24
// sla.pickupDays                        default 7
// sla.codInChatHours                    default 48
// sla.quoteResponseWindow               default "2 business hours" (per §25.21)
// partnership.bannerEnabled             default false      (L52)
// refund.gracePeriodMinutes             default 60         (P01)
// refund.quotaPerRvsfPer30Days          default 3          (§15.3)
// refund.flaggedRegexes                 [pattern list]     (§25.2)
// pingPong.rejectionThreshold           default 3          (L54)
// mockConfig                            {mode, services:{...}}
