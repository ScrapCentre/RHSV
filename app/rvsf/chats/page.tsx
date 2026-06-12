import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import ChatThread from "@/models/ChatThread"
import UnlockedLead from "@/models/UnlockedLead"
import { MessageSquare } from "lucide-react"
import RvsfChatsListClient from "@/components/rvsf/RvsfChatsListClient"

export const dynamic = "force-dynamic"

export default async function RvsfChatsListPage() {
    // 1. Authorize RVSF Partner
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "rvsf") {
        redirect("/rvsf/login")
    }

    const rvsfId = (session.user as any).rvsfId
    await connectToDatabase()

    // 2. Fetch all chat threads for this RVSF
    const chatThreads = await ChatThread.find({ rvsfId })
        .sort({ updatedAt: -1 })
        .lean()

    // 3. Resolve customer details & vehicle info via bulk lookup of unlocked leads
    const leadIds = chatThreads.map((t: any) => t.leadId)
    const unlockedLeads = await UnlockedLead.find({
        rvsfId,
        leadId: { $in: leadIds }
    }).select("leadId customerName vehicleInfo").lean()

    const leadInfoMap: Record<string, { customerName: string, vehicleInfo: string }> = {}
    unlockedLeads.forEach((l: any) => {
        leadInfoMap[l.leadId] = {
            customerName: l.customerName || "Customer",
            vehicleInfo: l.vehicleInfo || "Vehicle Lead",
        }
    })

    // 4. Structure chat details with last message preview
    const formattedChats = chatThreads.map((t: any) => {
        const info = leadInfoMap[t.leadId] || { customerName: "Customer", vehicleInfo: "Vehicle Lead" }
        const lastMsg = t.messages && t.messages.length > 0 ? t.messages[t.messages.length - 1] : null
        
        let previewText = "No messages yet."
        if (lastMsg) {
            if (lastMsg.type === "image") {
                previewText = "📷 Image Attachment"
            } else {
                previewText = lastMsg.message || ""
            }
        }

        return {
            id: t._id.toString(),
            leadId: t.leadId,
            customerName: info.customerName,
            vehicleInfo: info.vehicleInfo,
            lastMessage: previewText,
            agreedPrice: t.agreedPrice || null,
            updatedAt: t.updatedAt.toISOString(),
        }
    })

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                        <MessageSquare className="w-6 h-6 text-emerald-500" />
                        My Conversations
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Active negotiation and messaging threads with vehicle owners.
                    </p>
                </div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <span className="text-gray-900 dark:text-white font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs">
                        {formattedChats.length}
                    </span>
                    Total Channels
                </div>
            </div>

            {/* Chats Listing Client Component */}
            <RvsfChatsListClient initialChats={formattedChats} />
        </div>
    )
}
