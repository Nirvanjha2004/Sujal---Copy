/**
 * OptimizedImage Demo/Test Component
 * 
 * This file demonstrates the usage of OptimizedImage component
 * and can be used for manual testing.
 */

import { OptimizedImage } from './OptimizedImage';
import type { ImageUrls } from '@/shared/utils/imageUtils';

// Sample image data for testing
const sampleImages: ImageUrls = {
  thumbnail_url: 'https://example.com/image-thumbnail.jpg',
  medium_url: 'https://example.com/image-medium.jpg',
  large_url: 'https://example.com/image-large.jpg',
  thumbnail_webp_url: 'https://example.com/image-thumbnail.webp',
  medium_webp_url: 'https://example.com/image-medium.webp',
  large_webp_url: 'https://example.com/image-large.webp',
};

export function OptimizedImageDemo() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">OptimizedImage Component Demo</h1>

      {/* Priority Image (Above the fold) */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Priority Image (Above the fold)</h2>
        <div className="w-full max-w-2xl">
          <OptimizedImage
            images={sampleImages}
            alt="Priority hero image"
            context="detail"
            priority={true}
            className="rounded-lg"
            onLoad={() => console.log('Priority image loaded')}
          />
        </div>
      </section>

      {/* Grid Context with Blur Placeholder */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Grid Context with Blur Placeholder</h2>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <OptimizedImage
              key={i}
              images={sampleImages}
              alt={`Grid image ${i}`}
              context="grid"
              showBlurPlaceholder={true}
              className="rounded-lg aspect-video"
            />
          ))}
        </div>
      </section>

      {/* List Context with Skeleton Loader */}
      <section>
        <h2 className="text-xl font-semibold mb-4">List Context with Skeleton Loader</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <OptimizedImage
                images={sampleImages}
                alt={`List image ${i}`}
                context="list"
                showSkeleton={true}
                className="w-48 h-32 rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold">Property Title {i}</h3>
                <p className="text-gray-600">Property description goes here...</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Thumbnail Context */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Thumbnail Context</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <OptimizedImage
              key={i}
              images={sampleImages}
              alt={`Thumbnail ${i}`}
              context="thumbnail"
              className="w-20 h-20 rounded"
            />
          ))}
        </div>
      </section>

      {/* Error Handling Demo */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Error Handling (Invalid URL)</h2>
        <div className="w-64">
          <OptimizedImage
            images={{
              medium_url: 'https://invalid-url-that-will-fail.com/image.jpg',
            }}
            alt="Image that will fail to load"
            context="grid"
            maxRetries={2}
            className="rounded-lg aspect-video"
            onError={() => console.log('Image failed to load')}
          />
        </div>
      </section>

      {/* Custom Aspect Ratio */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Custom Aspect Ratio (16/9)</h2>
        <div className="w-full max-w-xl">
          <OptimizedImage
            images={sampleImages}
            alt="16:9 aspect ratio image"
            context="detail"
            aspectRatio="16/9"
            className="rounded-lg"
          />
        </div>
      </section>

      {/* Lazy Loading Demo (Below the fold) */}
      <section className="mt-[100vh]">
        <h2 className="text-xl font-semibold mb-4">Lazy Loading (Scroll to see)</h2>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <OptimizedImage
              key={i}
              images={sampleImages}
              alt={`Lazy loaded image ${i}`}
              context="grid"
              priority={false}
              className="rounded-lg aspect-video"
              onLoad={() => console.log(`Lazy image ${i} loaded`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
