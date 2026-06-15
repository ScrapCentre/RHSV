import mongoose, { Schema, Document } from "mongoose"

export interface IExecutive extends Document {
    name: string
    email: string
    password: string
    role: string
    mustChangePassword?: boolean
    createdAt: Date
    updatedAt: Date
}

const ExecutiveSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, default: "executive" },
        mustChangePassword: { type: Boolean, default: false }
    },
    { timestamps: true }
)

export default mongoose.models.Executive || mongoose.model<IExecutive>("Executive", ExecutiveSchema)
