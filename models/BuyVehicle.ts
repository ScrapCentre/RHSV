import mongoose, { Schema, model, models } from "mongoose"

const BuyVehicleSchema = new Schema(
    {
        userId: {
            type: String,
            required: false,
        },
        vehicleBrand: { type: String, required: true },
        customBrand: { type: String },
        vehicleModel: { type: String, required: true },
        customModel: { type: String },
        budgetRange: { type: String, required: true },
        fuelType: { type: String, required: true },
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        customerPhone: { type: String, required: true },
        state: { type: String },
        city: { type: String },
        customCity: { type: String },
        pincode: { type: String },
        status: {
            type: String,
            enum: ['pending', 'contacted', 'completed', 'rejected', 'approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped', 'triage_pending', 'rejected_by_triage'],
            default: 'pending'
        },
        b2bPickupId: { type: String },
        b2bPartnerId: { type: String },
        // Triage integration fields (engineering-design.md §3.1 / §12)
        leadStateId: { type: String },
        qualityScore: { type: String, enum: ['bronze', 'silver', 'gold'] },
        triageDecisionId: { type: String },
    },
    {
        timestamps: true,
        collection: 'buy_vehicles'
    }
)

const BuyVehicle = models.BuyVehicle || model("BuyVehicle", BuyVehicleSchema)

export default BuyVehicle

