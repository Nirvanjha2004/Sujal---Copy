import { S3Client } from '@aws-sdk/client-s3';

/**
 * AWS S3 Configuration Interface
 */
export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  cdnUrl?: string;
}

/**
 * Load and validate AWS S3 configuration from environment variables
 */
function loadS3Config(): S3Config {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const cdnUrl = process.env.AWS_CLOUDFRONT_URL;

  // Validate required environment variables
  const missingVars: string[] = [];
  
  if (!region) missingVars.push('AWS_REGION');
  if (!bucket) missingVars.push('AWS_S3_BUCKET');
  if (!accessKeyId) missingVars.push('AWS_ACCESS_KEY_ID');
  if (!secretAccessKey) missingVars.push('AWS_SECRET_ACCESS_KEY');

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required AWS environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env file and ensure all AWS credentials are configured.'
    );
  }

  return {
    region: region!,
    bucket: bucket!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    cdnUrl,
  };
}

/**
 * S3 Configuration object
 */
export const s3Config: S3Config = loadS3Config();

/**
 * S3 Client instance
 * Configured with credentials from environment variables
 */
export const s3Client = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
});

/**
 * Get the base URL for S3 objects
 * Uses CloudFront CDN URL if configured, otherwise uses direct S3 URL
 */
export function getS3BaseUrl(): string {
  if (s3Config.cdnUrl) {
    return s3Config.cdnUrl;
  }
  return `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com`;
}

/**
 * Validate S3 configuration on startup
 */
export function validateS3Config(): void {
  try {
    loadS3Config();
    console.log('✅ AWS S3 configuration loaded successfully');
    console.log(`   Region: ${s3Config.region}`);
    console.log(`   Bucket: ${s3Config.bucket}`);
    console.log(`   CDN: ${s3Config.cdnUrl || 'Not configured'}`);
  } catch (error) {
    console.error('❌ AWS S3 configuration error:', error);
    throw error;
  }
}
