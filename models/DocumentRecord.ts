// v2 DocumentRecord — normalised side-table for COD/CVS/KYC PDFs.
// Drives /admin/dsc-pending queue + the dsc-nudge cron.
// dscSigned = operator self-attestation (per Architect [A-11]).
import mongoose, { Schema, model, models } from "mongoose"

const DocumentRecordSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ["cod","cvs","rvsf_kyc","customer_id","customer_address","other"],
      required: true,
    },
    leadId:              { type: Schema.Types.ObjectId, ref: "Lead" },
    rvsfId:              { type: Schema.Types.ObjectId, ref: "RVSF" },
    uploadedByUserId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    cloudinaryPublicId:  { type: String, required: true },
    cloudinaryUrl:       { type: String, required: true },
    signedUrlExpiresAt:  { type: Date },  // for KYC (1h TTL)
    mime:                { type: String, required: true },
    sizeBytes:           { type: Number, required: true },
    dscSigned:           { type: Boolean, default: false },  // operator attests
    dscSignedAt:         { type: Date },
    dscPendingSince:     { type: Date },  // set when COD is "ready to sign"; drives nudge cron
    digiElvSubmittedAt:  { type: Date },
    digiElvReferenceNumber: { type: String },
    cdNumber:            { type: String },  // for COD docs
    chatMessageId:       { type: Schema.Types.ObjectId, ref: "ChatMessage" },  // null for KYC
  },
  { timestamps: true }
)

DocumentRecordSchema.index({ leadId: 1, kind: 1 })
DocumentRecordSchema.index({ rvsfId: 1, kind: 1 })
DocumentRecordSchema.index({ kind: 1, dscSigned: 1, dscPendingSince: 1 })  // dsc-pending queue + nudge cron

const DocumentRecord =
  (models.DocumentRecord as mongoose.Model<any>) || model("DocumentRecord", DocumentRecordSchema)
export default DocumentRecord
