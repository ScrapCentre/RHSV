import mongoose, { Schema, Document } from "mongoose"

export interface IExecutive extends Document {
    name: string
    email: string
    password: string
    role: string
    createdAt: Date
    updatedAt: Date
}

const ExecutiveSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, default: "executive" }
    },
    { timestamps: true }
)

export default mongoose.models.Executive || mongoose.model<IExecutive>("Executive", ExecutiveSchema)
