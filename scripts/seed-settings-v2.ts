#!/usr/bin/env tsx
/**
 * scripts/seed-settings-v2.ts — seed the v2 ConfigSetting key/value table.
 *
 * Idempotent (upserts on `key`). Safe to re-run. Production-safe: only
 * inserts a key if it doesn't already exist; never overwrites admin edits.
 *
 * Usage: npx tsx scripts/seed-settings-v2.ts
 */
import connectToDatabase from "@/lib/db"
import ConfigSetting from "@/models/ConfigSetting"

const SETTINGS = [
  { key: "pricing.scrapPricePerKg",      value: 0.75,             description: "₹ per kg unlock fee — L16" },
  { key: "marketplace.defaultRadiusKm",  value: 200,              description: "Default RVSF marketplace radius — L50" },
  { key: "marketplace.minRadiusKm",      value: 50,               description: "Min radius slider value" },
  { key: "marketplace.maxRadiusKm",      value: 1000,             description: "Max radius slider value" },
  { key: "leads.staleHours",             value: 48,               description: "Hours after first visibility to alert — L28" },
  { key: "leads.expiryDays",             value: 14,               description: "Days to revive queue" },
  { key: "offers.expiryHours",           value: 48,               description: "Open offer expiry — L45" },
  { key: "weight.trueUpTolerancePct",    value: 15,               description: "±% before true-up fires — L30" },
  { key: "razorpay.feeAbsorbedPct",      value: 2,                description: "Razorpay fee absorbed by ScrapCentre — L31" },
  { key: "dsc.nudgeAfterHours",          value: 24,               description: "Hours pending DSC before RVSF nudge" },
  { key: "sla.pickupDays",               value: 7,                description: "Pickup SLA promise to customer" },
  { key: "sla.codInChatHours",           value: 48,               description: "COD-in-chat SLA after scrap completion" },
  { key: "sla.quoteResponseWindow",      value: "2 business hours", description: "Honest SLA copy — §25.21" },
  { key: "partnership.bannerEnabled",    value: false,            description: "Hide RHM partnership line on hero — L52" },
  { key: "refund.gracePeriodMinutes",    value: 60,               description: "Grace window for auto-refund — P01" },
  { key: "refund.quotaPerRvsfPer30Days", value: 3,                description: "Approved refunds before admin escalation" },
  { key: "refund.flaggedRegexes",        value: [
    { name: "phone_number_e164",    pattern: "\\+?91[6-9]\\d{9}" },
    { name: "phone_number_local",   pattern: "\\b[6-9]\\d{9}\\b" },
    { name: "wa_me_link",           pattern: "wa\\.me/\\d+" },
    { name: "whatsapp_link",        pattern: "(https?://)?(www\\.)?whatsapp\\.com" },
    { name: "whatsapp_keyword",     pattern: "\\bwhatsapp\\b" },
    { name: "email",                pattern: "[\\w.+-]+@[\\w.-]+\\.[a-z]{2,}" },
    { name: "off_platform_outside", pattern: "\\b(let'?s )?talk (outside|directly|off[- ]platform)\\b" },
    { name: "off_platform_call",    pattern: "\\bcall me (directly|on)\\b" },
    { name: "off_platform_my_num",  pattern: "\\bmy (whatsapp|number|phone)\\b" },
    { name: "off_platform_send",    pattern: "\\b(send|message) (to|me on) (whatsapp|gpay|paytm)\\b" },
  ], description: "Chat leakage scanner pattern set — §25.2" },
  { key: "pingPong.rejectionThreshold",  value: 3,                description: "Auto-flag after N rejections — L54" },
  { key: "mockConfig",                   value: {
    mode: "success",
    services: { vahan: "success", otp: "success", digilocker: "success", vision: "success", maps: "success" },
  }, description: "Per-service mock-vs-real toggles" },
]

async function main() {
  await connectToDatabase()
  let inserted = 0
  let skipped = 0
  for (const s of SETTINGS) {
    const existing = await ConfigSetting.findOne({ key: s.key })
    if (existing) {
      skipped++
      continue
    }
    await ConfigSetting.create({ key: s.key, value: s.value, description: s.description })
    inserted++
    console.log(`  ✓ seeded ${s.key}`)
  }
  console.log(`Done. Inserted ${inserted}; skipped ${skipped} (already present).`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
