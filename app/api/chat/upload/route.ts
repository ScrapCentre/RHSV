import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { validateImageFile } from "@/lib/validation"
import { rateLimiters } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
    try {
        // Rate limit: 30 uploads per IP per hour
        const limited = await rateLimiters.chatUpload(req)
        if (limited) return limited

        // Authenticate user session
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file || typeof file === "string") {
            return NextResponse.json({ message: "No file provided" }, { status: 400 })
        }

        // Strict file validation: MIME type + 5 MB size cap
        const fileCheck = validateImageFile(file, "Chat attachment")
        if (!fileCheck.valid) {
            return NextResponse.json({ message: fileCheck.message }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.\-_]/g, "")
        const publicId = `chat_attach_${Date.now()}_${cleanName}`

        console.log(`[Chat Upload] Uploading image attachment to Cloudinary: ${cleanName}`)
        const secureUrl = await uploadToCloudinary(
            buffer,
            "autoscrap/chats/attachments",
            publicId,
            "image"
        )
        console.log(`[Chat Upload] Upload completed successfully. URL: ${secureUrl}`)

        return NextResponse.json({
            success: true,
            url: secureUrl,
        })

    } catch (error: any) {
        console.error("[Chat Attachment Upload API] Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}
