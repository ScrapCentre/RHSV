import mongoose, { Schema, model, models } from "mongoose"

const ValuationSchema = new Schema(
    {
        userId: {
            type: String, // Store as string for better NextAuth compatibility
            required: false,
        },
        vehicleType: {
            type: String,
            required: [true, "Vehicle type is required"],
        },
        brand: {
            type: String,
            required: [true, "Brand is required"],
        },
        model: {
            type: String,
            required: [true, "Model is required"],
        },
        year: {
            type: String,
            required: [true, "Year is required"],
        },
        vehicleNumber: {
            type: String,
            required: [true, "Vehicle number is required"],
        },
        vehicleWeight: {
            type: String,
            required: [true, "Vehicle weight is required"],
        },
        address: {
            pincode: String,
            state: String,
            city: String,
        },
        contact: {
            name: String,
            phone: String,
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "completed", "approved"],
            default: "pending",
        },
        estimatedValue: {
            type: Number, // Calculated scrap value (weight in tons * 1000 * scrapPricePerKg)
        },
        pickupCost: {
            type: Number,
        },
        distance: {
            type: Number, // Distance in km
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
        collection: 'valuations'
    }
)

const Valuation = models.Valuation || model("Valuation", ValuationSchema)

export default Valuation

