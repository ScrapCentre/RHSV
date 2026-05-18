import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
let MONGODB_URI = '';
for (const line of lines) {
    if (line.startsWith('MONGODB_URI=')) {
        MONGODB_URI = line.split('=')[1].trim().replace(/['"]/g, '');
    }
}

if (!MONGODB_URI) {
    console.error("MONGODB_URI not found");
    process.exit(1);
}

async function run() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MONGODB");
    
    // Check all collections for pincode "143001"
    const schema = new mongoose.Schema({}, { strict: false });
    const collections = ['valuations', 'wizardleads', 'sellvehicles', 'buyvehicles'];
    
    for (const collName of collections) {
        const Model = mongoose.models[collName] || mongoose.model(collName, schema, collName);
        const docs = await Model.find({
            $or: [
                { pincode: "143001" },
                { "address.pincode": "143001" },
                { pincode: 143001 },
                { "address.pincode": 143001 },
                { phone: /.*97.*/ },
                { "contact.phone": /.*97.*/ }
            ]
        }).lean();
        if (docs.length > 0) {
            console.log(`\n=== FOUND IN ${collName} ===`);
            console.log(JSON.stringify(docs, null, 2));
        }
    }

    await mongoose.connection.close();
}

run().catch(console.error);
