import { 
  Property, 
  PropertyType, 
  ListingType, 
  PropertyStatus, 
  PropertyImage, 
  PropertyStats,
  PropertyFormData,
  CreatePropertyRequest,
  PropertyAmenities
} from '../types';
import { 
  PROPERTY_TYPES, 
  LISTING_TYPES, 
  PROPERTY_STATUSES, 
  AMENITY_MAPPING,
  PRICE_RANGES,
  AREA_RANGES
} from '../constants';
import { AMENITIES_CONFIG } from '../constants/amenities';

/**
 * Format property price with currency and appropriate units
 */
export const formatPrice = (price: number, currency: string = '₹'): string => {
  if (price >= 10000000) { // 1 Crore
    const crores = price / 10000000;
    return `${currency}${crores.toFixed(crores >= 10 ? 0 : 1)} Cr`;
  } else if (price >= 100000) { // 1 Lakh
    const lakhs = price / 100000;
    return `${currency}${lakhs.toFixed(lakhs >= 10 ? 0 : 1)} L`;
  } else if (price >= 1000) { // 1 Thousand
    const thousands = price / 1000;
    return `${currency}${thousands.toFixed(0)}K`;
  }
  return `${currency}${price.toLocaleString()}`;
};

/**
 * Format property area with appropriate units
 */
export const formatArea = (area: number, unit: string = 'sqft'): string => {
  if (area >= 43560 && unit === 'sqft') { // Convert to acres if large
    const acres = area / 43560;
    return `${acres.toFixed(2)} acres`;
  }
  return `${area.toLocaleString()} ${unit}`;
};

/**
 * Get property type label from value
 */
export const getPropertyTypeLabel = (type: PropertyType): string => {
  const propertyType = PROPERTY_TYPES.find(pt => pt.value === type);
  return propertyType?.label || type;
};

/**
 * Get listing type label from value
 */
export const getListingTypeLabel = (type: ListingType): string => {
  const listingType = LISTING_TYPES.find(lt => lt.value === type);
  return listingType?.label || type;
};

/**
 * Get property status label from value
 */
export const getPropertyStatusLabel = (status: PropertyStatus): string => {
  const propertyStatus = PROPERTY_STATUSES.find(ps => ps.value === status);
  return propertyStatus?.label || status;
};

/**
 * Generate property title from basic information
 */
export const generatePropertyTitle = (
  propertyType: PropertyType,
  bedrooms?: number,
  location?: string
): string => {
  const typeLabel = getPropertyTypeLabel(propertyType);
  const bedroomText = bedrooms ? `${bedrooms} BHK ` : '';
  const locationText = location ? ` in ${location}` : '';
  
  return `${bedroomText}${typeLabel}${locationText}`;
};

/**
 * Calculate property price per square foot
 */
export const calculatePricePerSqft = (price: number, area: number): number => {
  if (area <= 0) return 0;
  return Math.round(price / area);
};

/**
 * Get property summary text
 */
export const getPropertySummary = (property: Property): string => {
  const parts: string[] = [];
  
  if (property.bedrooms) {
    parts.push(`${property.bedrooms} BHK`);
  }
  
  if (property.bathrooms) {
    parts.push(`${property.bathrooms} Bath`);
  }
  
  if (property.area_sqft) {
    parts.push(formatArea(property.area_sqft));
  }
  
  return parts.join(' • ');
};

/**
 * Get primary property image
 */
export const getPrimaryImage = (images: PropertyImage[]): PropertyImage | null => {
  if (!images || images.length === 0) return null;
  
  // Find primary image
  const primary = images.find(img => img.is_primary);
  if (primary) return primary;
  
  // Return first image if no primary is set
  return images[0] || null;
};

/**
 * Get property image URL with fallback
 */
export const getPropertyImageUrl = (
  images: PropertyImage[], 
  fallbackUrl: string = '/images/property-placeholder.jpg'
): string => {
  const primaryImage = getPrimaryImage(images);
  return  primaryImage?.large_url || primaryImage?.medium_url||primaryImage?.image_url || fallbackUrl;
};

