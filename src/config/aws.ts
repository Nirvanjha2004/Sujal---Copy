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
  distributionId?: string;
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
  const distributionId = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID;

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
    distributionId,
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
 * Prioritizes CloudFront CDN URL if configured, otherwise uses direct S3 URL
 */
export function getS3BaseUrl(): string {
  // Prioritize CloudFront URL for better performance
  if (s3Config.cdnUrl) {
    return s3Config.cdnUrl;
  }
  return `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com`;
}

/**
 * Get the full URL for an image using CDN when available
 * @param key - S3 object key (path to the image)
 * @param format - Optional format override ('webp' | 'jpeg')
 * @returns Full URL to the image
 */
export function getImageUrl(key: string, format?: 'webp' | 'jpeg'): string {
  const baseUrl = getS3BaseUrl();
  
  // If WebP format requested and key ends with .jpg/.jpeg, modify the key
  if (format === 'webp' && /\.(jpg|jpeg)$/i.test(key)) {
    key = key.replace(/\.(jpg|jpeg)$/i, '.webp');
  }
  
  // If JPEG format requested and key ends with .webp, modify the key
  if (format === 'jpeg' && key.endsWith('.webp')) {
    key = key.replace('.webp', '.jpg');
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  
  return `${baseUrl}/${cleanKey}`;
}

/**
 * Interface for responsive image URLs
 */
export interface ResponsiveImageUrls {
  thumbnail: string;
  medium: string;
  large: string;
  thumbnailWebP: string;
  mediumWebP: string;
  largeWebP: string;
}

/**
 * Get all responsive image URLs for a base image key
 * Returns URLs for all size variants (thumbnail, medium, large) in both JPEG and WebP formats
 * @param baseKey - Base S3 object key (e.g., 'properties/123/original/image.jpg')
 * @returns Object containing all responsive image URLs
 */
export function getResponsiveImageUrls(baseKey: string): ResponsiveImageUrls {
  const baseUrl = getS3BaseUrl();
  
  // Extract path components
  // Expected format: properties/123/original/image.jpg or properties/123/large/image.jpg
  const parts = baseKey.split('/');
  const filename = parts[parts.length - 1];
  
  // Find the size folder index (original, large, medium, thumbnail)
  const sizeIndex = parts.findIndex(part => 
    ['original', 'large', 'medium', 'thumbnail'].includes(part.toLowerCase())
  );
  
  // Build base path (everything before the size folder)
  const basePath = sizeIndex > 0 ? parts.slice(0, sizeIndex).join('/') : parts.slice(0, -2).join('/');
  
  // Generate WebP filename
  const webpFilename = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  return {
    thumbnail: `${baseUrl}/${basePath}/thumbnail/${filename}`,
    medium: `${baseUrl}/${basePath}/medium/${filename}`,
    large: `${baseUrl}/${basePath}/large/${filename}`,
    thumbnailWebP: `${baseUrl}/${basePath}/thumbnail/${webpFilename}`,
    mediumWebP: `${baseUrl}/${basePath}/medium/${webpFilename}`,
    largeWebP: `${baseUrl}/${basePath}/large/${webpFilename}`,
  };
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
    console.log(`   Distribution ID: ${s3Config.distributionId || 'Not configured'}`);
  } catch (error) {
    console.error('❌ AWS S3 configuration error:', error);
    throw error;
  }
}
