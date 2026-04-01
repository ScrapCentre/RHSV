import mongoose, { Schema, model, models } from "mongoose"

const SettingSchema = new Schema(
    {
        key: {
            type: String,
            required: [true, "Setting key is required"],
            unique: true,
            trim: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, "Setting value is required"],
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        collection: 'settings'
    }
)

const Setting = models.Setting || model("Setting", SettingSchema)

export default Setting