/**
 * Get property thumbnail URL
 */
export const getPropertyThumbnailUrl = (
  images: PropertyImage[], 
  fallbackUrl: string = '/images/property-placeholder-thumb.jpg'
): string => {
  const primaryImage = getPrimaryImage(images);
  return primaryImage?.thumbnail_url|| primaryImage?.image_url || fallbackUrl;
};

/**
 * Format property amenities for display
 */
export const formatAmenities = (amenities: string[] | Record<string, boolean> | PropertyAmenities): string[] => {
  if (Array.isArray(amenities)) {
    return amenities;
  }
  
  // Convert object format to array
  return Object.entries(amenities)
    .filter(([_, value]) => value === true)
    .map(([key, _]) => {
      // Convert backend key to display label
      const config = AMENITIES_CONFIG[key];
      return config?.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    });
};

/**
 * Get amenity display information
 */
export const getAmenityInfo = (amenityKey: string) => {
  return AMENITIES_CONFIG[amenityKey] || {
    label: amenityKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: 'basic' as const,
    icon: 'solar:home-bold',
    description: '',
    premium: false,
    searchKeywords: []
  };
};

/**
 * Convert amenities array to backend format
 */
export const convertAmenitiesToBackend = (amenities: string[]): Record<string, boolean> => {
  const result: Record<string, boolean> = {};
  
  amenities.forEach(amenity => {
    // Find the backend key for this amenity
    const backendKey = Object.entries(AMENITY_MAPPING)
      .find(([label, _]) => label === amenity)?.[1] || 
      amenity.toLowerCase().replace(/\s+/g, '_');
    
    result[backendKey] = true;
  });
  
  return result;
};

/**
 * Get property location string
 */
export const getLocationString = (property: Property): string => {
  const parts: string[] = [];
  
  if (property.address) {
    parts.push(property.address);
  }
  
  if (property.city) {
    parts.push(property.city);
  }
  
  if (property.state) {
    parts.push(property.state);
  }
  
  return parts.join(', ');
};

/**
 * Get short location string (city, state)
 */
export const getShortLocationString = (property: Property): string => {
  const parts: string[] = [];
  
  if (property.city) {
    parts.push(property.city);
  }
  
  if (property.state) {
    parts.push(property.state);
  }
  
  return parts.join(', ');
};

/**
 * Check if property is available for the given listing type
 */
export const isPropertyAvailable = (property: Property): boolean => {
  return property.is_active || false;
};

/**
 * Check if property is featured
 */
export const isPropertyFeatured = (property: Property): boolean => {
  return property.is_featured || false;
};

/**
 * Get property age from creation date
 */
export const getPropertyAge = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

/**
 * Get property stats summary
 */
export const getPropertyStatsSummary = (stats?: PropertyStats): string => {
  if (!stats) return 'No stats available';
  
  const parts: string[] = [];
  
  if (stats.views > 0) {
    parts.push(`${stats.views} view${stats.views > 1 ? 's' : ''}`);
  }
  
  if (stats.favorites > 0) {
    parts.push(`${stats.favorites} favorite${stats.favorites > 1 ? 's' : ''}`);
  }
  
  if (stats.inquiries > 0) {
    parts.push(`${stats.inquiries} inquir${stats.inquiries > 1 ? 'ies' : 'y'}`);
  }
  
  return parts.length > 0 ? parts.join(' • ') : 'No activity yet';
};

/**
 * Find price range for a given price
 */
export const findPriceRange = (price: number) => {
  return PRICE_RANGES.find(range => {
    if (range.max === null) {
      return price >= range.min;
    }
    return price >= range.min && price <= range.max;
  });
};

/**
 * Find area range for a given area
 */
export const findAreaRange = (area: number) => {
  return AREA_RANGES.find(range => {
    if (range.max === null) {
      return area >= range.min;
    }
    return area >= range.min && area <= range.max;
  });
};

/**
 * Convert form data to create property request
 */
