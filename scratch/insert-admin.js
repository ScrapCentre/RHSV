const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const uri = "mongodb+srv://scrapcentre69_db_user:FMTSiCszPRoHDnmI@cluster0.4qzm4t3.mongodb.net/project";

async function run() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    // 1. Hash the password
    const plainPassword = "scrapcentre@789";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 2. Clear rate limit/lockout records for this admin email
    const deletedLimits = await db.collection("ratelimits").deleteMany({
        key: { $regex: /scrapcentreadmin@gmail\.com/i }
    });
    console.log("Cleared lockout records:", deletedLimits);

    // 3. Upsert the admin user in the users collection
    const adminUser = {
        name: "System Admin",
        email: "scrapcentreadmin@gmail.com",
        password: hashedPassword,
        role: "admin",
        provider: "credentials",
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const updateResult = await db.collection("users").updateOne(
        { email: "scrapcentreadmin@gmail.com" },
        { $set: adminUser },
        { upsert: true }
    );
    console.log("Upserted admin user result:", updateResult);

    await mongoose.connection.close();
    console.log("Done!");
}
run();
