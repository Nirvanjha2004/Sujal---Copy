// Run S3 Migration Directly
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runS3Migration() {
  console.log('Running S3 Migration...\n');

  let connection;
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
    });

    console.log('✓ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, 'src', 'migrations', '021-add-s3-columns-to-property-images.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('✓ Read migration file');
    console.log('\nExecuting migration...\n');

    // Execute migration
    await connection.query(migrationSQL);

    console.log('✅ SUCCESS! S3 columns added to property_images table');
    console.log('\nColumns added:');
    console.log('  - s3_key');
    console.log('  - s3_bucket');
    console.log('  - thumbnail_url');
    console.log('  - medium_url');
    console.log('  - large_url');
    console.log('  - file_size');
    console.log('  - mime_type');
    console.log('  - width');
    console.log('  - height');
    console.log('  - is_primary');
    console.log('\nIndexes created:');
    console.log('  - idx_property_images_s3_key');
    console.log('  - idx_property_images_is_primary');

  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('⚠️  Columns already exist - migration already run');
    } else {
      console.log('❌ ERROR:', error.message);
      throw error;
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Database connection closed');
    }
  }
}

runS3Migration().catch(console.error);
