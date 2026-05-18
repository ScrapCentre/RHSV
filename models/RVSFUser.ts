import mongoose, { Schema, Document } from "mongoose"

export interface IRVSFUser extends Document {
    rvsfId: string
    name: string
    email: string
    password: string
    role: string
    createdAt: Date
    updatedAt: Date
}

const RVSFUserSchema: Schema = new Schema(
    {
        rvsfId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, default: "rvsf" }
    },
    { timestamps: true }
)

export default mongoose.models.RVSFUser || mongoose.model<IRVSFUser>("RVSFUser", RVSFUserSchema)
