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
    const password = "verifya";
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log(`Hashed password "${password}" successfully:`, hashedPassword);

    const scrapCentreUserSchema = new mongoose.Schema({}, { strict: false, collection: 'scrapcentreusers' });
    const ScrapCentreUser = mongoose.model("ScrapCentreUser", scrapCentreUserSchema);

    // Update sc01@gmail.com
    const res1 = await ScrapCentreUser.updateOne(
      { email: "sc01@gmail.com" },
      { $set: { password: hashedPassword } }
    );
    console.log("Updated sc01@gmail.com:", res1);

    // Update centre.test@scrapcentre.online
    const res2 = await ScrapCentreUser.updateOne(
      { email: "centre.test@scrapcentre.online" },
      { $set: { password: hashedPassword } }
    );
    console.log("Updated centre.test@scrapcentre.online:", res2);

    // Let's verify the update
    const updatedUsers = await ScrapCentreUser.find({
      email: { $in: ["sc01@gmail.com", "centre.test@scrapcentre.online"] }
    }).lean();
    console.log("Updated records in DB:", JSON.stringify(updatedUsers, null, 2));

  } catch (e) {
    console.error("Error during password update:", e);
  } finally {
    await mongoose.disconnect();
  }
}

run();
