// GET /api/leads/[id]/view — hydrated single-lead view for the customer-side
// detail page (/me/lead/[id]) and admin override.
//
// Returns the Lead doc plus everything a customer needs to render their
// lead's home page in one round trip:
//   - lead       — the canonical Lead document
//   - rvsf       — display info for the unlocking RVSF (name + city), or null
//   - unlock     — LeadUnlock ledger row (sanitised — strips Razorpay IDs)
//   - thread     — active ChatThread summary (or null)
//   - activeOffer — open OfferBubble from the thread (or null) — drives the
//                   Accept/Counter/Reject card on the detail page
//   - documents  — DocumentRecords (COD/CVS/KYC/etc.) for this lead
//   - recentMessages — last 8 chat events (system + offer only) so the
//                      activity timeline can show ordering
//
// Auth: client owner OR admin. Any other role -> 403 (not 401 — they ARE
// authed, just not this lead's customer). Unauth -> 401 via withAuth.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import { validateObjectId } from "@/lib/middleware/objectId"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import LeadUnlock from "@/models/LeadUnlock"
import ChatThread from "@/models/ChatThread"
import ChatMessage from "@/models/ChatMessage"
import DocumentRecord from "@/models/DocumentRecord"
import RVSF from "@/models/RVSF"
import AuditLog from "@/models/AuditLog"

