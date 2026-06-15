const mongoose = require("mongoose");
const uri = "mongodb+srv://scrapcentre69_db_user:FMTSiCszPRoHDnmI@cluster0.4qzm4t3.mongodb.net/project";

async function run() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const docs = await db.collection("executives").find({}).toArray();
    console.log("All executives:");
    console.log(JSON.stringify(docs, null, 2));
    await mongoose.connection.close();
}
run();
