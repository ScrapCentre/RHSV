const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const uri = "mongodb+srv://scrapcentre69_db_user:FMTSiCszPRoHDnmI@cluster0.4qzm4t3.mongodb.net/project";
const emailToUpdate = "simarpadam2005@gmail.com";
const newPassword = "dspn8p2149";

async function run() {
    console.log("Connecting to database...");
    await mongoose.connect(uri);
    console.log("Connected successfully.");

    const db = mongoose.connection.db;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update in executives collection
    const execRes = await db.collection("executives").updateOne(
        { email: emailToUpdate },
        { $set: { password: hashedPassword, mustChangePassword: true } }
    );
    console.log(`Updated in executives collection: ${execRes.matchedCount} matched, ${execRes.modifiedCount} modified.`);

    // Update in rvsfusers collection
    const rvsfRes = await db.collection("rvsfusers").updateOne(
        { email: emailToUpdate },
        { $set: { password: hashedPassword, mustChangePassword: true } }
    );
    console.log(`Updated in rvsfusers collection: ${rvsfRes.matchedCount} matched, ${rvsfRes.modifiedCount} modified.`);

    await mongoose.connection.close();
    console.log("Database connection closed.");
}

run().catch(console.error);
