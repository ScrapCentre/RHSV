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
  uri = process.env.MONGODB_URI || "mongodb://localhost:27017/scrapcentre";
}

async function run() {
  await mongoose.connect(uri);
  const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, required: false },
    phone: { type: String, unique: true, sparse: true, required: false },
    role: { type: String, default: "client" },
    provider: { type: String, default: "credentials" }
  });
  const User = mongoose.model("TestUser", UserSchema);
  
  try {
    const user1 = await User.create({ name: "User 1", phone: "111" });
    console.log("Created 1", user1);
    const user2 = await User.create({ name: "User 2", phone: "222" });
    console.log("Created 2", user2);
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
}
run();
