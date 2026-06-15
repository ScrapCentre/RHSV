import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import bcrypt from "bcryptjs"

import User from "@/models/User"
import Executive from "@/models/Executive"
import ScrapCentreUser from "@/models/ScrapCentreUser"
import B2BPartner from "@/models/B2BPartner"
import RVSFUser from "@/models/RVSFUser"
import CCOperator from "@/models/CCOperator"
import PersonalCCOperator from "@/models/PersonalCCOperator"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized. Please log in first." }, { status: 401 })
        }

        const body = await req.json()
        const { password } = body

        if (!password || password.trim().length < 6) {
            return NextResponse.json({ message: "Password must be at least 6 characters long." }, { status: 400 })
        }

        await connectToDatabase()

        const userId = (session.user as any).id
        const role = (session.user as any).role

        if (!userId) {
            return NextResponse.json({ message: "Invalid session user ID." }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        let updated = false

        // Determine collection based on session role and find user
        if (role === "admin" || role === "client") {
            const user = await User.findById(userId)
            if (user) {
                user.password = hashedPassword
                user.mustChangePassword = false
                await user.save()
                updated = true
            }
        } else if (role === "executive") {
            const exec = await Executive.findById(userId)
            if (exec) {
                exec.password = hashedPassword
                exec.mustChangePassword = false
                await exec.save()
                updated = true
            }
        } else if (role === "scrapcentre") {
            const sc = await ScrapCentreUser.findById(userId)
            if (sc) {
                sc.password = hashedPassword
                sc.mustChangePassword = false
                await sc.save()
                updated = true
            }
        } else if (role === "partner") {
            const partner = await B2BPartner.findById(userId)
            if (partner) {
                partner.password = hashedPassword
                partner.mustChangePassword = false
                await partner.save()
                updated = true
            }
        } else if (role === "rvsf") {
            const rvsf = await RVSFUser.findById(userId)
            if (rvsf) {
                rvsf.password = hashedPassword
                rvsf.mustChangePassword = false
                await rvsf.save()
                updated = true
            }
        } else if (role === "cc_operator") {
            // Check both standard CC operators and personal CC operators
            let ccOp = await CCOperator.findById(userId)
            if (ccOp) {
                ccOp.password = hashedPassword
                ccOp.mustChangePassword = false
                await ccOp.save()
                updated = true
            } else {
                let pCcOp = await PersonalCCOperator.findById(userId)
                if (pCcOp) {
                    pCcOp.password = hashedPassword
                    pCcOp.mustChangePassword = false
                    await pCcOp.save()
                    updated = true
                }
            }
        }

        if (!updated) {
            return NextResponse.json({ message: "User not found or role is not modifiable." }, { status: 404 })
        }

        return NextResponse.json({ message: "Password updated successfully." }, { status: 200 })
    } catch (error: any) {
        console.error("[RecreatePassword API] Error:", error)
        return NextResponse.json({ message: error.message || "An error occurred while updating the password." }, { status: 500 })
    }
}
