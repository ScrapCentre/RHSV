import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import RVSFUser from "@/models/RVSFUser"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { state, cardDetails } = body

        if (!state) {
            return NextResponse.json(
                { message: "Missing selected state" },
                { status: 400 }
            )
        }

        // Mock payment details check (just verify that the card number has 16 digits and is submitted)
        if (!cardDetails || !cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
            return NextResponse.json(
                { message: "Invalid payment details. Please check your credit card number." },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Generate unique RVSF credentials
        let isUnique = false
        let rvsfId = ""
        let email = ""

        while (!isUnique) {
            const randomNum = Math.floor(10000 + Math.random() * 90000)
            rvsfId = `RVSF${randomNum}`
            email = `partner.${randomNum}@rvsf.in`

            const existing = await RVSFUser.findOne({ $or: [{ rvsfId }, { email }] })
            if (!existing) {
                isUnique = true
            }
        }

        // Generate password
        const characters = "abcdefghjklmnpqrstuvwxyz23456789" // Avoid ambiguous chars
        let randomString = ""
        for (let i = 0; i < 5; i++) {
            randomString += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        const password = `rvsf-${randomString}`

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const normalizedState = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase()

        // Create RVSF Partner account in Database
        const newUser = await RVSFUser.create({
            rvsfId,
            name: `RVSF ${normalizedState} Facility`,
            email,
            password: hashedPassword,
            role: "rvsf",
            purchasedStates: [normalizedState],
            purchasedLeads: []
        })

        return NextResponse.json({
            message: "Purchase and provisioning successful",
            credentials: {
                rvsfId,
                email,
                password,
                name: newUser.name,
                state: normalizedState
            }
        }, { status: 201 })

    } catch (error: any) {
        console.error("RVSF Provisioning Purchase Error:", error)
        return NextResponse.json(
            { message: "An error occurred during account provisioning.", error: error.message },
            { status: 500 }
        )
    }
}
