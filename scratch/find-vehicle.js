const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
        envVars[trimmed.substring(0, eqIndex).trim()] = trimmed.substring(eqIndex + 1).trim();
    }
});

async function main() {
    await mongoose.connect(envVars.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fetch dynamic collections to avoid schema declaration mismatch
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));

    const regNoQuery = /UP78HS5219/i;

    for (const col of collections) {
        const collection = mongoose.connection.db.collection(col.name);
        // Find any document that contains "UP78HS5219" in any string field
        const docs = await collection.find({
            $or: [
                { regNo: regNoQuery },
                { registrationNumber: regNoQuery },
                { vehicleNumber: regNoQuery },
                { oldVehicleRegistration: regNoQuery }
            ]
        }).toArray();

        if (docs.length > 0) {
            console.log(`\nFound matching documents in collection: ${col.name}`);
            console.log(JSON.stringify(docs, null, 2));
        }
    }

    await mongoose.disconnect();
    console.log('\nDone.');
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
