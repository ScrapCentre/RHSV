/**
 * /me/lead/[id] — Customer lead detail page.
 *
 * Server component. Loads the Lead + LeadUnlock + active ChatThread +
 * DocumentRecords + recent activity directly (not via the public /view
 * endpoint — server-side DB calls skip the HTTP round-trip and cookie
 * forwarding headache). The /view endpoint stays available for the same
 * data set if any future client surface needs it.
 *
 * Layout:
 *   - Hero: vehicle reg + make/model + state badge
 *   - Stepper: Quote → Submitted → In marketplace → Unlocked → Negotiating → Pickup → Scrapped (+ Refund if applicable)
 *   - Active offer card (with Accept/Counter/Reject client island)
 *   - Quick links (chat, RVSF info)
 *   - Quote summary
 *   - Documents list (CD, CVS, weight slip, etc.)
 *   - Activity timeline (chat events + audit log, chronological)
 *   - Help "I need to change something" — opens contact-form drawer
 *
 * Auth: client owner OR admin only. Other authed roles -> notFound() (404,
 * doesn't leak existence). Unauth -> redirect to /login?from=/me/lead/<id>.
 */
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import mongoose from "mongoose"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import LeadUnlock from "@/models/LeadUnlock"
import ChatThread from "@/models/ChatThread"
import ChatMessage from "@/models/ChatMessage"
import DocumentRecord from "@/models/DocumentRecord"
import RVSF from "@/models/RVSF"
import AuditLog from "@/models/AuditLog"
import OfferActions from "@/components/me/OfferActions"
import LeadHelpForm from "@/components/me/LeadHelpForm"

export const dynamic = "force-dynamic"

// ── Stepper definition ──
// Each Lead.state is mapped to a numbered step. "Refund" only appears
// when the lead was rejected post-unlock; otherwise that step is hidden
// to keep the stepper from looking like 7/8 of the journey is left.
const STEPS = [
  { key: "calculator",  label: "Quote" },
  { key: "submitted",   label: "Submitted" },
  { key: "marketplace", label: "In marketplace" },
  { key: "unlocked",    label: "Unlocked" },
  { key: "negotiating", label: "Negotiating" },
  { key: "pickup",      label: "Pickup" },
  { key: "scrap",       label: "Scrapped" },
] as const

function stepIndexForState(state: string): number {
  switch (state) {
    case "created": return 0
    case "tier1_done":
    case "tier2_done":
    case "tier3_uploaded":
    case "triage_pending": return 1
    case "approved_auraiya":
    case "approved_marketplace":
    case "marketplace_visible": return 2
    case "unlocked":
    case "assigned_to_cc": return 3
    case "negotiating":
    case "cd_issued": return 4
    case "cvs_issued": return 5
    case "weight_settled":
    case "closed": return 6
    case "triage_rejected":
    case "rvsf_rejected":
    case "stale_alerted":
    case "expired": return -1  // off-track — handled separately
    default: return 0
  }
}

function stateLabel(state: string, hasOpenOffer: boolean): { text: string; tone: "neutral" | "active" | "success" | "warning" | "error" } {
  switch (state) {
    case "created":
    case "tier1_done":
    case "tier2_done":
    case "tier3_uploaded":   return { text: "Quote in progress", tone: "neutral" }
    case "triage_pending":   return { text: "Awaiting review", tone: "neutral" }
    case "approved_auraiya":
    case "approved_marketplace":
    case "marketplace_visible": return { text: "In marketplace", tone: "active" }
    case "unlocked":
    case "assigned_to_cc":   return { text: "RVSF assigned", tone: "active" }
    case "negotiating":      return { text: hasOpenOffer ? "Active offer" : "Negotiating", tone: "active" }
    case "cd_issued":        return { text: "CD issued", tone: "active" }
    case "cvs_issued":       return { text: "Pickup scheduled", tone: "active" }
    case "weight_settled":   return { text: "Weight settled", tone: "success" }
    case "closed":           return { text: "Closed", tone: "success" }
    case "triage_rejected":  return { text: "Couldn't list", tone: "error" }
    case "rvsf_rejected":    return { text: "RVSF returned — refund pending", tone: "warning" }
    case "stale_alerted":    return { text: "Inactive — needs attention", tone: "warning" }
    case "expired":          return { text: "Expired", tone: "error" }
    default: return { text: state, tone: "neutral" }
  }
}

