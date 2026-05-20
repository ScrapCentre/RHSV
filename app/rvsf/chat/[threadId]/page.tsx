// M12 — RVSF-side chat page
"use client"

import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import ChatThread from "@/components/chat/ChatThread"
import Link from "next/link"

export default function RvsfChatPage() {
  const { data: session } = useSession()
  const params = useParams<{ threadId: string }>()
  if (!session) return <p className="p-6">Please log in.</p>
  const role = ((session.user as any).role ?? "rvsf_executive") as "rvsf_admin" | "rvsf_executive"
  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Link href="/rvsf/marketplace" className="text-sm text-brand-gray-500 hover:text-brand-red">← Marketplace</Link>
      <h1 className="text-2xl font-bold mt-3 mb-4">Lead conversation</h1>
      <ChatThread
        leadId={params.threadId}
        currentUserId={(session.user as any).id}
        currentUserRole={role}
      />
    </div>
  )
}
