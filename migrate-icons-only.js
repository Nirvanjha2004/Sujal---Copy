// Simple runner for icons migration
require('dotenv').config();
const { execSync } = require('child_process');

console.log('Starting icons migration to S3...\n');

try {
  execSync('npx ts-node src/scripts/migrate-landing-images-to-s3.ts', {
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
