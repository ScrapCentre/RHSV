#!/usr/bin/env tsx
/**
 * scripts/migrate-v1-to-v2-leads.ts — one-time migration from the legacy
 * 4-collection v1 lead model into the unified v2 `Lead` collection.
 *
 * Reads:  valuations, sellvehicles, buyvehicles, exchangevehicles, wizardleads
 * Writes: leads (upserted by registrationNumber+phone+createdAt — idempotent)
 *
 * Dry-run by default. Pass `--apply` to actually write.
 *
 * Usage:
 *   npx tsx scripts/migrate-v1-to-v2-leads.ts            # dry-run, prints counts
 *   npx tsx scripts/migrate-v1-to-v2-leads.ts --apply    # writes for real
 */
import mongoose from "mongoose"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"

const APPLY = process.argv.includes("--apply")

// Map legacy "requestType" / model name → v2 flowType
function mapFlowType(model: string, requestType?: string): "scrap_only" | "scrap_plus_buy" | "buy_only" | "fleet" {
  if (model === "sellvehicles" || requestType === "sell") return "scrap_only"
  if (model === "exchangevehicles" || requestType === "exchange") return "scrap_plus_buy"
  if (model === "buyvehicles" || requestType === "buy") return "buy_only"
  if (model === "bulkoutsourcings" || requestType === "fleet") return "fleet"
  return "scrap_only" // default
}

function mapState(legacyStatus?: string): string {
  // Compress legacy v1 statuses into the v2 state enum.
  if (!legacyStatus) return "tier3_uploaded"
  const lower = legacyStatus.toLowerCase()
  if (lower.includes("approved") || lower === "approved_to_rvsf") return "approved_marketplace"
  if (lower.includes("rejected")) return "triage_rejected"
  if (lower.includes("completed") || lower.includes("scrapped")) return "closed"
  if (lower.includes("pickup")) return "negotiating"
  return "tier3_uploaded"
}

async function migrateCollection(collectionName: string, flowDefault: string) {
  const db = mongoose.connection.db
  if (!db) throw new Error("DB connection not ready")
  const cursor = db.collection(collectionName).find({})

  let scanned = 0, migrated = 0, skipped = 0
  while (await cursor.hasNext()) {
    const doc: any = await cursor.next()
    if (!doc) continue
    scanned++

    const regNumber = (doc.regNo || doc.registrationNumber || doc.vehicleNumber || "").toUpperCase()
    if (!regNumber) { skipped++; continue }

    const phone = doc.phone || doc.mobile || doc.contact || ""
    if (!phone) { skipped++; continue }

    // Idempotency key: same reg + phone + createdAt date → same v2 Lead
    const existing = await Lead.findOne({
      "vehicle.registrationNumber": regNumber,
      customerPhone: phone,
      createdAt: doc.createdAt,
    })
    if (existing) { skipped++; continue }

    const flowType = mapFlowType(collectionName, doc.requestType)
    const state = mapState(doc.status)

    const payload: any = {
      flowType,
      customerPhone: phone,
      customerName:  doc.name || doc.customerName,
      customerEmail: doc.email,
      vehicle: {
        class:              doc.vehicleType?.toUpperCase().replace("WHEELER", "W") || "4W",
        registrationNumber: regNumber,
        make:               doc.brand || doc.make || "Unknown",
        model:              doc.model || "Unknown",
        year:               Number(doc.year) || 2015,
        fuelType:           (doc.fuel || doc.fuelType || "petrol").toLowerCase(),
        state:              doc.state || regNumber.slice(0, 2),
        vahanWeightKg:      Number(doc.weight) || undefined,
      },
      calc: {
        scrapValueLow:      Math.floor((doc.estimatedValue || 0) * 0.85),
        scrapValueHigh:     Math.floor((doc.estimatedValue || 0) * 1.15),
        scrapValueHeadline: doc.estimatedValue || 0,
        pricePerKgUsed:     0.75,
        computedAt:         doc.createdAt || new Date(),
      },
      state,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }

    if (APPLY) {
      await Lead.create(payload)
    }
    migrated++
  }
  return { scanned, migrated, skipped }
}

async function main() {
  await connectToDatabase()
  console.log(`${APPLY ? "APPLY MODE" : "DRY-RUN"} — scanning legacy lead collections...\n`)

  const results: Record<string, any> = {}
  for (const coll of ["valuations", "sellvehicles", "buyvehicles", "exchangevehicles", "wizardleads", "bulkoutsourcings"]) {
    try {
      const r = await migrateCollection(coll, "scrap_only")
      results[coll] = r
      console.log(`  ${coll.padEnd(20)}  scanned=${r.scanned}  migrated=${r.migrated}  skipped=${r.skipped}`)
    } catch (err: any) {
      console.log(`  ${coll.padEnd(20)}  (collection not present or empty)`)
    }
  }

  console.log(`\n${APPLY ? "Applied" : "Would apply"} migration. Re-run with --apply to commit.`)
  process.exit(0)
}

main().catch((err) => { console.error(err); process.exit(1) })
