// POST /api/admin/reseed-demo — runs the demo-data seed in-process so the
// founder can re-seed from the browser via /admin/demo-leads instead of
// SSHing to VM 221 to run `npx tsx scripts/seed-demo-leads.ts`.
//
// Admin-only. Idempotent — the underlying seed wipes prior demo leads first.
//
// P0 SAFETY GUARDS (added 2026-05-22 after independent reviewer flagged a
// "one misclick wipes real leads" footgun):
//
//   1. The seed itself (lib/services/demo/seed.ts) now refuses to run in
//      production unless ALLOW_PROD_SEED=1 — so even if this handler is
//      tricked into running, prod-safe.
//
//   2. This handler additionally requires the request body to include a
//      verbatim confirmation string so an admin can't accidentally drop
//      leads by clicking a stray button or via a CSRF-style replay. The
//      browser UI prompts the founder before sending it.
//
// Returns:
//   400 — missing / wrong `confirm` string
//   401 / 403 — non-admin (via withAuth middleware)
//   409 — prerequisite missing (e.g. seed-v2-test-users.ts hasn't been run)
//   503 — production guard blocked the seed (ALLOW_PROD_SEED not set)
//   200 — seed ran; returns the new lead IDs
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import {
  seedDemoLeads,
  DemoSeedPrerequisiteError,
  DemoSeedProductionGuardError,
} from "@/lib/services/demo/seed"

// Verbatim string the client must POST in `{confirm: "…"}` to actually run
// the destructive re-seed. Kept here (not in seed.ts) because it's purely a
// transport-layer guard for the browser button — the seed function itself
// has its own ALLOW_PROD_SEED guard for CLI / scripted callers.
export const RESEED_CONFIRM_STRING =
  "I understand this destroys leads matching /^Demo Customer / pattern"

export const POST = withAuth(["admin"], async (req, _ctx) => {
  // Parse body for the confirm token. We accept either an explicit JSON
  // body with {confirm: "..."} or reject — we deliberately do NOT default
  // to "missing body = ok" because that's exactly the footgun we're closing.
  let body: any = null
  try {
    body = await req.json()
  } catch {
    // No body or invalid JSON — fall through to the confirm-string check
    // which will reject with a helpful error.
  }
  if (!body || body.confirm !== RESEED_CONFIRM_STRING) {
    return NextResponse.json(
      {
        error:
          "Missing or invalid confirm string. POST { \"confirm\": \"" +
          RESEED_CONFIRM_STRING +
          "\" } to acknowledge that this will destroy all leads matching the demo-customer regex.",
        requiredConfirmString: RESEED_CONFIRM_STRING,
      },
      { status: 400 }
    )
  }

  try {
    const result = await seedDemoLeads()
    return NextResponse.json({
      ok: true,
      cleanedUp: result.cleanedUp,
      leadAId: result.leadAId,
      leadBId: result.leadBId,
      leadCId: result.leadCId,
      rvsfDisplayName: result.rvsfDisplayName,
    })
  } catch (err: any) {
    if (err instanceof DemoSeedProductionGuardError) {
      // Surface the production guard distinctly so the UI can tell the
      // founder this is a deployment-env issue, not a code bug.
      return NextResponse.json({ error: err.message }, { status: 503 })
    }
    if (err instanceof DemoSeedPrerequisiteError) {
      return NextResponse.json({ error: err.message }, { status: 409 })
    }
    console.error("[reseed-demo] failed:", err)
    return NextResponse.json({ error: err?.message ?? "Seed failed" }, { status: 500 })
  }
})
