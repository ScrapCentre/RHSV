const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const originalContent = fs.readFileSync(envPath, 'utf8');

try {
  // Let's replace the ADMIN_PASSWORD line with an escaped version
  const modifiedContent = originalContent.replace(
    'ADMIN_PASSWORD=$2a$10$wK1mY6n04tH7v9tE2wXbIe.W5WdC6G13tH3K8I.e1D5c4aB2K3m4a',
    'ADMIN_PASSWORD=\\$2a\\$10\\$wK1mY6n04tH7v9tE2wXbIe.W5WdC6G13tH3K8I.e1D5c4aB2K3m4a'
  );
  
  fs.writeFileSync(envPath, modifiedContent, 'utf8');
  
  // Clear require cache/env cache and reload
  delete require.cache[require.resolve('@next/env')];
  const { loadEnvConfig } = require('@next/env');
  // Next.js loadEnvConfig won't reload if already loaded, so we pass forceReload if available or delete from process.env
  delete process.env.ADMIN_PASSWORD;
  loadEnvConfig(process.cwd());
  
  console.log('Parsed ADMIN_PASSWORD after escaping:', process.env.ADMIN_PASSWORD);
} finally {
  // Restore original content
  fs.writeFileSync(envPath, originalContent, 'utf8');
}
