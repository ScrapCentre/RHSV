const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

async function run() {
  const mod = await import('../lib/auth');
  const { authOptions } = mod.default;
  const mongoose = (await import('mongoose')).default;
  
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Partner Portal should be Index 2
  const provider = authOptions.providers[2];
  if (!provider) {
     console.error('Index 2 not found');
     await mongoose.disconnect();
     return;
  }

  const authorizeFn = provider.options.authorize;

  // 1. Try lowercase b2b64774 with password: tsv73jks61
  try {
    console.log('\n--- Simulating login with lowercase "b2b64774" ---');
    const user = await authorizeFn({
      userId: 'b2b64774',
      password: 'tsv73jks61'
    }, {});
    console.log('Result:', user);
  } catch (err) {
    console.error('Login failed with error:', err.message || err);
  }

  // 2. Try uppercase B2B64774 with password: tsv73jks61
  try {
    console.log('\n--- Simulating login with uppercase "B2B64774" ---');
    const user = await authorizeFn({
      userId: 'B2B64774',
      password: 'tsv73jks61'
    }, {});
    console.log('Result:', user);
  } catch (err) {
    console.error('Login failed with error:', err.message || err);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
