import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ScrapCentreUser from "@/models/ScrapCentreUser"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()
        const users = await ScrapCentreUser.find().sort({ createdAt: -1 })
        return NextResponse.json(users)
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { name, email, loginId, password } = await req.json()

        if (!name || !email || !loginId || !password) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
        }

        await connectToDatabase()

        // Check if user or loginId already exists
        const existingUser = await ScrapCentreUser.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { loginId: loginId.toLowerCase() }
            ]
        })
        
        if (existingUser) {
            return NextResponse.json({ message: "Identity (Email or Login ID) already exists" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const newUser = await ScrapCentreUser.create({
            name,
            loginId: loginId.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
        })

        return NextResponse.json(newUser, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}
