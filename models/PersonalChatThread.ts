import mongoose, { Schema, Document } from "mongoose"

export interface IPersonalChatMessage {
    _id?: any
    sender: "system" | "partner" | "customer"
    message: string
    isSystemMessage: boolean
    createdAt: Date
    
    senderId?: string
    senderName?: string
    senderRole?: "system" | "partner" | "customer"
    content?: string
    type?: "text" | "image" | "offer" | "system"
    offerAmount?: number
    offerStatus?: "pending" | "accepted" | "countered" | "rejected" | "expired"
    offerExpiresAt?: Date
}

export interface IPersonalChatThread extends Document {
    leadId: string
    partnerId: string
    customerId?: string
    messages: IPersonalChatMessage[]
    agreedPrice?: number
    agreedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const PersonalChatMessageSchema = new Schema(
    {
        sender: { type: String, enum: ["system", "partner", "customer"], required: true },
        message: { type: String, required: true },
        isSystemMessage: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        
        senderId: { type: String },
        senderName: { type: String },
        senderRole: { type: String, enum: ["system", "partner", "customer"] },
        content: { type: String },
        type: { type: String, enum: ["text", "image", "offer", "system"], default: "text" },
        offerAmount: { type: Number },
        offerStatus: { type: String, enum: ["pending", "accepted", "countered", "rejected", "expired"] },
        offerExpiresAt: { type: Date }
    },
    { _id: true }
)

const PersonalChatThreadSchema: Schema = new Schema(
    {
        leadId: { type: String, required: true },
        partnerId: { type: String, required: true },
        customerId: { type: String },
        messages: { type: [PersonalChatMessageSchema], default: [] },
        agreedPrice: { type: Number },
        agreedAt: { type: Date },
    },
    {
        timestamps: true,
        collection: "personal_chat_threads",
    }
)

PersonalChatThreadSchema.index({ leadId: 1, partnerId: 1 }, { unique: true })

if (mongoose.models.PersonalChatThread) {
    delete (mongoose.models as any).PersonalChatThread;
}

export default mongoose.model<IPersonalChatThread>("PersonalChatThread", PersonalChatThreadSchema)
