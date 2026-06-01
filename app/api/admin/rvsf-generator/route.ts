import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import RVSFUser from "@/models/RVSFUser"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        const isDev = process.env.NODE_ENV === "development"
        if (!isDev && (!session || (role !== "admin" && role !== "executive"))) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { rvsfId, password, name, email } = body

        if (!rvsfId || !password || !name || !email) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Check if RVSF user already exists
        const existingRVSF = await RVSFUser.findOne({ $or: [{ rvsfId }, { email: email.toLowerCase() }] })
        if (existingRVSF) {
            return NextResponse.json(
                { message: "An RVSF User with this ID or Email already exists." },
                { status: 400 }
            )
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create new RVSF User
        const newRvsfUser = await RVSFUser.create({
            rvsfId,
            password: hashedPassword,
            name,
            email: email.toLowerCase(),
            role: "rvsf"
        })

        return NextResponse.json(
            { message: "RVSF User created successfully", user: { rvsfId: newRvsfUser.rvsfId, name: newRvsfUser.name } },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("RVSF Generation Error:", error)
        return NextResponse.json(
            { message: "Failed to generate RVSF user.", error: error.message },
            { status: 500 }
        )
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        const isDev = process.env.NODE_ENV === "development"
        if (!isDev && (!session || (role !== "admin" && role !== "executive"))) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()
        const users = await RVSFUser.find({}).sort({ createdAt: -1 }).select("-password")
        return NextResponse.json(users, { status: 200 })
    } catch (error: any) {
        return NextResponse.json(
            { message: "Failed to fetch RVSF users" },
            { status: 500 }
        )
    }
}

// DELETE RVSF partner
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        const isDev = process.env.NODE_ENV === "development"
        if (!isDev && (!session || (role !== "admin" && role !== "executive"))) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ message: "ID parameter is required" }, { status: 400 })
        }

        await connectToDatabase()
        const deletedRvsf = await RVSFUser.findByIdAndDelete(id)

        if (!deletedRvsf) {
            return NextResponse.json({ message: "RVSF partner not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "RVSF partner access revoked successfully" }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to revoke RVSF access", error: error.message }, { status: 500 })
    }
}
