/**
 * Image Loading Priority Manager
 * 
 * Manages smart loading priorities for images:
 * - Limits concurrent image requests per domain
 * - Dynamically adjusts priorities based on viewport visibility
 * - Prioritizes above-the-fold images
 * - Implements request queuing for optimal performance
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

export interface ImageLoadRequest {
  url: string;
  priority: 'high' | 'medium' | 'low';
  element: HTMLImageElement;
  onLoad?: () => void;
  onError?: () => void;
}

export interface LoadingPriorityConfig {
  maxConcurrentPerDomain: number;
  highPriorityThreshold: number; // pixels from viewport
  mediumPriorityThreshold: number;
  enableDynamicPriority: boolean;
}

const DEFAULT_CONFIG: LoadingPriorityConfig = {
  maxConcurrentPerDomain: 6, // HTTP/2 optimal concurrent connections
  highPriorityThreshold: 0, // In viewport
  mediumPriorityThreshold: 500, // 500px below viewport
  enableDynamicPriority: true,
};

/**
 * Singleton class to manage image loading priorities across the application
 */
export class ImageLoadingPriorityManager {
  private static instance: ImageLoadingPriorityManager;
  private config: LoadingPriorityConfig;
  
  // Track loading state per domain
  private loadingByDomain: Map<string, Set<string>> = new Map();
  
  // Queue of pending requests per domain
  private queueByDomain: Map<string, ImageLoadRequest[]> = new Map();
  
  // Intersection observer for dynamic priority adjustment
  private intersectionObserver: IntersectionObserver | null = null;
  
  // Track observed elements
  private observedElements: WeakMap<HTMLImageElement, ImageLoadRequest> = new WeakMap();

  private constructor(config: Partial<LoadingPriorityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeIntersectionObserver();
  }

  static getInstance(config?: Partial<LoadingPriorityConfig>): ImageLoadingPriorityManager {
    if (!ImageLoadingPriorityManager.instance) {
      ImageLoadingPriorityManager.instance = new ImageLoadingPriorityManager(config);
    }
    return ImageLoadingPriorityManager.instance;
  }

