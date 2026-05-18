import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://scrapcentre69_db_user:FMTSiCszPRoHDnmI@cluster0.4qzm4t3.mongodb.net/project";

async function run() {
    try {
        console.log("Connecting...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected!");

        const schema = new mongoose.Schema({}, { strict: false });
        const WizardLead = mongoose.models.WizardLead || mongoose.model("WizardLead", schema, "wizardleads");
        const BuyVehicle = mongoose.models.BuyVehicle || mongoose.model("BuyVehicle", schema, "buyvehicles");
        const SellVehicle = mongoose.models.SellVehicle || mongoose.model("SellVehicle", schema, "sellvehicles");
        const Valuation = mongoose.models.Valuation || mongoose.model("Valuation", schema, "valuations");

        const buyId = "6a0b0279b571ee47340c48f8";
        console.log("\n--- TESTING BUY VEHICLE GET API LOGIC ---");
        let buyReq = await BuyVehicle.findById(buyId).lean();
        console.log("BuyVehicle.findById:", buyReq);
        if (!buyReq) {
            let wl = await WizardLead.findById(buyId).lean();
            console.log("WizardLead.findById:", wl);
        }

        const scrapOnlyId = "6a0ae20d78f06eb2a0d253b8";
        console.log("\n--- TESTING SCRAP ONLY GET API LOGIC ---");
        let valReq = await Valuation.findById(scrapOnlyId).lean();
        console.log("Valuation.findById:", valReq);
        if (!valReq) {
            let wl = await WizardLead.findById(scrapOnlyId).lean();
            console.log("WizardLead.findById:", wl);
        }

        const sellOnlyId = "6a083b3c2fe91eb92a444b1b";
        console.log("\n--- TESTING SELL ONLY GET API LOGIC ---");
        let sellReq = await SellVehicle.findById(sellOnlyId).lean();
        console.log("SellVehicle.findById:", sellReq);
        if (!sellReq) {
            let wl = await WizardLead.findById(sellOnlyId).lean();
            console.log("WizardLead.findById:", wl);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
