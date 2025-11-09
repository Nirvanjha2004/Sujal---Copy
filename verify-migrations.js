// Quick script to verify migration status
const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyMigrations() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USE