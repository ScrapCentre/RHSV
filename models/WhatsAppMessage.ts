import { Schema, model, models } from "mongoose";

const WhatsAppMessageSchema = new Schema(
    {
        from: {
            type: String,
            required: true,
            index: true,
        },
        messageId: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            required: true,
        },
        content: {
            type: Schema.Types.Mixed, // Stores text, media URLs, etc.
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        rawBody: {
            type: Schema.Types.Mixed, // Complete webhook payload for debugging
        },
    },
    {
        timestamps: true,
        collection: "whatsapp_messages",
    }
);

const WhatsAppMessage = models.WhatsAppMessage || model("WhatsAppMessage", WhatsAppMessageSchema);

export default WhatsAppMessage;

