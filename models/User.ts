import mongoose, { Schema, model, models } from "mongoose"

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            unique: true,
            required: [true, "Email is required"],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Email is invalid",
            ],
        },
        password: {
            type: String,
            required: false, // Optional for OAuth users
            select: false,
        },
        image: {
            type: String,
        },
        provider: {
            type: String,
            default: "credentials",
        },
        role: {
            type: String,
            enum: ["client", "admin", "b2b"],
            default: "client",
        },
    },
    {
        timestamps: true,
    }
)

const User = models.User || model("User", UserSchema)

export default User

