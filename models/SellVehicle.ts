import mongoose, { Schema, model, models } from "mongoose"

const SellVehicleSchema = new Schema(
    {
        userId: {
            type: String,
            required: false,
        },
        registrationNumber: { type: String, required: true },
        brand: { type: String, required: true },
        customBrand: { type: String },
        model: { type: String, required: true },
        customModel: { type: String },
        registrationYear: { type: String, required: true },
        fuelType: { type: String, required: true },
        pendingLoan: { type: String, required: true },
        loanAmount: { type: String },
        loanBank: { type: String },
        name: { type: String },
        phone: { type: String },
        state: { type: String },
        city: { type: String },
        customCity: { type: String },
        pincode: { type: String },
        insuranceName: { type: String },
        status: {
            type: String,
            enum: ['pending', 'contacted', 'completed', 'rejected', 'approved'],
            default: 'pending'
        },
        // eKYC Data
        firstName: { type: String },
        dob: { type: String },
        aadharPhone: { type: String },
        aadharNumber: { type: String },
        aadharFile: { type: String }, // URL or Path
        rcFile: { type: String }, // URL or Path
        carPhoto: { type: String }, // URL or Path
        ekycStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },
    },
    {
        timestamps: true,
        collection: 'sell_vehicles'
    }
)

const SellVehicle = models.SellVehicle || model("SellVehicle", SellVehicleSchema)

export default SellVehicle

