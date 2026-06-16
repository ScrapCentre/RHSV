const mongoose = require("mongoose");
const uri = "mongodb+srv://scrapcentre69_db_user:FMTSiCszPRoHDnmI@cluster0.4qzm4t3.mongodb.net/project";

async function run() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    // Check in users collection
    const user = await db.collection("users").findOne({ email: "scrapcentreadmin@gmail.com" });
    console.log("Admin User in users collection:", user);

    // Check in ratelimits collection
    const rateLimits = await db.collection("ratelimits").find({ key: { $regex: /admin/ } }).toArray();
    console.log("Admin rate limits:", rateLimits);

    await mongoose.connection.close();
}
run();
