import mongoose, { Schema, model, models } from "mongoose"

const B2BRegistrationSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Business/Owner Name is required"],
        },
        address: {
            type: String,
            required: [true, "Address is required"],
        },
        pincode: {
            type: String,
            required: [true, "Pincode is required"],
        },
        city: {
            type: String,
            required: [true, "City is required"],
        },
        state: {
            type: String,
            required: [true, "State is required"],
        },
        contactNumber: {
            type: String,
            required: [true, "Contact Number is required"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Email is invalid",
            ],
        },
        userId: {
            type: String,
            required: false, // Optional for backward compatibility, but valid for new ones
        },
        status: {
            type: String,
            enum: ['pending', 'rejected', 'approved'],
            default: 'pending'
        }
    },
    {
        timestamps: true,
        collection: 'b2b_registrations'
    }
)

const B2BRegistration = models.B2BRegistration || model("B2BRegistration", B2BRegistrationSchema)

export default B2BRegistration

