import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const emailParam = searchParams.get("email")

        // Hardcoded admin Fix
        // Admin 1: Admin
        const admin1Email = "admin@gmail.com"
        const admin1Password = "admin@123"

        // Admin 2: Simar (Original)
        const admin2Email = "simaradmin@gmail.com"
        const admin2Password = "simar-ad"

        await connectToDatabase()

        if (emailParam) {
            // Original promotion logic
            const user = await User.findOneAndUpdate(
                { email: emailParam },
                { role: "admin" },
                { new: true }
            )
            if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 })
            return NextResponse.json({ message: `User ${emailParam} promoted!` })
        }

        // Create/Fix specific admin
        // Create/Update Admin 1 (Admin)
        const hashedPwd1 = await bcrypt.hash(admin1Password, 10)
        await User.findOneAndUpdate(
            { email: admin1Email },
            {
                name: "Admin",
                email: admin1Email,
                password: hashedPwd1,
                role: "admin"
            },
            { upsert: true, new: true }
        )

        // Create/Update Admin 2 (Simar)
        const hashedPwd2 = await bcrypt.hash(admin2Password, 10)
        await User.findOneAndUpdate(
            { email: admin2Email },
            {
                name: "Simar Admin",
                email: admin2Email,
                password: hashedPwd2,
                role: "admin"
            },
            { upsert: true, new: true }
        )

        return NextResponse.json({
            message: `Admins Configured! \n1. ${admin1Email} / ${admin1Password} \n2. ${admin2Email} / ${admin2Password}`
        })

    } catch (error) {
        return NextResponse.json({ message: "Error", error }, { status: 500 })
    }
}

