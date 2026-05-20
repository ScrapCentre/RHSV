// v2 Lead — UNIFIED lead document (per v2-build-plan §22 Conflict 2 + §25.2).
// Replaces the 4-collection split (Valuation/SellVehicle/BuyVehicle/ExchangeVehicle).
// Single `state` enum carries the full lifecycle. All schema additions from
// the review consolidation (§25.2) are included here.
import mongoose, { Schema, model, models } from "mongoose"

const VehicleSchema = new Schema(
  {
    class: { type: String, enum: ["2W", "4W", "Truck"], required: true },
    registrationNumber: { type: String, required: true, uppercase: true, match: /^[A-Z]{2}\d{2}[A-Z]{0,2}\d{1,4}$/ },
    make:    { type: String, required: true },
    model:   { type: String, required: true },
    variant: { type: String },
    year:    { type: Number, required: true, min: 1990, max: 2030 },
    fuelType:{ type: String, enum: ["petrol", "diesel", "cng", "ev", "hybrid", "other"], required: true },
    state:   { type: String, required: true },
    vahanWeightKg:        { type: Number },
    secondApiWeightKg:    { type: Number },
    chargeBasisWeightKg:  { type: Number },  // max(VAHAN, secondary) — persisted at unlock
    chassisLast5: { type: String, match: /^[A-Z0-9]{5}$/ },
    engineLast5:  { type: String },
    photos: [{
      url:        { type: String, required: true },
      type:       { type: String, enum: ["front","rear","left","right","odometer","damage","other"] },
      uploadedAt: { type: Date, default: Date.now },
      blurredUrl: { type: String },
    }],
  },
  { _id: false }
)

const CalcResultSchema = new Schema(
  {
    scrapValueLow:      { type: Number, required: true },
    scrapValueHigh:     { type: Number, required: true },
    scrapValueHeadline: { type: Number, required: true },
    cdValueLow:         { type: Number },
    cdValueHigh:        { type: Number },
    dealerDiscountLow:  { type: Number },
    dealerDiscountHigh: { type: Number },
    greenFinanceLow:    { type: Number },
    greenFinanceHigh:   { type: Number },
    greenInsuranceLow:  { type: Number },
    greenInsuranceHigh: { type: Number },
    pickupCostEstimate: { type: Number },
    nearestCcId:        { type: Schema.Types.ObjectId, ref: "CollectionCenter" },
    distanceKm:         { type: Number },
    pricePerKgUsed:     { type: Number, required: true },
    computedAt:         { type: Date, default: Date.now },
  },
  { _id: false }
)

const VerificationSchema = new Schema(
  {
    aadhaarStatus:           { type: String, enum: ["not_attempted","pending","verified","mismatch","failed"], default: "not_attempted" },
    aadhaarDigilockerRefId:  { type: String },
    aadhaarNameMatchScore:   { type: Number, min: 0, max: 100 },
    panStatus:               { type: String },
    panNumber:               { type: String },
    rcStatus:                { type: String, enum: ["not_attempted","pending","verified","mismatch","failed"], default: "not_attempted" },
    rcOcrJson:               { type: Schema.Types.Mixed },
    vahanCrossCheckStatus:   { type: String },
    photoVerificationStatus: { type: String },
    photoVerificationConfidence: { type: Number, min: 0, max: 100 },
    flagsForHumanReview:     { type: [String], default: [] },
  },
  { _id: false }
)

const UnlockSchema = new Schema(
  {
    unlockedByRvsfId:    { type: Schema.Types.ObjectId, ref: "RVSF", required: true },
    unlockedByUserId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    unlockedAt:          { type: Date, required: true },
    weightKgCharged:     { type: Number, required: true },
    pricePerKgCharged:   { type: Number, required: true },
    amountChargedPaise:  { type: Number, required: true },
    leadUnlockId:        { type: Schema.Types.ObjectId, ref: "LeadUnlock", required: true },
  },
  { _id: false }
)

const TriageSchema = new Schema(
  {
    queuedAt:         { type: Date },
    decidedByUserId:  { type: Schema.Types.ObjectId, ref: "User" },
    decision:         { type: String, enum: ["approve_auraiya","approve_marketplace","reject"] },
    decidedAt:        { type: Date },
    decisionNotes:    { type: String },
    aiFlagsAtDecision:{ type: [String], default: [] },
  },
  { _id: false }
)

// AgreedPrice subdoc (per L44 + §25.2)
const AgreedPriceSchema = new Schema(
  {
    amountPaise:      { type: Number, required: true },
    acceptedAt:       { type: Date, required: true },
    threadId:         { type: Schema.Types.ObjectId, ref: "ChatThread", required: true },
    customerUserId:   { type: Schema.Types.ObjectId, ref: "User", required: true },
    rvsfId:           { type: Schema.Types.ObjectId, ref: "RVSF", required: true },
    acceptedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    acceptedByRole:   { type: String, enum: ["customer","rvsf_executive","rvsf_admin"], required: true },
    sourceMessageId:  { type: Schema.Types.ObjectId, ref: "ChatMessage", required: true },
  },
  { _id: false }
)

