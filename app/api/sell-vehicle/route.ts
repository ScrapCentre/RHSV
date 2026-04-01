import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import SellVehicle from "@/models/SellVehicle"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        await connectToDatabase()
        const body = await req.json()

        // Basic validation could go here, but schema handles required fields
        const newEntry = await SellVehicle.create({
            ...body,
            userId: (session?.user as any)?.id || null, // Link to user if logged in
        })

        return NextResponse.json(
            { message: "Sell vehicle request submitted successfully", data: newEntry },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("Sell Vehicle Submission Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}

