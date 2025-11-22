/**
 * S3 Image Utilities
 * 
 * Provides utility functions for generating S3 URLs for landing page images.
 * Supports both direct S3 bucket URLs and CloudFront CDN URLs.
 */

interface S3ImageConfig {
  bucket: string;
  region: string;
  cdnUrl?: string;
}

/**
 * Get S3 base URL (bucket or CDN)
 * 
 * @returns The base URL for S3 images (CDN if configured, otherwise S3 bucket URL)
 */
export function getS3BaseUrl(): string {
  // Check for CloudFront CDN URL first (preferred for performance)
  const cdnUrl = import.meta.env.VITE_AWS_CLOUDFRONT_URL;
  if (cdnUrl) {
    return cdnUrl.endsWith('/') ? cdnUrl.slice(0, -1) : cdnUrl;
  }
  
  // Fall back to direct S3 bucket URL
  const bucket = import.meta.env.VITE_AWS_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
  
  if (!bucket || !region) {
    console.warn('S3 configuration missing (VITE_AWS_S3_BUCKET or VITE_AWS_REGION). Image URLs may not work correctly.');
    return '';
  }
  
  return `https://${bucket}.s3.${region}.amazonaws.com`;
}

/**
 * Check if S3 is properly configured
 * 
 * @returns True if S3 environment variables are configured, false otherwise
 */
export function isS3Configured(): boolean {
  const bucket = import.meta.env.VITE_AWS_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
  
  return !!(bucket && region);
}

/**
 * Get S3 URL for a landing page image
 * 
 * Converts a relative path to a full S3 URL. Handles various path formats:
 * - "images/1.png" -> "https://cdn.cloudfront.net/landing-page/images/1.png"
 * - "projects/shalimar/C4 (3).jpg" -> "https://cdn.cloudfront.net/landing-page/projects/shalimar/C4 (3).jpg"
 * - "/landingpage/images/1.png" -> "https://cdn.cloudfront.net/landing-page/images/1.png"
 * - "/landingpage/ProjectImages/shalimar/c1.jpg" -> "https://cdn.cloudfront.net/landing-page/projects/shalimar/c1.jpg"
 * 
 * Note: Legacy paths with 'landingpage/ProjectImages/' are automatically converted to 'landing-page/projects/'
 * 
 * @param path - Relative path to the image (e.g., 'images/1.png' or 'projects/shalimar/C4 (3).jpg')
 * @returns Full S3 URL for the image
 */
export function getS3ImageUrl(path: string): string {
  const baseUrl = getS3BaseUrl();
  
  if (!baseUrl) {
    console.error(`Cannot generate S3 URL for path "${path}": S3 not configured`);
    return '';
  }

  let cleanPath = path.trim();

  // Remove leading slash
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }

  // Handle legacy paths that start with 'landingpage/' (without hyphen)
  if (cleanPath.startsWith('landingpage/')) {
    // Remove 'landingpage/' prefix
    cleanPath = cleanPath.slice('landingpage/'.length);
    
    // Convert 'ProjectImages' to 'projects' to match S3 structure
    if (cleanPath.startsWith('ProjectImages/')) {
      cleanPath = cleanPath.replace('ProjectImages/', 'projects/');
    }
    
    // Add 'landing-page/' prefix (with hyphen)
    cleanPath = `landing-page/${cleanPath}`;
  } else if (!cleanPath.startsWith('landing-page/')) {
    // For paths that don't start with 'landingpage/' or 'landing-page/', add the prefix
    cleanPath = `landing-page/${cleanPath}`;
  }

  // Encode unsafe URL characters (spaces, parentheses, etc.)
  const encodedPath = cleanPath
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/');

  return `${baseUrl}/${encodedPath}`;
}


/**
 * Get S3 configuration details
 * 
 * @returns Current S3 configuration
 */
export function getS3Config(): S3ImageConfig | null {
  const bucket = import.meta.env.VITE_AWS_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
  const cdnUrl = import.meta.env.VITE_AWS_CLOUDFRONT_URL;
  
  if (!bucket || !region) {
    return null;
  }
  
  return {
    bucket,
    region,
    cdnUrl: cdnUrl || undefined,
  };
}
