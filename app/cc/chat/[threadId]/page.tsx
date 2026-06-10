import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import ChatContainer from "@/components/admin/ChatContainer"
import { MessageSquare } from "lucide-react"

export const dynamic = "force-dynamic"

interface ChatPageProps {
    params: Promise<{ threadId: string }>
}

export default async function CCChatPage({ params }: ChatPageProps) {
    // 1. Authorize CC Operator
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "cc_operator") {
        redirect("/cc/login")
    }

    const { threadId } = await params

    return (
        <div className="space-y-5 max-w-4xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 sm:p-5 rounded-2xl"
                style={{
                    background: "linear-gradient(135deg, #E31E24, #c01319)",
                    boxShadow: "0 4px 20px rgba(227,30,36,0.2)",
                }}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">CC Negotiation & Chat Desk</h1>
                        <p className="text-[11px] text-red-200 mt-0.5 hidden sm:block">Direct messaging and read-only negotiation timeline.</p>
                    </div>
                </div>
            </div>

            {/* Chat Desk Container */}
            <ChatContainer role="partner" threadId={threadId} disableNegotiation={true} />
        </div>
    )
}
