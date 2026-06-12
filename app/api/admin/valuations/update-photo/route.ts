import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        const allowedRoles = ["admin", "executive"]
        if (!session || !allowedRoles.includes((session.user as any).role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id, type, carPhoto, action, photoUrl } = await req.json()

        if (!id || !type) {
            return NextResponse.json({ error: "Missing id or type" }, { status: 400 })
        }

        await connectToDatabase()

        let lead: any = null

        if (type === "scrap-buy") {
            lead = await WizardLead.findById(id)
        } else if (type === "exchange") {
            lead = await ExchangeVehicle.findById(id)
        } else if (type === "quote") {
            lead = await WizardLead.findById(id)
        } else if (type === "buy") {
            lead = await BuyVehicle.findById(id)
            if (!lead) {
                lead = await WizardLead.findById(id)
            }
        }

        if (!lead) {
            return NextResponse.json({ error: "Request not found in any matching collection" }, { status: 404 })
        }

        if (action === "delete") {
            if (!photoUrl) {
                return NextResponse.json({ error: "Missing photoUrl for delete action" }, { status: 400 })
            }

            // Remove photo URL if it matches any field
            if (lead.carPhoto === photoUrl) {
                lead.carPhoto = ""
            } else if (lead.photoFront === photoUrl) {
                lead.photoFront = ""
            } else if (lead.photoBack === photoUrl) {
                lead.photoBack = ""
            } else if (lead.photoLeft === photoUrl) {
                lead.photoLeft = ""
            } else if (lead.photoRight === photoUrl) {
                lead.photoRight = ""
            }

            if (lead.additionalPhotos && Array.isArray(lead.additionalPhotos)) {
                lead.additionalPhotos = lead.additionalPhotos.filter((url: string) => url !== photoUrl)
            }

            await lead.save()
            return NextResponse.json({ success: true, data: lead })
        } else {
            if (!carPhoto) {
                return NextResponse.json({ error: "Missing carPhoto URL to add" }, { status: 400 })
            }

            // Count total current photos
            const currentPhotosCount = [
                lead.carPhoto,
                lead.photoFront,
                lead.photoBack,
                lead.photoLeft,
                lead.photoRight
            ].filter(Boolean).length + (lead.additionalPhotos ? lead.additionalPhotos.length : 0)

            if (currentPhotosCount >= 6) {
                return NextResponse.json({ error: "Maximum of 6 photos allowed" }, { status: 400 })
            }

            // If carPhoto is empty, set it directly
            if (!lead.carPhoto) {
                lead.carPhoto = carPhoto
            } else {
                // Otherwise append to additionalPhotos
                if (!lead.additionalPhotos) {
                    lead.additionalPhotos = []
                }
                lead.additionalPhotos.push(carPhoto)
            }

            await lead.save()
            return NextResponse.json({ success: true, data: lead })
        }
    } catch (error) {
        console.error("Error updating vehicle photo:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
