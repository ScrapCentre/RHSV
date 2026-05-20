// v2 RVSF — top-level partner entity (per L18, locked 2026-05-20).
// Each RVSF has 0..N CollectionCenters, plus acts as its own CC for catchment.
// Auraiya RVSF = 1 RVSF + 6 CCs (Auraiya, Dehradun, Roorkee, Gorakhpur, Jhansi, Karera-MP).
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

const KycDocsSchema = new Schema(
  {
    panCardUrl:           { type: String, required: true },
    gstCertUrl:           { type: String, required: true },
    cpcbAuthUrl:          { type: String, required: true },
    morthAuthLetterUrl:   { type: String, required: true },
    addressProofUrl:      { type: String, required: true },
    signatoryIdUrl:       { type: String, required: true },
    cancelledChequeUrl:   { type: String, required: true },
    signatoryName:        { type: String, required: true },
    signatoryDesignation: { type: String, required: true },
    signatoryAadhaarLast4:{ type: String, match: /^\d{4}$/ },
    verifiedBy:           { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt:           { type: Date },
    rejectionReason:      { type: String },
  },
  { _id: false }
)

const BankAccountSchema = new Schema(
  {
    accountName:         { type: String, required: true },
    accountNumber:       { type: String, required: true },
    ifsc:                { type: String, required: true },
    bankName:            { type: String, required: true },
    cancelledChequeUrl:  { type: String, required: true },
  },
  { _id: false }
)

const RVSFSchema = new Schema(
  {
    legalName:    { type: String, required: true, trim: true },
    displayName:  { type: String, required: true, trim: true },
    slug:         { type: String, required: true, unique: true, lowercase: true, match: /^[a-z0-9-]+$/ },
    gstNumber:    { type: String, required: true, unique: true, match: /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/ },
    panNumber:    { type: String, required: true, match: /^[A-Z]{5}\d{4}[A-Z]$/ },
    cpcbAuthNumber: { type: String, required: true },
    morthAuthLetterUrl: { type: String, required: true },
    address:      { type: AddressSchema, required: true },
    // GeoJSON Point [lng, lat] per v2-build-plan §22 Conflict 4 (GeoJSON-only)
    primaryYardCoordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    serviceableVehicleClasses: { type: [String], enum: ["2W", "4W", "Truck"], default: ["2W", "4W", "Truck"] },
    bankAccount:  { type: BankAccountSchema, required: true },
    kycDocs:      { type: KycDocsSchema, required: true },
    // Per-RVSF override of the global default 200km. Slider 50-1000 per L50.
    marketplaceRadiusKm: { type: Number, default: 200, min: 50, max: 1000 },
    status: {
      type: String,
      enum: ["applied", "kyc_pending", "kyc_review", "active", "suspended", "rejected"],
      default: "applied",
    },
    triageQueueLastReviewedAt: { type: Date },
    razorpayContactId:         { type: String },
    notes:                     { type: String },
  },
  { timestamps: true }
)

RVSFSchema.index({ status: 1, createdAt: -1 })
RVSFSchema.index({ primaryYardCoordinates: "2dsphere" })

const RVSF = (models.RVSF as mongoose.Model<any>) || model("RVSF", RVSFSchema)
export default RVSF