  /**
   * Initialize intersection observer for dynamic priority adjustment
   */
  private initializeIntersectionObserver(): void {
    if (typeof window === 'undefined' || !this.config.enableDynamicPriority) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLImageElement;
          const request = this.observedElements.get(element);
          
          if (!request) return;

          // Adjust priority based on visibility
          if (entry.isIntersecting) {
            // Image is in viewport - upgrade to high priority
            if (request.priority !== 'high') {
              this.adjustPriority(request, 'high');
            }
          } else {
            // Check distance from viewport
            const distance = this.getDistanceFromViewport(entry);
            
            if (distance < this.config.mediumPriorityThreshold) {
              if (request.priority === 'low') {
                this.adjustPriority(request, 'medium');
              }
            }
          }
        });
      },
      {
        rootMargin: `${this.config.mediumPriorityThreshold}px`,
        threshold: [0, 0.1, 0.5, 1.0],
      }
    );
  }

  /**
   * Calculate distance from viewport
   */
  private getDistanceFromViewport(entry: IntersectionObserverEntry): number {
    const rect = entry.boundingClientRect;
    const viewportHeight = window.innerHeight;
    
    if (rect.top > viewportHeight) {
      // Below viewport
      return rect.top - viewportHeight;
    } else if (rect.bottom < 0) {
      // Above viewport
      return Math.abs(rect.bottom);
    }
    
    // In viewport
    return 0;
  }

  /**
   * Adjust priority of an existing request
   */
  private adjustPriority(request: ImageLoadRequest, newPriority: 'high' | 'medium' | 'low'): void {
    if (request.priority === newPriority) return;
    
    const oldPriority = request.priority;
    request.priority = newPriority;
    
    // Update fetchpriority attribute
    if (request.element) {
      request.element.fetchPriority = newPriority === 'high' ? 'high' : newPriority === 'low' ? 'low' : 'auto';
    }
    
    // If upgraded to high priority and in queue, move to front
    if (newPriority === 'high' && oldPriority !== 'high') {
      const domain = this.getDomain(request.url);
      const queue = this.queueByDomain.get(domain);
      
      if (queue) {
        const index = queue.indexOf(request);
        if (index > 0) {
          queue.splice(index, 1);
          queue.unshift(request);
          this.processQueue(domain);
        }
      }
    }
  }

  /**
   * Extract domain from URL
   */
  private getDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'default';
    }
  }

  /**
   * Check if domain has capacity for more concurrent requests
   */
  private hasCapacity(domain: string): boolean {
    const loading = this.loadingByDomain.get(domain);
    return !loading || loading.size < this.config.maxConcurrentPerDomain;
  }

  /**
   * Register an image element for smart loading
   */
  public registerImage(
    element: HTMLImageElement,
    priority: 'high' | 'medium' | 'low' = 'medium',
    onLoad?: () => void,
    onError?: () => void
  ): void {
    const url = element.src || element.dataset.src;
    if (!url) return;

    const request: ImageLoadRequest = {
      url,
      priority,
      element,
      onLoad,
      onError,
    };

    // Store request for intersection observer
    this.observedElements.set(element, request);

    // Observe element for dynamic priority adjustment
    if (this.intersectionObserver && this.config.enableDynamicPriority) {
      this.intersectionObserver.observe(element);
    }

    // Set initial fetchpriority attribute
    element.fetchPriority = priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'auto';

    // Queue or load immediately
    this.queueRequest(request);
  }

  /**
   * Queue a request or load immediately if capacity available
   */
  private queueRequest(request: ImageLoadRequest): void {
    const domain = this.getDomain(request.url);

    if (this.hasCapacity(domain)) {
      this.loadImage(request);
    } else {
      // Add to queue based on priority
      let queue = this.queueByDomain.get(domain);
      if (!queue) {
        queue = [];
        this.queueByDomain.set(domain, queue);
      }

      // Insert based on priority (high priority first)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const insertIndex = queue.findIndex(
        (r) => priorityOrder[r.priority] > priorityOrder[request.priority]
      );

      if (insertIndex === -1) {
        queue.push(request);
      } else {
        queue.splice(insertIndex, 0, request);
      }
    }
  }

  /**
   * Load an image and track it
   */
  private loadImage(request: ImageLoadRequest): void {
    const domain = this.getDomain(request.url);
    
    // Track as loading
    let loading = this.loadingByDomain.get(domain);
    if (!loading) {
      loading = new Set();
      this.loadingByDomain.set(domain, loading);
    }
    loading.add(request.url);

    // Set up load handlers
    const handleLoad = () => {
      this.onImageComplete(request, domain);
      request.onLoad?.();
    };

    const handleError = () => {
      this.onImageComplete(request, domain);
      request.onError?.();
    };

    // Attach handlers
    request.element.addEventListener('load', handleLoad, { once: true });
    request.element.addEventListener('error', handleError, { once: true });

    // If src is not set, set it now (for lazy loading)
    if (!request.element.src && request.element.dataset.src) {
      request.element.src = request.element.dataset.src;
    }
  }

  /**
   * Handle image load completion
   */
  private onImageComplete(request: ImageLoadRequest, domain: string): void {
    // Remove from loading set
    const loading = this.loadingByDomain.get(domain);
    if (loading) {
      loading.delete(request.url);
    }

    // Unobserve element
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(request.element);
    }

    // Process next in queue
    this.processQueue(domain);
  }

  /**
   * Process the next request in queue for a domain
   */
  private processQueue(domain: string): void {
    const queue = this.queueByDomain.get(domain);
    if (!queue || queue.length === 0) return;

    if (this.hasCapacity(domain)) {
      const nextRequest = queue.shift();
      if (nextRequest) {
        this.loadImage(nextRequest);
      }
    }
  }

  /**
   * Unregister an image element
   */
  public unregisterImage(element: HTMLImageElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
    this.observedElements.delete(element);
  }

  /**
   * Get current loading statistics
   */
  public getStats(): {
    loadingByDomain: Record<string, number>;
    queuedByDomain: Record<string, number>;
    totalLoading: number;
    totalQueued: number;
  } {
    const stats = {
      loadingByDomain: {} as Record<string, number>,
      queuedByDomain: {} as Record<string, number>,
      totalLoading: 0,
      totalQueued: 0,
    };

    this.loadingByDomain.forEach((loading, domain) => {
      stats.loadingByDomain[domain] = loading.size;
      stats.totalLoading += loading.size;
    });

    this.queueByDomain.forEach((queue, domain) => {
      stats.queuedByDomain[domain] = queue.length;
      stats.totalQueued += queue.length;
    });

    return stats;
  }

  /**
   * Clear all queues and reset state
   */
  public reset(): void {
    this.loadingByDomain.clear();
    this.queueByDomain.clear();
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.initializeIntersectionObserver();
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<LoadingPriorityConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Reinitialize intersection observer if dynamic priority setting changed
    if ('enableDynamicPriority' in config) {
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
      }
      this.initializeIntersectionObserver();
    }
  }
}

/**
 * Hook for easy access to the priority manager
 */
export const useImageLoadingPriority = (config?: Partial<LoadingPriorityConfig>) => {
  return ImageLoadingPriorityManager.getInstance(config);
};

/**
 * Determine priority based on element position
 */
export const calculateImagePriority = (element: HTMLElement): 'high' | 'medium' | 'low' => {
  if (typeof window === 'undefined') return 'medium';

  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // Above the fold (in viewport)
  if (rect.top < viewportHeight && rect.bottom > 0) {
    return 'high';
  }

  // Near viewport (within 500px)
  if (rect.top < viewportHeight + 500) {
    return 'medium';
  }

  // Far from viewport
  return 'low';
};
