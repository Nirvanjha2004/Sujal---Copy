/**
 * OptimizedImage Component
 * 
 * A high-performance image component with:
 * - WebP format support with JPEG fallback
 * - Blur-up placeholder while loading
 * - Skeleton/shimmer loading states
 * - Error handling with retry logic
 * - Priority prop for preloading critical images
 * - Lazy loading for below-fold images
 * - Smooth fade-in transition when loaded
 * - Smart loading priorities with dynamic adjustment
 * - Concurrent request limiting per domain
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.5, 7.1, 7.3, 7.6, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

import { useState, useEffect, useRef } from 'react';
import {
  ImageUrls,
  getResponsiveImageUrl,
  getPictureSources,
  getImageSizes,
} from '@/shared/utils/imageUtils';
import {
  ImageLoadingPriorityManager,
  calculateImagePriority,
} from '@/shared/utils/imageLoadingPriority';

export interface OptimizedImageProps {
  /** Image URLs object with all size variants */
  images: ImageUrls;
  /** Alt text for accessibility */
  alt: string;
  /** Context determines which size to use and responsive behavior */
  context: 'list' | 'grid' | 'detail' | 'thumbnail';
  /** Priority loading for above-the-fold images (disables lazy loading) */
  priority?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Show blur placeholder while loading */
  showBlurPlaceholder?: boolean;
  /** Show skeleton loader while loading */
  showSkeleton?: boolean;
  /** Maximum retry attempts on error */
  maxRetries?: number;
  /** Custom aspect ratio (e.g., "16/9", "4/3") */
  aspectRatio?: string;
  /** Enable smart loading priority management (default: true) */
  enableSmartLoading?: boolean;
  /** Manual priority override (auto-calculated if not provided) */
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function OptimizedImage({
  images,
  alt,
  context,
  priority = false,
  className = '',
  onLoad,
  onError,
  showBlurPlaceholder = true,
  showSkeleton = false,
  maxRetries = 3,
  aspectRatio,
  enableSmartLoading = true,
  fetchPriority: manualFetchPriority,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentImageKey, setCurrentImageKey] = useState(0);
  const [calculatedPriority, setCalculatedPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const priorityManagerRef = useRef<ImageLoadingPriorityManager | null>(null);

  // Get picture sources for WebP and JPEG
  const sources = getPictureSources(images);
  const sizes = getImageSizes(context);
  const fallbackUrl = getResponsiveImageUrl(images, getSizeFromContext(context), false);

  // Determine fetch priority
  const fetchPriorityValue = manualFetchPriority || 
    (priority ? 'high' : calculatedPriority === 'low' ? 'low' : 'auto');

  // Track load start time for performance monitoring
  useEffect(() => {
    startTimeRef.current = performance.now();
  }, []);

  // Calculate initial priority based on position
  useEffect(() => {
    if (!enableSmartLoading || priority || manualFetchPriority) return;
    
    if (containerRef.current) {
      const initialPriority = calculateImagePriority(containerRef.current);
      setCalculatedPriority(initialPriority);
    }
  }, [enableSmartLoading, priority, manualFetchPriority]);

  // Register with smart loading priority manager
  useEffect(() => {
    if (!enableSmartLoading || !imgRef.current) return;

    // Get priority manager instance
    priorityManagerRef.current = ImageLoadingPriorityManager.getInstance();

    // Determine priority
    const imagePriority = priority ? 'high' : calculatedPriority;

    // Register image
    priorityManagerRef.current.registerImage(
      imgRef.current,
      imagePriority,
      handleLoad,
      handleError
    );

    return () => {
      if (priorityManagerRef.current && imgRef.current) {
        priorityManagerRef.current.unregisterImage(imgRef.current);
      }
    };
  }, [enableSmartLoading, priority, calculatedPriority, currentImageKey]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    
    // Performance tracking
    const loadTime = performance.now() - startTimeRef.current;
    if (loadTime > 1000) {
      console.warn(`Slow image load: ${fallbackUrl} took ${loadTime.toFixed(0)}ms`);
    }
    
    onLoad?.();
  };

  const handleError = () => {
    if (retryCount < maxRetries) {
      // Retry with exponential backoff
      const backoffDelay = Math.pow(2, retryCount) * 1000;
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setCurrentImageKey(prev => prev + 1);
        setHasError(false);
      }, backoffDelay);
    } else {
      setHasError(true);
      onError?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Skeleton loader */}
      {showSkeleton && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
      )}

      {/* Blur placeholder */}
      {showBlurPlaceholder && !isLoaded && !hasError && !showSkeleton && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Main image with picture element for format fallback */}
      {!hasError && (
        <picture key={currentImageKey}>
          {/* WebP source */}
          <source
            type="image/webp"
            srcSet={sources.webpSrcSet}
            sizes={sizes}
          />
          
          {/* JPEG fallback source */}
          <source
            type="image/jpeg"
            srcSet={sources.jpegSrcSet}
            sizes={sizes}
          />
          
          {/* Fallback img element */}
          <img
            ref={imgRef}
            src={enableSmartLoading ? undefined : fallbackUrl}
            data-src={enableSmartLoading ? fallbackUrl : undefined}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={fetchPriorityValue}
            onLoad={enableSmartLoading ? undefined : handleLoad}
            onError={enableSmartLoading ? undefined : handleError}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            decoding="async"
          />
        </picture>
      )}

      {/* Error state with retry option */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
          <svg
            className="w-12 h-12 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">Failed to load image</span>
          {retryCount >= maxRetries && (
            <button
              onClick={() => {
                setRetryCount(0);
                setHasError(false);
                setCurrentImageKey(prev => prev + 1);
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Loading indicator for priority images */}
      {priority && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to map context to image size
 */
function getSizeFromContext(context: 'list' | 'grid' | 'detail' | 'thumbnail'): 'thumbnail' | 'medium' | 'large' {
  switch (context) {
    case 'thumbnail':
      return 'thumbnail';
    case 'list':
    case 'grid':
      return 'medium';
    case 'detail':
      return 'large';
    default:
      return 'medium';
  }
}
