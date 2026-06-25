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
    console.log("Loaded .env.local environment variables.");
  }
} catch (e) {
  console.error("Failed to load .env.local:", e);
}

async function query() {
  const regNo = "UP78JL0100";
  console.log(`Querying Surepass for: ${regNo}`);

  const token = process.env.SUREPASS_API_TOKEN;
  const publicKey = process.env.SUREPASS_PUBLIC_KEY;
  const privateKey = process.env.SUREPASS_PRIVATE_KEY;

  if (!token && !publicKey && !privateKey) {
    console.error("No Surepass API credentials set in environment variables!");
    return;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (publicKey && privateKey) {
    headers["X-API-Public-Key"] = publicKey;
    headers["X-API-Private-Key"] = privateKey;
    headers["Authorization"] = `Bearer ${privateKey}`;
  }

  try {
    const response = await fetch("https://kyc-api.surepass.app/api/v1/rc/rc-v2", {
      method: "POST",
      headers,
      body: JSON.stringify({
        id_number: regNo,
        enrich: true
      })
    });

    console.log(`HTTP Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log("Raw Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

query();
