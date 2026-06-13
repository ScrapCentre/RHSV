import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import connectToDatabase from "@/lib/db"
import Contact from "@/models/Contact"
import { contactSchema, formatZodError } from "@/lib/validation"
import { rateLimiters } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
    try {
        // Rate limit: 10 submissions per IP per hour
        const limited = await rateLimiters.contact(req)
        if (limited) return limited

        const body = await req.json()

        // Validate all fields with strict rules
        const parsed = contactSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: formatZodError(parsed.error) },
                { status: 400 }
            )
        }

        const { name, email, phone, subject, message } = parsed.data

        await connectToDatabase()

        const newContact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message,
        })

        return NextResponse.json(
            { message: "Contact form submitted successfully", data: newContact },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error submitting contact form:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
