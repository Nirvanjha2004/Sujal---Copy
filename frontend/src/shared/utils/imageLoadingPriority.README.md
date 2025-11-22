# Image Loading Priority Manager

A comprehensive system for managing image loading priorities to optimize performance and user experience.

## Features

- **Concurrent Request Limiting**: Limits concurrent image requests per domain (default: 6 for HTTP/2 optimization)
- **Dynamic Priority Adjustment**: Automatically adjusts image priorities based on viewport visibility
- **Smart Queuing**: Queues images when domain capacity is reached, prioritizing high-priority images
- **Intersection Observer**: Monitors image positions and upgrades priorities as they approach viewport
- **Automatic Priority Calculation**: Determines priority based on element position relative to viewport

## Requirements Addressed

- **10.1**: Prioritize above-the-fold images
- **10.2**: Use fetchpriority="high" for critical images
- **10.3**: Use fetchpriority="low" for below-fold images
- **10.4**: Limit concurrent requests to 6 per domain
- **10.5**: Preload next/previous images in carousels
- **10.6**: Dynamically adjust loading priorities based on scroll

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│         ImageLoadingPriorityManager (Singleton)         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │ Domain Tracking  │  │  Request Queuing         │   │
│  │ - Loading count  │  │  - Priority-based queue  │   │
│  │ - Capacity check │  │  - High priority first   │   │
│  └──────────────────┘  └──────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Intersection Observer                       │  │
│  │      - Monitor viewport visibility               │  │
│  │      - Dynamic priority adjustment               │  │
│  │      - Distance-based priority calculation       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Usage

### Basic Usage with OptimizedImage Component

The `OptimizedImage` component automatically integrates with the priority manager:

```tsx
import { OptimizedImage } from '@/shared/components/ui/OptimizedImage';

// Above-the-fold image (high priority)
<OptimizedImage
  images={propertyImages}
  alt="Property"
  context="detail"
  priority={true}
  enableSmartLoading={true}
/>

// Below-the-fold image (auto-calculated priority)
<OptimizedImage
  images={propertyImages}
  alt="Property"
  context="grid"
  enableSmartLoading={true}
/>

// Manual priority override
<OptimizedImage
  images={propertyImages}
  alt="Property"
  context="list"
  fetchPriority="low"
  enableSmartLoading={true}
/>
```

### Using the Hook

```tsx
import { useSmartImageLoading } from '@/shared/hooks/useSmartImageLoading';

function MyImageComponent({ src, alt }) {
  const { imageRef, containerRef, priority, isLoading } = useSmartImageLoading({
    enabled: true,
    onLoad: () => console.log('Image loaded'),
    onError: () => console.error('Image failed'),
  });

  return (
    <div ref={containerRef}>
      <img
        ref={imageRef}
        data-src={src}
        alt={alt}
        fetchPriority={priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'auto'}
      />
      {isLoading && <div>Loading...</div>}
    </div>
  );
}
```

### Direct Manager Usage

```tsx
import { ImageLoadingPriorityManager } from '@/shared/utils/imageLoadingPriority';

// Get singleton instance
const manager = ImageLoadingPriorityManager.getInstance({
  maxConcurrentPerDomain: 6,
  highPriorityThreshold: 0,
  mediumPriorityThreshold: 500,
  enableDynamicPriority: true,
});

// Register an image
const imgElement = document.querySelector('img');
manager.registerImage(
  imgElement,
  'high',
  () => console.log('Loaded'),
  () => console.error('Failed')
);

// Get loading statistics
const stats = manager.getStats();
console.log('Total loading:', stats.totalLoading);
console.log('Total queued:', stats.totalQueued);

// Unregister when done
manager.unregisterImage(imgElement);
```

### Monitoring Loading Statistics

```tsx
import { useImageLoadingStats } from '@/shared/hooks/useSmartImageLoading';

function LoadingMonitor() {
  const stats = useImageLoadingStats();

  return (
    <div>
      <h3>Image Loading Stats</h3>
      <p>Currently Loading: {stats.totalLoading}</p>
      <p>Queued: {stats.totalQueued}</p>
      
      <h4>By Domain:</h4>
      {Object.entries(stats.loadingByDomain).map(([domain, count]) => (
        <div key={domain}>
          {domain}: {count} loading, {stats.queuedByDomain[domain] || 0} queued
        </div>
      ))}
    </div>
  );
}
```

## Configuration

### LoadingPriorityConfig

```typescript
interface LoadingPriorityConfig {
  // Maximum concurrent requests per domain (default: 6)
  maxConcurrentPerDomain: number;
  
  // Distance from viewport for high priority (default: 0 = in viewport)
  highPriorityThreshold: number;
  
  // Distance from viewport for medium priority (default: 500px)
  mediumPriorityThreshold: number;
  
  // Enable dynamic priority adjustment (default: true)
  enableDynamicPriority: boolean;
}
```

### Updating Configuration

```typescript
const manager = ImageLoadingPriorityManager.getInstance();

manager.updateConfig({
  maxConcurrentPerDomain: 8, // Increase for faster connections
  mediumPriorityThreshold: 1000, // Larger preload distance
});
```

## Priority Levels

