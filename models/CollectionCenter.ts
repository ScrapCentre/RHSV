import mongoose, { Schema, Document } from "mongoose"

export interface ICollectionCenter extends Document {
    rvsfId: string
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

const CollectionCenterSchema: Schema = new Schema(
    {
        rvsfId: { type: String, required: true, index: true },
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
    { timestamps: true, collection: "collection_centers" }
)

export default mongoose.models.CollectionCenter ||
    mongoose.model<ICollectionCenter>("CollectionCenter", CollectionCenterSchema)
