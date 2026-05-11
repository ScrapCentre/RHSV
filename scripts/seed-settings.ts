// engineering-design.md §3.1 / §17 — Seeds mockConfig and leadExpiryDays Setting rows
// Idempotent: uses upsert. Safe to re-run.
import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not set in .env.local")
  process.exit(1)
}

const SETTINGS = [
  {
    key: "mockConfig",
    value: {
      mode: "success",
      services: {
        vahan:      "success",
        otp:        "success",
        digilocker: "success",
        vision:     "success",
        maps:       "success",
      }
    },
    description: "Mock service toggle. Per-service overrides take precedence over global mode. Modes: success | failure | random.",
  },
  {
    key: "leadExpiryDays",
    value: 14,
    description: "Number of days before a marketplace lead expires without a purchase.",
  },
]

async function run() {
  await mongoose.connect(MONGODB_URI!)
  console.log("Connected to MongoDB")

  const collection = mongoose.connection.collection("settings")

  for (const setting of SETTINGS) {
    await collection.updateOne(
      { key: setting.key },
      { $set: setting },
      { upsert: true }
    )
    console.log(`Upserted setting: ${setting.key}`)
  }

  console.log("Settings seeded successfully.")
  await mongoose.disconnect()
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
