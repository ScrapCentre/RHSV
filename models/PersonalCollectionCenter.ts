import mongoose, { Schema, Document } from "mongoose"

export interface IPersonalCollectionCenter extends Document {
    partnerId: string
    name: string
    fullAddress: string
    city: string
    state: string
    pincode: string
    catchmentRadius: number
    contactPersonName: string
    contactPersonPhone: string
    contactPersonEmail: string
    createdAt: Date
    updatedAt: Date
}

const PersonalCollectionCenterSchema: Schema = new Schema(
    {
        partnerId: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true },
        fullAddress: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pincode: { type: String, required: true },
        catchmentRadius: { type: Number, required: true, min: 50, max: 1000 },
        contactPersonName: { type: String, required: true, trim: true },
        contactPersonPhone: { type: String, required: true },
        contactPersonEmail: { type: String, required: true, trim: true, lowercase: true },
    },
    { timestamps: true, collection: "personal_collection_centers" }
)

export default mongoose.models.PersonalCollectionCenter ||
    mongoose.model<IPersonalCollectionCenter>("PersonalCollectionCenter", PersonalCollectionCenterSchema)
