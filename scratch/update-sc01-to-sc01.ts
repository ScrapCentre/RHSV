import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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
    const password = "sc01";
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log(`Hashed password "${password}" successfully:`, hashedPassword);

    const scrapCentreUserSchema = new mongoose.Schema({}, { strict: false, collection: 'scrapcentreusers' });
    const ScrapCentreUser = mongoose.model("ScrapCentreUser", scrapCentreUserSchema);

    // Update sc01@gmail.com's password to the hash of "sc01"
    const res = await ScrapCentreUser.updateOne(
      { email: "sc01@gmail.com" },
      { $set: { password: hashedPassword } }
    );
    console.log("Updated sc01@gmail.com:", res);

    const updatedUser = await ScrapCentreUser.findOne({ email: "sc01@gmail.com" }).lean();
    console.log("Updated record in DB:", JSON.stringify(updatedUser, null, 2));

  } catch (e) {
    console.error("Error during password update:", e);
  } finally {
    await mongoose.disconnect();
  }
}

run();
