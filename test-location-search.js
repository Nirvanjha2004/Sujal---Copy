// Test script to verify location filtering
// Run this with: node test-location-search.js

const fetch = require('node-fetch');

async function testLocationSearch() {
    const baseUrl = 'http://localhost:3000/api/v1/properties';
    
    console.log('=== Testing Location Search ===\n');
    
    try {
        // Test 1: Search with location parameter
        console.log('1. Testing location parameter search:');
        const response1 = await fetch(`${baseUrl}?location=Maharashtra`);
        const result1 = await response1.json();
        console.log(`   Found ${result1.data?.length || 0} properties for location=Maharashtra`);
        
        // Test 2: Search with keywords parameter  
        console.log('2. Testing keywords parameter search:');
        const response2 = await fetch(`${baseUrl}?keywords=Maharashtra`);
        const result2 = await response2.json();
        console.log(`   Found ${result2.data?.length || 0} properties for keywords=Maharashtra`);
        
        // Test 3: Search with state parameter
        console.log('3. Testing state parameter search:');
        const response3 = await fetch(`${baseUrl}?state=Maharashtra`);
        const result3 = await response3.json();
        console.log(`   Found ${result3.data?.length || 0} properties for state=Maharashtra`);
        
        // Test 4: Get all properties
        console.log('4. Testing get all properties:');
        const response4 = await fetch(baseUrl);
        const result4 = await response4.json();
        console.log(`   Total properties: ${result4.data?.length || 0}`);
        
        // Show state distribution
        console.log('\n=== State Distribution ===');
        if (result4.data) {
            const states = {};
            result4.data.forEach(prop => {
                const state = prop.state || 'Unknown';
                states[state] = (states[state] || 0) + 1;
            });
            console.log('States found:', states);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the test
testLocationSearch();