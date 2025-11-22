import { Property, PropertyType, ListingType, PropertyStatus } from '../types';

/**
 * Format currency with Indian numbering system
 */
export const formatCurrency = (
  amount: number, 
  currency: string = '₹',
  showDecimals: boolean = false
): string => {
  if (amount === 0) return `${currency}0`;
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  });
  
  return formatter.format(amount).replace('₹', currency);
};

/**
 * Format large numbers with Indian units (Lakh, Crore)
 */
export const formatIndianNumber = (
  num: number, 
  currency: string = '₹',
  precision: number = 1
): string => {
  if (num === 0) return `${currency}0`;
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 10000000) { // 1 Crore
    const crores = absNum / 10000000;
    const formatted = crores >= 100 
      ? crores.toFixed(0) 
      : crores.toFixed(crores >= 10 ? 1 : precision);
    return `${sign}${currency}${formatted} Cr`;
  } else if (absNum >= 100000) { // 1 Lakh
    const lakhs = absNum / 100000;
    const formatted = lakhs >= 100 
      ? lakhs.toFixed(0) 
      : lakhs.toFixed(lakhs >= 10 ? 1 : precision);
    return `${sign}${currency}${formatted} L`;
  } else if (absNum >= 1000) { // 1 Thousand
    const thousands = absNum / 1000;
    return `${sign}${currency}${thousands.toFixed(0)}K`;
  }
  
  return `${sign}${currency}${absNum.toLocaleString('en-IN')}`;
};

/**
 * Format area with appropriate units
 */
export const formatArea = (
  area: number, 
  unit: string = 'sq ft',
  showUnit: boolean = true
): string => {
  if (area === 0) return showUnit ? `0 ${unit}` : '0';
  
  const formattedArea = area.toLocaleString('en-IN');
  return showUnit ? `${formattedArea} ${unit}` : formattedArea;
};

/**
 * Format property configuration (BHK)
 */
export const formatPropertyConfig = (
  bedrooms?: number, 
  bathrooms?: number,
  shortForm: boolean = false
): string => {
  const parts: string[] = [];
  
  if (bedrooms !== undefined && bedrooms > 0) {
    if (shortForm) {
      parts.push(`${bedrooms}BHK`);
    } else {
      parts.push(`${bedrooms} ${bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`);
    }
  }
  
  if (bathrooms !== undefined && bathrooms > 0) {
    if (shortForm) {
      parts.push(`${bathrooms}B`);
    } else {
      parts.push(`${bathrooms} ${bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}`);
    }
  }
  
  return parts.join(shortForm ? ' ' : ', ');
};

/**
 * Format property title with configuration
 */
export const formatPropertyTitle = (
  property: Property,
  includeLocation: boolean = false,
  maxLength?: number
): string => {
  let title = property.title;
  
  // If title doesn't include configuration, add it
  const config = formatPropertyConfig(property.bedrooms, property.bathrooms, true);
  if (config && !title.toLowerCase().includes('bhk')) {
    title = `${config} ${title}`;
  }
  
  // Add location if requested
  if (includeLocation && property.city) {
    title += ` in ${property.city}`;
  }
  
  // Truncate if max length specified
  if (maxLength && title.length > maxLength) {
    title = title.substring(0, maxLength - 3) + '...';
  }
  
  return title;
};

/**
 * Format property description with truncation
 */
export const formatPropertyDescription = (
  description: string,
  maxLength: number = 150,
  addEllipsis: boolean = true
): string => {
  if (!description) return '';
  
  if (description.length <= maxLength) {
    return description;
  }
  
  const truncated = description.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const finalText = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
  
  return addEllipsis ? `${finalText}...` : finalText;
};

/**
 * Format property address
 */
export const formatAddress = (
  property: Property,
  format: 'full' | 'short' | 'city-state' = 'full'
): string => {
  const parts: string[] = [];
  
  switch (format) {
    case 'full':
      if (property.address) {
        parts.push(property.address);
      }
      if (property.city) parts.push(property.city);
      if (property.state) parts.push(property.state);
      if (property.postal_code) {
        parts.push(property.postal_code);
      }
      break;
      
    case 'short':
      if (property.city) parts.push(property.city);
      if (property.state) parts.push(property.state);
      break;
      
    case 'city-state':
      if (property.city) parts.push(property.city);
      if (property.state) parts.push(property.state);
      break;
  }
  
  return parts.filter(Boolean).join(', ');
};

/**
 * Format property status with color coding
 */
