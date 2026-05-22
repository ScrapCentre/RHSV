#!/usr/bin/env tsx
/**
 * scripts/seed-legacy-novalytix-creds.ts
 *
 * Re-seeds the five legacy Novalytix test creds that NOVALYTIX-TEST-CREDENTIALS.md
 * + NOVALYTIX-DEMO-GUIDE.md document as working but the E2E walker confirmed
 * actually fail on the live deploy. Founder approved a 1:1 re-seed with the
 * documented (weak) passwords on 2026-05-21 so Novalytix's own test workflows
 * keep functioning during the v2 transition.
 *
 *   sc01@gmail.com / sc01                      → User (admin)
 *   cc01           / cc01                      → ScrapCentreUser (loginId)
 *   rvsf01@gmail.com / rvsf01                  → RVSFUser  (rvsfId=RVSF01)
 *   ex01@gmail.com / ex01                      → Executive
 *   scrapcentreadmin@gmail.com / scrapcentre@789 → User (admin)
 *
 * Safe to re-run. Each block upserts. Refuses to run in production without
 * ALLOW_PROD_SEED=1 (same gate as seed-v2-test-users.ts).
 */
import bcrypt from "bcryptjs"
import connectToDatabase from "@/lib/db"
import User from "@/models/User"
import ScrapCentreUser from "@/models/ScrapCentreUser"
import RVSFUser from "@/models/RVSFUser"
import Executive from "@/models/Executive"

async function upsertUser(email: string, pwd: string, role: string, name: string) {
  const hashed = await bcrypt.hash(pwd, 10)
  const existing = await User.findOne({ email })
  if (existing) {
    existing.password = hashed
    existing.role = role as any
    existing.name = name
    await existing.save()
    console.log(`  ↻ User updated: ${email} (role=${role})`)
  } else {
    await User.create({ email, password: hashed, role, name, provider: "credentials" })
    console.log(`  ✓ User seeded:  ${email} (role=${role})`)
  }
}

async function upsertScrapCentreUser(loginId: string, pwd: string) {
  const hashed = await bcrypt.hash(pwd, 10)
  const existing = await ScrapCentreUser.findOne({ loginId })
  if (existing) {
    (existing as any).password = hashed
    await existing.save()
    console.log(`  ↻ ScrapCentreUser updated: ${loginId}`)
  } else {
    await ScrapCentreUser.create({
      loginId,
      email: `${loginId}@scrapcentre.com`,
      password: hashed,
      name: `Legacy CC ${loginId}`,
    } as any)
    console.log(`  ✓ ScrapCentreUser seeded:  ${loginId}`)
  }
}

async function upsertRvsfUser(rvsfId: string, email: string, pwd: string) {
  const hashed = await bcrypt.hash(pwd, 10)
  const existing = await RVSFUser.findOne({ $or: [{ rvsfId }, { email }] })
  if (existing) {
    (existing as any).password = hashed
    ;(existing as any).rvsfId = rvsfId
    ;(existing as any).email = email
    await existing.save()
    console.log(`  ↻ RVSFUser updated: ${rvsfId} / ${email}`)
  } else {
    await RVSFUser.create({
      rvsfId,
      email,
      password: hashed,
      role: "rvsf",
      name: `Legacy RVSF ${rvsfId}`,
    } as any)
    console.log(`  ✓ RVSFUser seeded:  ${rvsfId} / ${email}`)
  }
}

async function upsertExecutive(email: string, pwd: string) {
  const hashed = await bcrypt.hash(pwd, 10)
  const existing = await Executive.findOne({ email })
  if (existing) {
    (existing as any).password = hashed
    await existing.save()
    console.log(`  ↻ Executive updated: ${email}`)
  } else {
    await Executive.create({
      email,
      password: hashed,
      name: "Legacy Executive",
    } as any)
    console.log(`  ✓ Executive seeded:  ${email}`)
  }
}

async function main() {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PROD_SEED) {
    console.error("Refusing to re-seed legacy creds in production. Set ALLOW_PROD_SEED=1 to override.")
    process.exit(1)
  }
  await connectToDatabase()
  console.log("Re-seeding the five legacy Novalytix test creds…")
  await upsertUser("sc01@gmail.com", "sc01", "admin", "Legacy sc01 (admin)")
  await upsertScrapCentreUser("cc01", "cc01")
  await upsertRvsfUser("RVSF01", "rvsf01@gmail.com", "rvsf01")
  await upsertExecutive("ex01@gmail.com", "ex01")
  await upsertUser("scrapcentreadmin@gmail.com", "scrapcentre@789", "admin", "Legacy ScrapCentre Admin")
  console.log("\nDone. All five legacy creds restored to documented passwords.")
  process.exit(0)
}

main().catch((err) => { console.error(err); process.exit(1) })
