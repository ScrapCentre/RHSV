const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function main() {
  // 1. Generate hash for scrapcentre@789
  const password = 'scrapcentre@789';
  const salt = await bcrypt.genSalt(10);
  const rawHash = await bcrypt.hash(password, salt);
  console.log('Raw generated hash:', rawHash);
  
  // Escape $ as \$ for Next.js env files
  const escapedHash = rawHash.replace(/\$/g, '\\$');
  console.log('Escaped hash for env file:', escapedHash);

  // 2. Read and update .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Find current ADMIN_PASSWORD line
  const passwordLineRegex = /^ADMIN_PASSWORD=.*$/m;
  const newPasswordLine = `ADMIN_PASSWORD=${escapedHash}`;
  
  if (envContent.match(passwordLineRegex)) {
    envContent = envContent.replace(passwordLineRegex, newPasswordLine);
    console.log('Updated ADMIN_PASSWORD in .env.local');
  } else {
    console.log('Could not find ADMIN_PASSWORD line in .env.local to replace.');
    return;
  }
  
  fs.writeFileSync(envPath, envContent, 'utf8');

  // 3. Connect to MongoDB and clear rate limit / lockout records
  // Extract MongoDB URI from envContent
  let mongoUri = '';
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim();
      const val = trimmed.substring(eqIndex + 1).trim();
      if (key === 'MONGODB_URI') {
        mongoUri = val;
      }
    }
  });

  if (!mongoUri) {
    console.error('MONGODB_URI not found in .env.local');
    return;
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const RateLimit = mongoose.model('RateLimit', new mongoose.Schema({
    key: String,
    count: Number,
    resetAt: Date
  }));

  const cleared = await RateLimit.deleteMany({
    key: { $regex: /(scrapcentreadmin|sc01|login)/i }
  });
  console.log(`Cleared ${cleared.deletedCount} lockout/rate limit records from DB.`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(console.error);
