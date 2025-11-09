// Quick S3 Connection Test
require('dotenv').config();
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

async function testS3Connection() {
  console.log('Testing AWS S3 Connection...\n');
  
  console.log('Configuration:');
  console.log('- Region:', process.env.AWS_REGION);
  console.log('- Bucket:', process.env.AWS_S3_BUCKET);
  console.log('- Access Key:', process.env.AWS_ACCESS_KEY_ID ? '✓ Set' : '✗ Missing');
  console.log('- Secret Key:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Set' : '✗ Missing');
  console.log('');

  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log('Attempting to list buckets...');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    console.log('\n✅ SUCCESS! Connected to AWS S3');
    console.log('\nYour buckets:');
    response.Buckets.forEach((bucket) => {
      const isTarget = bucket.Name === process.env.AWS_S3_BUCKET;
      console.log(`  ${isTarget ? '→' : ' '} ${bucket.Name}${isTarget ? ' (configured)' : ''}`);
    });

    const bucketExists = response.Buckets.some(b => b.Name === process.env.AWS_S3_BUCKET);
    if (bucketExists) {
      console.log('\n✅ Your configured bucket exists!');
    } else {
      console.log('\n⚠️  Warning: Configured bucket not found. Please create it in AWS Console.');
    }

  } catch (error) {
    console.log('\n❌ ERROR: Failed to connect to AWS S3');
    console.log('Error:', error.message);
    
    if (error.message.includes('credentials')) {
      console.log('\n💡 Tip: Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file');
    } else if (error.message.includes('region')) {
      console.log('\n💡 Tip: Check your AWS_REGION in .env file');
    }
  }
}

testS3Connection();
