// v2 DistanceCache — Google Distance Matrix result cache (30-day TTL).
// Cuts Maps API spend on repeated pincode-pair queries (per Architect §10.3).
import mongoose, { Schema, model, models } from "mongoose"

const DistanceCacheSchema = new Schema(
  {
    originPincode:      { type: String, required: true },
    destinationPincode: { type: String, required: true },
    distanceKm:         { type: Number, required: true },
    durationMin:        { type: Number },
    cachedAt: { type: Date, default: Date.now, required: true, expires: 30 * 24 * 60 * 60 },  // 30d TTL
  },
  { timestamps: false }
)

DistanceCacheSchema.index({ originPincode: 1, destinationPincode: 1 }, { unique: true })

const DistanceCache =
  (models.DistanceCache as mongoose.Model<any>) || model("DistanceCache", DistanceCacheSchema)
export default DistanceCache
