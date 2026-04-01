import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Contact from "@/models/Contact"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, phone, subject, message } = body

        // Basic validation
        if (!name || !email || !phone || !subject || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

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

