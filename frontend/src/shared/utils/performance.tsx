/**
 * Performance monitoring and optimization utilities
 */

// Performance metrics interface
export interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
  props?: Record<string, any>;
}

// Performance observer for monitoring component render times
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observer: PerformanceObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObserver();
    }
  }

  private initializeObserver() {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          this.metrics.push({
            renderTime: entry.duration,
            componentName: entry.name,
            timestamp: entry.startTime,
          });
        }
      });
    });

    this.observer.observe({ entryTypes: ['measure'] });
  }

  // Start measuring component render time
  startMeasure(componentName: string) {
    if (typeof window !== 'undefined' && performance.mark) {
      performance.mark(`${componentName}-start`);
    }
  }

  // End measuring component render time
  endMeasure(componentName: string, props?: Record<string, any>) {
    if (typeof window !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${componentName}-end`);
      performance.measure(componentName, `${componentName}-start`, `${componentName}-end`);
      
      // Store additional context
      if (props) {
        const lastMetric = this.metrics[this.metrics.length - 1];
        if (lastMetric && lastMetric.componentName === componentName) {
          lastMetric.props = props;
        }
      }
    }
  }

  // Get performance metrics
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  // Get metrics for a specific component
  getComponentMetrics(componentName: string): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.componentName === componentName);
  }

  // Get average render time for a component
  getAverageRenderTime(componentName: string): number {
    const componentMetrics = this.getComponentMetrics(componentName);
    if (componentMetrics.length === 0) return 0;
    
    const totalTime = componentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return totalTime / componentMetrics.length;
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = [];
  }

  // Disconnect observer
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string, props?: Record<string, any>) {
  React.useEffect(() => {
    performanceMonitor.startMeasure(componentName);
    
    return () => {
      performanceMonitor.endMeasure(componentName, props);
    };
  }, [componentName, props]);
}

// Higher-order component for performance monitoring
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const MonitoredComponent = React.forwardRef<any, P>((props, ref) => {
    React.useEffect(() => {
      performanceMonitor.startMeasure(displayName);
      
      return () => {
        performanceMonitor.endMeasure(displayName, props as Record<string, any>);
      };
    }, [props]);

    return <WrappedComponent {...props} ref={ref} />;
  });

  MonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  return MonitoredComponent;
}

// Bundle size analysis utilities
export const bundleAnalysis = {
  // Measure bundle loading time
  measureBundleLoad: (bundleName: string) => {
    if (typeof window !== 'undefined' && performance.mark) {
      performance.mark(`bundle-${bundleName}-start`);
      
      return () => {
        performance.mark(`bundle-${bundleName}-end`);
        performance.measure(`bundle-${bundleName}`, `bundle-${bundleName}-start`, `bundle-${bundleName}-end`);
      };
    }
    return () => {};
  },

  // Get resource loading metrics
  getResourceMetrics: () => {
    if (typeof window === 'undefined' || !performance.getEntriesByType) {
      return [];
    }

    return performance.getEntriesByType('resource').map((entry: any) => ({
      name: entry.name,
      size: entry.transferSize || 0,
      duration: entry.duration,
      type: entry.initiatorType,
    }));
  },

  // Get largest resources
  getLargestResources: (limit: number = 10) => {
    const resources = bundleAnalysis.getResourceMetrics();
    return resources
      .sort((a, b) => b.size - a.size)
      .slice(0, limit);
  }
};

// Image optimization utilities
export const imageOptimization = {
  // Lazy load images with intersection observer
  createLazyImageLoader: () => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null;
    }

    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.remove('lazy');
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
  },

  // Preload critical images
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },

  // Generate responsive image srcSet
  generateSrcSet: (baseUrl: string, sizes: number[]): string => {
    return sizes
      .map(size => `${baseUrl}?w=${size} ${size}w`)
      .join(', ');
  }
};

// Memory usage monitoring
export const memoryMonitor = {
  // Get current memory usage (Chrome only)
  getCurrentUsage: () => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  },

  // Monitor memory usage over time
  startMonitoring: (interval: number = 5000) => {
    const measurements: Array<{ timestamp: number; usage: any }> = [];
    
    const measureMemory = () => {
      const usage = memoryMonitor.getCurrentUsage();
      if (usage) {
        measurements.push({
          timestamp: Date.now(),
          usage
        });
      }
    };

    const intervalId = setInterval(measureMemory, interval);
    
    return {
      stop: () => clearInterval(intervalId),
      getMeasurements: () => [...measurements]
    };
  }
};

// Core Web Vitals monitoring
export const webVitals = {
  // Measure Largest Contentful Paint (LCP)
  measureLCP: (callback: (value: number) => void) => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      callback(lastEntry.startTime);
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  },

  // Measure First Input Delay (FID)
  measureFID: (callback: (value: number) => void) => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        callback(entry.processingStart - entry.startTime);
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  },

  // Measure Cumulative Layout Shift (CLS)
  measureCLS: (callback: (value: number) => void) => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          callback(clsValue);
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }
};

// Performance reporting
export const performanceReporter = {
  // Generate performance report
  generateReport: () => {
    const metrics = performanceMonitor.getMetrics();
    const resourceMetrics = bundleAnalysis.getResourceMetrics();
    const memoryUsage = memoryMonitor.getCurrentUsage();

    return {
      timestamp: Date.now(),
      componentMetrics: metrics,
      resourceMetrics,
      memoryUsage,
      navigation: performance.getEntriesByType('navigation')[0],
      paint: performance.getEntriesByType('paint')
    };
  },

  // Send report to analytics service
  sendReport: async (report: any, endpoint?: string) => {
    if (!endpoint) return;

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.warn('Failed to send performance report:', error);
    }
  }
};

// React import for hooks
import * as React from 'react';