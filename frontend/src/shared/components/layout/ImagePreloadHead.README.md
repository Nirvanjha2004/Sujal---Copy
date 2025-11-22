# ImagePreloadHead Component

A React component for optimizing image loading performance through strategic preloading, prefetching, and connection optimization.

## Overview

The `ImagePreloadHead` component manages critical performance optimizations by injecting link tags into the document head. It implements best practices for reducing image load times through DNS prefetch, preconnect, preload, and prefetch strategies.

## Features

- ✅ **DNS Prefetch**: Early DNS resolution for CloudFront domain
- ✅ **Preconnect**: Early connection establishment (DNS + TCP + TLS)
- ✅ **Preload**: High-priority loading for critical above-the-fold images
- ✅ **Prefetch**: Low-priority loading for likely-needed images
- ✅ **Dynamic Lists**: Support for dynamic image arrays
- ✅ **Automatic Cleanup**: Removes link tags on component unmount
- ✅ **No Dependencies**: Uses native DOM APIs (no react-helmet-async needed)

## Requirements Satisfied

- **3.1**: Preload hero images and above-the-fold images
- **3.3**: Use link rel="preload" and rel="prefetch" for images
- **5.1**: DNS prefetch for S3/CloudFront domains
- **5.2**: Preconnect for critical image domains
- **5.6**: Establish early connections to image CDN

## Installation

No additional dependencies required. The component is self-contained.

## Usage

### Basic Usage

```tsx
import { ImagePreloadHead, useCloudFrontUrl } from '@/shared/components/layout/ImagePreloadHead';

function MyPage() {
  const cdnUrl = useCloudFrontUrl();
  
  return (
    <>
      <ImagePreloadHead
        cdnUrl={cdnUrl}
        criticalImages={[
          'https://d1234567890.cloudfront.net/images/hero.jpg',
          'https://d1234567890.cloudfront.net/images/banner.jpg',
        ]}
      />
      
      {/* Your page content */}
    </>
  );
}
```

### Landing Page Example

```tsx
import { ImagePreloadHead, useCloudFrontUrl } from '@/shared/components/layout/ImagePreloadHead';

function RealEstateLandingPage() {
  const cdnUrl = useCloudFrontUrl();
  
  // Define critical images (above-the-fold)
  const criticalImages = [
    `${cdnUrl}/images/topbanner.png`,
    `${cdnUrl}/properties/featured-1/large/image.jpg`,
    `${cdnUrl}/properties/featured-2/large/image.jpg`,
  ];
  
  // Define prefetch images (likely-needed)
  const prefetchImages = [
    `${cdnUrl}/properties/featured-3/large/image.jpg`,
    `${cdnUrl}/properties/featured-4/large/image.jpg`,
  ];
  
  return (
    <>
      <ImagePreloadHead
        cdnUrl={cdnUrl}
        criticalImages={criticalImages}
        prefetchImages={prefetchImages}
      />
      
      <div className="landing-page">
        {/* Hero section with topbanner.png */}
        {/* Featured properties */}
      </div>
    </>
  );
}
```

### Gallery Page Example

```tsx
import { ImagePreloadHead, useCloudFrontUrl } from '@/shared/components/layout/ImagePreloadHead';

function PropertyGallery({ images }) {
  const cdnUrl = useCloudFrontUrl();
  
  // Preload first image, prefetch next 3
  const criticalImages = images.slice(0, 1).map(img => img.large_url);
  const prefetchImages = images.slice(1, 4).map(img => img.large_url);
  
  return (
    <>
      <ImagePreloadHead
        cdnUrl={cdnUrl}
        criticalImages={criticalImages}
        prefetchImages={prefetchImages}
      />
      
      <div className="gallery">
        {images.map(img => (
          <img key={img.id} src={img.large_url} alt={img.alt} />
        ))}
      </div>
    </>
  );
}
```

### With Dynamic Images

```tsx
import { ImagePreloadHead, useCloudFrontUrl } from '@/shared/components/layout/ImagePreloadHead';
import { useEffect, useState } from 'react';

function DynamicPage() {
  const cdnUrl = useCloudFrontUrl();
  const [featuredProjects, setFeaturedProjects] = useState([]);
  
  useEffect(() => {
    // Fetch featured projects
    fetchFeaturedProjects().then(setFeaturedProjects);
  }, []);
  
  // Extract image URLs from projects
  const criticalImages = featuredProjects
    .slice(0, 4)
    .map(project => project.image_url)
    .filter(Boolean);
  
  return (
    <>
      <ImagePreloadHead
        cdnUrl={cdnUrl}
        criticalImages={criticalImages}
      />
      
      <div className="projects">
        {featuredProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </>
  );
}
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cdnUrl` | `string` | **Required** | CloudFront CDN URL for dns-prefetch and preconnect |
| `criticalImages` | `string[]` | `[]` | Critical images to preload with high priority |
| `prefetchImages` | `string[]` | `[]` | Images to prefetch with low priority |
| `enableDnsPrefetch` | `boolean` | `true` | Enable DNS prefetch for CDN domain |
| `enablePreconnect` | `boolean` | `true` | Enable preconnect for CDN domain |

### Hooks

#### `useCloudFrontUrl()`

Returns the CloudFront URL from environment variables, with fallback to S3 URL.

```tsx
const cdnUrl = useCloudFrontUrl();
// Returns: "https://d1234567890.cloudfront.net" or S3 URL
```

## How It Works

### 1. DNS Prefetch

```html
<link rel="dns-prefetch" href="https://d1234567890.cloudfront.net" />
```

- Resolves the domain name early
- Reduces DNS lookup time (typically 20-120ms)
- Happens in parallel with page load