const AddressSchema = new Schema(
  { line1: String, line2: String, city: String, state: String, pincode: String, country: { type: String, default: "IN" } },
  { _id: false }
)

const LeadSchema = new Schema(
  {
    flowType: { type: String, enum: ["scrap_only","scrap_plus_buy","buy_only","fleet"], required: true },
    customerUserId: { type: Schema.Types.ObjectId, ref: "User" },
    customerPhone:  { type: String, required: true },
    customerName:   { type: String },
    customerEmail:  { type: String },
    vehicle:        { type: VehicleSchema, required: true },
    pickupAddress:  { type: AddressSchema },
    pickupCoordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] },
    },
    pickupOrDrop: { type: String, enum: ["pickup","drop","undecided"], default: "undecided" },
    originCcId:   { type: Schema.Types.ObjectId, ref: "CollectionCenter" },
    calc:    { type: CalcResultSchema, required: true },
    quality: { type: String, enum: ["bronze","silver","gold"], default: "bronze" },
    verification: { type: VerificationSchema },

    // ── Single state enum (v2-build-plan §22 Conflict 2 — one canonical state field) ──
    state: {
      type: String,
      enum: [
        "created", "tier1_done", "tier2_done", "tier3_uploaded",
        "triage_pending", "approved_auraiya", "approved_marketplace", "triage_rejected",
        "marketplace_visible", "unlocked", "assigned_to_cc",
        "negotiating", "cd_issued", "cvs_issued", "weight_settled", "closed",
        "stale_alerted", "expired", "revived", "rvsf_rejected",
      ],
      default: "created",
      required: true,
    },

    inCatchmentCcIds:      { type: [Schema.Types.ObjectId], ref: "CollectionCenter", default: [] },
    marketplaceVisibleAt:  { type: Date },
    unlock:                { type: UnlockSchema },
    assignedCcId:          { type: Schema.Types.ObjectId, ref: "CollectionCenter" },
    triage:                { type: TriageSchema },

    // DigiELV / vscrap manual workflow state
    codRecordId:           { type: Schema.Types.ObjectId, ref: "DocumentRecord" },
    cvsRecordId:           { type: Schema.Types.ObjectId, ref: "DocumentRecord" },
    digiElvAppId:          { type: String },
    digiElvCdNumber:       { type: String },

    // ── §25.2 additions ──
    agreedPrice:           { type: AgreedPriceSchema },
    rejectionCount:        { type: Number, default: 0 },
    adminAttentionFlag:    { type: Boolean, default: false },
    // Reveal-customer-number rule (founder addition 2026-05-20)
    customerNumberRevealed: {
      type: new Schema({
        atTime:    { type: Date, required: true },
        byUserId:  { type: Schema.Types.ObjectId, ref: "User", required: true },
      }, { _id: false }),
    },
    pickupNegotiation: {
      type: new Schema({
        customerPrefers: { type: String, enum: ["pickup","drop"] },
        rvsfPrefers:     { type: String, enum: ["pickup","drop"] },
        costPaidBy:      { type: String, enum: ["customer","rvsf","split"] },
        agreedAt:        { type: Date },
      }, { _id: false }),
    },

    relistedFromUnlockId: { type: Schema.Types.ObjectId, ref: "LeadUnlock" },
    scrapCompletedAt:     { type: Date },
    closedAt:             { type: Date },
    closedReason: {
      type: String,
      enum: ["completed","customer_cancelled","unserviceable","fraud","admin_force_close"],
    },
  },
  { timestamps: true }
)

// Indexes per v2-build-plan §5.3 + §25.3
LeadSchema.index({ state: 1, createdAt: -1 })
LeadSchema.index({ customerUserId: 1, createdAt: -1 })
LeadSchema.index({ inCatchmentCcIds: 1, state: 1, marketplaceVisibleAt: -1 })
LeadSchema.index({ pickupCoordinates: "2dsphere" })
LeadSchema.index({ marketplaceVisibleAt: 1, state: 1 })
LeadSchema.index({ "vehicle.registrationNumber": 1 })
LeadSchema.index({ "unlock.unlockedByRvsfId": 1, state: 1 })
LeadSchema.index({ adminAttentionFlag: 1, rejectionCount: -1 }, { partialFilterExpression: { adminAttentionFlag: true } })
LeadSchema.index({ rejectionCount: 1, state: 1 })
LeadSchema.index({ "agreedPrice.acceptedAt": -1 }, { partialFilterExpression: { "agreedPrice.amountPaise": { $exists: true } } })
LeadSchema.index({ "customerNumberRevealed.atTime": -1 }, { partialFilterExpression: { "customerNumberRevealed.atTime": { $exists: true } } })

const Lead = (models.Lead as mongoose.Model<any>) || model("Lead", LeadSchema)
export default Lead
