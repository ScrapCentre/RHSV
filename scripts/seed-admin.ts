import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// User Schema (matching models/User.ts)
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: false },
    role: { type: String, enum: ["client", "admin", "b2b"], default: "client" },
    provider: { type: String, default: "credentials" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ Connected.");

    const email = "scrapcentreadmin@gmail.com";
    const password = "scrapcentre@789";
    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`Updating existing admin: ${email}`);
      await User.updateOne(
        { email },
        {
          $set: {
            password: hashedPassword,
            role: "admin",
            provider: "credentials",
            name: "Scrap Centre Admin"
          },
        }
      );
      console.log("✅ Admin password and role updated successfully.");
    } else {
      console.log(`Creating new admin user: ${email}`);
      const newAdmin = new User({
        name: "Scrap Centre Admin",
        email,
        password: hashedPassword,
        role: "admin",
        provider: "credentials",
      });
      await newAdmin.save();
      console.log("✅ Admin user created successfully.");
    }

    await mongoose.disconnect();
    console.log("Disconnected from database.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
