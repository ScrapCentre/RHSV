// Test Mongoose select behavior - does "+password mustChangePassword" work correctly?
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

    const ExecutiveSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, default: "executive" },
        mustChangePassword: { type: Boolean, default: false }
    });

    const Executive = mongoose.model('Executive', ExecutiveSchema);

    const email = 'simarjeetsinghpadam50@gmail.com';

    // Test 1: Normal find
    console.log('\n=== Test 1: Normal findOne (no select) ===');
    const t1 = await Executive.findOne({ email }).lean();
    console.log('  Has password:', !!t1?.password);
    console.log('  Password starts $2:', t1?.password?.startsWith('$2'));
    console.log('  Has name:', !!t1?.name);
    console.log('  Has email:', !!t1?.email);
    console.log('  Fields:', Object.keys(t1 || {}));

    // Test 2: With .select("+password mustChangePassword") - exactly as in auth.ts
    console.log('\n=== Test 2: .select("+password mustChangePassword") ===');
    const t2 = await Executive.findOne({ email }).select("+password mustChangePassword").lean();
    console.log('  Has password:', !!t2?.password);
    console.log('  Password starts $2:', t2?.password?.startsWith('$2'));
    console.log('  Has name:', !!t2?.name);
    console.log('  Has email:', !!t2?.email);
    console.log('  Fields:', Object.keys(t2 || {}));

    // Test 3: With .select("+password +mustChangePassword")
    console.log('\n=== Test 3: .select("+password +mustChangePassword") ===');
    const t3 = await Executive.findOne({ email }).select("+password +mustChangePassword").lean();
    console.log('  Has password:', !!t3?.password);
    console.log('  Password starts $2:', t3?.password?.startsWith('$2'));
    console.log('  Has name:', !!t3?.name);
    console.log('  Has email:', !!t3?.email);
    console.log('  Fields:', Object.keys(t3 || {}));

    // Test 4: No select at all, just test bcrypt
    console.log('\n=== Test 4: Full bcrypt test as auth.ts does ===');
    const bcrypt = require('bcryptjs');
    const user = await Executive.findOne({ email }).select("+password mustChangePassword").lean();
    if (user) {
        const storedPw = user.password;
        const inputPw = 'iil2fmio64';
        const isHashed = storedPw?.startsWith("$2");
        console.log('  storedPw type:', typeof storedPw);
        console.log('  storedPw truthy:', !!storedPw);
        console.log('  isHashed:', isHashed);
        if (isHashed) {
            const isMatch = await bcrypt.compare(inputPw, storedPw);
            console.log('  bcrypt.compare result:', isMatch);
        } else {
            console.log('  Direct compare:', storedPw === inputPw);
        }
    }

    await mongoose.disconnect();
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
