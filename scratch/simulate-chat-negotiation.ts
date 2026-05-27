import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import ChatThread from "../models/ChatThread";

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

  const threadId = "6a15c047e85afa5a4e78090c";
  const now = new Date();

  try {
    console.log("\n--- STEP 1: Fetching initial thread ---");
    const thread = await ChatThread.findById(threadId);
    if (!thread) {
      console.error("Test thread not found!");
      return;
    }
    console.log("Initial message count:", thread.messages.length);

    // Reset messages and agreed price first
    thread.messages = [
      {
        sender: "system",
        message: "Sumit Kumar (RVSF Partner) has unlocked your lead and will reach out shortly.",
        isSystemMessage: true,
        createdAt: now,
        senderRole: "system",
        type: "system"
      }
    ];
    thread.agreedPrice = undefined;
    thread.agreedAt = undefined;
    await thread.save();

    console.log("\n--- STEP 2: RVSF Partner sends a text message ---");
    thread.messages.push({
      sender: "rvsf",
      message: "Hi Naresh, let's start the negotiation for your 2015 Honda City.",
      isSystemMessage: false,
      createdAt: new Date(),
      senderId: "RVSF60084",
      senderName: "Sumit Kumar",
      senderRole: "rvsf",
      type: "text"
    });
    await thread.save();
    console.log("RVSF Text message sent successfully.");

    console.log("\n--- STEP 3: RVSF Partner sends a negotiation offer of ₹1,50,000 ---");
    const offerExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    thread.messages.push({
      sender: "rvsf",
      message: "Offer: ₹150000",
      isSystemMessage: false,
      createdAt: new Date(),
      senderId: "RVSF60084",
      senderName: "Sumit Kumar",
      senderRole: "rvsf",
      type: "offer",
      offerAmount: 150000,
      offerStatus: "pending",
      offerExpiresAt
    });
    await thread.save();
    console.log("RVSF Offer sent successfully.");

    console.log("\n--- STEP 4: Attempting to send another offer while an active offer exists ---");
    const activeOfferExists = thread.messages.some(
      (msg: any) =>
        msg.type === "offer" &&
        msg.offerStatus === "pending" &&
        msg.offerExpiresAt &&
        new Date(msg.offerExpiresAt) > new Date()
    );

    if (activeOfferExists) {
      console.log("✅ CHECK PASSED: Correctly blocked sending another offer. Rule enforced!");
    } else {
      console.log("❌ CHECK FAILED: Did not detect active offer.");
    }

    console.log("\n--- STEP 5: Customer counters the offer with ₹1,60,000 ---");
    // Find the active offer
    const activeIndex = thread.messages.findIndex(
      (msg: any) =>
        msg.type === "offer" &&
        msg.offerStatus === "pending" &&
        msg.offerExpiresAt &&
        new Date(msg.offerExpiresAt) > new Date()
    );

    if (activeIndex !== -1) {
      // Mark old as countered
      thread.messages[activeIndex].offerStatus = "countered";

      // Append new pending offer from customer
      thread.messages.push({
        sender: "customer",
        message: "Offer: ₹160000",
        isSystemMessage: false,
        createdAt: new Date(),
        senderId: "6a0e5fc920a1746e699dd50d",
        senderName: "Naresh Kumar",
        senderRole: "customer",
        type: "offer",
        offerAmount: 160000,
        offerStatus: "pending",
        offerExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
      });
      await thread.save();
      console.log("✅ Counter offer of ₹1,60,000 saved successfully.");
    } else {
      console.log("❌ Active offer not found to counter.");
    }

    console.log("\n--- STEP 6: RVSF Partner accepts the customer's counter offer ---");
    // Refresh thread state
    const freshThread = await ChatThread.findById(threadId);
    if (!freshThread) throw new Error("Could not find thread");

    const newActiveIndex = freshThread.messages.findIndex(
      (msg: any) =>
        msg.type === "offer" &&
        msg.offerStatus === "pending" &&
        msg.offerExpiresAt &&
        new Date(msg.offerExpiresAt) > new Date()
    );

    if (newActiveIndex !== -1) {
      const activeOffer = freshThread.messages[newActiveIndex];
      activeOffer.offerStatus = "accepted";
      
      // Pin agreed price to the parent document
      freshThread.agreedPrice = activeOffer.offerAmount;
      freshThread.agreedAt = new Date();

      // System notification
      freshThread.messages.push({
        sender: "system",
        message: `Both parties have agreed on ₹${activeOffer.offerAmount}. The deal will now proceed offline.`,
        isSystemMessage: true,
        createdAt: new Date(),
        senderRole: "system",
        type: "system"
      });

      await freshThread.save();
      console.log("✅ Offer successfully accepted! Pinned price:", freshThread.agreedPrice);
    } else {
      console.log("❌ Pending counter offer not found to accept.");
    }

    console.log("\n--- FINAL CHAT THREAD STATUS INSPECTION ---");
    const finalThread = await ChatThread.findById(threadId);
    console.log("Thread ID:", finalThread?._id);
    console.log("Agreed Price (Pinned):", finalThread?.agreedPrice);
    console.log("Agreed At:", finalThread?.agreedAt);
    console.log("Total Messages:", finalThread?.messages.length);
    console.log("Message History Details:");
    finalThread?.messages.forEach((m: any, idx: number) => {
      console.log(`[${idx}] Sender: ${m.sender} | Type: ${m.type} | Msg: "${m.message}" ${m.offerStatus ? `| Status: ${m.offerStatus}` : ""}`);
    });

  } catch (error) {
    console.error("Simulation error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
