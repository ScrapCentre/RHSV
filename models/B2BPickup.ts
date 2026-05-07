import mongoose, { Schema, model, models } from "mongoose"

const B2BPickupSchema = new Schema(
    {
        // Partner who accepted
        partnerId: { type: String, required: true },
        partnerName: { type: String },

        // Reference to the original lead
        leadId: { type: String, required: true },
        leadType: {
            type: String,
            enum: ['valuation', 'sell', 'exchange', 'buy', 'quote'],
            required: true
        },

        // Snapshot of key lead data for display
        customerName: { type: String },
        customerPhone: { type: String },
        vehicleInfo: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },

        // Pickup status
        status: {
            type: String,
            enum: ['accepted', 'scheduled', 'picked_up', 'car_scrapped', 'completed', 'cancelled'],
            default: 'accepted'
        },

        // Full lead data snapshot
        leadSnapshot: { type: Schema.Types.Mixed },
    },
    {
        timestamps: true,
        collection: 'b2b_pickups'
    }
)

const B2BPickup = models.B2BPickup || model("B2BPickup", B2BPickupSchema)

export default B2BPickup
