import mongoose, { Schema, model, models } from "mongoose"

const B2BPartnerSchema = new Schema(
    {
        userId: {
            type: String,
            required: [true, "User ID is required"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        businessName: {
            type: String,
            required: true,
        },
        contactNumber: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        address: String,
        city: String,
        state: String,
        pincode: String,
        // Reference to original registration if needed, though we might delete it
        registrationId: {
            type: Schema.Types.ObjectId,
            ref: "B2BRegistration",
        },
        originalUserId: {
            type: String, // Store the NextAuth User ID of the applicant
            required: false
        }
    }, {
    timestamps: true,
    collection: 'b2bpartner' // Explicitly naming the collection as requested
})

const B2BPartner = models.B2BPartner || model("B2BPartner", B2BPartnerSchema)

export default B2BPartner

