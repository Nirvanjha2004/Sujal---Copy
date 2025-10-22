import { 
  PropertyFormData, 
  CreatePropertyRequest,
  PropertyType,
  ListingType,
  PropertyStatus
} from '../types';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

// Field validation result
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Validate property title - No validation, always passes
 */
export const validateTitle = (title: string): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate property description - No validation, always passes
 */
export const validateDescription = (description: string): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate property type - No validation, always passes
 */
export const validatePropertyType = (propertyType: string): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate listing type - No validation, always passes
 */
export const validateListingType = (listingType: string): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate property status - No validation, always passes
 */
export const validatePropertyStatus = (status: string): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate property price - No validation, always passes
 */
export const validatePrice = (price: string | number): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate property area - No validation, always passes
 */
export const validateArea = (area: string | number): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate bedrooms count - No validation, always passes
 */
export const validateBedrooms = (bedrooms: string | number): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate bathrooms count - No validation, always passes
 */
export const validateBathrooms = (bathrooms: string | number): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate address - No validation, always passes
 */
export const validateAddress = (address: string): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate city - No validation, always passes
 */
export const validateCity = (city: string): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate state - No validation, always passes
 */
export const validateState = (state: string): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate postal code - No validation, always passes
 */
export const validatePostalCode = (postalCode: string): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate amenities - No validation, always passes
 */
export const validateAmenities = (amenities: string[]): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate property images - No validation, always passes
 */
export const validatePropertyImages = (images: File[]): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate single image file - No validation, always passes
 */
export const validateImageFile = (file: File): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate coordinates - No validation, always passes
 */
export const validateCoordinates = (
  latitude?: string | number, 
  longitude?: string | number
): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate complete property form data - No validation, always passes
 */
export const validatePropertyForm = (formData: PropertyFormData): ValidationResult => {
  return {
    isValid: true,
    errors: {},
    warnings: {}
  };
};

/**
 * Validate create property request - No validation, always passes
 */
export const validateCreatePropertyRequest = (request: CreatePropertyRequest): ValidationResult => {
  return {
    isValid: true,
    errors: {}
  };
};

/**
 * Sanitize property form data - Basic sanitization only
 */
export const sanitizePropertyFormData = (formData: PropertyFormData): PropertyFormData => {
  return {
    title: formData.title?.trim() || '',
    description: formData.description?.trim() || '',
    property_type: formData.property_type?.trim() || '',
    listing_type: formData.listing_type?.trim() || '',
    status: formData.status?.trim() || '',
    price: formData.price?.toString() || '0',
    area: formData.area?.toString() || '0',
    bedrooms: formData.bedrooms?.toString() || '0',
    bathrooms: formData.bathrooms?.toString() || '0',
    address: formData.address?.trim() || '',
    city: formData.city?.trim() || '',
    state: formData.state?.trim() || '',
    postal_code: formData.postal_code?.toString() || '',
    amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
    images: Array.isArray(formData.images) ? formData.images : [],
    latitude: formData.latitude?.toString() || undefined,
    longitude: formData.longitude?.toString() || undefined,
    specifications: formData.specifications || {}
  };
};

/**
 * Check if property data has required fields for listing - Always returns true
 */
export const hasRequiredFieldsForListing = (formData: PropertyFormData): boolean => {
  return true;
};

/**
 * Get validation progress percentage - Always returns 100%
 */
export const getValidationProgress = (formData: PropertyFormData): number => {
  return 100;
};