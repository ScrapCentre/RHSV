#!/usr/bin/env tsx
/**
 * scripts/seed-demo-leads.ts — one-shot demo data for the v2 walkthrough.
 *
 * Thin CLI wrapper around `lib/services/demo/seed.ts`. The actual seed
 * logic is shared with the /api/admin/reseed-demo endpoint, so the founder
 * can re-seed from the browser via /admin/demo-leads without SSHing in.
 *
 * Idempotent: deletes any prior demo leads (customerName ^/Demo /) first.
 *
 * Usage: npx tsx scripts/seed-demo-leads.ts
 */
import { seedDemoLeads, DemoSeedPrerequisiteError, TEST_PASSWORD } from "@/lib/services/demo/seed"

async function main() {
  try {
    const result = await seedDemoLeads()

    if (result.cleanedUp) {
      console.log(`  ↻ cleaned up ${result.cleanedUp} prior demo leads`)
    }

    console.log("")
    console.log("✓ Demo data seeded")
    console.log("")
    console.log("Lead A (marketplace, unlock-ready)   — UP70AB1234 — Maruti Swift")
    console.log(`  /rvsf/marketplace/${result.leadAId}`)
    console.log("")
    console.log("Lead B (already-unlocked, active chat, open offer)")
    console.log(`  /rvsf/chat/${result.leadBId}     (login as partner.test)`)
    console.log(`  /me/chat/${result.leadBId}        (login as client.test)`)
    console.log(`  → has an open ₹14,500 offer from RVSF — customer can Accept/Counter/Reject`)
    console.log("")
    console.log("Lead C (rejected, refund pending admin review)")
    console.log(`  /admin/refund-review        (login as admin.test)`)
    console.log(`  → see 'Customer C — Hyundai i20' with auto-flagged WhatsApp + phone patterns`)
    console.log("")
    console.log(`Test users (shared password: ${TEST_PASSWORD}):`)
    console.log("  admin.test@scrapcentre.online   → admin")
    console.log("  client.test@scrapcentre.online  → client (use this for the customer-side demo)")
    console.log("  partner.test@scrapcentre.online → rvsf_admin")
    console.log("")
    console.log("Tip: browse /admin/demo-leads to see these same links in the UI.")
    console.log("")
    process.exit(0)
  } catch (err) {
    if (err instanceof DemoSeedPrerequisiteError) {
      console.error(err.message)
      process.exit(1)
    }
    throw err
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
