import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Property, PropertyFilters } from "@/lib/api";

interface PropertyMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  onBoundsChange?: (bounds: google.maps.LatLngBounds) => void;
  filters?: PropertyFilters;
  className?: string;
  height?: string;
}

interface PropertyMarker {
  property: Property;
  marker: google.maps.Marker;
  infoWindow: google.maps.InfoWindow;
}

export function PropertyMap({ 
  properties, 
  onPropertySelect, 
  onBoundsChange,
  filters,
  className = "",
  height = "400px"
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<PropertyMarker[]>([]);
  const [markerClusterer, setMarkerClusterer] = useState<any>(null);

  // Google Maps API key - in production, this should be in environment variables
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (map) {
      updateMarkers();
    }
  }, [properties, map]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      setLoading(true);
      
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      await loader.load();

      // Default center (Mumbai, India)
      const defaultCenter = { lat: 19.0760, lng: 72.8777 };
      
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add bounds change listener
      mapInstance.addListener('bounds_changed', () => {
        const bounds = mapInstance.getBounds();
        if (bounds && onBoundsChange) {
          onBoundsChange(bounds);
        }
      });

      setMap(mapInstance);
      setError(null);
    } catch (err) {
      setError('Failed to load Google Maps');
      console.error('Error loading Google Maps:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateMarkers = () => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(({ marker, infoWindow }) => {
      marker.setMap(null);
      infoWindow.close();
    });

    const newMarkers: PropertyMarker[] = [];
    const bounds = new google.maps.LatLngBounds();

    properties.forEach((property) => {
      // Use mock coordinates if not available
      const lat = property.latitude || (19.0760 + (Math.random() - 0.5) * 0.1);
      const lng = property.longitude || (72.8777 + (Math.random() - 0.5) * 0.1);

      const position = { lat, lng };
      bounds.extend(position);

      // Create custom marker icon based on property type
      const markerIcon = {
        url: getMarkerIcon(property.property_type, property.listing_type),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 40)
      };

      const marker = new google.maps.Marker({
        position,
        map,
        title: property.title,
        icon: markerIcon,
        animation: google.maps.Animation.DROP
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(property)
      });

      // Add click listeners
      marker.addListener('click', () => {
        // Close all other info windows
        markers.forEach(({ infoWindow: iw }) => iw.close());
        
        infoWindow.open(map, marker);
        
        if (onPropertySelect) {
          onPropertySelect(property);
        }
      });

      newMarkers.push({ property, marker, infoWindow });
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (properties.length > 0) {
      map.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() && map.getZoom()! > 15) {
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  };

  const getMarkerIcon = (propertyType: string, listingType: string): string => {
    // Return different colored markers based on property type and listing type
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    
    if (listingType === 'rent') {
      switch (propertyType) {
        case 'apartment': return `${baseUrl}blue-dot.png`;
        case 'house': return `${baseUrl}green-dot.png`;
        case 'commercial': return `${baseUrl}purple-dot.png`;
        case 'land': return `${baseUrl}yellow-dot.png`;
        default: return `${baseUrl}blue-dot.png`;
      }
    } else {
      switch (propertyType) {
        case 'apartment': return `${baseUrl}red-dot.png`;
        case 'house': return `${baseUrl}orange-dot.png`;
        case 'commercial': return `${baseUrl}pink-dot.png`;
        case 'land': return `${baseUrl}ltblue-dot.png`;
        default: return `${baseUrl}red-dot.png`;
      }
    }
  };

  const createInfoWindowContent = (property: Property): string => {
    const formatPrice = (price: number) => {
      if (price >= 10000000) {
        return `₹ ${(price / 10000000).toFixed(2)} Cr`;
      } else if (price >= 100000) {
        return `₹ ${(price / 100000).toFixed(2)} Lakh`;
      } else {
        return `₹ ${price.toLocaleString()}`;
      }
    };

    const imageUrl = property.images?.[0]?.image_url || '/api/placeholder/200/150';

    return `
      <div style="max-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <img src="${imageUrl}" alt="${property.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
        <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1f2937;">${property.title}</h3>
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; display: flex; align-items: center;">
          <span style="margin-right: 4px;">📍</span> ${property.location}
        </p>
        <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #059669;">${formatPrice(property.price)}</p>
        <div style="display: flex; gap: 8px; margin-bottom: 8px; font-size: 11px; color: #6b7280;">
          <span>${property.area_sqft || 0} sq ft</span>
          <span>•</span>
          <span>${property.bedrooms} BHK</span>
          <span>•</span>
          <span>${property.bathrooms} Bath</span>
        </div>
        <div style="display: flex; gap: 4px; margin-bottom: 8px;">
          <span style="background: #e5e7eb; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: capitalize;">${property.property_type}</span>
          <span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: capitalize;">${property.listing_type}</span>
        </div>
        <button onclick="window.dispatchEvent(new CustomEvent('propertySelect', { detail: ${property.id} }))" 
                style="width: 100%; background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 500;">
          View Details
        </button>
      </div>
    `;
  };

  // Listen for property selection from info window
  useEffect(() => {
    const handlePropertySelect = (event: any) => {
      const propertyId = event.detail;
      const property = properties.find(p => p.id === propertyId);
      if (property && onPropertySelect) {
        onPropertySelect(property);
      }
    };

    window.addEventListener('propertySelect', handlePropertySelect);
    return () => window.removeEventListener('propertySelect', handlePropertySelect);
  }, [properties, onPropertySelect]);

  const centerMapOnLocation = (location: string) => {
    if (!map) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(13);
      }
    });
  };

  // Center map when location filter changes
  useEffect(() => {
    if (map && filters?.location) {
      centerMapOnLocation(filters.location);
    }
  }, [map, filters?.location]);

  if (loading) {
    return (
      <Card className={className}>
        <div 
          className="flex items-center justify-center bg-muted rounded-lg"
          style={{ height }}
        >
          <div className="text-center">
            <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <div 
          className="flex items-center justify-center bg-muted rounded-lg"
          style={{ height }}
        >
          <div className="text-center">
            <Icon icon="solar:map-bold" className="size-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            <Button size="sm" onClick={initializeMap}>
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full rounded-lg"
          style={{ height }}
        />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="shadow-lg"
            onClick={() => {
              if (map && properties.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                properties.forEach(property => {
                  const lat = property.latitude || (19.0760 + (Math.random() - 0.5) * 0.1);
                  const lng = property.longitude || (72.8777 + (Math.random() - 0.5) * 0.1);
                  bounds.extend({ lat, lng });
                });
                map.fitBounds(bounds);
              }
            }}
          >
            <Icon icon="solar:maximize-bold" className="size-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <h4 className="text-xs font-semibold mb-2">Property Types</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Apartment (Sale)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Apartment (Rent)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>House (Sale)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>House (Rent)</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}