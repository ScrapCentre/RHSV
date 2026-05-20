#!/usr/bin/env tsx
/**
 * scripts/create-v2-indexes.ts — idempotent index creation for all v2 collections.
 *
 * Mongoose creates indexes automatically the first time a model is registered,
 * but in production it's safer to materialise them explicitly. Run this once
 * after deploying the v2 fork to a fresh Mongo cluster.
 *
 * Usage: npx tsx scripts/create-v2-indexes.ts
 */
import connectToDatabase from "@/lib/db"
import User from "@/models/User"
import RVSF from "@/models/RVSF"
import CollectionCenter from "@/models/CollectionCenter"
import Lead from "@/models/Lead"
import LeadUnlock from "@/models/LeadUnlock"
import ChatThread from "@/models/ChatThread"
import ChatMessage from "@/models/ChatMessage"
import Payment from "@/models/Payment"
import DocumentRecord from "@/models/DocumentRecord"
import CalcSession from "@/models/CalcSession"
import ConfigSetting from "@/models/ConfigSetting"
import AuditLog from "@/models/AuditLog"
import Notification from "@/models/Notification"
import OtpAttempt from "@/models/OtpAttempt"
import RejectionEvent from "@/models/RejectionEvent"
import DistanceCache from "@/models/DistanceCache"
import TriageDecision from "@/models/TriageDecision"
import AntiHoardingAlert from "@/models/AntiHoardingAlert"

const COLLECTIONS = [
  ["users", User],
  ["rvsfs", RVSF],
  ["collectioncenters", CollectionCenter],
  ["leads", Lead],
  ["leadunlocks", LeadUnlock],
  ["chatthreads", ChatThread],
  ["chatmessages", ChatMessage],
  ["payments", Payment],
  ["documentrecords", DocumentRecord],
  ["calcsessions", CalcSession],
  ["configsettings", ConfigSetting],
  ["auditlogs", AuditLog],
  ["notifications", Notification],
  ["otpattempts", OtpAttempt],
  ["rejectionevents", RejectionEvent],
  ["distancecaches", DistanceCache],
  ["triagedecisions", TriageDecision],
  ["antihoardingalerts", AntiHoardingAlert],
] as const

async function main() {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PROD_INDEXES) {
    console.error("Refusing to run in production without ALLOW_PROD_INDEXES=1")
    process.exit(1)
  }
  await connectToDatabase()
  for (const [name, Model] of COLLECTIONS) {
    try {
      await (Model as any).createIndexes()
      console.log(`  ✓ ${name}: indexes synced`)
    } catch (err: any) {
      console.error(`  ✗ ${name}: ${err.message}`)
    }
  }
  console.log("Done.")
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
