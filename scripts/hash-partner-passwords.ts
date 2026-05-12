// engineering-design.md §11 / §17 — One-shot B2BPartner password migration
// Run ONCE before deploying the plaintext-fallback removal in lib/auth.ts
// Safe to re-run: skips already-hashed passwords (startsWith "$2")
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not set in .env.local")
  process.exit(1)
}

async function run() {
  await mongoose.connect(MONGODB_URI!)
  console.log("Connected to MongoDB")

  const collection = mongoose.connection.collection("b2bpartner")
  const docs = await collection.find({}).toArray()

  let hashed = 0
  let skipped = 0

  for (const doc of docs) {
    const pw = doc.password as string | undefined
    if (!pw) { skipped++; continue }
    if (pw.startsWith("$2")) { skipped++; continue }  // already bcrypt

    const hashedPw = await bcrypt.hash(pw, 12)
    await collection.updateOne({ _id: doc._id }, { $set: { password: hashedPw } })
    console.log(`Hashed password for partner: ${doc.userId ?? doc._id}`)
    hashed++
  }

  console.log(`Done. Hashed: ${hashed}, Skipped (already hashed or empty): ${skipped}`)
  await mongoose.disconnect()
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
