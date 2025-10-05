// Quick script to verify the routes are properly configured
const express = require('express');

console.log('Checking if routes module exists...');

try {
  // This will help verify the compiled routes exist
  const routes = require('./dist/routes/index.js');
  console.log('✅ Routes module loaded successfully');
  
  const propertyRoutes = require('./dist/routes/propertyRoutes.js');
  console.log('✅ Property routes module loaded successfully');
  
  console.log('\nExpected route structure:');
  console.log('- /api/v1/properties (GET, POST)');
  console.log('- /api/v1/properties/:id (GET, PUT, DELETE)');
  console.log('- /api/v1/properties/search (GET)');
  console.log('- /api/v1/properties/my-properties (GET)');
  console.log('\nIf you see this message, your routes are compiled correctly.');
  console.log('Make sure to restart your backend server with: npm run dev');
  
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  console.log('\nPlease run: npm run build');
}
