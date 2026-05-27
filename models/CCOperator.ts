import mongoose, { Schema, Document } from "mongoose"

export interface ICCOperator extends Document {
    ccId: string
    rvsfId: string
    name: string
    phone: string
    email: string
    password: string
    role: string
    mustChangePassword: boolean
    createdAt: Date
    updatedAt: Date
}

const CCOperatorSchema: Schema = new Schema(
    {
        ccId: { type: String, required: true, unique: true },
        rvsfId: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        role: { type: String, default: "cc_operator" },
        mustChangePassword: { type: Boolean, default: true },
    },
    { timestamps: true, collection: "cc_operators" }
)

export default mongoose.models.CCOperator ||
    mongoose.model<ICCOperator>("CCOperator", CCOperatorSchema)
