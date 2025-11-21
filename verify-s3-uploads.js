/**
 * Verification script to check S3 uploads
 */
const https = require('https');

const baseUrl = 'https://real-estate-portal-images-dev.s3.ap-south-1.amazonaws.com';

// Sample images to verify
const testImages = [
  'landing-page/images/1.png',
  'landing-page/images/topbanner.png',
  'landing-page/images/redBanner.png',
  'landing-page/projects/shalimar/C4 (3).jpg',
  'landing-page/projects/Amanora/Gateway II Main Brochure Final_page-0005.jpg',
  'landing-page/projects/Casagrand/ENTRANCE LOBBY.jpg',
  'landing-page/projects/DSRVALAR/DSR Valar Brochure _page-0002.jpg'
];

console.log('🔍 Verifying S3 uploads...\n');
console.log(`Base URL: ${baseUrl}\n`);

let successCount = 0;
let failCount = 0;

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${url}`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content-Type: ${res.headers['content-type']}`);
        console.log(`   Content-Length: ${(parseInt(res.headers['content-length']) / 1024).toFixed(2)} KB`);
        console.log('');
        successCount++;
        resolve(true);
      } else {
        console.log(`❌ ${url}`);
        console.log(`   Status: ${res.statusCode}`);
        console.log('');
        failCount++;
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`❌ ${url}`);
      console.log(`   Error: ${err.message}`);
      console.log('');
      failCount++;
      resolve(false);
    });
  });
}

async function verifyAll() {
  for (const imagePath of testImages) {
    const url = `${baseUrl}/${imagePath}`;
    await checkUrl(url);
  }
  
  console.log('='.repeat(80));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tested: ${testImages.length}`);
  console.log(`✅ Accessible: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`🎯 Success Rate: ${((successCount / testImages.length) * 100).toFixed(2)}%`);
  
  if (failCount === 0) {
    console.log('\n🎉 All sample images are publicly accessible!');
  } else {
    console.log('\n⚠️  Some images failed verification. Check S3 bucket policy.');
  }
}

verifyAll();
