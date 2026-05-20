#!/usr/bin/env tsx
/**
 * scripts/migrate-v1-roles.ts — one-time migration of legacy role collections
 * into the unified v2 `User` table.
 *
 * - B2BPartner    → User{role:"rvsf_admin"}    (linked to a synthetic RVSF entity if none exists)
 * - ScrapCentreUser → User{role:"cc_operator"} (linked to a synthetic CC under Auraiya)
 * - Executive     → User{role:"executive"}
 *
 * The legacy collections stay readable (we never drop them; they keep
 * historical login traces). New writes go to User.
 *
 * Dry-run by default. Pass `--apply` to write.
 *
 * Usage:
 *   npx tsx scripts/migrate-v1-roles.ts
 *   npx tsx scripts/migrate-v1-roles.ts --apply
 */
import mongoose from "mongoose"
import connectToDatabase from "@/lib/db"
import User from "@/models/User"
import RVSF from "@/models/RVSF"
import CollectionCenter from "@/models/CollectionCenter"

const APPLY = process.argv.includes("--apply")

async function migrateExecutives() {
  const db = mongoose.connection.db
  if (!db) throw new Error("DB connection not ready")
  const cursor = db.collection("executives").find({})
  let scanned = 0, migrated = 0, skipped = 0
  while (await cursor.hasNext()) {
    const e: any = await cursor.next()
    scanned++
    if (!e?.email) { skipped++; continue }
    const existing = await User.findOne({ email: e.email })
    if (existing) { skipped++; continue }
    if (APPLY) {
      await User.create({
        name: e.name || e.email,
        email: e.email,
        password: e.password,  // already bcrypt-hashed in legacy
        role: "executive",
        provider: "credentials",
      })
    }
    migrated++
  }
  return { scanned, migrated, skipped }
}

async function migrateScrapCentreUsers() {
  const db = mongoose.connection.db
  if (!db) throw new Error("DB connection not ready")
  const auraiya = await RVSF.findOne({ slug: "auraiya-rvsf" })
  if (!auraiya) {
    console.log("  (no auraiya RVSF found; run seed-v2-test-users.ts first; skipping ScrapCentreUser migration)")
    return { scanned: 0, migrated: 0, skipped: 0 }
  }
  const primaryYard = await CollectionCenter.findOne({ rvsfId: auraiya._id, isPrimaryYard: true })

  const cursor = db.collection("scrapcentreusers").find({})
  let scanned = 0, migrated = 0, skipped = 0
  while (await cursor.hasNext()) {
    const u: any = await cursor.next()
    scanned++
    const email = u?.email
    if (!email) { skipped++; continue }
    const existing = await User.findOne({ email })
    if (existing) { skipped++; continue }
    if (APPLY) {
      await User.create({
        name: u.name || email,
        email,
        password: u.password,  // legacy may be plaintext OR bcrypt; carry over as-is
        role: "cc_operator",
        provider: "credentials",
        linkedRvsfId: auraiya._id,
        linkedCcId: primaryYard?._id,
        mustChangePassword: false,
      })
    }
    migrated++
  }
  return { scanned, migrated, skipped }
}

async function migrateB2BPartners() {
  const db = mongoose.connection.db
  if (!db) throw new Error("DB connection not ready")
  const cursor = db.collection("b2bpartners").find({})
  let scanned = 0, migrated = 0, skipped = 0
  while (await cursor.hasNext()) {
    const p: any = await cursor.next()
    scanned++
    const email = p?.email || `${p?.userId}@legacy-partner.scrapcentre.com`
    if (!email) { skipped++; continue }
    const existing = await User.findOne({ email })
    if (existing) { skipped++; continue }
    if (APPLY) {
      // Each legacy B2BPartner becomes a User{rvsf_admin}. We do NOT auto-create
      // a v2 RVSF entity for each one — that would require KYC docs we don't have.
      // Instead, leave linkedRvsfId null; admin onboards them properly later.
      await User.create({
        name: p.businessName || p.name || email,
        email,
        password: p.password,
        role: "rvsf_admin",
        provider: "credentials",
        // linkedRvsfId left null — admin must create a v2 RVSF and link manually
      })
    }
    migrated++
  }
  return { scanned, migrated, skipped }
}

async function main() {
  await connectToDatabase()
  console.log(`${APPLY ? "APPLY MODE" : "DRY-RUN"} — migrating legacy role collections...\n`)

  const e = await migrateExecutives()
  console.log(`  executives           scanned=${e.scanned}  migrated=${e.migrated}  skipped=${e.skipped}`)
  const s = await migrateScrapCentreUsers()
  console.log(`  scrapcentreusers     scanned=${s.scanned}  migrated=${s.migrated}  skipped=${s.skipped}`)
  const b = await migrateB2BPartners()
  console.log(`  b2bpartners          scanned=${b.scanned}  migrated=${b.migrated}  skipped=${b.skipped}`)

  console.log(`\n${APPLY ? "Applied" : "Would apply"} role migration. Re-run with --apply to commit.`)
  console.log("Note: B2BPartner-derived users have linkedRvsfId=null; admin must link them after creating proper v2 RVSF entities.")
  process.exit(0)
}

main().catch((err) => { console.error(err); process.exit(1) })
