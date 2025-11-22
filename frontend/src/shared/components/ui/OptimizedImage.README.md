# OptimizedImage Component

A high-performance React image component designed for optimal loading performance with WebP support, lazy loading, and progressive enhancement.

## Features

✅ **WebP Format Support** - Automatically serves WebP to supported browsers with JPEG fallback  
✅ **Lazy Loading** - Images below the fold load only when needed  
✅ **Priority Loading** - Critical above-the-fold images load immediately  
✅ **Blur Placeholder** - Smooth loading experience with blur-up effect  
✅ **Skeleton Loader** - Alternative shimmer loading state  
✅ **Error Handling** - Automatic retry with exponential backoff  
✅ **Responsive Images** - Serves appropriate size based on context  
✅ **Performance Monitoring** - Logs slow image loads for debugging  
✅ **Smooth Transitions** - Fade-in effect when images load  

## Requirements Satisfied

- **6.1** - Progressive image loading with blur-up placeholder
- **6.2** - Smooth transition from placeholder to full image
- **6.3** - Lazy loading with intersection observer for below-fold images
- **6.5** - Skeleton loader and shimmer effect
- **7.1** - WebP format support with browser detection
- **7.3** - Picture element with format fallbacks
- **7.6** - JPEG fallback for browsers without WebP support

## Usage

### Basic Usage

```tsx
import { OptimizedImage } from '@/shared/components/ui/OptimizedImage';

function PropertyCard({ property }) {
  return (
    <OptimizedImage
      images={property.images}
      alt={property.title}
      context="grid"
    />
  );
}
```

### Priority Image (Above the Fold)

```tsx
<OptimizedImage
  images={heroImages}
  alt="Hero banner"
  context="detail"
  priority={true}  // Disables lazy loading, uses fetchpriority="high"
/>
```

### With Blur Placeholder

```tsx
<OptimizedImage
  images={propertyImages}
  alt="Property photo"
  context="list"
  showBlurPlaceholder={true}  // Shows gray blur while loading
/>
```

### With Skeleton Loader

```tsx
<OptimizedImage
  images={propertyImages}
  alt="Property photo"
  context="grid"
  showSkeleton={true}  // Shows animated shimmer effect
/>
```

### With Error Handling

```tsx
<OptimizedImage
  images={propertyImages}
  alt="Property photo"
  context="detail"
  maxRetries={3}
  onLoad={() => console.log('Image loaded')}
  onError={() => console.log('Image failed')}
/>
```

### Custom Aspect Ratio

```tsx
<OptimizedImage
  images={propertyImages}
  alt="Property photo"
  context="grid"
  aspectRatio="16/9"  // Maintains aspect ratio
  className="rounded-lg"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `ImageUrls` | Required | Object containing image URLs for all sizes and formats |
| `alt` | `string` | Required | Alt text for accessibility |
| `context` | `'list' \| 'grid' \| 'detail' \| 'thumbnail'` | Required | Determines which image size to use |
| `priority` | `boolean` | `false` | If true, disables lazy loading and uses high priority |
| `className` | `string` | `''` | Additional CSS classes |
| `onLoad` | `() => void` | - | Callback when image loads successfully |
| `onError` | `() => void` | - | Callback when image fails to load |
| `showBlurPlaceholder` | `boolean` | `true` | Show blur placeholder while loading |
| `showSkeleton` | `boolean` | `false` | Show skeleton/shimmer loader (overrides blur) |
| `maxRetries` | `number` | `3` | Maximum retry attempts on error |
| `aspectRatio` | `string` | - | CSS aspect ratio (e.g., "16/9", "4/3") |

## ImageUrls Interface

```typescript
interface ImageUrls {
  thumbnail_url?: string;
  medium_url?: string;
  large_url?: string;
  image_url?: string;
  thumbnail_webp_url?: string;
  medium_webp_url?: string;
  large_webp_url?: string;
}
```

## Context Sizes

| Context | Image Size | Use Case |
|---------|-----------|----------|
| `thumbnail` | 300w | Small thumbnails, gallery previews |
| `list` | 800w | List view items, cards |
| `grid` | 800w | Grid view items |
| `detail` | 1600w | Full-size detail views, hero images |

## How It Works

### 1. Format Selection
The component uses the `<picture>` element to provide multiple image formats:
- WebP source (modern browsers)
- JPEG source (fallback)
- Fallback `<img>` element

### 2. Lazy Loading
For non-priority images, the component uses:
- `loading="lazy"` attribute
- Intersection Observer with 50px margin
- Loads images just before they enter viewport

### 3. Error Handling
On image load failure:
1. Retries with exponential backoff (1s, 2s, 4s)
2. Shows error state after max retries
3. Provides manual retry button

### 4. Performance Monitoring
Automatically logs warnings for images that take > 1 second to load.

## Best Practices

### Above the Fold Images
```tsx
// Hero images, first visible content
<OptimizedImage priority={true} context="detail" />
```

### Below the Fold Images
```tsx
// Images further down the page
<OptimizedImage priority={false} context="grid" />
```

### Property Lists
```tsx
// Use medium size for list/grid views
<OptimizedImage context="list" showBlurPlaceholder={true} />
```

### Property Details
```tsx
// Use large size for detail pages
<OptimizedImage context="detail" priority={true} />
```

### Thumbnails
```tsx
// Use thumbnail size for small previews
<OptimizedImage context="thumbnail" />
```

## Performance Tips

1. **Use priority sparingly** - Only for above-the-fold images
2. **Choose appropriate context** - Don't load large images for thumbnails
3. **Monitor console warnings** - Check for slow-loading images
4. **Ensure WebP versions exist** - Backend should generate both formats
5. **Use aspect ratio** - Prevents layout shift during loading

## Browser Support

- **WebP**: Chrome 23+, Firefox 65+, Edge 18+, Safari 14+
- **Lazy Loading**: Chrome 77+, Firefox 75+, Edge 79+, Safari 15.4+
- **Intersection Observer**: All modern browsers
- **Fallback**: Works in all browsers with JPEG

## Accessibility

- Always provide meaningful `alt` text
- Component maintains proper semantic HTML
- Error states are visible and actionable
- Loading states don't block screen readers

## Testing

See `OptimizedImage.demo.tsx` for comprehensive usage examples and manual testing.

## Related Components

- `imageUtils.ts` - Helper functions for image URL generation
- `ImagePreloadHead` - Component for preloading critical images (Task 9)

## Migration Guide

### From Standard `<img>` Tag

**Before:**
```tsx
<img src={property.image_url} alt={property.title} />
```

**After:**
```tsx
<OptimizedImage
  images={property}
  alt={property.title}
  context="grid"
/>
```

### From Custom Image Component

**Before:**
```tsx
<PropertyImage
  src={property.medium_url}
  alt={property.title}
  loading="lazy"
/>
```

**After:**
```tsx
<OptimizedImage
  images={property}
  alt={property.title}
  context="list"
  priority={false}
/>
```

## Troubleshooting

### Images not loading
- Check that `images` object has valid URLs
- Verify CloudFront/S3 URLs are accessible
- Check browser console for CORS errors

### WebP not being served
- Verify browser supports WebP
- Check that `*_webp_url` fields exist in images object
- Ensure backend generates WebP versions

### Slow loading
- Check console for performance warnings
- Verify CloudFront is configured correctly
- Consider using smaller image sizes for context

### Layout shift
- Use `aspectRatio` prop to reserve space
- Ensure container has defined dimensions
- Use skeleton loader for better UX
