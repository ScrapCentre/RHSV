import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRateLimit extends Document {
    key: string;     // "ip:endpoint"  e.g. "1.2.3.4:register"
    count: number;   // requests made in current window
    resetAt: Date;   // window expiry — TTL index auto-deletes this doc
}

const RateLimitSchema = new Schema<IRateLimit>(
    {
        key:     { type: String, required: true, unique: true },
        count:   { type: Number, required: true, default: 1 },
        resetAt: { type: Date,   required: true },
    },
    { timestamps: true }
);

// MongoDB TTL index — auto-deletes documents after resetAt
// (MongoDB checks every 60 seconds, so cleanup is near-immediate)
RateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

const RateLimit: Model<IRateLimit> =
    mongoose.models.RateLimit ||
    mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);

export default RateLimit;
