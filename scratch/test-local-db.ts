import mongoose from "mongoose";

async function testLocal() {
  const localUri = "mongodb://localhost:27017/scrapcentre";
  console.log("Attempting connection to local MongoDB at:", localUri);
  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
    console.log("✅ SUCCESS: Local MongoDB is running and reachable!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (e: any) {
    console.error("❌ FAILED: Local MongoDB is not running or not reachable.", e.message);
    process.exit(1);
  }
}

testLocal();
