import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";

let uri = "";
try {
  const envContent = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
  for (const line of envContent.split("\n")) {
    if (line.startsWith("MONGODB_URI=")) {
      uri = line.split("=")[1].trim().replace(/['"]/g, "");
    }
  }
} catch (e) {}

if (!uri) {
  uri = process.env.MONGODB_URI || "";
}

async function run() {
  console.log("Connecting to database...");
  await mongoose.connect(uri);
  try {
    const rvsfUserSchema = new mongoose.Schema({}, { strict: false, collection: 'rvsfusers' });
    const RVSFUser = mongoose.models.RVSFUser || mongoose.model("RVSFUser", rvsfUserSchema);

    const users = await RVSFUser.find({}).lean();
    console.log("ALL RVSF USERS IN DB:", JSON.stringify(users, null, 2));

  } catch (e) {
    console.error("Error:", e);
  } finally {
    await mongoose.disconnect();
  }
}

run();
