// v2 CollectionCenter — child of RVSF (locked 2026-05-20 L18-L25).
// CC operator can ACCEPT leads but cannot REJECT (RVSF-only).
// CC sees ONLY its own catchment leads; no sibling visibility.
import mongoose, { Schema, model, models } from "mongoose"

const AddressSchema = new Schema(
  {
    line1:   { type: String, required: true },
    line2:   { type: String },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true, match: /^\d{6}$/ },
    country: { type: String, default: "IN" },
  },
  { _id: false }
)

const CatchmentSchema = new Schema(
  {
    center: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    radiusKm: { type: Number, required: true, min: 5, max: 500 },
  },
  { _id: false }
)

const CollectionCenterSchema = new Schema(
  {
    rvsfId: { type: Schema.Types.ObjectId, ref: "RVSF", required: true },
    city:   { type: String, required: true, trim: true },
    state:  { type: String, required: true, trim: true },
    displayName: { type: String, required: true },  // computed: "{rvsf.displayName} – {city}"
    address:     { type: AddressSchema, required: true },
    catchment:   { type: CatchmentSchema, required: true },
    pincodeOverrides: { type: [String], default: [] },  // future-proof: catchment exceptions
    isPrimaryYard:    { type: Boolean, default: false }, // true for RVSF's own yard
    publicVisible:    { type: Boolean, default: true },  // find-your-nearest widget (L24)
    status: {
      type: String,
      enum: ["active", "paused", "disabled"],
      default: "active",
    },
    contact: {
      name:  { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    operatingHours: { type: String },
  },
  { timestamps: true }
)

// Critical indexes per v2-build-plan §5.3 + §25.3
CollectionCenterSchema.index({ rvsfId: 1, city: 1 }, { unique: true })  // one CC per city per RVSF
CollectionCenterSchema.index({ "catchment.center": "2dsphere" })        // catchment match query
CollectionCenterSchema.index({ publicVisible: 1, status: 1 })           // find-your-nearest
CollectionCenterSchema.index({ rvsfId: 1, status: 1 })

const CollectionCenter =
  (models.CollectionCenter as mongoose.Model<any>) || model("CollectionCenter", CollectionCenterSchema)
export default CollectionCenter
