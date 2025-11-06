// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// User Roles
export const USER_ROLES = {
  BUYER: 'buyer',
  OWNER: 'owner',
  AGENT: 'agent',
  BUILDER: 'builder',
  ADMIN: 'admin',
} as const;

// Property Types
export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  VILLA: 'villa',
  PLOT: 'plot',
  COMMERCIAL: 'commercial',
} as const;

// Listing Types
export const LISTING_TYPES = {
  SALE: 'sale',
  RENT: 'rent',
} as const;

// Visit Status
export const VISIT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

// Project Status
export const PROJECT_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
} as const;

// Unit Status
export const UNIT_STATUS = {
  AVAILABLE: 'available',
  SOLD: 'sold',
  RESERVED: 'reserved',
  BLOCKED: 'blocked',
} as const;

// Common Amenities
export const COMMON_AMENITIES = [
  'Parking',
  'Gym',
  'Swimming Pool',
  'Security',
  'Elevator',
  'Power Backup',
  'Garden',
  'Playground',
  'Club House',
  'Maintenance Staff',
  'Water Supply',
  'Internet',
  'Air Conditioning',
  'Balcony',
  'Furnished',
] as const;

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILES: 10,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROPERTIES: '/properties',
  ADD_PROPERTY: '/add-property',
  MY_PROPERTIES: '/my-properties',
  FAVORITES: '/favorites',
  SEARCH: '/search',
  ADMIN: '/admin',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  BUILDER: {
    PROJECTS: '/builder/projects',
    NEW_PROJECT: '/builder/new-project',
    PROJECT_DETAILS: (id: string) => `/builder/projects/${id}`,
    PROJECT_UNITS: (id: string) => `/builder/projects/${id}/units`,
  },
  AGENT: {
    DASHBOARD: '/agent-dashboard',
    BULK_UPLOAD: '/agent/bulk-upload',
    LEADS: '/leads',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language',
  SEARCH_HISTORY: 'searchHistory',
  FAVORITES: 'favorites',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PROPERTY_CREATED: 'Property created successfully!',
  PROPERTY_UPDATED: 'Property updated successfully!',
  PROPERTY_DELETED: 'Property deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  VISIT_SCHEDULED: 'Visit scheduled successfully!',
  VISIT_APPROVED: 'Visit approved successfully!',
  VISIT_REJECTED: 'Visit rejected successfully!',
} as const;