export const convertFormDataToCreateRequest = (formData: PropertyFormData): CreatePropertyRequest => {
  return {
    title: formData.title,
    description: formData.description,
    property_type: formData.property_type as PropertyType,
    listing_type: formData.listing_type as ListingType,
    price: parseFloat(formData.price),
    area_sqft: parseFloat(formData.area),
    bedrooms: parseInt(formData.bedrooms) || 0,
    bathrooms: parseInt(formData.bathrooms) || 0,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    amenities: convertAmenitiesToBackend(formData.amenities)
  };
};

/**
 * Convert property to form data
 */
export const convertPropertyToFormData = (property: Property): PropertyFormData => {
  return {
    title: property.title,
    description: property.description || '',
    property_type: property.property_type || '',
    listing_type: property.listing_type || '',
    status: property.status,
    price: property.price.toString(),
    area: (property.area_sqft || 0).toString(),
    bedrooms: (property.bedrooms || 0).toString(),
    bathrooms: (property.bathrooms || 0).toString(),
    address: property.address || '',
    city: property.city,
    state: property.state,
    postal_code: '',
    amenities: formatAmenities(property.amenities),
    images: [],
    latitude: property.latitude?.toString(),
    longitude: property.longitude?.toString()
  };
};

/**
 * Normalize property data from API response
 */
export const normalizePropertyData = (property: any): Property => {
  return {
    id: property.id,
    user_id: property.user_id,
    title: property.title,
    description: property.description,
    property_type: property.property_type,
    listing_type: property.listing_type,
    price: property.price,
    area_sqft: property.area_sqft,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    address: property.address,
    city: property.city,
    state: property.state,
    latitude: property.latitude,
    longitude: property.longitude,
    amenities: property.amenities || {},
    images: property.images || [],
    is_active: property.is_active ?? true,
    is_featured: property.is_featured ?? false,
    status: property.status,
    created_at: property.created_at,
    updated_at: property.updated_at
  };
};

/**
 * Generate property URL slug
 */
export const generatePropertySlug = (property: Property): string => {
  const title = property.title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  return `${title}-${property.id}`;
};

/**
 * Parse property ID from slug
 */
export const parsePropertyIdFromSlug = (slug: string): number | null => {
  const match = slug.match(/-(\d+)$/);
  return match ? parseInt(match[1]) : null;
};

/**
 * Check if two properties are similar
 */
export const arePropertiesSimilar = (prop1: Property, prop2: Property): boolean => {
  return (
    prop1.property_type === prop2.property_type &&
    prop1.city === prop2.city &&
    Math.abs(prop1.price - prop2.price) / Math.max(prop1.price, prop2.price) < 0.3 &&
    Math.abs((prop1.bedrooms || 0) - (prop2.bedrooms || 0)) <= 1
  );
};

/**
 * Sort properties by given criteria
 */
export const sortProperties = (
  properties: Property[], 
  sortBy: string, 
  sortOrder: 'asc' | 'desc' = 'asc'
): Property[] => {
  return [...properties].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'area':
        comparison = (a.area_sqft || 0) - (b.area_sqft || 0);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

/**
 * Filter properties by criteria
 */
export const filterProperties = (
  properties: Property[],
  filters: {
    minPrice?: number;
    maxPrice?: number;
    propertyType?: PropertyType;
    bedrooms?: number;
    city?: string;
    amenities?: string[];
  }
): Property[] => {
  return properties.filter(property => {
    if (filters.minPrice && property.price < filters.minPrice) return false;
    if (filters.maxPrice && property.price > filters.maxPrice) return false;
    if (filters.propertyType && property.property_type !== filters.propertyType) return false;
    if (filters.bedrooms && property.bedrooms !== filters.bedrooms) return false;
    if (filters.city && property.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    
    if (filters.amenities && filters.amenities.length > 0) {
      const propertyAmenities = formatAmenities(property.amenities);
      const hasAllAmenities = filters.amenities.every(amenity => 
        propertyAmenities.some(pa => pa.toLowerCase().includes(amenity.toLowerCase()))
      );
      if (!hasAllAmenities) return false;
    }
    
    return true;
  });
};