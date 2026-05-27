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
    const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({}, { strict: false, collection: 'users' }));
    const users = await User.find({}).lean();
    console.log("ALL NORMAL USERS IN DB:", JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await mongoose.disconnect();
  }
}

run();