export const formatPropertyStatus = (
  status: PropertyStatus
): { label: string; color: string; bgColor: string } => {
  const statusMap: Record<PropertyStatus, { label: string; color: string; bgColor: string }> = {
    new: { label: 'New Launch', color: 'text-green-600', bgColor: 'bg-green-100' },
    resale: { label: 'Resale', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    under_construction: { label: 'Under Construction', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    active: { label: 'Active', color: 'text-green-600', bgColor: 'bg-green-100' },
    pending: { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    sold: { label: 'Sold', color: 'text-red-600', bgColor: 'bg-red-100' },
    rented: { label: 'Rented', color: 'text-purple-600', bgColor: 'bg-purple-100' }
  };
  
  return statusMap[status] || { label: status, color: 'text-gray-600', bgColor: 'bg-gray-100' };
};

/**
 * Format property type with icon
 */
export const formatPropertyType = (
  propertyType: PropertyType
): { label: string; icon: string } => {
  const typeMap: Record<PropertyType, { label: string; icon: string }> = {
    apartment: { label: 'Apartment', icon: 'solar:buildings-2-bold' },
    house: { label: 'House', icon: 'solar:home-bold' },
    villa: { label: 'Villa', icon: 'solar:home-2-bold' },
    plot: { label: 'Plot', icon: 'solar:map-bold' },
    commercial: { label: 'Commercial', icon: 'solar:shop-bold' },
    land: { label: 'Land', icon: 'solar:leaf-bold' }
  };
  
  return typeMap[propertyType] || { label: propertyType, icon: 'solar:home-bold' };
};

/**
 * Format listing type with appropriate styling
 */
export const formatListingType = (
  listingType: ListingType
): { label: string; color: string; bgColor: string } => {
  const typeMap: Record<ListingType, { label: string; color: string; bgColor: string }> = {
    sale: { label: 'For Sale', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    rent: { label: 'For Rent', color: 'text-green-600', bgColor: 'bg-green-100' }
  };
  
  return typeMap[listingType] || { label: listingType, color: 'text-gray-600', bgColor: 'bg-gray-100' };
};

/**
 * Format amenities list with grouping
 */
export const formatAmenitiesList = (
  amenities: string[],
  maxDisplay: number = 5,
  groupByCategory: boolean = false
): {
  displayed: string[];
  remaining: number;
  grouped?: Record<string, string[]>;
} => {
  if (!amenities || amenities.length === 0) {
    return { displayed: [], remaining: 0 };
  }
  
  const displayed = amenities.slice(0, maxDisplay);
  const remaining = Math.max(0, amenities.length - maxDisplay);
  
  const result: any = { displayed, remaining };
  
  if (groupByCategory) {
    // This would require amenity category mapping
    // For now, return a simple grouping
    result.grouped = {
      'Basic': displayed.filter(a => ['Parking', 'Security', 'Elevator'].includes(a)),
      'Recreational': displayed.filter(a => ['Swimming Pool', 'Gym', 'Garden'].includes(a)),
      'Other': displayed.filter(a => !['Parking', 'Security', 'Elevator', 'Swimming Pool', 'Gym', 'Garden'].includes(a))
    };
  }
  
  return result;
};

/**
 * Format property price range
 */
export const formatPriceRange = (
  minPrice: number,
  maxPrice: number,
  currency: string = '₹'
): string => {
  if (minPrice === maxPrice) {
    return formatIndianNumber(minPrice, currency);
  }
  
  const formattedMin = formatIndianNumber(minPrice, currency);
  const formattedMax = formatIndianNumber(maxPrice, currency);
  
  return `${formattedMin} - ${formattedMax}`;
};

/**
 * Format area range
 */
export const formatAreaRange = (
  minArea: number,
  maxArea: number,
  unit: string = 'sq ft'
): string => {
  if (minArea === maxArea) {
    return formatArea(minArea, unit);
  }
  
  return `${formatArea(minArea, '', false)} - ${formatArea(maxArea, unit)}`;
};

/**
 * Format property stats for display
 */
export const formatPropertyStats = (
  stats: {
    views?: number;
    favorites?: number;
    inquiries?: number;
    shares?: number;
  },
  format: 'full' | 'compact' = 'full'
): string[] => {
  const formatted: string[] = [];
  
  if (stats.views !== undefined && stats.views > 0) {
    const label = format === 'compact' ? 'views' : stats.views === 1 ? 'view' : 'views';
    formatted.push(`${stats.views.toLocaleString()} ${label}`);
  }
  
  if (stats.favorites !== undefined && stats.favorites > 0) {
    const label = format === 'compact' ? '♥' : stats.favorites === 1 ? 'favorite' : 'favorites';
    formatted.push(`${stats.favorites.toLocaleString()} ${label}`);
  }
  
  if (stats.inquiries !== undefined && stats.inquiries > 0) {
    const label = format === 'compact' ? 'inquiries' : stats.inquiries === 1 ? 'inquiry' : 'inquiries';
    formatted.push(`${stats.inquiries.toLocaleString()} ${label}`);
  }
  
  if (stats.shares !== undefined && stats.shares > 0) {
    const label = format === 'compact' ? 'shares' : stats.shares === 1 ? 'share' : 'shares';
    formatted.push(`${stats.shares.toLocaleString()} ${label}`);
  }
  
  return formatted;
};

/**
 * Format time ago from date string
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

/**
 * Format date in Indian format
 */
export const formatDate = (
  dateString: string,
  format: 'short' | 'long' | 'numeric' = 'short'
): string => {
  const date = new Date(dateString);
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    case 'long':
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    case 'numeric':
      return date.toLocaleDateString('en-IN');
    default:
      return date.toLocaleDateString('en-IN');
  }
};

/**
 * Format percentage with appropriate precision
 */
export const formatPercentage = (
  value: number,
  precision: number = 1,
  showSign: boolean = false
): string => {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(precision)}%`;
};

/**
 * Format property URL slug
 */
export const formatPropertySlug = (title: string, id: number): string => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
  
  return `${slug}-${id}`;
};

/**
 * Format search query for display
 */
export const formatSearchQuery = (
  query: string,
  maxLength: number = 50
): string => {
  if (!query) return '';
  
  const trimmed = query.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  
  return `${trimmed.substring(0, maxLength - 3)}...`;
};

/**
 * Format file size for image uploads
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Format validation error messages
 */
export const formatValidationError = (
  field: string,
  error: string
): string => {
  const fieldLabels: Record<string, string> = {
    title: 'Property Title',
    description: 'Description',
    price: 'Price',
    area: 'Area',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    address: 'Address',
    city: 'City',
    state: 'State',
    postal_code: 'Postal Code',
    property_type: 'Property Type',
    listing_type: 'Listing Type'
  };
  
  const fieldLabel = fieldLabels[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return `${fieldLabel}: ${error}`;
};