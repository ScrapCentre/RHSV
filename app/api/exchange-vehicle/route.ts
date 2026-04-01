import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        await connectToDatabase()
        const body = await req.json()

        const newEntry = await ExchangeVehicle.create({
            ...body,
            userId: (session?.user as any)?.id || null,
        })

        return NextResponse.json(
            { message: "Exchange vehicle request submitted successfully", data: newEntry },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("Exchange Vehicle Submission Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}

