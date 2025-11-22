import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/shared/components/ui/button";
import { PropertyImage } from "../../types";
import { OptimizedImage } from "@/shared/components/ui/OptimizedImage";

export interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
  className?: string;
  showThumbnails?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function PropertyGallery({ 
  images, 
  title, 
  className = "",
  showThumbnails = true,
  autoPlay = false,
  autoPlayInterval = 5000
}: PropertyGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const prefetchedImagesRef = useRef<Set<number>>(new Set());

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, images.length]);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  const getImageAlt = (image: PropertyImage, index: number) => {
    return image.alt_text || `${title} - Image ${index + 1}`;
  };

  // Default images if none provided
  const defaultImages: PropertyImage[] = [
    {
      id: 1,
      property_id: 0,
      image_url: "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/luxury-real-estate/landscape/4.webp",
      alt_text: title,
      display_order: 1,
      is_primary: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      property_id: 0,
      image_url: "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/luxury-real-estate/square/3.webp",
      alt_text: "Property view",
      display_order: 2,
      is_primary: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      property_id: 0,
      image_url: "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/luxury-real-estate/square/2.webp",
      alt_text: "Property view",
      display_order: 3,
      is_primary: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  console.log("images", images);
  const displayImages = images && images.length > 0 ? images : defaultImages;
  console.log("displayImages", displayImages);

  // Prefetch next and previous images when viewing an image
  useEffect(() => {
    if (displayImages.length <= 1) return;

    const prefetchImage = (index: number) => {
      if (prefetchedImagesRef.current.has(index)) return;
      
      const image = displayImages[index];
      if (!image) return;

      // Prefetch large version for lightbox
      const largeUrl = image.large_url || image.medium_url || image.image_url;
      const largeWebpUrl = image.large_webp_url || image.medium_webp_url;
      
      if (largeUrl) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = largeUrl;
        document.head.appendChild(link);
      }
      
      if (largeWebpUrl) {
        const linkWebp = document.createElement('link');
        linkWebp.rel = 'prefetch';
        linkWebp.as = 'image';
        linkWebp.href = largeWebpUrl;
        document.head.appendChild(linkWebp);
      }

      prefetchedImagesRef.current.add(index);
    };

    // Prefetch next image
    const nextIndex = (selectedImageIndex + 1) % displayImages.length;
    prefetchImage(nextIndex);

    // Prefetch previous image
    const prevIndex = (selectedImageIndex - 1 + displayImages.length) % displayImages.length;
    prefetchImage(prevIndex);
  }, [selectedImageIndex, displayImages]);

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Main Gallery Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Main Image */}
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group" onClick={() => openLightbox(selectedImageIndex)}>
            <OptimizedImage
              images={displayImages[selectedImageIndex]}
              alt={getImageAlt(displayImages[selectedImageIndex], selectedImageIndex)}
              context="detail"
              priority={true}
              className="group-hover:scale-105 transition-transform duration-300"
              showBlurPlaceholder={true}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
            
            {/* Expand Button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => openLightbox(selectedImageIndex)}
            >
              <Icon icon="solar:maximize-bold" className="size-5" />
            </Button>

            {/* Navigation Arrows for Main Image */}
            {/* {displayImages.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <Icon icon="solar:arrow-left-bold" className="size-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-12 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <Icon icon="solar:arrow-right-bold" className="size-5" />
                </Button>
              </>
            )} */}

            {/* Image Counter */}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {selectedImageIndex + 1} / {displayImages.length}
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-2 gap-4">
            {displayImages.slice(1, 5).map((image, index) => (
              <div 
                key={image.id || index} 
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => {
                  setSelectedImageIndex(index + 1);
                  openLightbox(index + 1);
                }}
              >
                <OptimizedImage
                  images={image}
                  alt={getImageAlt(image, index + 1)}
                  context="thumbnail"
                  priority={false}
                  className="group-hover:scale-105 transition-transform duration-300"
                  showBlurPlaceholder={true}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                
                {/* More Images Indicator */}
                {index === 3 && displayImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                    <span className="text-white font-semibold text-lg">
                      +{displayImages.length - 5} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {showThumbnails && displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {displayImages.map((image, index) => (
              <button
                key={image.id || index}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === selectedImageIndex ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <OptimizedImage
                  images={image}
                  alt={getImageAlt(image, index)}
                  context="thumbnail"
                  priority={false}
                  showBlurPlaceholder={false}
                  showSkeleton={true}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <OptimizedImage
              images={displayImages[selectedImageIndex]}
              alt={getImageAlt(displayImages[selectedImageIndex], selectedImageIndex)}
              context="detail"
              priority={true}
              className="max-w-full max-h-full object-contain"
              showBlurPlaceholder={true}
            />
            
            {/* Close Button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white"
              onClick={closeLightbox}
            >
              <Icon icon="solar:close-bold" className="size-6" />
            </Button>

            {/* Navigation Buttons */}
            {/* {displayImages.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <Icon icon="solar:arrow-left-bold" className="size-6" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <Icon icon="solar:arrow-right-bold" className="size-6" />
                </Button>
              </>
            )} */}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {displayImages.length}
            </div>

            {/* Thumbnail Strip in Lightbox */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
              {displayImages.map((image, index) => (
                <button
                  key={image.id || index}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex ? 'border-white' : 'border-transparent'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(index);
                  }}
                >
                  <OptimizedImage
                    images={image}
                    alt={getImageAlt(image, index)}
                    context="thumbnail"
                    priority={false}
                    showBlurPlaceholder={false}
                    showSkeleton={true}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}