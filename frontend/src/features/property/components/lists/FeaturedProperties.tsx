import React, { useState, useRef } from 'react';
import { Property } from '../../types';
import { PropertyCard } from '../common/PropertyCard';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ChevronLeft, ChevronRight, Star, TrendingUp, Eye, ArrowRight } from 'lucide-react';

export interface FeaturedPropertiesProps {
  properties: Property[];
  title?: string;
  subtitle?: string;
  onPropertyClick?: (property: Property) => void;

  onViewAll?: () => void;
  showViewAll?: boolean;
  showFavoriteButton?: boolean;
  showStats?: boolean;
  layout?: 'carousel' | 'grid';
  maxItems?: number;
  autoScroll?: boolean;
  autoScrollInterval?: number;
  className?: string;
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties,
  title = 'Featured Properties',
  subtitle = 'Handpicked premium properties for you',
  onPropertyClick,
  onViewAll,
  showViewAll = true,
  showFavoriteButton = true,
  showStats = true,
  layout = 'carousel',
  maxItems = 6,
  autoScroll = false,
  autoScrollInterval = 5000,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout>();

  const displayProperties = properties.slice(0, maxItems);
  const itemsPerView = layout === 'carousel' ? 3 : 6;
  const maxIndex = Math.max(0, displayProperties.length - itemsPerView);

  // Auto scroll functionality
  React.useEffect(() => {
    if (autoScroll && layout === 'carousel' && displayProperties.length > itemsPerView) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, autoScrollInterval);

      return () => {
        if (autoScrollRef.current) {
          clearInterval(autoScrollRef.current);
        }
      };
    }
  }, [autoScroll, layout, displayProperties.length, itemsPerView, maxIndex, autoScrollInterval]);

  const scrollTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    
    // Clear auto scroll when user manually navigates
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
  };

  const scrollLeft = () => {
    scrollTo(currentIndex - 1);
  };

  const scrollRight = () => {
    scrollTo(currentIndex + 1);
  };

  if (displayProperties.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Property count badge */}
            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {displayProperties.length} Properties
            </Badge>

            {/* View all button */}
            {showViewAll && onViewAll && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewAll}
                className="flex items-center gap-2"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {layout === 'carousel' ? (
          <div className="relative">
            {/* Carousel Navigation */}
            {displayProperties.length > itemsPerView && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollLeft}
                  disabled={currentIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollRight}
                  disabled={currentIndex >= maxIndex}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div
                ref={scrollContainerRef}
                className="flex transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
                }}
              >
                {displayProperties.map((property) => (
                  <div
                    key={property.id}
                    className="flex-shrink-0 px-2"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    <PropertyCard
                      property={property}
                      variant="grid"
                      showFavorite={showFavoriteButton}
                      showStats={showStats}
                      showAgent={false}
                      onClick={() => onPropertyClick?.(property)}


                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Indicators */}
            {displayProperties.length > itemsPerView && (
              <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Grid Layout
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                variant="grid"
                showFavorite={showFavoriteButton}
                showStats={showStats}
                showAgent={false}
                onClick={() => onPropertyClick?.(property)}


              />
            ))}
          </div>
        )}

        {/* Featured Properties Stats */}
        {showStats && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {displayProperties.length}
                </div>
                <div className="text-sm text-gray-600">Featured</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{Math.round(displayProperties.reduce((sum, p) => sum + p.price, 0) / displayProperties.length / 100000)}L
                </div>
                <div className="text-sm text-gray-600">Avg Price</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(displayProperties.reduce((sum, p) => sum + (p.area_sqft || 0), 0) / displayProperties.length)}
                </div>
                <div className="text-sm text-gray-600">Avg Area</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                  <Eye className="h-5 w-5" />
                  {displayProperties.length}
                </div>
                <div className="text-sm text-gray-600">Properties</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Skeleton loader for FeaturedProperties
export const FeaturedPropertiesSkeleton: React.FC<{
  layout?: 'carousel' | 'grid';
  count?: number;
}> = ({ layout = 'carousel', count = 3 }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
      </CardHeader>

      <CardContent>
        <div className={layout === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'flex space-x-4'
        }>
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border shadow-sm overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-24" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};