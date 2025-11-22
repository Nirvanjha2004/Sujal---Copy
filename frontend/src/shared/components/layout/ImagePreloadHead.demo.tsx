/**
 * ImagePreloadHead Component Demo
 * 
 * This file demonstrates various usage patterns for the ImagePreloadHead component.
 * Use these examples as reference when implementing image preloading in your pages.
 */

import { ImagePreloadHead, useCloudFrontUrl } from './ImagePreloadHead';

/**
 * Example 1: Basic Landing Page
 * Preload hero image and first few featured properties
 */
export function LandingPageExample() {
  const cdnUrl = useCloudFrontUrl();
  
  const criticalImages = [
    `${cdnUrl}/images/topbanner.png`,
    `${cdnUrl}/properties/featured-1/large/image.jpg`,
    `${cdnUrl}/properties/featured-2/large/image.jpg`,
  ];
  
  return (
    <>
      <ImagePreloadHead
        cdnUrl={cdnUrl}
        criticalImages={criticalImages}
      />
      
      <div className="landing-page">
        <div className="hero">
          <img src={`${cdnUrl}/images/topbanner.png`} alt="Hero" />
        </div>
        <div className="featured-properties">
          {/* Featured property cards */}
        </div>
      </div>
    </>
  );
}

/**
 * Example 2: Property Details Page
 * Preload main image, prefetch gallery images
 */
