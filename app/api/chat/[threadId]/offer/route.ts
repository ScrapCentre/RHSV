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
        const { action, counterAmount } = body

        if (!action || !["accept", "reject", "counter"].includes(action)) {
            return NextResponse.json({ message: "Invalid action. Must be 'accept', 'reject', or 'counter'." }, { status: 400 })
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

        // 2. Find the active pending offer
        const activeOfferIndex = thread.messages.findIndex(
            (msg: any) =>
                msg.type === "offer" &&
                msg.offerStatus === "pending" &&
                msg.offerExpiresAt &&
                new Date(msg.offerExpiresAt) > now
        )

        if (activeOfferIndex === -1) {
            return NextResponse.json({ message: "No active pending offer found to take action on." }, { status: 400 })
        }

        const activeOffer = thread.messages[activeOfferIndex]
        const offerId = activeOffer._id ? activeOffer._id.toString() : null

        let systemMessageText = ""
        let newOfferMessage: any = null

        // 3. Process actions
        if (action === "accept") {
            // -- ACCEPT OFFER --
            activeOffer.offerStatus = "accepted"
            
            // Pin agreed price to the parent document
            thread.agreedPrice = activeOffer.offerAmount
            thread.agreedAt = now

            systemMessageText = `Both parties have agreed on ₹${activeOffer.offerAmount}. The deal will now proceed offline.`

        } else if (action === "reject") {
            // -- REJECT OFFER --
            activeOffer.offerStatus = "rejected"
            systemMessageText = "Offer was rejected."

        } else if (action === "counter") {
            // -- COUNTER OFFER --
            if (!counterAmount || isNaN(Number(counterAmount)) || Number(counterAmount) <= 0) {
                return NextResponse.json({ message: "A valid counter offer amount is required." }, { status: 400 })
            }

            activeOffer.offerStatus = "countered"
            
            // Construct a new pending offer replacing the old one
            const counterText = `Offer: ₹${counterAmount}`
            newOfferMessage = {
                sender: senderRole,
                message: counterText,
                isSystemMessage: false,
                createdAt: now,
                senderId,
                senderName,
                senderRole,
                content: counterText,
                type: "offer" as const,
                offerAmount: Number(counterAmount),
                offerStatus: "pending" as const,
                offerExpiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000)
            }
        }

        // 4. If system message needs to be posted (accept / reject)
        let savedSystemMessage: any = null
        if (systemMessageText) {
            const systemMsg = {
                sender: "system" as const,
                message: systemMessageText,
                isSystemMessage: true,
                createdAt: now,
                senderRole: "system" as const,
                type: "system" as const
            }
            thread.messages.push(systemMsg)
        }

        // If counter, append the new counter offer message
        if (newOfferMessage) {
            thread.messages.push(newOfferMessage)
        }

        // Save thread updates to database
        await thread.save()

        // 5. Broadcats updates via Pusher
        try {
            // Trigger status change for the active offer
            await pusherServer.trigger(threadId, "offer-updated", {
                messageId: offerId,
                offerStatus: activeOffer.offerStatus,
                agreedPrice: thread.agreedPrice,
                agreedAt: thread.agreedAt,
            })

            // Broadcast any newly appended messages (system notice or counter offer)
            if (systemMessageText) {
                const savedSys = thread.messages[thread.messages.length - 1]
                await pusherServer.trigger(threadId, "new-message", savedSys)
            } else if (newOfferMessage) {
                const savedCounter = thread.messages[thread.messages.length - 1]
                await pusherServer.trigger(threadId, "new-message", savedCounter)
            }
        } catch (pushErr) {
            console.error("Pusher negotiation update broadcast failed:", pushErr)
        }

        return NextResponse.json({
            success: true,
            message: "Offer processed successfully",
            agreedPrice: thread.agreedPrice,
            agreedAt: thread.agreedAt,
        })

    } catch (err: any) {
        console.error("[Offer Action API] Error:", err)
        return NextResponse.json(
            { message: err.message || "Internal server error" },
            { status: 500 }
        )
    }
}
