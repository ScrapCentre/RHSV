import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import ChatContainer from "@/components/admin/ChatContainer"
import { MessageSquare } from "lucide-react"

export const dynamic = "force-dynamic"

interface ChatPageProps {
    params: Promise<{ threadId: string }>
}

export default async function RvsfChatPage({ params }: ChatPageProps) {
    // 1. Authorize RVSF
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "rvsf") {
        redirect("/rvsf/login")
    }

    const { threadId } = await params

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header info */}
            <div className="flex items-center justify-between bg-white dark:bg-[#0E192D] p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E31E24]/10 border border-[#E31E24]/20 flex items-center justify-center text-[#E31E24]">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Real-time Negotiation Desk</h1>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Direct messaging & instant price negotiation with the customer.</p>
                    </div>
                </div>
            </div>

            {/* Chat Desk Container */}
            <ChatContainer role="rvsf" threadId={threadId} />
        </div>
    )
}
