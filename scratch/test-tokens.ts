import * as fs from "fs";
import * as path from "path";

// Load .env.local manually
try {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const index = trimmed.indexOf("=");
      if (index === -1) return;
      const key = trimmed.slice(0, index).trim();
      let val = trimmed.slice(index + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    });
    console.log("Loaded .env.local.");
  }
} catch (e) {
  console.error("Failed to load .env.local:", e);
}

async function testWithToken() {
  const token = process.env.SUREPASS_API_TOKEN;
  console.log("\n--- Testing with SUREPASS_API_TOKEN only ---");
  if (!token) {
    console.log("No token found.");
    return;
  }
  try {
    const response = await fetch("https://kyc-api.surepass.app/api/v1/rc/rc-v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ id_number: "UP78JL0100", enrich: true })
    });
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log("Success:", data.success, "Message:", data.message);
  } catch (err) {
    console.error("Token test error:", err);
  }
}

async function testWithKeys() {
  const publicKey = process.env.SUREPASS_PUBLIC_KEY;
  const privateKey = process.env.SUREPASS_PRIVATE_KEY;
  console.log("\n--- Testing with PUBLIC/PRIVATE KEYS only ---");
  if (!publicKey || !privateKey) {
    console.log("Keys not found.");
    return;
  }
  try {
    const response = await fetch("https://kyc-api.surepass.app/api/v1/rc/rc-v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Public-Key": publicKey,
        "X-API-Private-Key": privateKey,
        "Authorization": `Bearer ${privateKey}`
      },
      body: JSON.stringify({ id_number: "UP78JL0100", enrich: true })
    });
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log("Success:", data.success, "Message:", data.message);
  } catch (err) {
    console.error("Keys test error:", err);
  }
}

async function run() {
  await testWithToken();
  await testWithKeys();
}

run();
