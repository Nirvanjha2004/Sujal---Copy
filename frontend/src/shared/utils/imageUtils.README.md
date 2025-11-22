# Image Utils - WebP Support Guide

## Overview

The `imageUtils.ts` module provides utilities for responsive image loading with automatic WebP format support and JPEG fallback.

## Quick Start

```typescript
import { 
  getResponsiveImageUrl, 
  getImageSrcSet, 
  getPictureSources,
  supportsWebP 
} from '@/shared/utils/imageUtils';
```

## ImageUrls Interface

```typescript
interface ImageUrls {
  // JPEG URLs
  thumbnail_url?: string;   // ~300px width
  medium_url?: string;      // ~800px width
  large_url?: string;       // ~1600px width
  image_url?: string;       // Original/fallback
  
  // WebP URLs (automatically preferred when supported)
  thumbnail_webp_url?: string;
  medium_webp_url?: string;
  large_webp_url?: string;
}
```

## Functions

### supportsWebP()

Detects if the browser supports WebP format.

```typescript
const hasWebPSupport = supportsWebP();
// Returns: true in Chrome/Firefox/Edge/Safari 14+
// Returns: false in older browsers
```

**Features:**
- Caches result for performance
- SSR-safe (returns false on server)
- Runs once per session

---

### getResponsiveImageUrl()

Gets the best image URL for a given size, preferring WebP when supported.

```typescript
getResponsiveImageUrl(
  images: ImageUrls,
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium',
  preferWebP: boolean = true
): string
```

**Examples:**

```typescript
// Automatic WebP (recommended)
const url = getResponsiveImageUrl(propertyImages, 'medium');

// Force JPEG
const jpegUrl = getResponsiveImageUrl(propertyImages, 'medium', false);

// Get thumbnail
const thumbUrl = getResponsiveImageUrl(propertyImages, 'thumbnail');
```

**Fallback Chain:**
- Thumbnail: `thumbnail_webp_url` → `thumbnail_url` → `medium_url` → `image_url` → placeholder
- Medium: `medium_webp_url` → `medium_url` → `large_url` → `image_url` → placeholder
- Large: `large_webp_url` → `large_url` → `image_url` → placeholder

---

### getImageSrcSet()

Generates a srcset string for responsive images.

```typescript
getImageSrcSet(
  images: ImageUrls,
  preferWebP: boolean = true
): string
```

**Examples:**

```typescript
// WebP srcset (automatic)
const srcSet = getImageSrcSet(propertyImages);
// Returns: "https://.../thumb.webp 300w, https://.../medium.webp 800w, ..."

// JPEG srcset
const jpegSrcSet = getImageSrcSet(propertyImages, false);
// Returns: "https://.../thumb.jpg 300w, https://.../medium.jpg 800w, ..."
```

**Usage in img tag:**

```typescript
<img
  src={getResponsiveImageUrl(images, 'medium')}
  srcSet={getImageSrcSet(images)}
  sizes="(max-width: 640px) 100vw, 50vw"
  alt="Property"
/>
```

---

### getPictureSources()

Gets both WebP and JPEG sources for use with `<picture>` element.

```typescript
getPictureSources(images: ImageUrls): {
  webp: string;
  jpeg: string;
  webpSrcSet: string;
  jpegSrcSet: string;
}
```

**Example:**

```typescript
const sources = getPictureSources(propertyImages);

<picture>
  {/* Modern browsers get WebP */}
  <source 
    type="image/webp" 
    srcSet={sources.webpSrcSet}
    sizes="(max-width: 640px) 100vw, 50vw"
  />
  
  {/* Fallback to JPEG */}
  <source 
    type="image/jpeg" 
    srcSet={sources.jpegSrcSet}
    sizes="(max-width: 640px) 100vw, 50vw"
  />
  
  {/* Final fallback */}
  <img 
    src={sources.jpeg} 
    alt="Property"
    loading="lazy"
  />
</picture>
```

---

### getImageSizes()

Gets the sizes attribute for different contexts.

```typescript
getImageSizes(
  context: 'card' | 'list' | 'grid' | 'detail' | 'thumbnail'
): string
```

