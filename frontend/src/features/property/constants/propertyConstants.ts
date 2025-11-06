import { PropertyType, ListingType, PropertyStatus } from '../types';

// Property type options
export const PROPERTY_TYPES: Array<{ value: PropertyType; label: string }> = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot', label: 'Plot' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' }
];

// Listing type options
export const LISTING_TYPES: Array<{ value: ListingType; label: string }> = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' }
];

// Property status options
export const PROPERTY_STATUSES: Array<{ value: PropertyStatus; label: string }> = [
  { value: 'new', label: 'New Launch' },
  { value: 'resale', label: 'Resale' },
  { value: 'under_construction', label: 'Under Construction' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'sold', label: 'Sold' },
  { value: 'rented', label: 'Rented' }
];

// Bedroom options
export const BEDROOM_OPTIONS = [
  { value: '1', label: '1 Bedroom' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4', label: '4 Bedrooms' },
  { value: '5', label: '5+ Bedrooms' }
];

// Bathroom options
export const BATHROOM_OPTIONS = [
  { value: '1', label: '1 Bathroom' },
  { value: '2', label: '2 Bathrooms' },
  { value: '3', label: '3 Bathrooms' },
  { value: '4', label: '4+ Bathrooms' }
];

// Amenities list
export const AMENITIES_LIST = [
  'Swimming Pool',
  'Gym',
  'Parking',
  'Security',
  'Garden',
  'Balcony',
  'Air Conditioning',
  'Elevator',
  'Power Backup',
  'Water Supply',
  'Internet',
  'Club House',
  'Children Play Area',
  'Jogging Track',
  'Tennis Court',
  'Basketball Court',
  'Spa',
  'Sauna',
  'Jacuzzi',
  'Conference Room',
  'Library',
  'Cafeteria',
  'Shopping Center',
  'Hospital Nearby',
  'School Nearby',
  'Metro Station',
  'Bus Stop'
];

// Amenity mapping for backend compatibility
export const AMENITY_MAPPING: Record<string, string> = {
  'Swimming Pool': 'swimming_pool',
  'Gym': 'gym',
  'Parking': 'parking',
  'Security': 'security',
  'Garden': 'garden',
  'Balcony': 'balcony',
  'Air Conditioning': 'air_conditioning',
  'Elevator': 'elevator',
  'Power Backup': 'power_backup',
  'Water Supply': 'water_supply',
  'Internet': 'internet',
  'Club House': 'club_house',
  'Children Play Area': 'playground',
  'Jogging Track': 'jogging_track',
  'Tennis Court': 'tennis_court',
  'Basketball Court': 'basketball_court',
  'Spa': 'spa',
  'Sauna': 'sauna',
  'Jacuzzi': 'jacuzzi',
  'Conference Room': 'conference_room',
  'Library': 'library',
  'Cafeteria': 'cafeteria',
  'Shopping Center': 'shopping_center',
  'Hospital Nearby': 'hospital_nearby',
  'School Nearby': 'school_nearby',
  'Metro Station': 'metro_station',
  'Bus Stop': 'bus_stop'
};

// Price ranges for filters
export const PRICE_RANGES = [
  { min: 0, max: 2500000, label: 'Under ₹25 Lakh' },
  { min: 2500000, max: 5000000, label: '₹25 Lakh - ₹50 Lakh' },
  { min: 5000000, max: 10000000, label: '₹50 Lakh - ₹1 Crore' },
  { min: 10000000, max: 20000000, label: '₹1 Crore - ₹2 Crore' },
  { min: 20000000, max: 50000000, label: '₹2 Crore - ₹5 Crore' },
  { min: 50000000, max: null, label: 'Above ₹5 Crore' }
];

// Area ranges for filters
export const AREA_RANGES = [
  { min: 0, max: 500, label: 'Under 500 sq ft' },
  { min: 500, max: 1000, label: '500 - 1000 sq ft' },
  { min: 1000, max: 1500, label: '1000 - 1500 sq ft' },
  { min: 1500, max: 2000, label: '1500 - 2000 sq ft' },
  { min: 2000, max: 3000, label: '2000 - 3000 sq ft' },
  { min: 3000, max: null, label: 'Above 3000 sq ft' }
];

// Sort options
export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'date_new', label: 'Newest First' },
  { value: 'date_old', label: 'Oldest First' },
  { value: 'area_large', label: 'Area: Large to Small' },
  { value: 'area_small', label: 'Area: Small to Large' }
];

// Quick filters
export const QUICK_FILTERS = [
  { key: 'new_launch', label: 'New Launch', filter: { status: 'new' } },
  { key: 'under_construction', label: 'Under Construction', filter: { status: 'under_construction' } },
  { key: 'ready_to_move', label: 'Ready to Move', filter: { status: 'resale' } }
];

// Validation rules
export const VALIDATION_RULES = {
  title: {
    minLength: 10,
    maxLength: 100,
    required: true
  },
  description: {
    minLength: 50,
    maxLength: 1000,
    required: true
  },
  price: {
    min: 100000,
    max: 1000000000,
    required: true
  },
  area: {
    min: 100,
    max: 50000,
    required: true
  },
  images: {
    maxCount: 20,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    required: true
  },
  bedrooms: {
    min: 0,
    max: 10,
    required: false
  },
  bathrooms: {
    min: 0,
    max: 10,
    required: false
  }
};

// Default values
export const DEFAULT_VALUES = {
  pagination: {
    page: 1,
    limit: 12,
    maxLimit: 50
  },
  search: {
    debounceMs: 300,
    minQueryLength: 2,
    maxSuggestions: 10
  },
  images: {
    thumbnailSize: { width: 300, height: 200 },
    previewSize: { width: 800, height: 600 },
    compressionQuality: 0.8
  },
  map: {
    defaultZoom: 12,
    clusterDistance: 50,
    maxZoom: 18,
    minZoom: 8
  }
};

// Feature flags
export const FEATURE_FLAGS = {
  enableVirtualTour: true,
  enablePropertyComparison: true,
  enableSavedSearches: true,
  enablePropertyAlerts: true,
  enableSocialSharing: true,
  enablePropertyReports: false,
  enableBulkOperations: false
};

// Property card display options
export const PROPERTY_CARD_VARIANTS = {
  grid: {
    imageHeight: 200,
    showDescription: false,
    showStats: true,
    showAgent: false
  },
  list: {
    imageHeight: 150,
    showDescription: true,
    showStats: true,
    showAgent: true
  },
  compact: {
    imageHeight: 100,
    showDescription: false,
    showStats: false,
    showAgent: false
  },
  featured: {
    imageHeight: 250,
    showDescription: true,
    showStats: true,
    showAgent: true
  }
};

// API endpoints
export const API_ENDPOINTS = {
  properties: '/properties',
  search: '/properties/search',
  suggestions: '/properties/suggestions',
  favorites: '/properties/favorites',
  similar: (id: number) => `/properties/${id}/similar`,
  analytics: (id: number) => `/properties/${id}/analytics`,
  images: (id: number) => `/properties/${id}/images`
};