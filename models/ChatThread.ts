import mongoose, { Schema, Document } from "mongoose"

export interface IChatMessage {
    _id?: any
    sender: "system" | "rvsf" | "customer"
    message: string
    isSystemMessage: boolean
    createdAt: Date
    
    // Extended fields for Task 6
    senderId?: string
    senderName?: string
    senderRole?: "system" | "rvsf" | "customer"
    content?: string
    type?: "text" | "image" | "offer" | "system"
    offerAmount?: number
    offerStatus?: "pending" | "accepted" | "countered" | "rejected" | "expired"
    offerExpiresAt?: Date
}

export interface IChatThread extends Document {
    leadId: string
    rvsfId: string
    customerId?: string
    messages: IChatMessage[]
    agreedPrice?: number
    agreedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const ChatMessageSchema = new Schema(
    {
        sender: { type: String, enum: ["system", "rvsf", "customer"], required: true },
        message: { type: String, required: true },
        isSystemMessage: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        
        // Extended fields for Task 6
        senderId: { type: String },
        senderName: { type: String },
        senderRole: { type: String, enum: ["system", "rvsf", "customer"] },
        content: { type: String },
        type: { type: String, enum: ["text", "image", "offer", "system"], default: "text" },
        offerAmount: { type: Number },
        offerStatus: { type: String, enum: ["pending", "accepted", "countered", "rejected", "expired"] },
        offerExpiresAt: { type: Date }
    },
    { _id: true }
)

const ChatThreadSchema: Schema = new Schema(
    {
        leadId: { type: String, required: true },
        rvsfId: { type: String, required: true },
        customerId: { type: String },
        messages: { type: [ChatMessageSchema], default: [] },
        agreedPrice: { type: Number },
        agreedAt: { type: Date },
    },
    {
        timestamps: true,
        collection: "chat_threads",
    }
)

ChatThreadSchema.index({ leadId: 1, rvsfId: 1 }, { unique: true })

export default mongoose.models.ChatThread || mongoose.model<IChatThread>("ChatThread", ChatThreadSchema)
