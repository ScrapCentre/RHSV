// engineering-design.md §6 — LeadState transition engine
// All API handlers must call transition() — never write tier directly.
import connectToDatabase from "@/lib/db"
import LeadState, { ILeadState } from "@/models/LeadState"

export type LeadTier = "tier1" | "tier2" | "tier3" | "triage" | "routed" | "rejected"

interface Transition {
  from: LeadTier | LeadTier[]
  to: LeadTier
  guard?: (lead: ILeadState) => boolean
}

const TRANSITIONS: Transition[] = [
  {
    from: "tier1",
    to:   "tier2",
    guard: (l) => !!l.phone && !!l.phoneVerifiedAt,
  },
  {
    from: "tier2",
    to:   "tier3",
    guard: (l) => l.photoUrls.length >= 1 && l.aadhaarConsent,
  },
  {
    from: "tier3",
    to:   "triage",
    guard: (l) => l.verificationStatus !== "pending",
  },
  {
    from: "triage",
    to:   "routed",
    guard: (l) => !!l.routing && l.routing !== "rejected",
  },
  {
    from: "triage",
    to:   "rejected",
  },
]

/**
 * Perform an allowed state transition on a LeadState document.
 * Throws if the transition is not allowed from the current tier,
 * or if a guard condition is not satisfied.
 */
export async function transition(
  leadId: string,
  to: LeadTier,
  updates: Partial<ILeadState>
): Promise<ILeadState> {
  await connectToDatabase()
  const lead = await LeadState.findById(leadId)
  if (!lead) throw new Error(`LeadState not found: ${leadId}`)

  const mergedState = { ...lead.toObject(), ...updates } as ILeadState

  const allowed = TRANSITIONS.find(t => {
    const fromMatch = Array.isArray(t.from)
      ? t.from.includes(lead.tier)
      : t.from === lead.tier
    if (!fromMatch || t.to !== to) return false
    if (t.guard && !t.guard(mergedState)) return false
    return true
  })

  if (!allowed) {
    throw new Error(`Invalid transition: ${lead.tier} → ${to} (guard failed or not in TRANSITIONS)`)
  }

  const updated = await LeadState.findByIdAndUpdate(
    leadId,
    { tier: to, ...updates },
    { new: true }
  )
  if (!updated) throw new Error(`LeadState update failed: ${leadId}`)
  return updated
}
