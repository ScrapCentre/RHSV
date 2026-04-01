import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
        }

        await connectToDatabase()

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        })

        return NextResponse.json({ message: "User created successfully", userId: newUser._id }, { status: 201 })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

