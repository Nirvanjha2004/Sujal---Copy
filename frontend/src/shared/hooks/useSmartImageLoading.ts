/**
 * React hook for smart image loading with priority management
 * 
 * Provides easy integration with the ImageLoadingPriorityManager
 * for React components.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

import { useEffect, useRef, useState } from 'react';
import {
  ImageLoadingPriorityManager,
  calculateImagePriority,
  LoadingPriorityConfig,
} from '@/shared/utils/imageLoadingPriority';

export interface UseSmartImageLoadingOptions {
  /** Enable smart loading (default: true) */
  enabled?: boolean;
  /** Manual priority override */
  priority?: 'high' | 'medium' | 'low';
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails */
  onError?: () => void;
  /** Custom configuration */
  config?: Partial<LoadingPriorityConfig>;
}

export interface UseSmartImageLoadingReturn {
  /** Ref to attach to image element */
  imageRef: React.RefObject<HTMLImageElement>;
  /** Ref to attach to container element for position calculation */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Current calculated priority */
  priority: 'high' | 'medium' | 'low';
  /** Whether image is currently loading */
  isLoading: boolean;
  /** Loading statistics */
  stats: {
    loadingByDomain: Record<string, number>;
    queuedByDomain: Record<string, number>;
    totalLoading: number;
    totalQueued: number;
  };
}

/**
 * Hook for smart image loading with automatic priority management
 */
export function useSmartImageLoading(
  options: UseSmartImageLoadingOptions = {}
): UseSmartImageLoadingReturn {
  const {
    enabled = true,
    priority: manualPriority,
    onLoad,
    onError,
    config,
  } = options;

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [calculatedPriority, setCalculatedPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    loadingByDomain: {},
    queuedByDomain: {},
    totalLoading: 0,
    totalQueued: 0,
  });

  const managerRef = useRef<ImageLoadingPriorityManager | null>(null);

  // Initialize manager
  useEffect(() => {
    if (!enabled) return;
    
    managerRef.current = ImageLoadingPriorityManager.getInstance(config);
  }, [enabled, config]);

  // Calculate initial priority based on position
  useEffect(() => {
    if (!enabled || manualPriority || !containerRef.current) return;

    const priority = calculateImagePriority(containerRef.current);
    setCalculatedPriority(priority);
  }, [enabled, manualPriority]);

  // Register image with manager
  useEffect(() => {
    if (!enabled || !imageRef.current || !managerRef.current) return;

    const priority = manualPriority || calculatedPriority;
    setIsLoading(true);

    const handleLoadComplete = () => {
      setIsLoading(false);
      onLoad?.();
    };

    const handleLoadError = () => {
      setIsLoading(false);
      onError?.();
    };

    managerRef.current.registerImage(
      imageRef.current,
      priority,
      handleLoadComplete,
      handleLoadError
    );

    return () => {
      if (managerRef.current && imageRef.current) {
        managerRef.current.unregisterImage(imageRef.current);
      }
    };
  }, [enabled, manualPriority, calculatedPriority, onLoad, onError]);

  // Update stats periodically
  useEffect(() => {
    if (!enabled || !managerRef.current) return;

    const updateStats = () => {
      if (managerRef.current) {
        setStats(managerRef.current.getStats());
      }
    };

    // Update stats every second
    const interval = setInterval(updateStats, 1000);
    updateStats(); // Initial update

    return () => clearInterval(interval);
  }, [enabled]);

  return {
    imageRef,
    containerRef,
    priority: manualPriority || calculatedPriority,
    isLoading,
    stats,
  };
}

/**
 * Hook to get loading statistics without registering an image
 */
export function useImageLoadingStats() {
  const [stats, setStats] = useState({
    loadingByDomain: {},
    queuedByDomain: {},
    totalLoading: 0,
    totalQueued: 0,
  });

  useEffect(() => {
    const manager = ImageLoadingPriorityManager.getInstance();

    const updateStats = () => {
      setStats(manager.getStats());
    };

    const interval = setInterval(updateStats, 1000);
    updateStats();

    return () => clearInterval(interval);
  }, []);

  return stats;
}
