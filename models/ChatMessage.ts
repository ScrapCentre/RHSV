// v2 ChatMessage — type discriminator: text | image | pdf | offer | system_event.
// OfferBubble has Accept/Counter/Reject buttons (per L36). 48h auto-expire (L45).
// Accept = signal + audit log (no money movement) per L44.
import mongoose, { Schema, model, models } from "mongoose"

const OfferSchema = new Schema(
  {
    amountPaise: { type: Number, required: true, min: 100 },
    actor:       { type: String, enum: ["customer","rvsf"], required: true },
    status:      { type: String, enum: ["open","accepted","countered","rejected","expired"], default: "open", required: true },
    expiresAt:   { type: Date, required: true },  // createdAt + 48h
    counterOfMessageId: { type: Schema.Types.ObjectId, ref: "ChatMessage" },
    decidedAt:          { type: Date },
    decidedByUserId:    { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
)

const AttachmentSchema = new Schema(
  {
    url:         { type: String, required: true },
    mime:        { type: String, required: true },
    sizeBytes:   { type: Number, required: true },
    originalName:{ type: String },
    blurredUrl:  { type: String },
    // For document type: distinguish COD / CVS / pickup auth / other.
    subtype:     { type: String, enum: ["cod","cvs","pickup_authorisation","other"] },
    // Operator self-attestation that the COD/CVS was DSC-signed (per [A-11]).
    dscSigned:   { type: Boolean, default: false },
  },
  { _id: false }
)

const ChatMessageSchema = new Schema(
  {
    threadId:   { type: Schema.Types.ObjectId, ref: "ChatThread", required: true },
    senderUserId: { type: Schema.Types.ObjectId, ref: "User" },  // null for system messages
    senderRole: { type: String, enum: ["customer","rvsf_executive","system","admin"], required: true },
    type:       { type: String, enum: ["text","image","pdf","offer","system_event"], required: true },
    text:       { type: String },  // required for text and system_event
    attachment: { type: AttachmentSchema },  // for image / pdf
    offer:      { type: OfferSchema },  // for type=offer
    replyToMessageId:  { type: Schema.Types.ObjectId, ref: "ChatMessage" },
    seenByCustomerAt:  { type: Date },
    seenByRvsfAt:      { type: Date },
    seenByAdminAt:     { type: Date },
  },
  { timestamps: true }
)

ChatMessageSchema.index({ threadId: 1, createdAt: 1 })  // chronological scroll
ChatMessageSchema.index({ threadId: 1, type: 1, "offer.status": 1 })  // active offer lookup
ChatMessageSchema.index(
  { "offer.status": 1, "offer.expiresAt": 1 },
  { partialFilterExpression: { type: "offer", "offer.status": "open" } }
)  // offer-expiry cron

const ChatMessage =
  (models.ChatMessage as mongoose.Model<any>) || model("ChatMessage", ChatMessageSchema)
export default ChatMessage
