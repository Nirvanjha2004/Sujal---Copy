/**
 * ImagePreloadHead Component
 * 
 * Manages preloading and prefetching of images for optimal performance.
 * Adds dns-prefetch, preconnect, preload, and prefetch link tags to the document head.
 * 
 * Features:
 * - DNS prefetch for CloudFront domain (early DNS resolution)
 * - Preconnect for CloudFront domain (early connection establishment)
 * - Preload links for critical above-the-fold images (high priority)
 * - Prefetch links for likely-needed images (low priority)
 * - Dynamic image list support
 * - Automatic cleanup on unmount
 * 
 * Requirements: 3.1, 3.3, 5.1, 5.2, 5.6
 * 
 * @example
 * ```tsx
 * <ImagePreloadHead
 *   cdnUrl="https://d1234567890.cloudfront.net"
 *   criticalImages={[
 *     'https://d1234567890.cloudfront.net/images/hero.jpg',
 *     'https://d1234567890.cloudfront.net/images/featured-1.jpg'
 *   ]}
 *   prefetchImages={[
 *     'https://d1234567890.cloudfront.net/images/gallery-1.jpg'
 *   ]}
 * />
 * ```
 */

import { useEffect, useRef } from 'react';

export interface ImagePreloadHeadProps {
  /** CloudFront CDN URL for dns-prefetch and preconnect */
  cdnUrl: string;
  /** Critical images to preload with high priority (above-the-fold) */
  criticalImages?: string[];
  /** Images to prefetch with low priority (likely-needed) */
  prefetchImages?: string[];
  /** Enable dns-prefetch (default: true) */
  enableDnsPrefetch?: boolean;
  /** Enable preconnect (default: true) */
  enablePreconnect?: boolean;
}

export function ImagePreloadHead({
  cdnUrl,
  criticalImages = [],
  prefetchImages = [],
  enableDnsPrefetch = true,
  enablePreconnect = true,
}: ImagePreloadHeadProps) {
  // Store references to created link elements for cleanup
  const linkElementsRef = useRef<HTMLLinkElement[]>([]);

  useEffect(() => {
    const linkElements: HTMLLinkElement[] = [];

    // Helper function to create and append link element
    const createLinkElement = (
      rel: string,
      href: string,
      options?: {
        as?: string;
        fetchPriority?: 'high' | 'low' | 'auto';
        crossOrigin?: string;
      }
    ): HTMLLinkElement => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;

      if (options?.as) {
        link.as = options.as;
      }

      if (options?.fetchPriority) {
        link.setAttribute('fetchpriority', options.fetchPriority);
      }

      if (options?.crossOrigin) {
        link.crossOrigin = options.crossOrigin;
      }

      // Add data attribute for easier identification and cleanup
      link.setAttribute('data-image-preload-head', 'true');

      document.head.appendChild(link);
      linkElements.push(link);

      return link;
    };

    // Extract domain from CDN URL for dns-prefetch and preconnect
    const cdnDomain = extractDomain(cdnUrl);

    // 1. Add dns-prefetch for CloudFront domain (Requirement 5.1)
    // DNS prefetch resolves the domain name early, reducing DNS lookup time
    if (enableDnsPrefetch && cdnDomain) {
      createLinkElement('dns-prefetch', cdnDomain);
    }

    // 2. Add preconnect for CloudFront domain (Requirement 5.2, 5.6)
    // Preconnect establishes early connection (DNS + TCP + TLS), reducing connection time
    if (enablePreconnect && cdnDomain) {
      createLinkElement('preconnect', cdnDomain, {
        crossOrigin: 'anonymous',
      });
    }

    // 3. Preload critical images with high priority (Requirement 3.1, 3.3)
    // Preload tells the browser to fetch these resources immediately
    criticalImages.forEach((imageUrl) => {
      if (imageUrl && isValidUrl(imageUrl)) {
        createLinkElement('preload', imageUrl, {
          as: 'image',
          fetchPriority: 'high',
        });
      }
    });

    // 4. Prefetch likely-needed images with low priority (Requirement 3.3)
    // Prefetch hints that these resources might be needed soon
    prefetchImages.forEach((imageUrl) => {
      if (imageUrl && isValidUrl(imageUrl)) {
        createLinkElement('prefetch', imageUrl, {
          as: 'image',
        });
      }
    });

    // Store references for cleanup
    linkElementsRef.current = linkElements;

    // Cleanup function: remove all created link elements on unmount
    return () => {
      linkElements.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
      linkElementsRef.current = [];
    };
  }, [cdnUrl, criticalImages, prefetchImages, enableDnsPrefetch, enablePreconnect]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Extract domain from URL for dns-prefetch and preconnect
 * @param url - Full URL
 * @returns Domain with protocol (e.g., "https://example.com")
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch (error) {
    console.warn(`Invalid URL for domain extraction: ${url}`);
    return '';
  }
}

/**
 * Validate if a string is a valid URL
 * @param url - URL string to validate
 * @returns true if valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Hook to get CloudFront URL from environment
 * @returns CloudFront URL or fallback S3 URL
 */
export function useCloudFrontUrl(): string {
  // Get CloudFront URL from environment variable
  const cloudFrontUrl = import.meta.env.VITE_AWS_CLOUDFRONT_URL;
  
  // Fallback to S3 URL if CloudFront not configured
  if (!cloudFrontUrl) {
    const region = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
    const bucket = import.meta.env.VITE_AWS_S3_BUCKET || 'real-estate-portal-images-dev';
    return `https://${bucket}.s3.${region}.amazonaws.com`;
  }
  
  return cloudFrontUrl;
}

/**
 * Default export for convenience
 */
export default ImagePreloadHead;
