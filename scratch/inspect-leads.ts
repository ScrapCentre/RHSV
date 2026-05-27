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
    const UnlockedLead = mongoose.models.UnlockedLead || mongoose.model("UnlockedLead", new mongoose.Schema({}, { strict: false, collection: 'unlocked_leads' }));
    const ChatThread = mongoose.models.ChatThread || mongoose.model("ChatThread", new mongoose.Schema({}, { strict: false, collection: 'chat_threads' }));

    const leads = await UnlockedLead.find({}).lean();
    console.log("UNLOCKED LEADS IN DB:", JSON.stringify(leads, null, 2));

    const chats = await ChatThread.find({}).lean();
    console.log("CHAT THREADS IN DB:", JSON.stringify(chats, null, 2));

  } catch (e) {
    console.error("Error:", e);
  } finally {
    await mongoose.disconnect();
  }
}

run();
