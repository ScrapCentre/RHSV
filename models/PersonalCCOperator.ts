import mongoose, { Schema, Document } from "mongoose"

export interface IPersonalCCOperator extends Document {
    ccId: string
    partnerId: string
    name: string
    phone: string
    email: string
    password: string
    role: string
    mustChangePassword: boolean
    createdAt: Date
    updatedAt: Date
}

const PersonalCCOperatorSchema: Schema = new Schema(
    {
        ccId: { type: String, required: true, unique: true },
        partnerId: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        role: { type: String, default: "cc_operator" },
        mustChangePassword: { type: Boolean, default: true },
    },
    { timestamps: true, collection: "personal_cc_operators" }
)

export default mongoose.models.PersonalCCOperator ||
    mongoose.model<IPersonalCCOperator>("PersonalCCOperator", PersonalCCOperatorSchema)
