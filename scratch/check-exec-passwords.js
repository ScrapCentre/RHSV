// Test password comparison for the problematic executive
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
        name: String,
        email: String,
        password: String,
        role: String,
        mustChangePassword: Boolean
    }));

    // Test the specific email that's failing
    const testEmail = 'simarjeetsinghpadam50@gmail.com';
    const testPassword = 'iil2fmio64';

    console.log(`\n=== Testing login for: ${testEmail} ===`);
    console.log(`Input password: "${testPassword}" (length: ${testPassword.length})`);

    const exec = await Executive.findOne({ email: testEmail }).lean();
    if (!exec) {
        console.log('❌ Executive NOT FOUND in database!');
    } else {
        console.log(`✓ Executive found: ${exec.name}`);
        console.log(`  Stored hash: ${exec.password}`);
        
        const isMatch = await bcrypt.compare(testPassword, exec.password);
        console.log(`  bcrypt.compare result: ${isMatch}`);
        
        if (isMatch) {
            console.log('✅ Password MATCHES - login should work');
        } else {
            console.log('❌ Password DOES NOT MATCH - this is the bug!');
            
            // Test what happens if we hash the test password and compare
            const newHash = await bcrypt.hash(testPassword, 10);
            console.log(`\n  Fresh hash of "${testPassword}": ${newHash}`);
            console.log(`  Stored hash: ${exec.password}`);
            console.log(`  (These will be different since bcrypt uses random salt, but both should compare successfully with the same input)`);

            // Try trimmed version
            const trimmedMatch = await bcrypt.compare(testPassword.trim(), exec.password);
            console.log(`\n  Trimmed compare: ${trimmedMatch}`);
        }
    }

    // Also test the other executive (simarpadam2005@gmail.com with dspn8p2149)
    const testEmail2 = 'simarpadam2005@gmail.com';
    const testPassword2 = 'dspn8p2149';

    console.log(`\n=== Testing login for: ${testEmail2} ===`);
    const exec2 = await Executive.findOne({ email: testEmail2 }).lean();
    if (exec2) {
        const isMatch2 = await bcrypt.compare(testPassword2, exec2.password);
        console.log(`  bcrypt.compare result: ${isMatch2}`);
        if (isMatch2) {
            console.log('✅ Password MATCHES');
        } else {
            console.log('❌ Password DOES NOT MATCH');
        }
    }

    await mongoose.disconnect();
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
