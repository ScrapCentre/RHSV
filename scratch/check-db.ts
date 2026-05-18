import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://scrapcentre69_db_user:FMTSiCszPRoHDnmI@cluster0.4qzm4t3.mongodb.net/project";

async function run() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully!");

        const schema = new mongoose.Schema({}, { strict: false });
        const WizardLead = mongoose.models.WizardLead || mongoose.model("WizardLead", schema, "wizardleads");

        const leads = await WizardLead.find().sort({ createdAt: -1 }).limit(10).lean();
        console.log("LATEST 10 WIZARD LEADS:");
        console.log(JSON.stringify(leads, null, 2));

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

run();
