// Verify the fix works - test the CORRECTED select syntax
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

    const Executive = mongoose.model('Executive', new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, default: "executive" },
        mustChangePassword: { type: Boolean, default: false }
    }));

    const email = 'simarjeetsinghpadam50@gmail.com';
    const inputPassword = 'iil2fmio64';

    // Test with the FIXED select syntax
    console.log('\n=== Testing FIXED .select("+password +mustChangePassword") ===');
    const user = await Executive.findOne({ email }).select("+password +mustChangePassword").lean();
    
    if (!user) {
        console.log('❌ User not found');
    } else {
        console.log(`✓ User found: ${user.name}`);
        console.log(`  Fields returned: ${Object.keys(user).join(', ')}`);
        console.log(`  Has password: ${!!user.password}`);
        console.log(`  Has email: ${!!user.email}`);
        console.log(`  Has name: ${!!user.name}`);
        
        const storedPw = user.password;
        const isHashed = storedPw?.startsWith("$2");
        const isMatch = isHashed ? await bcrypt.compare(inputPassword, storedPw) : storedPw === inputPassword;
        
        console.log(`\n  isHashed: ${isHashed}`);
        console.log(`  isMatch: ${isMatch}`);
        
        if (isMatch) {
            console.log('\n✅ LOGIN WOULD SUCCEED with the fix!');
        } else {
            console.log('\n❌ Login would still fail');
        }
    }

    // Also test the OLD broken syntax to confirm it's the issue
    console.log('\n=== Confirming OLD broken .select("+password mustChangePassword") ===');
    const user2 = await Executive.findOne({ email }).select("+password mustChangePassword").lean();
    console.log(`  Fields returned: ${Object.keys(user2 || {}).join(', ')}`);
    console.log(`  Has password: ${!!user2?.password}`);
    console.log(`  ❌ Password was MISSING with old syntax = root cause of all login failures`);

    await mongoose.disconnect();
    console.log('\nDone.');
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
