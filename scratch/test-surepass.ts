import * as fs from "fs";
import * as path from "path";
import { lookupVehicle } from "../app/actions";

// Load .env.local manually for standalone execution
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
      // Remove enclosing quotes if any
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    });
    console.log("Successfully loaded .env.local environment variables.");
  } else {
    console.warn(".env.local file not found at", envPath);
  }
} catch (e) {
  console.error("Failed to load .env.local:", e);
}

async function verify() {
  const regNo = "UP14X6100"; // Should trigger mock
  console.log(`\n--- Testing Mock lookup for ${regNo} ---`);
  const mockResult = await lookupVehicle(regNo);
  console.log("Mock Result:", JSON.stringify(mockResult, null, 2));

  const realRegNo = "UP78BX4178"; // Should fetch live data from Surepass
  console.log(`\n--- Testing Live API lookup for ${realRegNo} ---`);
  const apiResult = await lookupVehicle(realRegNo);
  console.log("Live API Result:", JSON.stringify(apiResult, null, 2));
}

verify();
