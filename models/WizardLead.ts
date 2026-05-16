import mongoose, { Schema, Document } from "mongoose";

export interface IWizardLead extends Document {
  serviceType: string; // 'sell', 'buy', 'scrap'
  category?: string; // 'scrap_only', 'scrap_and_buy', 'sell_only', 'buy_only'
  status?: string; // 'pending', 'reviewing', 'approved', 'completed'
  userId?: string; // linked user account
  
  // Vehicle Details (for sell and scrap)
  regNo?: string;
  brand?: string;
  model?: string;
  year?: string;
  weight?: string;
  kms?: string;
  fuel?: string[]; // fuel can be multiple selections now in UI

  // Customer Details
  name: string;
  phone: string;
  address?: string;
  pincode?: string;

  // Buy New Details (if buying new)
  desiredCompany?: string;
  desiredModel?: string;

  createdAt: Date;
  updatedAt: Date;
}

const WizardLeadSchema: Schema = new Schema(
  {
    serviceType: {
      type: String,
      required: true,
      enum: ['sell', 'buy', 'scrap'],
    },
    category: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'reviewed', 'approved', 'completed'],
      default: 'pending',
    },
    userId: { type: String },
    regNo: { type: String },
    brand: { type: String },
    model: { type: String },
    year: { type: String },
    weight: { type: String },
    kms: { type: String },
    fuel: [{ type: String }],
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    pincode: { type: String },
    desiredCompany: { type: String },
    desiredModel: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.WizardLead || mongoose.model<IWizardLead>("WizardLead", WizardLeadSchema);
