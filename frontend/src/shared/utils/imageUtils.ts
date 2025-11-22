/**
 * Image utility functions for responsive image loading with WebP support
 */

export interface ImageUrls {
  thumbnail_url?: string;
  medium_url?: string;
  large_url?: string;
  image_url?: string; // Original/fallback
  thumbnail_webp_url?: string;
  medium_webp_url?: string;
  large_webp_url?: string;
}

/**
 * Detect if the browser supports WebP format
 * Uses canvas toDataURL to check WebP support
 */
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if we've already cached the result
  if (typeof (window as any).__webpSupport !== 'undefined') {
    return (window as any).__webpSupport;
  }
  
  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    const support = elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    (window as any).__webpSupport = support;
    return support;
  }
  
  (window as any).__webpSupport = false;
  return false;
};

/**
 * Get the appropriate image URL based on context with WebP support
 */
export const getResponsiveImageUrl = (
  images: ImageUrls,
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium',
  preferWebP: boolean = true
): string => {
  const useWebP = preferWebP && supportsWebP();
  
  // Return appropriate size with WebP preference and fallback chain
  switch (size) {
    case 'thumbnail':
      if (useWebP && images.thumbnail_webp_url) return images.thumbnail_webp_url;
      return images.thumbnail_url || images.medium_url || images.image_url || '/placeholder.jpg';
    
    case 'medium':
      if (useWebP && images.medium_webp_url) return images.medium_webp_url;
      return images.medium_url || images.large_url || images.image_url || '/placeholder.jpg';
    
    case 'large':
      if (useWebP && images.large_webp_url) return images.large_webp_url;
      return images.large_url || images.image_url || '/placeholder.jpg';
    
    case 'original':
      return images.image_url || images.large_url || '/placeholder.jpg';
    
    default:
      return images.image_url || '/placeholder.jpg';
  }
};

/**
 * Get srcset for responsive images with WebP support
 */
export const getImageSrcSet = (images: ImageUrls, preferWebP: boolean = true): string => {
  const useWebP = preferWebP && supportsWebP();
  const srcSet: string[] = [];
  
  if (useWebP) {
    // Prefer WebP sources
    if (images.thumbnail_webp_url) {
      srcSet.push(`${images.thumbnail_webp_url} 300w`);
    }
    if (images.medium_webp_url) {
      srcSet.push(`${images.medium_webp_url} 800w`);
    }
    if (images.large_webp_url) {
      srcSet.push(`${images.large_webp_url} 1600w`);
    }
  } else {
    // Fallback to JPEG sources
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
 * Get picture element sources for WebP with JPEG fallback
 * Returns both WebP and JPEG sources for use in <picture> element
 */
export const getPictureSources = (images: ImageUrls): {
  webp: string;
  jpeg: string;
  webpSrcSet: string;
  jpegSrcSet: string;
} => {
  return {
    webp: images.medium_webp_url || images.medium_url || images.image_url || '/placeholder.jpg',
    jpeg: images.medium_url || images.image_url || '/placeholder.jpg',
    webpSrcSet: getImageSrcSet(images, true),
    jpegSrcSet: getImageSrcSet(images, false),
  };
};

/**
 * Get placeholder image
 */
export const getPlaceholderImage = (): string => {
  return '/placeholder.jpg';
};
