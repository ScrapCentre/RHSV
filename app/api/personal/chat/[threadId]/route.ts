import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import PersonalChatThread from "@/models/PersonalChatThread"
import { pusherServer } from "@/lib/pusher"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ threadId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { threadId } = await params
        await connectToDatabase()

        const thread = await PersonalChatThread.findById(threadId)
        if (!thread) {
            return NextResponse.json({ message: "Chat thread not found" }, { status: 404 })
        }

        const partnerId = (session.user as any)?.partnerId
        const userId = (session.user as any)?.id

        const isPartnerOwner = partnerId && thread.partnerId === partnerId
        const isCustomerOwner = userId && thread.customerId === userId

        if (!isPartnerOwner && !isCustomerOwner) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        // --- Auto-expiry sweeping loop ---
        let threadUpdated = false
        const now = new Date()

        for (let i = 0; i < thread.messages.length; i++) {
            const msg = thread.messages[i]
            if (
                msg.type === "offer" &&
                msg.offerStatus === "pending" &&
                msg.offerExpiresAt &&
                new Date(msg.offerExpiresAt) < now
            ) {
                msg.offerStatus = "expired"
                threadUpdated = true

                // Append notification system message to log
                const systemMsg = {
                    sender: "system" as const,
                    message: "Offer expired.",
                    isSystemMessage: true,
                    createdAt: new Date(),
                    senderRole: "system" as const,
                    type: "system" as const,
                }
                
                thread.messages.push(systemMsg)

                // Dispatch real-time Pusher notify event
                try {
                    await pusherServer.trigger(threadId, "new-message", systemMsg)
                    await pusherServer.trigger(threadId, "offer-updated", {
                        messageId: msg._id ? msg._id.toString() : undefined,
                        offerStatus: "expired",
                    })
                } catch (pushErr) {
                    console.error("Pusher trigger failed for auto-expiry:", pushErr)
                }
            }
        }

        if (threadUpdated) {
            await thread.save()
            console.log(`[Auto-expiry] Dynamic check: Swept expired offers on personal thread ${threadId}`)
        }

        return NextResponse.json({
            success: true,
            thread,
            currentUser: {
                id: isPartnerOwner ? partnerId : userId,
                name: session.user.name,
                role: isPartnerOwner ? "partner" : "customer",
            }
        })

    } catch (err: any) {
        console.error("[Personal Chat Thread Fetch API] Error:", err)
        return NextResponse.json(
            { message: err.message || "Internal server error" },
            { status: 500 }
        )
    }
}
