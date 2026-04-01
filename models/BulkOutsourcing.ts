import mongoose, { Schema, Document } from "mongoose"

export interface IVehicleEntry {
    vehicleType: string
    weight: string
    registrationNumber: string
}

export interface IBulkOutsourcing extends Document {
    partnerId: string
    partnerName: string
    partnerEmail: string
    entries: IVehicleEntry[]
    status: string // "pending", "reviewed", "completed"
    createdAt: Date
    updatedAt: Date
}

const VehicleEntrySchema = new Schema<IVehicleEntry>({
    vehicleType: { type: String, required: true },
    weight: { type: String, required: true }, // Can be stored as String or Number depends on unit consistency
    registrationNumber: { type: String, required: true }
}, { _id: false })

const BulkOutsourcingSchema = new Schema<IBulkOutsourcing>({
    partnerId: { type: String, required: true },
    partnerName: { type: String, required: true },
    partnerEmail: { type: String, required: true },
    entries: [VehicleEntrySchema],
    status: { type: String, required: true, default: "pending" }
}, {
    timestamps: true
})

export default mongoose.models.BulkOutsourcing || mongoose.model<IBulkOutsourcing>("BulkOutsourcing", BulkOutsourcingSchema)