function inr(paise?: number | null): string {
  if (paise == null) return "—"
  return `₹${(paise / 100).toLocaleString("en-IN")}`
}

function inrFromRupees(rupees?: number | null): string {
  if (rupees == null) return "—"
  return `₹${rupees.toLocaleString("en-IN")}`
}

function fmtDate(d?: Date | string | null): string {
  if (!d) return "—"
  try { return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) }
  catch { return String(d) }
}

function docKindLabel(kind: string): string {
  switch (kind) {
    case "cod": return "Certificate of Deposit (COD)"
    case "cvs": return "CVS / weight slip"
    case "customer_id": return "Your ID"
    case "customer_address": return "Address proof"
    case "rvsf_kyc": return "RVSF KYC"
    default: return kind.replace(/_/g, " ")
  }
}

function auditActionLabel(action: string): string | null {
  // Map raw action codes to customer-friendly text. Returning null hides
  // an entry (some actions are admin-only and don't belong in the
  // customer's timeline, e.g. "lead.adminAttentionFlag.set").
  switch (action) {
    case "lead.price.agreed":           return "Price agreed"
    case "lead.unlocked":               return "Unlocked by RVSF"
    case "lead.rejected.by_rvsf":       return "RVSF returned the lead — refund initiated"
    case "lead.rejected.by_admin":      return "Admin closed the lead"
    case "lead.customerNumber.revealed": return "Your phone number shared with RVSF"
    case "lead.refund.issued":          return "Refund issued"
    case "lead.weight.settled":         return "Weight reconciled"
    default:
      // Don't surface unknown admin actions to the customer.
      return null
  }
}

