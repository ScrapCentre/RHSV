import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const MONGODB_URI = "mongodb+srv://scrapcentre69_db_user:FMTSiCszPRoHDnmI@cluster0.4qzm4t3.mongodb.net/project"

async function run() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("DB connected")

    const email = "scrapcentreadmin@gmail.com"
    const pass = "scrapcentre@789"
    const hashed = await bcrypt.hash(pass, 12)

    const UserSchema = new mongoose.Schema({
      email: { type: String, unique: true },
      password: { type: String },
      role: { type: String },
      name: { type: String },
      provider: { type: String }
    }, { timestamps: true })

    const User = mongoose.models.User || mongoose.model("User", UserSchema)

    await User.findOneAndUpdate(
      { email },
      { 
        password: hashed, 
        role: "admin", 
        name: "Admin",
        provider: "credentials"
      },
      { upsert: true, new: true }
    )

    console.log("✅ Admin added/updated successfully.")
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
