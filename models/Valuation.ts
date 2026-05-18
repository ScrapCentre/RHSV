import mongoose, { Schema, model, models } from "mongoose"

const ValuationSchema = new Schema(
    {
        userId: {
            type: String, // Store as string for better NextAuth compatibility
            required: false,
        },
        requestType: {
            type: String,
            enum: ["valuation", "sell", "buy"],
            default: "valuation"
        },
        vehicleType: {
            type: String,
        },
        brand: {
            type: String,
            required: [true, "Brand is required"],
        },
        model: {
            type: String,
        },
        year: {
            type: String,
        },
        vehicleNumber: {
            type: String,
        },
        vehicleWeight: {
            type: String,
        },
        // Buy Vehicle specific fields
        budget: String,
        fuelType: String,
        modelType: String,
        address: {
            pincode: String,
            state: String,
            city: String,
            fullAddress: String,
        },
        contact: {
            name: String,
            phone: String,
            email: String,
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "completed", "approved", "pickup_scheduled", "reached_collection_centre", "car_scrapped"],
            default: "pending",
        },
        b2bPickupId: { type: String },
        b2bPartnerId: { type: String },
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

