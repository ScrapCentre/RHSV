import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import ChatContainer from "@/components/admin/ChatContainer"
import { MessageSquare } from "lucide-react"

export const dynamic = "force-dynamic"

interface CustomerChatPageProps {
    params: Promise<{ threadId: string }>
}

export default async function CustomerChatPage({ params }: CustomerChatPageProps) {
    // 1. Authorize Customer
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect("/login")
    }

    const { threadId } = await params

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-32 pb-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header info */}
                <div className="flex items-center justify-between bg-white dark:bg-[#0E192D] p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Lead Negotiation & Chat</h1>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Real-time chat and official price negotiations with the RVSF Partner.</p>
                        </div>
                    </div>
                </div>

                {/* Chat Desk Container */}
                <ChatContainer role="customer" threadId={threadId} />
            </div>
        </div>
    )
}
