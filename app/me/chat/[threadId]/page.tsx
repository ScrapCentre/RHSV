// M12 — customer-side chat page (param naming retains "threadId" but lookup is by leadId)
"use client"

import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import ChatThread from "@/components/chat/ChatThread"
import Link from "next/link"

export default function CustomerChatPage() {
  const { data: session } = useSession()
  const params = useParams<{ threadId: string }>()
  if (!session) return <p className="p-6">Please log in.</p>
  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Link href="/me" className="text-sm text-brand-gray-500 hover:text-brand-red">← My leads</Link>
      <h1 className="text-2xl font-bold mt-3 mb-4">Conversation</h1>
      <ChatThread
        leadId={params.threadId}
        currentUserId={(session.user as any).id}
        currentUserRole="customer"
      />
    </div>
  )
}
