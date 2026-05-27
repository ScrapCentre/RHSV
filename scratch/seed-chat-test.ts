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
    const ChatThread = mongoose.models.ChatThread || mongoose.model("ChatThread", new mongoose.Schema({}, { strict: false, collection: 'chat_threads' }));
    const UnlockedLead = mongoose.models.UnlockedLead || mongoose.model("UnlockedLead", new mongoose.Schema({}, { strict: false, collection: 'unlocked_leads' }));

    const threadId = "6a15c047e85afa5a4e78090c";
    const customerId = "6a0e5fc920a1746e699dd50d"; // Naresh Kumar

    // 1. Update Unlocked Lead
    const updatedLead = await UnlockedLead.findOneAndUpdate(
      { leadId: "6a0c0ccc404c74807a0dce8d" },
      {
        $set: {
          customerId: customerId,
          customerName: "Naresh Kumar",
          customerPhone: "+918957858190",
          customerEmail: "918957858190@otp.com",
          status: "accepted"
        }
      },
      { new: true }
    );
    console.log("UPDATED UNLOCKED LEAD:", updatedLead);

    // 2. Update Chat Thread
    const updatedThread = await ChatThread.findByIdAndUpdate(
      threadId,
      {
        $set: {
          customerId: customerId,
          messages: [
            {
              sender: "system",
              message: "Sumit Kumar (RVSF Partner) has unlocked your lead and will reach out shortly.",
              isSystemMessage: true,
              createdAt: new Date(),
              senderRole: "system",
              type: "system"
            }
          ],
          // Reset agreed price if any to allow fresh negotiations
          agreedPrice: null,
          agreedAt: null
        }
      },
      { new: true }
    );
    console.log("UPDATED CHAT THREAD:", updatedThread);

  } catch (e) {
    console.error("Error seeding test data:", e);
  } finally {
    await mongoose.disconnect();
  }
}

run();
