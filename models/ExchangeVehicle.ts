import mongoose, { Schema, model, models } from "mongoose"

const ExchangeVehicleSchema = new Schema(
    {
        userId: {
            type: String,
            required: false,
        },
        oldVehicleRegistration: { type: String, required: true },
        oldVehicleBrand: { type: String, required: true },
        oldVehicleModel: { type: String, required: true },
        oldVehicleYear: { type: String, required: true },
        oldVehicleFuelType: { type: String, required: true },
        newVehicleBrand: { type: String, required: true },
        newVehicleModel: { type: String },
        customerName: { type: String, required: true },
        customerPhone: { type: String, required: true },
        state: { type: String },
        city: { type: String },
        customCity: { type: String },
        pincode: { type: String },
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
        collection: 'exchange_vehicles'
    }
)

const ExchangeVehicle = models.ExchangeVehicle || model("ExchangeVehicle", ExchangeVehicleSchema)

export default ExchangeVehicle

