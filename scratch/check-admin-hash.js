const bcrypt = require('bcryptjs');

const hashes = {
  dbHash: '$2b$10$OO5OCDCWt4GC8SKlQ9IHm.eSJaD3PfhwjfsPAaaZ6/PcBNQ1uob5G',
  envHash: '$2a$10$wK1mY6n04tH7v9tE2wXbIe.W5WdC6G13tH3K8I.e1D5c4aB2K3m4a'
};

const candidates = [
  'scrapcentre@789',
  'scrapcentre@123',
  'admin',
  'admin123',
  'admin@123',
  'scrapcentre',
  'scrapcentre123',
  'sc01',
  'sc01@123',
  'sc01@789',
  'scrapcentreadmin',
  'scrapcentreadmin@789',
  'scrapcentreadmin@123',
  'scrapcentre@7890'
];

async function run() {
  for (const [name, hash] of Object.entries(hashes)) {
    console.log(`\nTesting for ${name}:`);
    for (const cand of candidates) {
      const match = await bcrypt.compare(cand, hash);
      if (match) {
        console.log(`  🎉 Found match: "${cand}"`);
      }
    }
  }
}

run();
