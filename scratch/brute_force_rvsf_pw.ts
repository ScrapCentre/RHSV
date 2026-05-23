import * as fs from "fs";
import * as path from "path";

try {
  const envContent = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/['"]/g, "");
      process.env[key] = val;
    }
  }
} catch (e) {
  console.error("Failed to load .env.local manually:", e);
}

async function run() {
  const { default: connectToDatabase } = await import("../lib/db");
  const { default: RVSFUser } = await import("../models/RVSFUser");
  const { default: bcrypt } = await import("bcryptjs");

  await connectToDatabase();
  console.log("DB connected successfully");

  const candidates = [
    "xyz", "verifya", "rvsf", "rvsf01", "rvsf123", "admin", "password", "123456", "sc01",
    "RVSF44986", "RVSF52850", "partner.52850@rvsf.in", "rvsf01@gmail.com", "haryana", "partner"
  ];

  const users = await RVSFUser.find({}).select("+password").lean();
  for (const user of users) {
    console.log(`\nUser: ${user.name} (${user.rvsfId} / ${user.email})`);
    let found = false;
    for (const cand of candidates) {
      const match = await bcrypt.compare(cand, user.password);
      if (match) {
        console.log(`✅ FOUND PASSWORD: "${cand}"`);
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(`❌ No candidate password matched.`);
    }
  }

  process.exit(0);
}

run().catch(console.error);
