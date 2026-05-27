import mongoose, { Schema, Document } from "mongoose"

export interface IRVSFDetail extends Document {
    // Step 1 — Identity
    legalEntityName: string
    gstNumber: string
    panNumber: string
    cpcbAuthNumber: string
    morthAuthNumber: string
    businessEmail: string
    phoneNumber: string
    registeredAddress: string
    city: string
    state: string
    pincode: number

    // Step 2 — KYC Documents (Cloudinary URLs)
    gstCertificateUrl: string
    cpcbLetterUrl: string
    morthCertificateUrl: string
    panCardUrl: string

    // Step 3 — Bank Account
    accountHolderName: string
    bankName: string
    accountNumber: string
    ifscCode: string
    accountType: "savings" | "current"

    // Meta
    userId?: string
    status: "pending_review" | "under_review" | "activated" | "rejected"
    createdAt: Date
    updatedAt: Date
}

const RVSFDetailSchema: Schema = new Schema(
    {
        // Step 1
        legalEntityName: { type: String, required: true, trim: true },
        gstNumber: { type: String, required: true, trim: true, uppercase: true },
        panNumber: { type: String, required: true, trim: true, uppercase: true },
        cpcbAuthNumber: { type: String, required: true, trim: true },
        morthAuthNumber: { type: String, required: true, trim: true },
        businessEmail: { type: String, required: true, trim: true, lowercase: true },
        phoneNumber: { type: String, required: true, trim: true },
        registeredAddress: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pincode: { type: Number, required: true },

        // Step 2 — URLs from Cloudinary
        gstCertificateUrl: { type: String, required: true },
        cpcbLetterUrl: { type: String, required: true },
        morthCertificateUrl: { type: String, required: true },
        panCardUrl: { type: String, required: true },

        // Step 3
        accountHolderName: { type: String, required: true, trim: true },
        bankName: { type: String, required: true, trim: true },
        accountNumber: { type: String, required: true },
        ifscCode: { type: String, required: true, trim: true, uppercase: true },
        accountType: { type: String, enum: ["savings", "current"], required: true },

        // Meta
        userId: { type: String, index: true, sparse: true },
        status: { type: String, enum: ["pending_review", "under_review", "activated", "rejected"], default: "pending_review" },
    },
    {
        timestamps: true,
        collection: "RVSFs_Details",
    }
)

if (mongoose.models.RVSFDetail) {
    delete mongoose.models.RVSFDetail
}

export default mongoose.model<IRVSFDetail>("RVSFDetail", RVSFDetailSchema)
