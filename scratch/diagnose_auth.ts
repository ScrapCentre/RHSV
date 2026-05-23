import * as fs from "fs";
import * as path from "path";

// Load env
try {
  const envContent = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = val;
    }
  }
} catch (e) {
  console.error("Failed to load .env.local:", e);
}

async function run() {
  console.log("=== DIAGNOSING ALL AUTH PROVIDERS ===\n");

  // Step 1: Test DB
  console.log("--- Step 1: Database Connection ---");
  const { default: connectToDatabase } = await import("../lib/db");
  await connectToDatabase();
  console.log("✅ DB connected\n");

  // Step 2: Test bcrypt
  console.log("--- Step 2: bcrypt test ---");
  const { default: bcrypt } = await import("bcryptjs");
  const testHash = await bcrypt.hash("test123", 10);
  const testMatch = await bcrypt.compare("test123", testHash);
  console.log(`bcrypt hash/compare works: ${testMatch}`);
  if (!testMatch) {
    console.error("❌ CRITICAL: bcrypt is broken!");
    process.exit(1);
  }
  console.log("✅ bcrypt OK\n");

  // Step 3: Test Admin (env-based)
  console.log("--- Step 3: Admin Login (env-based) ---");
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  console.log(`ADMIN_EMAIL loaded: ${!!adminEmail} (${adminEmail})`);
  console.log(`ADMIN_PASSWORD loaded: ${!!adminPassword} (${adminPassword})`);
  if (adminEmail && adminPassword) {
    const testInput = "scrapcentreadmin@gmail.com";
    const testPw = "scrapcentre@789";
    const emailMatch = testInput.toLowerCase() === adminEmail.toLowerCase();
    const pwMatch = testPw === adminPassword;
    console.log(`Email match: ${emailMatch}, Password match: ${pwMatch}`);
    if (emailMatch && pwMatch) {
      console.log("✅ Admin env login SHOULD work\n");
    } else {
      console.log("❌ Admin env login will FAIL\n");
    }
  }

  // Step 4: Test ScrapCentre user
  console.log("--- Step 4: ScrapCentre User ---");
  const { default: ScrapCentreUser } = await import("../models/ScrapCentreUser");
  const scUser = await ScrapCentreUser.findOne({ $or: [{ email: "sc01@gmail.com" }, { loginId: "sc01" }] }).select("+password").lean();
  if (scUser) {
    console.log(`Found user: ${(scUser as any).name}, email: ${(scUser as any).email}`);
    const storedPw = (scUser as any).password;
    console.log(`Password stored (first 10): ${storedPw?.substring(0, 10)}...`);
    const isHashed = storedPw?.startsWith("$2");
    console.log(`Is hashed: ${isHashed}`);
    if (isHashed) {
      const match1 = await bcrypt.compare("sc01", storedPw);
      const match2 = await bcrypt.compare("verifya", storedPw);
      console.log(`bcrypt compare "sc01": ${match1}`);
      console.log(`bcrypt compare "verifya": ${match2}`);
    } else {
      console.log(`Plain compare "sc01": ${storedPw === "sc01"}`);
      console.log(`Plain compare "verifya": ${storedPw === "verifya"}`);
    }
  } else {
    console.log("❌ sc01@gmail.com not found in DB");
  }
  console.log();

  // Step 5: Test B2B user
  console.log("--- Step 5: B2B Partner ---");
  const { default: B2BPartner } = await import("../models/B2BPartner");
  const b2bUser = await B2BPartner.findOne({}).select("+password").lean();
  if (b2bUser) {
    console.log(`Found B2B user: ${(b2bUser as any).businessName || (b2bUser as any).userId}`);
    console.log(`Password stored (first 10): ${(b2bUser as any).password?.substring(0, 10)}...`);
  } else {
    console.log("No B2B partner found in DB");
  }
  console.log();

  // Step 6: Test Executive user
  console.log("--- Step 6: Executive ---");
  const { default: Executive } = await import("../models/Executive");
  const execUser = await Executive.findOne({}).select("+password").lean();
  if (execUser) {
    console.log(`Found Executive: ${(execUser as any).name}, email: ${(execUser as any).email}`);
    console.log(`Password stored (first 10): ${(execUser as any).password?.substring(0, 10)}...`);
  } else {
    console.log("No Executive found in DB");
  }
  console.log();

  // Step 7: Test RVSF user
  console.log("--- Step 7: RVSF User ---");
  const { default: RVSFUser } = await import("../models/RVSFUser");
  const rvsfUsers = await RVSFUser.find({}).select("+password").lean();
  for (const u of rvsfUsers) {
    console.log(`Found RVSF: ${u.name}, rvsfId: ${u.rvsfId}, email: ${u.email}`);
    console.log(`Password stored (first 10): ${u.password?.substring(0, 10)}...`);
    const isHashed = u.password?.startsWith("$2");
    if (isHashed) {
      // Try common passwords
      for (const pw of ["xyz", "rvsf01", "verifya", u.rvsfId]) {
        const match = await bcrypt.compare(pw, u.password);
        if (match) console.log(`  ✅ Password match: "${pw}"`);
      }
    }
  }
  console.log();

  // Step 8: Check User model
  console.log("--- Step 8: User model (admin DB users) ---");
  const { default: User } = await import("../models/User");
  const adminDbUser = await User.findOne({ email: "scrapcentreadmin@gmail.com" }).select("+password").lean();
  if (adminDbUser) {
    console.log(`Found admin in User DB: ${(adminDbUser as any).email}, role: ${(adminDbUser as any).role}`);
  } else {
    console.log("Admin email NOT in User DB (relies on env fallback)");
  }
  console.log();

  // Step 9: Actually simulate the signIn authorize flow for admin
  console.log("--- Step 9: Simulate FULL admin authorize ---");
  const identifier = "scrapcentreadmin@gmail.com".toLowerCase();
  const password = "scrapcentre@789";

  // ENV check
  const envAdminEmail = process.env.ADMIN_EMAIL;
  const envAdminPassword = process.env.ADMIN_PASSWORD;
  console.log(`Env check: email="${envAdminEmail}", pw="${envAdminPassword}"`);
  console.log(`Input: "${identifier}" vs env: "${envAdminEmail?.toLowerCase()}"`);
  console.log(`Match email: ${identifier === envAdminEmail?.toLowerCase()}`);
  console.log(`Match pw: ${password === envAdminPassword}`);

  if (envAdminEmail && envAdminPassword && 
      identifier === envAdminEmail.toLowerCase() && 
      password === envAdminPassword) {
    console.log("✅ ADMIN LOGIN SHOULD SUCCEED via env fallback");
  } else {
    console.log("❌ ADMIN LOGIN WILL FAIL via env fallback");
    console.log(`  Reason: email match=${identifier === envAdminEmail?.toLowerCase()}, pw match=${password === envAdminPassword}`);
  }

  console.log("\n=== DIAGNOSIS COMPLETE ===");
  process.exit(0);
}

run().catch(e => {
  console.error("FATAL ERROR:", e);
  process.exit(1);
});