// ── Stepper component (server-rendered) ──
function Stepper({ activeIdx, isRefund }: { activeIdx: number; isRefund: boolean }) {
  const steps = isRefund
    ? [...STEPS, { key: "refund", label: "Refund" }]
    : STEPS
  // If activeIdx === -1 (off-track), highlight nothing forward of step 1.
  const renderIdx = activeIdx === -1 ? (isRefund ? steps.length - 1 : 1) : activeIdx

  return (
    <ol className="flex items-center gap-1 overflow-x-auto pb-2 -mx-2 px-2" aria-label="Lead progress">
      {steps.map((step, i) => {
        const done = i < renderIdx
        const current = i === renderIdx
        const tone = current
          ? "bg-brand-red text-white border-brand-red"
          : done
          ? "bg-status-success text-white border-status-success"
          : "bg-white text-brand-gray-500 border-brand-gray-300"
        return (
          <li key={step.key} className="flex items-center gap-1 shrink-0">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold ${tone}`}>
              {done ? "✓" : i + 1}
            </div>
            <span className={`text-xs ${current ? "font-bold text-brand-black" : done ? "text-brand-gray-700" : "text-brand-gray-500"}`}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-4 h-px ${done ? "bg-status-success" : "bg-brand-gray-300"}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function StateBadge({ tone, children }: { tone: "neutral" | "active" | "success" | "warning" | "error"; children: React.ReactNode }) {
  const cls = {
    neutral: "bg-brand-gray-100 text-brand-gray-700 border-brand-gray-300",
    active:  "bg-brand-red-xlight text-brand-red border-brand-red-light",
    success: "bg-[#ECFDF5] text-status-success border-[#A7F3D0]",
    warning: "bg-[#FFFBEB] text-status-warning border-[#FDE68A]",
    error:   "bg-brand-red-xlight text-status-error border-brand-red-light",
  }[tone]
  return (
    <span className={`inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${cls}`}>
      {children}
    </span>
  )
}

// ── Page ──
type PageProps = { params: Promise<{ id: string }> }

export default async function CustomerLeadDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect(`/login?from=/me/lead/${id}`)
  }
  const user = session.user as any

  // Cheap precheck — bail before hitting Mongo on a malformed id (matches
  // the API route's behaviour so the customer sees notFound, not 500).
  if (!/^[a-fA-F0-9]{24}$/.test(id) || !mongoose.Types.ObjectId.isValid(id)) {
    notFound()
  }

  await connectToDatabase()
  const lead = await Lead.findById(id).lean() as any
  if (!lead) notFound()

  const isOwner = user.role === "client" && lead.customerUserId?.toString() === user.id
  const isAdmin = user.role === "admin"
  if (!isOwner && !isAdmin) {
    // RVSF, CC operator, executive, etc. -> return 404 rather than 403 so
    // we don't leak "this lead exists but you can't see it". The /view API
    // endpoint returns the more honest 403 (the caller is already
    // authenticated; we're hiding the resource, not the auth state).
    notFound()
  }

  // Parallel fetch of associated docs.
  const [thread, unlock, documents, audit] = await Promise.all([
    ChatThread.findOne({ leadId: lead._id, status: "active" }).lean() as any,
    lead.unlock?.leadUnlockId
      ? LeadUnlock.findById(lead.unlock.leadUnlockId).lean() as any
      : Promise.resolve(null),
    DocumentRecord.find({ leadId: lead._id }).sort({ createdAt: -1 }).lean(),
    AuditLog.find({ targetCollection: "leads", targetId: lead._id }).sort({ createdAt: -1 }).limit(15).lean(),
  ])

  const rvsf = lead.unlock?.unlockedByRvsfId
    ? await RVSF.findById(lead.unlock.unlockedByRvsfId).select("displayName legalName address.city").lean() as any
    : null

  let activeOffer: any = null
  let recentMessages: any[] = []
  if (thread) {
    activeOffer = await ChatMessage.findOne({
      threadId: thread._id,
      type: "offer",
      "offer.status": "open",
    }).sort({ createdAt: -1 }).lean() as any
    recentMessages = await ChatMessage.find({
      threadId: thread._id,
      type: { $in: ["system_event", "offer"] },
    }).sort({ createdAt: -1 }).limit(8).lean()
  }

  const stepIdx = stepIndexForState(lead.state)
  const isRefund = lead.state === "rvsf_rejected" || (audit as any[]).some((a) => a.action === "lead.refund.issued")
  const badge = stateLabel(lead.state, !!activeOffer)
  const vehicleSummary = `${lead.vehicle?.registrationNumber ?? ""} — ${lead.vehicle?.make ?? ""} ${lead.vehicle?.model ?? ""}`.trim()

  // ── Merge audit + chat events into a single chronological timeline ──
  type TimelineEntry = { ts: Date; label: string; sub?: string }
  const timeline: TimelineEntry[] = []
  timeline.push({ ts: new Date(lead.createdAt), label: "Lead created", sub: "You submitted your scrap request" })
  if (lead.marketplaceVisibleAt) timeline.push({ ts: new Date(lead.marketplaceVisibleAt), label: "Listed in marketplace", sub: "Local RVSFs can now see your lead" })
  if (lead.unlock?.unlockedAt && rvsf) {
    timeline.push({
      ts: new Date(lead.unlock.unlockedAt),
      label: `Unlocked by ${rvsf.displayName ?? rvsf.legalName}`,
      sub: rvsf.address?.city ? `${rvsf.address.city} RVSF` : undefined,
    })
  }
  if (lead.agreedPrice?.acceptedAt) {
    timeline.push({
      ts: new Date(lead.agreedPrice.acceptedAt),
      label: `Price agreed: ${inr(lead.agreedPrice.amountPaise)}`,
    })
  }
  if (lead.scrapCompletedAt) timeline.push({ ts: new Date(lead.scrapCompletedAt), label: "Scrap completed" })
  if (lead.closedAt) timeline.push({ ts: new Date(lead.closedAt), label: `Lead closed`, sub: lead.closedReason })

  for (const m of recentMessages as any[]) {
    if (m.type === "offer") {
      const who = m.senderRole === "customer" ? "You" : "RVSF"
      const verb = m.offer?.status === "open" ? "posted" : m.offer?.status
      timeline.push({
        ts: new Date(m.createdAt),
        label: `${who} ${verb} an offer of ${inr(m.offer?.amountPaise)}`,
      })
    } else if (m.type === "system_event" && m.text) {
      timeline.push({ ts: new Date(m.createdAt), label: m.text })
    }
  }

  for (const a of audit as any[]) {
    const label = auditActionLabel(a.action)
    if (!label) continue
    timeline.push({ ts: new Date(a.createdAt), label })
  }

  // De-dup near-identical entries (e.g. price.agreed appears both as audit
  // + as lead.agreedPrice.acceptedAt) by collapsing same-label-within-2s.
  timeline.sort((a, b) => b.ts.getTime() - a.ts.getTime())
  const dedupedTimeline: TimelineEntry[] = []
  for (const e of timeline) {
    const last = dedupedTimeline[dedupedTimeline.length - 1]
    if (last && last.label === e.label && Math.abs(last.ts.getTime() - e.ts.getTime()) < 2000) continue
    dedupedTimeline.push(e)
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <div>
        <Link href="/me" className="text-sm text-brand-gray-500 hover:text-brand-red">← My leads</Link>
      </div>

      {/* ── Hero ── */}
      <header className="card-base">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-mono text-brand-gray-500 break-all">{lead.vehicle?.registrationNumber ?? "—"}</p>
            <h1 className="text-2xl font-bold mt-1 break-words">
              {lead.vehicle?.year ?? ""} {lead.vehicle?.make ?? ""} {lead.vehicle?.model ?? ""}
            </h1>
            <p className="text-xs text-brand-gray-500 mt-1">
              Submitted {fmtDate(lead.createdAt)}
            </p>
          </div>
          <div className="shrink-0">
            <StateBadge tone={badge.tone}>{badge.text}</StateBadge>
          </div>
        </div>

        <div className="mt-5">
          <Stepper activeIdx={stepIdx} isRefund={isRefund} />
        </div>
      </header>

      {/* ── Agreed price banner (top-of-page priority if exists) ── */}
      {lead.agreedPrice && (
        <div className="card-base bg-[#ECFDF5] border-[#A7F3D0]">
          <p className="text-xs uppercase tracking-wide text-status-success font-bold mb-1">Agreed price</p>
          <p className="text-3xl font-bold text-brand-black">{inr(lead.agreedPrice.amountPaise)}</p>
          <p className="text-sm text-brand-gray-700 mt-1">
            Accepted {fmtDate(lead.agreedPrice.acceptedAt)} — money + vehicle handover happens between you and the RVSF directly.
          </p>
        </div>
      )}

      {/* ── Active offer card ── */}
      {activeOffer && !lead.agreedPrice && (
        <section className="card-base border-2 border-brand-red">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-brand-red font-bold mb-1">
                {activeOffer.offer.actor === "rvsf" ? "Offer from RVSF" : "Your open offer"}
              </p>
              <p className="text-3xl font-bold">{inr(activeOffer.offer.amountPaise)}</p>
              {rvsf && (
                <p className="text-sm text-brand-gray-700 mt-1">
                  From <strong>{rvsf.displayName ?? rvsf.legalName}</strong>
                  {rvsf.address?.city && ` · ${rvsf.address.city}`}
                </p>
              )}
              <p className="text-xs text-brand-gray-500 mt-2">
                Posted {fmtDate(activeOffer.createdAt)} · expires {fmtDate(activeOffer.offer.expiresAt)}
              </p>
            </div>
          </div>
          <OfferActions
            messageId={String(activeOffer._id)}
            amountPaise={activeOffer.offer.amountPaise}
            canAct={activeOffer.offer.actor === "rvsf"}
          />
        </section>
      )}

      {/* ── Quick links ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {thread && (
          <Link href={`/me/chat/${lead._id}`} className="card-feature block">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-bold">Open chat</p>
                <p className="text-xs text-brand-gray-500 mt-1">
                  {rvsf ? `with ${rvsf.displayName ?? rvsf.legalName}` : "with your RVSF"}
                  {thread.unreadByCustomer > 0 && ` · ${thread.unreadByCustomer} new`}
                </p>
              </div>
              <span className="text-brand-red shrink-0 ml-2">→</span>
            </div>
          </Link>
        )}
        {rvsf && (
          <div className="card-base">
            <p className="font-bold">{rvsf.displayName ?? rvsf.legalName}</p>
            <p className="text-xs text-brand-gray-500 mt-1">{rvsf.address?.city ?? "RVSF"}</p>
            <p className="text-xs text-brand-gray-500 mt-2">
              Money + vehicle handover happens between you and them offline.
            </p>
          </div>
        )}
      </section>

      {/* ── Quote (calc) summary — always shown ── */}
      <section className="card-base">
        <h2 className="font-bold mb-3">Your quote</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-brand-gray-500">Scrap value (range)</p>
            <p className="font-bold">
              {inrFromRupees(lead.calc?.scrapValueLow)} – {inrFromRupees(lead.calc?.scrapValueHigh)}
            </p>
          </div>
          <div>
            <p className="text-xs text-brand-gray-500">Headline estimate</p>
            <p className="font-bold">{inrFromRupees(lead.calc?.scrapValueHeadline)}</p>
          </div>
          {lead.calc?.pickupCostEstimate != null && (
            <div>
              <p className="text-xs text-brand-gray-500">Pickup cost</p>
              <p className="font-bold">{inrFromRupees(lead.calc.pickupCostEstimate)}</p>
            </div>
          )}
          {lead.quality && (
            <div>
              <p className="text-xs text-brand-gray-500">Lead quality</p>
              <p className="font-bold capitalize">{lead.quality}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Documents ── */}
      <section className="card-base">
        <h2 className="font-bold mb-3">Documents</h2>
        {(!documents || (documents as any[]).length === 0) && (
          <p className="text-sm text-brand-gray-500">
            No documents yet. Your RVSF will upload the COD, CVS, and weight slip after pickup.
          </p>
        )}
        {(documents as any[]).length > 0 && (
          <ul className="space-y-2">
            {(documents as any[]).map((d) => (
              <li key={String(d._id)} className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0 border-brand-gray-300">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{docKindLabel(d.kind)}</p>
                  <p className="text-xs text-brand-gray-500">
                    {fmtDate(d.createdAt)}
                    {d.cdNumber && ` · CD #${d.cdNumber}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {d.dscSigned ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#ECFDF5] text-status-success border border-[#A7F3D0]">Signed</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-gray-100 text-brand-gray-700 border border-brand-gray-300">Pending sign</span>
                  )}
                  <a
                    href={d.cloudinaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-red hover:underline"
                  >
                    Open
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Activity timeline ── */}
      <section className="card-base">
        <h2 className="font-bold mb-3">Activity</h2>
        <ol className="space-y-3">
          {dedupedTimeline.map((e, i) => (
            <li key={i} className="flex gap-3">
              <div className="shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-brand-red" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{e.label}</p>
                {e.sub && <p className="text-xs text-brand-gray-500 mt-0.5">{e.sub}</p>}
                <p className="text-xs text-brand-gray-500 mt-0.5">{fmtDate(e.ts)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Help / contact ── */}
      <section>
        <LeadHelpForm
          leadId={String(lead._id)}
          defaultName={user.name ?? lead.customerName ?? ""}
          defaultEmail={user.email ?? lead.customerEmail ?? ""}
          defaultPhone={lead.customerPhone ?? ""}
          vehicleSummary={vehicleSummary || "your vehicle"}
        />
      </section>
    </div>
  )
}