### 2. Preconnect

```html
<link rel="preconnect" href="https://d1234567890.cloudfront.net" crossorigin="anonymous" />
```

- Establishes early connection (DNS + TCP + TLS handshake)
- Reduces connection time (typically 100-500ms)
- Critical for first image load

### 3. Preload (High Priority)

```html
<link rel="preload" as="image" href="https://cdn.com/hero.jpg" fetchpriority="high" />
```

- Tells browser to fetch immediately
- High priority in resource loading queue
- Use for above-the-fold images

### 4. Prefetch (Low Priority)

```html
<link rel="prefetch" as="image" href="https://cdn.com/gallery.jpg" />
```

- Hints that resource might be needed soon
- Low priority (won't block critical resources)
- Use for below-fold or next-page images

## Performance Impact

### Before ImagePreloadHead

```
User visits page
  ↓
HTML parsed (0ms)
  ↓
CSS parsed (50ms)
  ↓
Image discovered (100ms)
  ↓
DNS lookup (50ms)
  ↓
TCP handshake (100ms)
  ↓
TLS handshake (100ms)
  ↓
Image download (200ms)
  ↓
Total: 600ms
```

### After ImagePreloadHead

```
User visits page
  ↓
HTML parsed (0ms) ← DNS prefetch starts
  ↓                ← Preconnect starts
CSS parsed (50ms) ← Preload starts
  ↓
Image discovered (100ms) ← Already downloading!
  ↓
Image download (100ms remaining)
  ↓
Total: 200ms (66% faster!)
```

## Best Practices

### 1. Limit Critical Images

Only preload truly critical above-the-fold images (2-4 images max):

```tsx
// ✅ Good: Only hero and first featured
const criticalImages = [heroImage, featured1, featured2];

// ❌ Bad: Too many preloads
const criticalImages = allImages; // Don't do this!
```

### 2. Use Prefetch for Likely-Needed

Prefetch images that user will likely see soon:

```tsx
// ✅ Good: Prefetch next carousel images
const prefetchImages = carouselImages.slice(1, 4);

// ✅ Good: Prefetch on hover
<div onMouseEnter={() => setPrefetchImages([detailPageImage])}>
```

### 3. Dynamic Updates

Update image lists when data changes:

```tsx
const [criticalImages, setCriticalImages] = useState([]);

useEffect(() => {
  if (featuredProjects.length > 0) {
    setCriticalImages(
      featuredProjects.slice(0, 4).map(p => p.image_url)
    );
  }
}, [featuredProjects]);
```

### 4. Combine with OptimizedImage

Use together with OptimizedImage component:

```tsx
<ImagePreloadHead
  cdnUrl={cdnUrl}
  criticalImages={[heroImage]}
/>

<OptimizedImage
  images={heroImageUrls}
  alt="Hero"
  context="detail"
  priority={true} // Matches preload
/>
```

## Environment Variables

Add to your `.env` file:

```bash
# CloudFront CDN URL (recommended)
VITE_AWS_CLOUDFRONT_URL=https://d1234567890.cloudfront.net

# Fallback: S3 configuration
VITE_AWS_REGION=ap-south-1
VITE_AWS_S3_BUCKET=real-estate-portal-images-dev
```

## Browser Support

- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Mobile browsers: Full support

All modern browsers support dns-prefetch, preconnect, preload, and prefetch.

## Troubleshooting

### Images not preloading?

Check browser DevTools → Network tab:
- Look for "Priority: High" on preloaded images
- Check "Initiator" column (should show "preload")

### Too many preloads?

Limit to 2-4 critical images:
```tsx
criticalImages={images.slice(0, 4)}
```

### CloudFront URL not working?

Check environment variable:
```tsx
console.log(import.meta.env.VITE_AWS_CLOUDFRONT_URL);
```

### Link tags not appearing?

Check document head in DevTools:
```tsx
document.querySelectorAll('[data-image-preload-head]')
```

## Testing

### Manual Testing

1. Open DevTools → Network tab
2. Filter by "Img"
3. Reload page
4. Check "Priority" column:
   - Preloaded images: "High"
   - Normal images: "Low" or "Medium"

### Performance Testing

```tsx
// Measure LCP improvement
const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    console.log('LCP:', entry.startTime);
  });
});
observer.observe({ entryTypes: ['largest-contentful-paint'] });
```

## Related Components

- **OptimizedImage**: Use together for complete optimization
- **RealEstateLandingPage2**: Example implementation
- **FeaturedProjectDetailsPage**: Example implementation

## Migration Guide

### From No Preloading

```tsx
// Before
function MyPage() {
  return <img src={heroImage} alt="Hero" />;
}

// After
function MyPage() {
  const cdnUrl = useCloudFrontUrl();
  
  return (
    <>
      <ImagePreloadHead
        cdnUrl={cdnUrl}
        criticalImages={[heroImage]}
      />
      <img src={heroImage} alt="Hero" />
    </>
  );
}
```

### From react-helmet-async

```tsx
// Before
import { Helmet } from 'react-helmet-async';

<Helmet>
  <link rel="preload" as="image" href={image} />
</Helmet>

// After
import { ImagePreloadHead } from '@/shared/components/layout/ImagePreloadHead';

<ImagePreloadHead
  cdnUrl={cdnUrl}
  criticalImages={[image]}
/>
```

## Performance Metrics

Expected improvements with ImagePreloadHead:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| DNS Lookup | 50ms | 0ms | 100% |
| Connection | 200ms | 0ms | 100% |
| First Image | 600ms | 200ms | 66% |
| LCP | 3000ms | 1500ms | 50% |

## License

Part of the Real Estate Portal project.
