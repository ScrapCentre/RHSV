// M19 — Customer-side chat page with DigiELV side panel.
"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import ChatThread from "@/components/chat/ChatThread"
import DigiElvChecklist from "@/components/digielv/DigiElvChecklist"
import Link from "next/link"

export default function CustomerChatPage() {
  const { data: session } = useSession()
  const params = useParams<{ threadId: string }>()
  const [tab, setTab] = useState<"chat" | "digielv">("chat")

  if (!session) return <p className="p-6">Please log in.</p>

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Link href="/me" className="text-sm text-brand-gray-500 hover:text-brand-red">← My leads</Link>
      <h1 className="text-2xl font-bold mt-3 mb-4">Conversation with your RVSF</h1>

      <div className="flex gap-2 border-b border-brand-gray-300 mb-4">
        {(["chat", "digielv"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium ${tab === t ? "border-b-2 border-brand-red text-brand-red" : "text-brand-gray-700"}`}
          >{t === "chat" ? "Chat" : "Your scrap & sell journey"}</button>
        ))}
      </div>

      {tab === "chat" ? (
        <ChatThread
          leadId={params.threadId}
          currentUserId={(session.user as any).id}
          currentUserRole="customer"
        />
      ) : (
        <div className="card-base">
          <DigiElvChecklist leadId={params.threadId} audience="customer" />
        </div>
      )}
    </div>
  )
}
