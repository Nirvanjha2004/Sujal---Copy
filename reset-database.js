// Script to reset the database and fix the index issues
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log('🗄️ Dropping existing database...');
    await connection.execute(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\``);
    
    console.log('🗄️ Creating fresh database...');
    await connection.execute(`CREATE DATABASE \`${process.env.DB_NAME}\``);
    
    console.log('✅ Database reset complete!');
    console.log('Now run: npm run dev');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await connection.end();
  }
}

resetDatabase();