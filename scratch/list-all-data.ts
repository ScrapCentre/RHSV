import mongoose from "mongoose";

const uri = "mongodb+srv://scrapcentre69_db_user:FMTSiCszPRoHDnmI@cluster0.4qzm4t3.mongodb.net/project";

async function run() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    
    if (!db) {
        console.error("Database connection not established");
        return;
    }

    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    const b2bPartners = await db.collection("b2bpartner").find({}).toArray();
    console.log(`\nFound ${b2bPartners.length} B2B Partners:`);
    b2bPartners.forEach(p => {
        console.log(`- ID: ${p.userId}, Name: ${p.businessName}, Email: ${p.email}`);
    });

    const scrapCentreUsers = await db.collection("scrapcentreusers").find({}).toArray();
    console.log(`\nFound ${scrapCentreUsers.length} Scrap Centre Users:`);
    scrapCentreUsers.forEach(u => {
        console.log(`- ID: ${u.loginId || u.email}, Name: ${u.name}`);
    });

    const executives = await db.collection("executives").find({}).toArray();
    console.log(`\nFound ${executives.length} Executives:`);
    executives.forEach(e => {
        console.log(`- Name: ${e.name}, Email: ${e.email}`);
    });

    await mongoose.connection.close();
}
run().catch(console.error);
