import { PropertyType, ListingType, PropertyImageType, AreaUnit } from '../types';

// Property type configurations with detailed information
export const PROPERTY_TYPE_CONFIG: Record<PropertyType, {
  label: string;
  description: string;
  icon: string;
  category: 'residential' | 'commercial' | 'land';
  features: string[];
  defaultAmenities: string[];
}> = {
  apartment: {
    label: 'Apartment',
    description: 'Multi-story residential building with individual units',
    icon: 'solar:buildings-bold',
    category: 'residential',
    features: ['Shared amenities', 'Security', 'Maintenance'],
    defaultAmenities: ['Elevator', 'Security', 'Parking', 'Power Backup']
  },
  house: {
    label: 'Independent House',
    description: 'Standalone residential property with private land',
    icon: 'solar:home-bold',
    category: 'residential',
    features: ['Private land', 'Independent entry', 'Customizable'],
    defaultAmenities: ['Parking', 'Garden', 'Security']
  },
  villa: {
    label: 'Villa',
    description: 'Luxury residential property with premium amenities',
    icon: 'solar:home-2-bold',
    category: 'residential',
    features: ['Luxury finishes', 'Premium location', 'Exclusive amenities'],
    defaultAmenities: ['Swimming Pool', 'Garden', 'Parking', 'Security', 'Club House']
  },
  plot: {
    label: 'Plot/Land',
    description: 'Vacant land for construction or investment',
    icon: 'solar:map-bold',
    category: 'land',
    features: ['Development potential', 'Investment opportunity', 'Flexible use'],
    defaultAmenities: ['Road access', 'Electricity connection']
  },
  commercial: {
    label: 'Commercial',
    description: 'Properties for business and commercial use',
    icon: 'solar:shop-bold',
    category: 'commercial',
    features: ['Business use', 'High footfall', 'Investment returns'],
    defaultAmenities: ['Parking', 'Security', 'Power Backup', 'Internet']
  },
  land: {
    label: 'Agricultural Land',
    description: 'Land suitable for agricultural purposes',
    icon: 'solar:leaf-bold',
    category: 'land',
    features: ['Agricultural use', 'Rural location', 'Natural resources'],
    defaultAmenities: ['Water source', 'Road access']
  }
};

// Listing type configurations
export const LISTING_TYPE_CONFIG: Record<ListingType, {
  label: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}> = {
  sale: {
    label: 'For Sale',
    description: 'Property available for purchase',
    icon: 'solar:tag-price-bold',
    color: 'blue',
    features: ['Ownership transfer', 'Investment opportunity', 'Long-term asset']
  },
  rent: {
    label: 'For Rent',
    description: 'Property available for rental',
    icon: 'solar:key-bold',
    color: 'green',
    features: ['Monthly rental', 'Flexible tenure', 'No ownership transfer']
  }
};

// Area unit configurations
export const AREA_UNIT_CONFIG: Record<AreaUnit, {
  label: string;
  shortLabel: string;
  description: string;
  conversionToSqft: number;
}> = {
  sqft: {
    label: 'Square Feet',
    shortLabel: 'sq ft',
    description: 'Standard unit for measuring area',
    conversionToSqft: 1
  },
  sqm: {
    label: 'Square Meters',
    shortLabel: 'sq m',
    description: 'Metric unit for measuring area',
    conversionToSqft: 10.764
  },
  acres: {
    label: 'Acres',
    shortLabel: 'acres',
    description: 'Large area measurement unit',
    conversionToSqft: 43560
  },
  marla: {
    label: 'Marla',
    shortLabel: 'marla',
    description: 'Traditional unit used in North India',
    conversionToSqft: 272.25
  },
  kanal: {
    label: 'Kanal',
    shortLabel: 'kanal',
    description: 'Traditional unit, equals 20 marlas',
    conversionToSqft: 5445
  }
};

// Property image type configurations
export const PROPERTY_IMAGE_TYPE_CONFIG: Record<PropertyImageType, {
  label: string;
  description: string;
  maxCount: number;
  required: boolean;
  displayOrder: number;
}> = {
  exterior: {
    label: 'Exterior Views',
    description: 'Outside views of the property',
    maxCount: 5,
    required: true,
    displayOrder: 1
  },
  interior: {
    label: 'Interior Views',
    description: 'Inside views of rooms and spaces',
    maxCount: 10,
    required: true,
    displayOrder: 2
  },
  amenity: {
    label: 'Amenities',
    description: 'Common areas and facilities',
    maxCount: 8,
    required: false,
    displayOrder: 3
  },
  floor_plan: {
    label: 'Floor Plans',
    description: 'Layout and floor plans',
    maxCount: 3,
    required: false,
    displayOrder: 4
  },
  gallery: {
    label: 'Gallery',
    description: 'Additional property images',
    maxCount: 15,
    required: false,
    displayOrder: 5
  },
  virtual_tour: {
    label: 'Virtual Tour',
    description: '360-degree or virtual tour images',
    maxCount: 1,
    required: false,
    displayOrder: 6
  }
};

// Property categories for filtering and organization
export const PROPERTY_CATEGORIES = {
  residential: {
    label: 'Residential',
    types: ['apartment', 'house', 'villa'] as PropertyType[],
    icon: 'solar:home-bold',
    description: 'Properties for living purposes'
  },
  commercial: {
    label: 'Commercial',
    types: ['commercial'] as PropertyType[],
    icon: 'solar:shop-bold',
    description: 'Properties for business purposes'
  },
  land: {
    label: 'Land & Plots',
    types: ['plot', 'land'] as PropertyType[],
    icon: 'solar:map-bold',
    description: 'Land and plots for development'
  }
};

// Property size categories
export const PROPERTY_SIZE_CATEGORIES = {
  compact: {
    label: 'Compact',
    range: { min: 0, max: 600 },
    description: 'Small and efficient spaces',
    suitableFor: ['Singles', 'Young couples']
  },
  medium: {
    label: 'Medium',
    range: { min: 600, max: 1200 },
    description: 'Comfortable family spaces',
    suitableFor: ['Small families', 'Couples']
  },
  large: {
    label: 'Large',
    range: { min: 1200, max: 2500 },
    description: 'Spacious family homes',
    suitableFor: ['Large families', 'Multi-generational']
  },
  luxury: {
    label: 'Luxury',
    range: { min: 2500, max: null },
    description: 'Premium luxury properties',
    suitableFor: ['Luxury living', 'Entertainment']
  }
};

// Property investment categories
export const INVESTMENT_CATEGORIES = {
  budget: {
    label: 'Budget Friendly',
    priceRange: { min: 0, max: 5000000 },
    description: 'Affordable properties for first-time buyers',
    roi: 'Medium',
    riskLevel: 'Low'
  },
  mid_range: {
    label: 'Mid Range',
    priceRange: { min: 5000000, max: 20000000 },
    description: 'Properties with good appreciation potential',
    roi: 'High',
    riskLevel: 'Medium'
  },
  premium: {
    label: 'Premium',
    priceRange: { min: 20000000, max: 50000000 },
    description: 'High-end properties in prime locations',
    roi: 'Medium',
    riskLevel: 'Medium'
  },
  luxury: {
    label: 'Luxury',
    priceRange: { min: 50000000, max: null },
    description: 'Ultra-luxury properties for elite buyers',
    roi: 'Low',
    riskLevel: 'High'
  }
};