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
  console.log("Connecting to:", uri);
  await mongoose.connect(uri);
  try {
    const db = mongoose.connection.db;
    if (!db) {
      console.error("DB connection not established");
      return;
    }
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    // Define generic schema to read ScrapCentreUser collection
    const scrapCentreUserSchema = new mongoose.Schema({}, { strict: false, collection: 'scrapcentreusers' });
    const ScrapCentreUser = mongoose.model("ScrapCentreUser", scrapCentreUserSchema);

    const allScrapUsers = await ScrapCentreUser.find({}).lean();
    console.log("All ScrapCentreUsers in DB:", JSON.stringify(allScrapUsers, null, 2));

    // Also look for "sc01" in any other collection just in case
    const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
    const User = mongoose.model("User", userSchema);
    const users = await User.find({ $or: [{ email: /sc01/i }, { name: /sc01/i }] }).lean();
    console.log("Matching Users in 'users' collection:", JSON.stringify(users, null, 2));

  } catch (e) {
    console.error("Error during inspection:", e);
  } finally {
    await mongoose.disconnect();
  }
}

run();
