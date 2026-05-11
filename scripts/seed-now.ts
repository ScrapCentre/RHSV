// engineering-design.md §13 / 07-tech-debt CRITICAL
// Hardcoded MongoDB URI replaced with process.env.MONGODB_URI (dotenv loaded from .env.local)
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not set. Add it to .env.local")
  process.exit(1)
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI!)
    console.log("DB connected")

    const email = "scrapcentreadmin@gmail.com"
    const pass  = process.env.ADMIN_PASSWORD ?? "scrapcentre@789"
    const hashed = await bcrypt.hash(pass, 12)

    const UserSchema = new mongoose.Schema({
      email:    { type: String, unique: true },
      password: { type: String },
      role:     { type: String },
      name:     { type: String },
      provider: { type: String }
    }, { timestamps: true })

    const User = mongoose.models.User || mongoose.model("User", UserSchema)

    await User.findOneAndUpdate(
      { email },
      { password: hashed, role: "admin", name: "Admin", provider: "credentials" },
      { upsert: true, new: true }
    )

    console.log("Admin added/updated successfully.")
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
