import mongoose, { Schema, Document } from "mongoose"

// engineering-design.md §3.2 — individual messages with poll index
export interface IChatMessage extends Document {
  threadId: string
  senderRole: "customer" | "partner"
  senderId: string        // customer phone or partner userId
  messageType: "text" | "photo"
  textContent: string | null
  photoUrl: string | null // Cloudinary URL
  readAt: Date | null

  createdAt: Date
  updatedAt: Date
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    threadId:     { type: String, required: true },
    senderRole:   { type: String, enum: ["customer","partner"], required: true },
    senderId:     { type: String, required: true },
    messageType:  { type: String, enum: ["text","photo"], required: true },
    textContent:  { type: String, default: null },
    photoUrl:     { type: String, default: null },
    readAt:       { type: Date, default: null },
  },
  { timestamps: true, collection: "chat_messages" }
)

// Index for polling feed — engineering-design.md §12
ChatMessageSchema.index({ threadId: 1, createdAt: 1 })

const ChatMessage = mongoose.models.ChatMessage || mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema)
export default ChatMessage
