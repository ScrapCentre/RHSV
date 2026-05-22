import { NextResponse, type NextRequest } from "next/server"
import connectToDatabase from "@/lib/db"
import Executive from "@/models/Executive"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { requireCsrf } from "@/lib/middleware/csrf"
import bcrypt from "bcryptjs"

// GET all executives
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()
        const executives = await Executive.find({}).sort({ createdAt: -1 })
        
        return NextResponse.json({ success: true, data: executives })
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}

// POST create a new executive
export async function POST(req: NextRequest) {
    const csrfFail = requireCsrf(req)
    if (csrfFail) return csrfFail
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { name, email, password } = body

        if (!name || !email || !password) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
        }

        await connectToDatabase()

        // Check if executive already exists
        const existingExec = await Executive.findOne({ email: email.toLowerCase() })
        if (existingExec) {
            return NextResponse.json({ success: false, message: "Executive already exists with this email" }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        const executive = await Executive.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "executive"
        })

        return NextResponse.json({ success: true, data: executive })
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
