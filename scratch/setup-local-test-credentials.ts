import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const uri = "mongodb+srv://scrapcentre69_db_user:FMTSiCszPRoHDnmI@cluster0.4qzm4t3.mongodb.net/project";

async function run() {
    console.log("Connecting to database...");
    await mongoose.connect(uri);
    console.log("Connected successfully.");

    const db = mongoose.connection.db;
    if (!db) {
        throw new Error("DB connection not established");
    }

    const testPassword = "password123";
    const hashedPassword = await bcrypt.hash(testPassword, 12);

    // 1. Setup Admin user password (default: scrapcentreadmin@gmail.com)
    const adminEmail = "scrapcentreadmin@gmail.com";
    const adminRes = await db.collection("users").updateOne(
        { email: adminEmail },
        { $set: { password: hashedPassword, role: "admin", provider: "credentials", name: "Scrap Centre Admin" } },
        { upsert: true }
    );
    console.log(`Admin user: ${adminRes.matchedCount} matched, ${adminRes.modifiedCount} modified.`);

    // 2. Setup B2B Partner password (B2B94647 / premium.novalytix@gmail.com)
    const partnerId = "B2B94647";
    const partnerRes = await db.collection("b2bpartner").updateOne(
        { userId: partnerId },
        { $set: { password: hashedPassword, mustChangePassword: false } }
    );
    console.log(`B2B Partner (${partnerId}): ${partnerRes.matchedCount} matched, ${partnerRes.modifiedCount} modified.`);

    // 3. Setup Scrap Centre User password (sc61889 / simar)
    const scId = "sc61889";
    const scRes = await db.collection("scrapcentreusers").updateOne(
        { loginId: scId },
        { $set: { password: hashedPassword, mustChangePassword: false } }
    );
    console.log(`Scrap Centre User (${scId}): ${scRes.matchedCount} matched, ${scRes.modifiedCount} modified.`);

    // 4. Setup Executive password (ex01@gmail.com)
    const execEmail = "ex01@gmail.com";
    const execRes = await db.collection("executives").updateOne(
        { email: execEmail },
        { $set: { password: hashedPassword, mustChangePassword: false } }
    );
    console.log(`Executive (${execEmail}): ${execRes.matchedCount} matched, ${execRes.modifiedCount} modified.`);

    console.log(`\n==========================================`);
    console.log(`ALL TEST ACCOUNTS UPDATED WITH PASSWORD: "${testPassword}"`);
    console.log(`- Admin: scrapcentreadmin@gmail.com`);
    console.log(`- B2B Partner ID: B2B94647`);
    console.log(`- Scrap Centre ID: sc61889`);
    console.log(`- Executive Email: ex01@gmail.com`);
    console.log(`==========================================\n`);

    await mongoose.connection.close();
}
run().catch(console.error);
