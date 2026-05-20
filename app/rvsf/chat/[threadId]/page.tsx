// M19 — RVSF-side chat page with full v2 toolbar:
//   • RejectLeadDialog button (rvsf_admin only)
//   • RevealCustomerNumberDialog button
//   • DigiElvChecklist side panel
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import ChatThread from "@/components/chat/ChatThread"
import RejectLeadDialog from "@/components/rvsf/RejectLeadDialog"
import RevealCustomerNumberDialog from "@/components/rvsf/RevealCustomerNumberDialog"
import DigiElvChecklist from "@/components/digielv/DigiElvChecklist"

export default function RvsfChatPage() {
  const { data: session } = useSession()
  const params = useParams<{ threadId: string }>()
  const router = useRouter()
  const [leadMeta, setLeadMeta] = useState<any>(null)
  const [showReject, setShowReject] = useState(false)
  const [showReveal, setShowReveal] = useState(false)
  const [tab, setTab] = useState<"chat" | "digielv">("chat")

  useEffect(() => {
    fetch(`/api/marketplace/leads/${params.threadId}`)
      .then((r) => r.json())
      .then((d) => setLeadMeta(d.lead))
      .catch(() => {})
  }, [params.threadId])

  if (!session) return <p className="p-6">Please log in.</p>
  const role = ((session.user as any).role ?? "rvsf_executive") as "rvsf_admin" | "rvsf_executive"
  const isAdmin = role === "rvsf_admin"

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <Link href="/rvsf/marketplace" className="text-sm text-brand-gray-500 hover:text-brand-red">← Marketplace</Link>

      {/* Header with action buttons */}
      <div className="flex items-start justify-between mt-3 mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {leadMeta?.vehicle?.year ?? ""} {leadMeta?.vehicle?.make ?? "Lead"} {leadMeta?.vehicle?.model ?? ""}
          </h1>
          <p className="text-xs font-mono text-brand-gray-500">{leadMeta?.vehicle?.registrationNumber ?? params.threadId}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReveal(true)}
            className="border border-brand-red text-brand-red rounded px-3 py-2 text-sm hover:bg-brand-red-light"
            title="Unlock the customer's phone number to call them directly"
          >📞 Reveal customer's number</button>
          {isAdmin && leadMeta && (
            <button
              onClick={() => setShowReject(true)}
              className="border border-brand-gray-300 text-brand-gray-700 rounded px-3 py-2 text-sm hover:bg-brand-gray-100"
              title="Return this lead to the marketplace"
            >✕ Reject lead</button>
          )}
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex gap-2 border-b border-brand-gray-300 mb-4">
        {(["chat", "digielv"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium ${tab === t ? "border-b-2 border-brand-red text-brand-red" : "text-brand-gray-700"}`}
          >{t === "chat" ? "Chat" : "DigiELV checklist"}</button>
        ))}
      </div>

      {tab === "chat" ? (
        <ChatThread
          leadId={params.threadId}
          currentUserId={(session.user as any).id}
          currentUserRole={role}
        />
      ) : (
        <div className="card-base">
          <DigiElvChecklist leadId={params.threadId} audience="rvsf" />
        </div>
      )}

      {showReject && leadMeta && (
        <RejectLeadDialog
          open={showReject}
          onClose={() => setShowReject(false)}
          lead={{
            id: params.threadId,
            vehicleReg: leadMeta?.vehicle?.registrationNumber ?? "",
            unlockedAt: leadMeta?.unlock?.unlockedAt ?? new Date(),
            chatNonSystemMessageCount: 0,
            unlockAmountPaise: leadMeta?.unlock?.amountChargedPaise ?? 0,
            customerNumberRevealed: !!leadMeta?.customerNumberRevealed,
          }}
          onSuccess={(decision) => {
            alert(`Lead rejected. Refund decision: ${decision}`)
            router.push("/rvsf/marketplace")
          }}
        />
      )}

      {showReveal && (
        <RevealCustomerNumberDialog
          open={showReveal}
          onClose={() => setShowReveal(false)}
          leadId={params.threadId}
          alreadyRevealed={leadMeta?.customerNumberRevealed
            ? { atTime: leadMeta.customerNumberRevealed.atTime, phone: leadMeta?.customerPhone }
            : null}
        />
      )}
    </div>
  )
}
