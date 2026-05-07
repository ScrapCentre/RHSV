const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://scrapcentre69_db_user:FMTSiCszPRoHDnmI@cluster0.4qzm4t3.mongodb.net/project";

async function checkConnection() {
    try {
        console.log("Checking connection...");
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("SUCCESS: Connected to MongoDB!");
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        process.exit(0);
    } catch (error) {
        console.error("CONNECTION FAILED:", error.message);
        if (error.message.includes("EREFUSED")) {
            console.log("DIAGNOSIS: DNS resolution failed or cluster unreachable. This is likely an IP Whitelist issue or a network firewall.");
        }
        process.exit(1);
    }
}

checkConnection();
