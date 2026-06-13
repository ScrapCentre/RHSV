import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ScrapCentreUser from "@/models/ScrapCentreUser"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createScrapUserSchema, zMongoId, formatZodError } from "@/lib/validation"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        if (!session || (role !== "admin" && role !== "executive")) {
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
        const role = (session?.user as any)?.role
        if (!session || (role !== "admin" && role !== "executive")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()

        // Validate all fields
        const parsed = createScrapUserSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { message: formatZodError(parsed.error) },
                { status: 400 }
            )
        }

        const { name, email, loginId, password } = parsed.data

        await connectToDatabase()

        const existingUser = await ScrapCentreUser.findOne({
            $or: [
                { email },
                { loginId }
            ]
        })

        if (existingUser) {
            return NextResponse.json({ message: "Identity (Email or Login ID) already exists" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const newUser = await ScrapCentreUser.create({
            name,
            loginId,
            email,
            password: hashedPassword,
        })

        return NextResponse.json(newUser, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        if (!session || (role !== "admin" && role !== "executive")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        // Validate MongoDB ObjectId format
        const idCheck = zMongoId.safeParse(id)
        if (!idCheck.success) {
            return NextResponse.json({ message: "Invalid or missing ID parameter" }, { status: 400 })
        }

        await connectToDatabase()
        const deletedUser = await ScrapCentreUser.findByIdAndDelete(idCheck.data)

        if (!deletedUser) {
            return NextResponse.json({ message: "ScrapCentre operator not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "ScrapCentre operator access revoked successfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}
