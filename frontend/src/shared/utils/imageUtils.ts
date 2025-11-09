/**
 * Image utility functions for responsive image loading
 */

export interface ImageUrls {
  thumbnail_url?: string;
  medium_url?: string;
  large_url?: string;
  image_url?: string; // Original/fallback
}

/**
 * Get the appropriate image URL based on context
 */
export const getResponsiveImageUrl = (
  images: ImageUrls,
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium'
): string => {
  // Return appropriate size with fallback chain
  switch (size) {
    case 'thumbnail':
      return images.thumbnail_url || images.medium_url || images.image_url || '/placeholder.jpg';
    
    case 'medium':
      return images.medium_url || images.large_url || images.image_url || '/placeholder.jpg';
    
    case 'large':
      return images.large_url || images.image_url || '/placeholder.jpg';
    
    case 'original':
      return images.image_url || images.large_url || '/placeholder.jpg';
    
    default:
      return images.image_url || '/placeholder.jpg';
  }
};

/**
 * Get srcset for responsive images
 */
export const getImageSrcSet = (images: ImageUrls): string => {
  const srcSet: string[] = [];
  
  if (images.thumbnail_url) {
    srcSet.push(`${images.thumbnail_url} 300w`);
  }
  if (images.medium_url) {
    srcSet.push(`${images.medium_url} 800w`);
  }
  if (images.large_url) {
    srcSet.push(`${images.large_url} 1600w`);
  }
  if (images.image_url && !images.large_url) {
    srcSet.push(`${images.image_url} 2000w`);
  }
  
  return srcSet.join(', ');
};

/**
 * Get sizes attribute for responsive images
 */
export const getImageSizes = (context: 'card' | 'list' | 'grid' | 'detail' | 'thumbnail'): string => {
  switch (context) {
    case 'thumbnail':
      return '(max-width: 640px) 100px, 150px';
    
    case 'card':
    case 'list':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    
    case 'grid':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px';
    
    case 'detail':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px';
    
    default:
      return '100vw';
  }
};

/**
 * Get the best image for a specific context
 */
export const getContextualImage = (
  images: ImageUrls,
  context: 'list' | 'grid' | 'detail' | 'thumbnail'
): string => {
  switch (context) {
    case 'thumbnail':
      return getResponsiveImageUrl(images, 'thumbnail');
    
    case 'list':
    case 'grid':
      return getResponsiveImageUrl(images, 'medium');
    
    case 'detail':
      return getResponsiveImageUrl(images, 'large');
    
    default:
      return getResponsiveImageUrl(images, 'medium');
  }
};

/**
 * Check if image URLs are S3 URLs (for migration compatibility)
 */
export const isS3Image = (url: string): boolean => {
  return url.includes('s3.') || url.includes('amazonaws.com') || url.includes('cloudfront.net');
};

/**
 * Get placeholder image
 */
export const getPlaceholderImage = (): string => {
  return '/placeholder.jpg';
};
