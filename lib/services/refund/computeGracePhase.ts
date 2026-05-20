/**
 * Refund grace-phase computation — PURE FUNCTION (no DB, no clock reads).
 *
 * Implements the THREE-CONDITION refund model locked 2026-05-20:
 *   1. customerNumberRevealed != null  → admin_pending (NEVER auto-refund)
 *   2. ELSE within grace window AND zero non-system messages  → auto_full
 *   3. ELSE  → admin_pending (engaged-window — admin reviews)
 *
 * All time inputs are injected (no `Date.now()` or `new Date()` calls),
 * so this is fully deterministic and time-mockable in CI per QA §4.
 *
 * Used by:
 *   - POST /api/leads/[id]/reject  (the reject handler)
 *   - <RejectLeadDialog>  (client-side preview of refund eligibility BEFORE the user commits)
 */

export type GracePhaseDecision = {
  eligible: boolean
  reason: "number_revealed" | "engaged_phase" | "grace_phase"
}

export type ComputeGracePhaseArgs = {
  customerNumberRevealed: { atTime: Date } | null | undefined
  unlockedAt: Date
  nonSystemMessageCount: number
  gracePeriodMinutes: number
  now: Date
}

export function computeGracePhase(args: ComputeGracePhaseArgs): GracePhaseDecision {
  const { customerNumberRevealed, unlockedAt, nonSystemMessageCount, gracePeriodMinutes, now } = args

  // Condition 1: number revealed → always admin-reviewed
  if (customerNumberRevealed != null) {
    return { eligible: false, reason: "number_revealed" }
  }

  // Condition 2: within grace window AND zero non-system messages
  const elapsedMs = now.getTime() - unlockedAt.getTime()
  const elapsedMinutes = elapsedMs / 60_000
  if (elapsedMinutes <= gracePeriodMinutes && nonSystemMessageCount === 0) {
    return { eligible: true, reason: "grace_phase" }
  }

  // Condition 3: engaged window
  return { eligible: false, reason: "engaged_phase" }
}
