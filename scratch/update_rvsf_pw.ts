import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    
    // Hash password "xyz"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("xyz", salt);

    const RVSFUser = mongoose.models.RVSFUser || mongoose.model('RVSFUser', new mongoose.Schema({}, { strict: false }));
    const result = await RVSFUser.updateOne(
        { rvsfId: "rvsf01@gmail.com" },
        { $set: { password: hashedPassword } }
    );
    console.log("Updated password result:", result);

    await mongoose.connection.close();
}

run().catch(console.error);