export function PropertyDetailsExample() {
  const cdnUrl = useCloudFrontUrl();
  
  const propertyImages = [
    { large_url: `${cdnUrl}/properties/123/large/image-1.jpg` },
    { large_url: `${cdnUrl}/properties/123/large/image-2.jpg` },
    { large_url: `${cdnUrl}/properties/123/large/image-3.jpg` },
    { large_url: `${cdnUrl}/properties/123/large/image-4.jpg` },
  ];
  
  // Preload first image (main), prefetch next 3 (gallery)
  const criticalImages = [propertyImages[0].large_url];
  const prefetchImages = propertyImages.slice(1, 4).map(img => img.large_url);
  
  return (
    <>
      <ImagePreloadHead
        cdnUrl={cdnUrl}
        criticalImages={criticalImages}
        prefetchImages={prefetchImages}
      />
      
      <div className="property-details">
        <div className="main-image">
          <img src={propertyImages[0].large_url} alt="Property" />
        </div>
        <div className="gallery">
          {propertyImages.slice(1).map((img, idx) => (
            <img key={idx} src={img.large_url} alt={`Gallery ${idx + 1}`} />
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Example 3: Dynamic Content
 * Update preload list when data changes
 */
export function DynamicContentExample() {
  const cdnUrl = useCloudFrontUrl();
  const [projects, setProjects] = React.useState<Array<{ id: number; image_url: string; name: string }>>([]);
  
  React.useEffect(() => {
    // Simulate fetching projects
    fetchProjects().then(setProjects);
  }, []);
  
  // Extract image URLs from projects
  const criticalImages = projects
    .slice(0, 4)
    .map(project => project.image_url)
    .filter(Boolean); // Remove undefined/null
  
  return (
    <>
      <ImagePreloadHead
        cdnUrl={cdnUrl}
        criticalImages={criticalImages}
      />
      
      <div className="projects-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <img src={project.image_url} alt={project.name} />
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Example 4: Carousel with Prefetch
 * Prefetch next/previous images on navigation
 */
export function CarouselExample() {
  const cdnUrl = useCloudFrontUrl();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  const images = [
    `${cdnUrl}/carousel/image-1.jpg`,
    `${cdnUrl}/carousel/image-2.jpg`,
    `${cdnUrl}/carousel/image-3.jpg`,
    `${cdnUrl}/carousel/image-4.jpg`,
    `${cdnUrl}/carousel/image-5.jpg`,
  ];
  
  // Preload current image
  const criticalImages = [images[currentIndex]];
  
  // Prefetch next and previous images
  const prefetchImages = [
    images[currentIndex + 1],
    images[currentIndex - 1],
  ].filter(Boolean);
  
  return (
    <>
      <ImagePreloadHead
        cdnUrl={cdnUrl}
        criticalImages={criticalImages}
        prefetchImages={prefetchImages}
      />
      
      <div className="carousel">
        <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}>
          Previous
        </button>
        
        <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
        
        <button onClick={() => setCurrentIndex(i => Math.min(images.length - 1, i + 1))}>
          Next
        </button>
      </div>
    </>
  );
}

/**
 * Example 5: Hover Prefetch
 * Prefetch detail page images on card hover
 */
export function HoverPrefetchExample() {
  const cdnUrl = useCloudFrontUrl();
  const [hoveredProject, setHoveredProject] = React.useState<string | null>(null);
  
  const projects = [
    { id: '1', thumbnail: `${cdnUrl}/projects/1/thumbnail/image.jpg`, detailImage: `${cdnUrl}/projects/1/large/image.jpg` },
    { id: '2', thumbnail: `${cdnUrl}/projects/2/thumbnail/image.jpg`, detailImage: `${cdnUrl}/projects/2/large/image.jpg` },
    { id: '3', thumbnail: `${cdnUrl}/projects/3/thumbnail/image.jpg`, detailImage: `${cdnUrl}/projects/3/large/image.jpg` },
  ];
  
  // Prefetch detail image when hovering over card
  const prefetchImages = hoveredProject
    ? [projects.find(p => p.id === hoveredProject)?.detailImage].filter(Boolean)
    : [];
  
  return (
    <>
      <ImagePreloadHead
        cdnUrl={cdnUrl}
        prefetchImages={prefetchImages as string[]}
      />
      
      <div className="projects-grid">
        {projects.map(project => (
          <div
            key={project.id}
            className="project-card"
            onMouseEnter={() => setHoveredProject(project.id)}
            onMouseLeave={() => setHoveredProject(null)}
          >
            <img src={project.thumbnail} alt="Project" />
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Example 6: Conditional Preloading
 * Only preload on fast connections
 */
export function ConditionalPreloadExample() {
  const cdnUrl = useCloudFrontUrl();
  const [shouldPreload, setShouldPreload] = React.useState(true);
  
  React.useEffect(() => {
    // Check connection speed
    const connection = (navigator as any).connection;
    if (connection) {
      // Don't preload on slow connections (2G, slow-2g)
      const slowConnection = connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
      setShouldPreload(!slowConnection);
    }
  }, []);
  
  const criticalImages = shouldPreload
    ? [`${cdnUrl}/images/hero.jpg`]
    : [];
  
  return (
    <>
      <ImagePreloadHead
        cdnUrl={cdnUrl}
        criticalImages={criticalImages}
      />
      
      <div className="page">
        <img src={`${cdnUrl}/images/hero.jpg`} alt="Hero" />
      </div>
    </>
  );
}

/**
 * Example 7: Multiple Formats (WebP + JPEG)
 * Preload both WebP and JPEG versions
 */
export function MultiFormatExample() {
  const cdnUrl = useCloudFrontUrl();
  const supportsWebP = checkWebPSupport();
  
  const heroImageJpeg = `${cdnUrl}/images/hero.jpg`;
  const heroImageWebP = `${cdnUrl}/images/hero.webp`;
  
  // Preload appropriate format based on browser support
  const criticalImages = [supportsWebP ? heroImageWebP : heroImageJpeg];
  
  return (
    <>
      <ImagePreloadHead
        cdnUrl={cdnUrl}
        criticalImages={criticalImages}
      />
      
      <picture>
        <source type="image/webp" srcSet={heroImageWebP} />
        <source type="image/jpeg" srcSet={heroImageJpeg} />
        <img src={heroImageJpeg} alt="Hero" />
      </picture>
    </>
  );
}

/**
 * Example 8: Disable DNS Prefetch/Preconnect
 * For testing or specific use cases
 */
export function CustomConfigExample() {
  const cdnUrl = useCloudFrontUrl();
  
  return (
    <>
      <ImagePreloadHead
        cdnUrl={cdnUrl}
        criticalImages={[`${cdnUrl}/images/hero.jpg`]}
        enableDnsPrefetch={false}
        enablePreconnect={false}
      />
      
      <div className="page">
        <img src={`${cdnUrl}/images/hero.jpg`} alt="Hero" />
      </div>
    </>
  );
}

// Helper functions
function fetchProjects() {
  return Promise.resolve([
    { id: 1, image_url: 'https://example.com/project-1.jpg', name: 'Project 1' },
    { id: 2, image_url: 'https://example.com/project-2.jpg', name: 'Project 2' },
  ]);
}

function checkWebPSupport() {
  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

// Add React import for demo
import * as React from 'react';