### High Priority
- **When**: Image is in viewport or marked as priority
- **Behavior**: 
  - Loads immediately if capacity available
  - Placed at front of queue if capacity full
  - Uses `fetchpriority="high"`
- **Use Cases**: Hero images, above-the-fold content, critical UI elements

### Medium Priority
- **When**: Image is within 500px of viewport
- **Behavior**:
  - Loads when capacity available
  - Normal queue position
  - Uses `fetchpriority="auto"`
- **Use Cases**: Near-viewport images, likely to be seen soon

### Low Priority
- **When**: Image is far from viewport (>500px)
- **Behavior**:
  - Loads when capacity available
  - Back of queue
  - Uses `fetchpriority="low"`
- **Use Cases**: Below-fold images, background images, decorative content

## Dynamic Priority Adjustment

The system automatically adjusts priorities as users scroll:

```
Initial State:
┌─────────────────┐
│   Viewport      │ ← High priority images
├─────────────────┤
│   500px buffer  │ ← Medium priority images
├─────────────────┤
│   Far away      │ ← Low priority images
└─────────────────┘

After Scroll:
┌─────────────────┐
│   Viewport      │ ← Previously medium → now high
├─────────────────┤
│   500px buffer  │ ← Previously low → now medium
├─────────────────┤
│   Far away      │ ← Still low priority
└─────────────────┘
```

## Performance Benefits

1. **Reduced Network Congestion**: Limits concurrent requests to optimal HTTP/2 level
2. **Faster Critical Content**: Prioritizes visible images
3. **Better User Experience**: Content appears faster where users are looking
4. **Efficient Resource Usage**: Defers loading of off-screen content
5. **Adaptive Loading**: Adjusts to user behavior (scrolling)

## Best Practices

### 1. Mark Critical Images as Priority

```tsx
// Hero image - always high priority
<OptimizedImage priority={true} {...props} />
```

### 2. Let System Calculate for Lists

```tsx
// Grid of images - auto-calculate based on position
{properties.map(property => (
  <OptimizedImage
    key={property.id}
    enableSmartLoading={true}
    {...props}
  />
))}
```

### 3. Use Low Priority for Decorative Images

```tsx
// Background or decorative image
<OptimizedImage
  fetchPriority="low"
  {...props}
/>
```

### 4. Monitor Performance in Development

```tsx
// Add monitoring component during development
<LoadingMonitor />
```

### 5. Adjust Configuration for Your Use Case

```typescript
// For image-heavy sites
ImageLoadingPriorityManager.getInstance({
  maxConcurrentPerDomain: 8,
  mediumPriorityThreshold: 1000,
});

// For slower connections
ImageLoadingPriorityManager.getInstance({
  maxConcurrentPerDomain: 4,
  mediumPriorityThreshold: 300,
});
```

## Browser Compatibility

- **Intersection Observer**: All modern browsers (IE11 requires polyfill)
- **fetchpriority**: Chrome 101+, Edge 101+, Safari 17+ (gracefully degrades)
- **HTTP/2**: All modern browsers

## Testing

### Manual Testing

1. Open DevTools Network tab
2. Throttle to "Fast 3G"
3. Scroll through page
4. Verify:
   - Max 6 concurrent requests per domain
   - Above-fold images load first
   - Priority adjusts as you scroll

### Automated Testing

```typescript
import { ImageLoadingPriorityManager } from '@/shared/utils/imageLoadingPriority';

describe('ImageLoadingPriorityManager', () => {
  it('limits concurrent requests per domain', () => {
    const manager = ImageLoadingPriorityManager.getInstance();
    // Add test logic
  });

  it('prioritizes high priority images', () => {
    // Test priority queue ordering
  });

  it('adjusts priority based on viewport', () => {
    // Test intersection observer behavior
  });
});
```

## Troubleshooting

### Images Not Loading

**Problem**: Images remain in queue and don't load

**Solution**: Check that images have valid `data-src` attribute and are registered with manager

### Too Many Concurrent Requests

**Problem**: More than 6 requests per domain

**Solution**: Ensure all images use the priority manager, not direct loading

### Priority Not Adjusting

**Problem**: Images stay at initial priority

**Solution**: Verify `enableDynamicPriority: true` in config

### Performance Issues

**Problem**: Page feels slow despite priority system

**Solution**: 
- Reduce `maxConcurrentPerDomain` for slower connections
- Increase `mediumPriorityThreshold` to preload more aggressively
- Check that critical images are marked with `priority={true}`

## Related Components

- `OptimizedImage`: Main image component with built-in priority support
- `ImagePreloadHead`: Preload critical images in document head
- `useSmartImageLoading`: React hook for custom implementations

## Performance Metrics

Expected improvements with smart loading:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| LCP (Largest Contentful Paint) | 4-6s | 2-3s | 50% |
| Above-fold load time | 3-5s | 1-2s | 60% |
| Total concurrent requests | 20+ | 6 per domain | 70% |
| Network congestion | High | Low | Significant |
| User-perceived performance | Slow | Fast | Major |

## Future Enhancements

- [ ] Adaptive concurrency based on connection speed
- [ ] Predictive preloading based on user behavior
- [ ] Integration with Service Worker for offline support
- [ ] Machine learning for optimal priority prediction
- [ ] Support for video and other media types
