// v2 OtpAttempt — OTP rate-limit + audit.
// Defends against OTP-bombing (attacker burns through victim's Firebase quota).
// 30-day Mongo TTL for log retention.
import mongoose, { Schema, model, models } from "mongoose"

const OtpAttemptSchema = new Schema(
  {
    phone:     { type: String, required: true },
    ipAddress: { type: String, required: true },
    purpose:   { type: String, enum: ["login","tier2_verify","change_phone"], required: true },
    attemptedAt: { type: Date, default: Date.now, required: true },
    firebaseRequestId: { type: String },
    outcome:   { type: String, enum: ["sent","blocked_rate_limit","blocked_abuse","verified","verify_failed"], required: true },
  },
  { timestamps: false }  // we use attemptedAt explicitly
)

OtpAttemptSchema.index({ phone: 1, attemptedAt: -1 })
OtpAttemptSchema.index({ ipAddress: 1, attemptedAt: -1 })
OtpAttemptSchema.index({ attemptedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })  // 30d TTL

const OtpAttempt =
  (models.OtpAttempt as mongoose.Model<any>) || model("OtpAttempt", OtpAttemptSchema)
export default OtpAttempt
