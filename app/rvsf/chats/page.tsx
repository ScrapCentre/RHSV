import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import ChatThread from "@/models/ChatThread"
import UnlockedLead from "@/models/UnlockedLead"
import Link from "next/link"
import { MessageSquare, Calendar, ArrowRight, User, Car, Pin } from "lucide-react"

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

            {/* Chats Listing */}
            {formattedChats.length === 0 ? (
                <div className="bg-white dark:bg-[#0E192D] rounded-3xl border border-gray-100 dark:border-slate-800 p-16 text-center space-y-4">
                    <MessageSquare className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No active chats found</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Accept leads from your active dashboard queue to unlock custom chat panels.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {formattedChats.map((chat) => (
                        <Link 
                            key={chat.id} 
                            href={`/rvsf/chat/${chat.id}`}
                            className="bg-white dark:bg-[#0E192D] border border-gray-100 dark:border-slate-800 hover:border-emerald-500/30 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all shadow-sm group hover:shadow-md"
                        >
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-blue-500" />
                                        {chat.customerName}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-700 font-light">•</span>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Car className="w-3.5 h-3.5 text-purple-500" />
                                        {chat.vehicleInfo}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-700 font-light">•</span>
                                    <span className="text-[10px] font-mono text-slate-400 font-medium tracking-tight uppercase">
                                        Lead: {chat.leadId.slice(-8)}
                                    </span>
                                    {chat.agreedPrice && (
                                        <span className="text-[9px] uppercase font-extrabold tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Pin className="w-2.5 h-2.5" /> ₹{chat.agreedPrice} Pinned
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xl italic">
                                    "{chat.lastMessage}"
                                </p>
                            </div>

                            <div className="flex items-center gap-4.5 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t border-slate-100 dark:border-slate-800 md:border-t-0">
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                    {new Date(chat.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </div>
                                <button className="inline-flex items-center gap-1 px-4 py-2 bg-slate-50 hover:bg-emerald-500 hover:text-white dark:bg-slate-900 dark:hover:bg-emerald-500 text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-all border border-slate-100 dark:border-slate-800 hover:border-transparent group-hover:translate-x-0.5">
                                    Open
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