export const GET = withAuth(
  ["client", "admin", "rvsf_admin", "rvsf_executive", "cc_operator", "executive", "scrapcentre", "rvsf", "partner"],
  async (req, { user }) => {
    await connectToDatabase()
    const url = new URL(req.url)
    const segments = url.pathname.split("/")
    // /api/leads/<id>/view
    const leadId = segments[segments.length - 2]

    const bad = validateObjectId(leadId, "leadId")
    if (bad) return bad

    const lead = await Lead.findById(leadId).lean() as any
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Ownership check — spec is explicit: client owner OR admin only.
    // Other authed roles (RVSF, CC operator, executive) get 403 from this
    // endpoint because it shows customer-side data. RVSF/CC have their own
    // endpoints for the same lead.
    const isOwner = user.role === "client" && lead.customerUserId?.toString() === user.id
    const isAdmin = user.role === "admin"
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // ── Hydrate associated docs in parallel ──
    const [thread, unlock, documents] = await Promise.all([
      ChatThread.findOne({ leadId: lead._id, status: "active" }).lean() as any,
      lead.unlock?.leadUnlockId
        ? LeadUnlock.findById(lead.unlock.leadUnlockId).lean() as any
        : Promise.resolve(null),
      DocumentRecord.find({ leadId: lead._id }).sort({ createdAt: -1 }).lean(),
    ])

    // RVSF display info (only if unlock happened)
    const rvsfId = lead.unlock?.unlockedByRvsfId
    const rvsf = rvsfId
      ? await RVSF.findById(rvsfId).select("displayName legalName address.city").lean() as any
      : null

    // Active offer (open OfferBubble in the active thread) — drives the
    // detail page's "Accept / Counter / Reject" card.
    let activeOffer: any = null
    let recentMessages: any[] = []
    if (thread) {
      activeOffer = await ChatMessage.findOne({
        threadId: thread._id,
        type: "offer",
        "offer.status": "open",
      }).sort({ createdAt: -1 }).lean() as any

      // Last 8 system_event / offer messages — feeds the activity timeline.
      // Skip text/image/pdf — those belong in the chat view, not the
      // customer's summary timeline.
      recentMessages = await ChatMessage.find({
        threadId: thread._id,
        type: { $in: ["system_event", "offer"] },
      }).sort({ createdAt: -1 }).limit(8).lean()
    }

    // Recent state-change audit log entries — chronological "what happened"
    // feed. Keep payload light: action + when.
    const audit = await AuditLog.find({
      targetCollection: "leads",
      targetId: lead._id,
    }).sort({ createdAt: -1 }).limit(10).lean()

    // ── Sanitise outbound ──
    const safeLead = {
      _id: lead._id.toString(),
      state: lead.state,
      flowType: lead.flowType,
      quality: lead.quality,
      vehicle: lead.vehicle,
      pickupAddress: lead.pickupAddress,
      pickupOrDrop: lead.pickupOrDrop,
      calc: lead.calc,
      agreedPrice: lead.agreedPrice
        ? {
            amountPaise: lead.agreedPrice.amountPaise,
            acceptedAt: lead.agreedPrice.acceptedAt,
            acceptedByRole: lead.agreedPrice.acceptedByRole,
          }
        : null,
      marketplaceVisibleAt: lead.marketplaceVisibleAt,
      scrapCompletedAt: lead.scrapCompletedAt,
      closedAt: lead.closedAt,
      closedReason: lead.closedReason,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      // Whether RVSF has been allowed to see customer phone yet (founder
      // rule 2026-05-20). Only expose the boolean — never the actor id.
      customerNumberRevealed: !!lead.customerNumberRevealed,
    }

    const safeUnlock = unlock
      ? {
          _id: unlock._id.toString(),
          status: unlock.status,
          amountPaise: unlock.baseAmountPaise,
          weightKg: unlock.weightKgAtUnlock,
          unlockedAt: lead.unlock?.unlockedAt,
          trueUpStatus: unlock.trueUp?.settledAt ? "settled" : (unlock.trueUp ? "pending" : null),
          // Deliberately strip razorpayOrderId / razorpayPaymentId — customer
          // doesn't need to see Razorpay IDs and they can leak info in a
          // screenshot.
        }
      : null

    const safeThread = thread
      ? {
          _id: thread._id.toString(),
          status: thread.status,
          lastMessageAt: thread.lastMessageAt,
          unreadByCustomer: thread.unreadByCustomer ?? 0,
          pinnedOfferAmountPaise: thread.pinnedOfferAmountPaise ?? null,
        }
      : null

    const safeRvsf = rvsf
      ? {
          _id: rvsf._id.toString(),
          displayName: rvsf.displayName ?? rvsf.legalName,
          city: rvsf.address?.city ?? null,
        }
      : null

    const safeActiveOffer = activeOffer
      ? {
          _id: activeOffer._id.toString(),
          amountPaise: activeOffer.offer.amountPaise,
          actor: activeOffer.offer.actor,            // "customer" | "rvsf"
          expiresAt: activeOffer.offer.expiresAt,
          postedAt: activeOffer.createdAt,
          // The customer can only Accept offers FROM the rvsf — they can't
          // self-accept (back-end enforces this too).
          canAct: activeOffer.offer.actor === "rvsf",
        }
      : null

    const safeDocuments = (documents as any[]).map((d) => ({
      _id: d._id.toString(),
      kind: d.kind,
      mime: d.mime,
      sizeBytes: d.sizeBytes,
      url: d.cloudinaryUrl,
      dscSigned: !!d.dscSigned,
      cdNumber: d.cdNumber ?? null,
      createdAt: d.createdAt,
    }))

    const safeMessages = (recentMessages as any[]).map((m) => ({
      _id: m._id.toString(),
      type: m.type,
      text: m.text ?? null,
      senderRole: m.senderRole,
      offerStatus: m.offer?.status ?? null,
      offerAmountPaise: m.offer?.amountPaise ?? null,
      createdAt: m.createdAt,
    }))

    const safeAudit = (audit as any[]).map((a) => ({
      action: a.action,
      createdAt: a.createdAt,
    }))

    return NextResponse.json({
      lead: safeLead,
      rvsf: safeRvsf,
      unlock: safeUnlock,
      thread: safeThread,
      activeOffer: safeActiveOffer,
      documents: safeDocuments,
      recentMessages: safeMessages,
      audit: safeAudit,
    })
  }
)
