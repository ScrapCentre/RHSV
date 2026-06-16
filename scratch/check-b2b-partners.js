const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const B2BPartner = mongoose.model('B2BPartner', new mongoose.Schema({
    userId: String,
    businessName: String,
    password: { type: String, select: true },
    email: String
  }, { collection: 'b2bpartner' }));

  const partners = await B2BPartner.find({}).lean();
  console.log('\nAll B2B Partners in DB:', partners);

  await mongoose.disconnect();
}

main().catch(console.error);
