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

  // RVSF 1
  const rvsfId1 = "RVSF44986";
  const pass1 = "xyz";
  const user1 = await RVSFUser.findOne({ rvsfId: rvsfId1 }).select("+password").lean();
  if (user1) {
    const match = await bcrypt.compare(pass1, (user1 as any).password);
    console.log(`User1 (RVSF44986) password "xyz" match:`, match);
  } else {
    console.log("User1 not found");
  }

  // RVSF 2
  const rvsfId2 = "RVSF52850";
  const pass2 = "xyz"; // what is the password for RVSF52850? Let's try "xyz"
  const user2 = await RVSFUser.findOne({ rvsfId: rvsfId2 }).select("+password").lean();
  if (user2) {
    const match = await bcrypt.compare(pass2, (user2 as any).password);
    console.log(`User2 (RVSF52850) password "xyz" match:`, match);
  } else {
    console.log("User2 not found");
  }

  process.exit(0);
}

run().catch(console.error);
