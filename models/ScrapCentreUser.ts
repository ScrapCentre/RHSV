import mongoose, { Schema, Document } from "mongoose"

export interface IScrapCentreUser extends Document {
    name: string
    loginId: string
    email: string
    password: string
    role: string
    createdAt: Date
    updatedAt: Date
}

const ScrapCentreUserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        loginId: { type: String, required: true, unique: true, lowercase: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, default: "scrapcentre" }
    },
    { timestamps: true }
)

export default mongoose.models.ScrapCentreUser || mongoose.model<IScrapCentreUser>("ScrapCentreUser", ScrapCentreUserSchema)
