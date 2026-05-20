import mongoose, { Schema, Document } from "mongoose"

// engineering-design.md §3.2 — partner-facing lead record with masking and locking
export interface IMarketplaceLead extends Document {
  leadStateId: string
  downstreamLeadId: string
  downstreamLeadType: string

  vehicleType: "2W" | "4W" | "truck"
  brand: string
  model: string
  year: string
  cityMasked: string        // e.g. "Kanpur, UP" (no exact address)
  pincodeMasked: string     // first 3 digits only e.g. "208***"
  estimatedWeightKg: number
  qualityScore: "bronze" | "silver" | "gold"
  photoUrlsBlurred: string[]  // Cloudinary blur transformation URLs
  aadhaarVerified: boolean
  isRelisted: boolean
  relist_count: number

  leadPriceInr: number      // = estimatedWeightKg * (vehicleType === "2W" ? 0.75 : 1.0)

  status: "active" | "sold" | "expired" | "rejected" | "in_revival"
  soldToPartnerId: string | null
  soldAt: Date | null
  expiresAt: Date

  watchedBy: string[]       // array of B2BPartner.userId

  createdAt: Date
  updatedAt: Date
}

const MarketplaceLeadSchema = new Schema<IMarketplaceLead>(
  {
    leadStateId:        { type: String, required: true },
    downstreamLeadId:   { type: String, required: true },
    downstreamLeadType: { type: String, required: true },

    vehicleType:        { type: String, enum: ["2W","4W","truck"], required: true },
    brand:              { type: String, required: true },
    model:              { type: String, required: true },
    year:               { type: String, required: true },
    cityMasked:         { type: String, required: true },
    pincodeMasked:      { type: String, required: true },
    estimatedWeightKg:  { type: Number, required: true },
    qualityScore:       { type: String, enum: ["bronze","silver","gold"], required: true },
    photoUrlsBlurred:   [{ type: String }],
    aadhaarVerified:    { type: Boolean, default: false },
    isRelisted:         { type: Boolean, default: false },
    relist_count:       { type: Number, default: 0 },

    leadPriceInr:       { type: Number, required: true },

    status:             { type: String, enum: ["active","sold","expired","rejected","in_revival"], default: "active" },
    soldToPartnerId:    { type: String, default: null },
    soldAt:             { type: Date, default: null },
    expiresAt:          { type: Date, required: true },

    watchedBy:          [{ type: String }],
  },
  { timestamps: true, collection: "marketplace_leads" }
)

// Indexes per engineering-design.md §12
MarketplaceLeadSchema.index({ status: 1, expiresAt: 1 })
MarketplaceLeadSchema.index({ soldToPartnerId: 1 })
MarketplaceLeadSchema.index({ watchedBy: 1 })

const MarketplaceLead = mongoose.models.MarketplaceLead || mongoose.model<IMarketplaceLead>("MarketplaceLead", MarketplaceLeadSchema)
export default MarketplaceLead
