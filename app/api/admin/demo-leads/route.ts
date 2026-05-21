// GET /api/admin/demo-leads — surface the seeded "Demo *" leads so the founder
// can click straight into the relevant flow from /admin/demo-leads instead of
// SSHing to VM 221 and grepping journalctl for the seed script's printed IDs.
//
// Returns structured rows for the 3 canonical demo customers (A/B/C) — each
// with its own click-target paths — so the page stays a thin renderer.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import ChatThread from "@/models/ChatThread"
import RejectionEvent from "@/models/RejectionEvent"

type DemoRow = {
  leadId: string
  customerName: string
  vehicleLabel: string
  state: string
  links: { label: string; href: string; visibleToRoles: string[] }[]
  notes?: string
}

export const GET = withAuth(["admin"], async (_req, _ctx) => {
  await connectToDatabase()

  // Demo leads are tagged by the customerName prefix "Demo " from the seed
  // script. createdAt-desc so the freshest re-seed wins if duplicates exist.
  const leads = await Lead
    .find({ customerName: { $regex: /^Demo / } })
    .sort({ createdAt: -1 })
    .lean() as any[]

  // For each lead we surface the relevant links per the demo brief.
  const rows: DemoRow[] = leads.map((l) => {
    const id = l._id.toString()
    const v = l.vehicle ?? {}
    const vehicleLabel = `${v.year ?? ""} ${v.make ?? ""} ${v.model ?? ""}`.trim() || "Unknown vehicle"
    const name: string = l.customerName ?? "Demo"

    // Customer A — marketplace, unlock-ready
    if (name.includes("Customer A")) {
      return {
        leadId: id,
        customerName: name,
        vehicleLabel,
        state: l.state,
        links: [
          {
            label: "RVSF marketplace detail (unlock demo)",
            href: `/rvsf/marketplace/${id}`,
            visibleToRoles: ["rvsf_admin", "rvsf_executive"],
          },
        ],
        notes: "Login as partner.test to demo the unlock flow.",
      }
    }

    // Customer B — already unlocked, active chat with open offer
    if (name.includes("Customer B")) {
      return {
        leadId: id,
        customerName: name,
        vehicleLabel,
        state: l.state,
        links: [
          {
            label: "RVSF-side chat (login as partner.test)",
            href: `/rvsf/chat/${id}`,
            visibleToRoles: ["rvsf_admin", "rvsf_executive"],
          },
          {
            label: "Customer-side chat (login as client.test)",
            href: `/me/chat/${id}`,
            visibleToRoles: ["client"],
          },
        ],
        notes: "Open ₹14,500 offer from RVSF — customer can Accept / Counter / Reject.",
      }
    }

    // Customer C — rejected, refund pending
    if (name.includes("Customer C")) {
      return {
        leadId: id,
        customerName: name,
        vehicleLabel,
        state: l.state,
        links: [
          {
            label: "Admin refund-review queue",
            href: `/admin/refund-review`,
            visibleToRoles: ["admin"],
          },
        ],
        notes: "Auto-flagged WhatsApp + phone patterns; admin must approve / partial / deny refund.",
      }
    }

    // Fallback for any other Demo-* lead someone manually creates.
    return {
      leadId: id,
      customerName: name,
      vehicleLabel,
      state: l.state,
      links: [
        {
          label: "RVSF marketplace detail",
          href: `/rvsf/marketplace/${id}`,
          visibleToRoles: ["rvsf_admin", "rvsf_executive"],
        },
      ],
    }
  })

  // Side counters so the UI can show "1 active chat thread, 1 pending refund".
  const [activeThreadCount, pendingRefundCount] = await Promise.all([
    ChatThread.countDocuments({
      leadId: { $in: leads.map((l) => l._id) },
      status: "active",
    }),
    RejectionEvent.countDocuments({
      leadId: { $in: leads.map((l) => l._id) },
      refundDecision: { $in: ["admin_pending", "auto_full_but_refund_failed", "auto_denied_number_revealed"] },
    }),
  ])

  return NextResponse.json({
    count: rows.length,
    rows,
    sideCounters: {
      activeThreadCount,
      pendingRefundCount,
    },
  })
})