**Examples:**

```typescript
getImageSizes('thumbnail')  // "(max-width: 640px) 100px, 150px"
getImageSizes('grid')       // "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
getImageSizes('detail')     // "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
```

---

### getContextualImage()

Gets the best image for a specific context (convenience function).

```typescript
getContextualImage(
  images: ImageUrls,
  context: 'list' | 'grid' | 'detail' | 'thumbnail'
): string
```

**Examples:**

```typescript
// Property card in grid
const gridImage = getContextualImage(propertyImages, 'grid');

// Property detail page
const detailImage = getContextualImage(propertyImages, 'detail');
```

## Common Patterns

### Pattern 1: Simple Responsive Image

```typescript
<img
  src={getResponsiveImageUrl(images, 'medium')}
  srcSet={getImageSrcSet(images)}
  sizes={getImageSizes('grid')}
  alt="Property"
  loading="lazy"
/>
```

### Pattern 2: Picture Element with WebP

```typescript
const sources = getPictureSources(images);

<picture>
  <source type="image/webp" srcSet={sources.webpSrcSet} sizes={getImageSizes('detail')} />
  <source type="image/jpeg" srcSet={sources.jpegSrcSet} sizes={getImageSizes('detail')} />
  <img src={sources.jpeg} alt="Property" loading="lazy" />
</picture>
```

### Pattern 3: Property Card

```typescript
<div className="property-card">
  <img
    src={getContextualImage(property.images, 'grid')}
    srcSet={getImageSrcSet(property.images)}
    sizes={getImageSizes('card')}
    alt={property.title}
    loading="lazy"
  />
</div>
```

### Pattern 4: Gallery Thumbnail

```typescript
<button onClick={() => selectImage(index)}>
  <img
    src={getResponsiveImageUrl(image, 'thumbnail')}
    alt={`Gallery image ${index + 1}`}
    loading="lazy"
  />
</button>
```

## Browser Support

| Browser | WebP | Behavior |
|---------|------|----------|
| Chrome 23+ | ✅ | Serves WebP |
| Firefox 65+ | ✅ | Serves WebP |
| Edge 18+ | ✅ | Serves WebP |
| Safari 14+ | ✅ | Serves WebP |
| Safari 13- | ❌ | Serves JPEG |
| IE 11 | ❌ | Serves JPEG |

## Performance Tips

1. **Use WebP by default** - It's 25-35% smaller than JPEG
2. **Use lazy loading** - Add `loading="lazy"` to below-fold images
3. **Use appropriate sizes** - Match the sizes attribute to your layout
4. **Preload critical images** - Use `<link rel="preload">` for above-fold images
5. **Use picture element** - For art direction or format fallbacks

## Migration Guide

### Before (Old Code)

```typescript
<img src={property.image_url} alt="Property" />
```

### After (With WebP Support)

```typescript
<img
  src={getResponsiveImageUrl(property.images, 'medium')}
  srcSet={getImageSrcSet(property.images)}
  sizes={getImageSizes('grid')}
  alt="Property"
  loading="lazy"
/>
```

## Troubleshooting

### Images not loading?
- Check that the ImageUrls object has at least one URL property
- Verify S3/CloudFront URLs are accessible
- Check browser console for errors

### WebP not being served?
- Verify `thumbnail_webp_url`, `medium_webp_url`, `large_webp_url` are set in database
- Check that backend is uploading WebP versions
- Test in Chrome DevTools → Network tab

### Fallback not working?
- Ensure JPEG URLs are always present as fallback
- Check that `image_url` or `medium_url` exists

## Related Files

- `frontend/src/shared/utils/imageUtils.ts` - Main implementation
- `src/services/imageProcessingService.ts` - Backend WebP generation
- `src/services/s3Service.ts` - S3 upload with WebP
- `src/models/PropertyImage.ts` - Database schema

## Next Steps

After implementing WebP utilities, you can:
1. Create OptimizedImage component (Task 8)
2. Add image preloading (Task 9)
3. Update landing pages (Task 10-11)
4. Update property components (Task 17-19)
