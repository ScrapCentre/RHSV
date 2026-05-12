import mongoose, { Schema, Document } from "mongoose"

// engineering-design.md §3.2 — one thread per (MarketplaceLead × partner) pair
export interface IChatThread extends Document {
  marketplaceLeadId: string
  leadStateId: string
  partnerId: string
  customerPhone: string | null   // null until purchase; unlocked on purchase
  customerName: string | null

  status: "active" | "closed"
  lastMessageAt: Date | null

  createdAt: Date
  updatedAt: Date
}

const ChatThreadSchema = new Schema<IChatThread>(
  {
    marketplaceLeadId: { type: String, required: true },
    leadStateId:       { type: String, required: true },
    partnerId:         { type: String, required: true },
    customerPhone:     { type: String, default: null },
    customerName:      { type: String, default: null },

    status:            { type: String, enum: ["active","closed"], default: "active" },
    lastMessageAt:     { type: Date, default: null },
  },
  { timestamps: true, collection: "chat_threads" }
)

// Unique per (lead × partner) pair — atomic enforcement
ChatThreadSchema.index({ marketplaceLeadId: 1, partnerId: 1 }, { unique: true })

const ChatThread = mongoose.models.ChatThread || mongoose.model<IChatThread>("ChatThread", ChatThreadSchema)
export default ChatThread
