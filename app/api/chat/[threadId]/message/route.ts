import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import ChatThread from "@/models/ChatThread"
import { pusherServer } from "@/lib/pusher"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ threadId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { threadId } = await params
        const body = await request.json()
        const { content, type, offerAmount } = body

        if (!type || !["text", "image", "offer"].includes(type)) {
            return NextResponse.json({ message: "Invalid message type." }, { status: 400 })
        }

        if (type !== "offer" && (!content || content.trim().length === 0)) {
            return NextResponse.json({ message: "Message content is required." }, { status: 400 })
        }

        await connectToDatabase()

        // 1. Fetch thread and verify access
        const thread = await ChatThread.findById(threadId)
        if (!thread) {
            return NextResponse.json({ message: "Chat thread not found" }, { status: 404 })
        }

        const rvsfId = (session.user as any)?.rvsfId
        const userId = (session.user as any)?.id

        const isRvsfOwner = rvsfId && thread.rvsfId === rvsfId
        const isCustomerOwner = userId && thread.customerId === userId

        if (!isRvsfOwner && !isCustomerOwner) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const senderRole = isRvsfOwner ? "rvsf" : "customer"
        const senderName = session.user.name || (isRvsfOwner ? "RVSF Partner" : "Customer")
        const senderId = isRvsfOwner ? rvsfId : userId

        const now = new Date()

        // 2. Enforce negotiation validation rules
        if (type === "offer") {
            if (!offerAmount || isNaN(Number(offerAmount)) || Number(offerAmount) <= 0) {
                return NextResponse.json({ message: "A valid offer amount is required." }, { status: 400 })
            }

            // Assert only one active offer at a time
            const activeOfferExists = thread.messages.some(
                (msg: any) =>
                    msg.type === "offer" &&
                    msg.offerStatus === "pending" &&
                    msg.offerExpiresAt &&
                    new Date(msg.offerExpiresAt) > now
            )

            if (activeOfferExists) {
                return NextResponse.json(
                    { message: "An offer is already active. Please accept, counter, or reject it first." },
                    { status: 400 }
                )
            }
        }

        // 3. Construct new message subdocument
        const messageText = type === "offer" ? `Offer: ₹${offerAmount}` : content.trim()
        const newMessage: any = {
            sender: senderRole,
            message: messageText,
            isSystemMessage: false,
            createdAt: now,
            senderId,
            senderName,
            senderRole,
            content: messageText,
            type,
        }

        if (type === "offer") {
            newMessage.offerAmount = Number(offerAmount)
            newMessage.offerStatus = "pending"
            newMessage.offerExpiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours countdown
        }

        // 4. Save to MongoDB
        thread.messages.push(newMessage)
        await thread.save()

        // Retrieve the saved subdocument so we have the auto-generated Mongoose _id
        const savedMessage = thread.messages[thread.messages.length - 1]

        // 5. Broadcast real-time Pusher update
        try {
            await pusherServer.trigger(threadId, "new-message", savedMessage)
        } catch (pushErr) {
            console.error("Pusher message broadcast failed:", pushErr)
        }

        return NextResponse.json({
            success: true,
            message: savedMessage,
        })

    } catch (error: any) {
        console.error("[Send Message API] Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}
