import mongoose, { Schema, model, models } from "mongoose"

const ContactSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
        },
        message: {
            type: String,
            required: [true, "Message is required"],
        },
        status: {
            type: String,
            enum: ["new", "reviewed", "resolved"],
            default: "new",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
)

const Contact = models.Contact || model("Contact", ContactSchema)

export default Contact

