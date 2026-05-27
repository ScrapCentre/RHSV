import mongoose, { Schema, Document } from "mongoose"

export interface IRVSFUser extends Document {
    rvsfId: string
    name: string
    email: string
    password: string
    role: string
    registeredAddress?: string
    city?: string
    state?: string
    pincode?: number
    purchasedStates?: string[]
    purchasedLeads?: string[]
    createdAt: Date
    updatedAt: Date
}

const RVSFUserSchema: Schema = new Schema(
    {
        rvsfId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, default: "rvsf" },
        registeredAddress: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: Number },
        purchasedStates: { type: [String], default: [] },
        purchasedLeads: { type: [String], default: [] }
    },
    { timestamps: true }
)

export default mongoose.models.RVSFUser || mongoose.model<IRVSFUser>("RVSFUser", RVSFUserSchema)
