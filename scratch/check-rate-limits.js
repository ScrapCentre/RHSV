// Check rate limit records for the email
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

    const RateLimit = mongoose.model('RateLimit', new mongoose.Schema({
        key: String,
        count: Number,
        resetAt: Date
    }));

    // Check all rate limit records
    const records = await RateLimit.find({}).lean();
    console.log(`\nFound ${records.length} rate limit records:\n`);

    for (const rec of records) {
        const isActive = rec.resetAt > new Date();
        console.log(`  Key: "${rec.key}"`);
        console.log(`  Count: ${rec.count}`);
        console.log(`  Reset At: ${rec.resetAt}`);
        console.log(`  Active: ${isActive ? '🔴 YES - BLOCKED' : '✅ NO - expired'}`);
        console.log('');
    }

    // Clear any rate limits for the test email
    const deleted = await RateLimit.deleteMany({
        key: { $regex: /simarjeetsinghpadam50/i }
    });
    console.log(`Cleared ${deleted.deletedCount} rate limit records for simarjeetsinghpadam50@gmail.com`);

    const deleted2 = await RateLimit.deleteMany({
        key: { $regex: /simarpadam2005/i }
    });
    console.log(`Cleared ${deleted2.deletedCount} rate limit records for simarpadam2005@gmail.com`);

    await mongoose.disconnect();
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
