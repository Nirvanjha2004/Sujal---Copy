import { 
  PropertyFormData, 
  CreatePropertyRequest
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
 * Validate property title - Must be between 5 and 255 characters
 */
export const validateTitle = (title: string): FieldValidationResult => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Title is required' };
  }
  
  const trimmedTitle = title.trim();
  if (trimmedTitle.length < 5) {
    return { isValid: false, error: 'Title must be at least 5 characters long' };
  }
  
  if (trimmedTitle.length > 255) {
    return { isValid: false, error: 'Title must be no more than 255 characters long' };
  }
  
  return { isValid: true };
};

/**
 * Validate property description - Optional, but if provided must be reasonable length
 */
export const validateDescription = (description: string): FieldValidationResult => {
  if (!description || description.trim().length === 0) {
    return { isValid: true }; // Description is optional
  }
  
  const trimmedDescription = description.trim();
  if (trimmedDescription.length > 2000) {
    return { isValid: false, error: 'Description must be no more than 2000 characters long' };
  }
  
  return { isValid: true };
};

/**
 * Validate property type - Must be one of the valid property types
 */
export const validatePropertyType = (propertyType: string): FieldValidationResult => {
  if (!propertyType || propertyType.trim().length === 0) {
    return { isValid: false, error: 'Property type is required' };
  }
  
  const validTypes = ['apartment', 'house', 'villa', 'plot', 'commercial', 'land'];
  if (!validTypes.includes(propertyType.toLowerCase())) {
    return { isValid: false, error: 'Please select a valid property type' };
  }
  
  return { isValid: true };
};

/**
 * Validate listing type - Must be 'sale' or 'rent'
 */
export const validateListingType = (listingType: string): FieldValidationResult => {
  if (!listingType || listingType.trim().length === 0) {
    return { isValid: false, error: 'Listing type is required' };
  }
  
  const validTypes = ['sale', 'rent'];
  if (!validTypes.includes(listingType.toLowerCase())) {
    return { isValid: false, error: 'Please select either Sale or Rent' };
  }
  
  return { isValid: true };
};

/**
 * Validate property status - Must be one of the valid status values
 */
export const validatePropertyStatus = (status: string): FieldValidationResult => {
  if (!status || status.trim().length === 0) {
    return { isValid: false, error: 'Property status is required' };
  }
  
  const validStatuses = ['new', 'resale', 'under_construction'];
  if (!validStatuses.includes(status.toLowerCase())) {
    return { isValid: false, error: 'Please select a valid property status' };
  }
  
  return { isValid: true };
};

/**
 * Validate property price - Must be a positive number
 */
export const validatePrice = (price: string | number): FieldValidationResult => {
  if (!price || price.toString().trim().length === 0) {
    return { isValid: false, error: 'Price is required' };
  }
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return { isValid: false, error: 'Price must be a valid number' };
  }
  
  if (numericPrice <= 0) {
    return { isValid: false, error: 'Price must be greater than 0' };
  }
  
  if (numericPrice > 999999999999999) {
    return { isValid: false, error: 'Price is too large' };
  }
  
  return { isValid: true };
};

/**
 * Validate property area - Must be a positive number
 */
export const validateArea = (area: string | number): FieldValidationResult => {
  if (!area || area.toString().trim().length === 0) {
    return { isValid: false, error: 'Area is required' };
  }
  
  const numericArea = typeof area === 'string' ? parseFloat(area) : area;
  
  if (isNaN(numericArea)) {
    return { isValid: false, error: 'Area must be a valid number' };
  }
  
  if (numericArea <= 0) {
    return { isValid: false, error: 'Area must be greater than 0' };
  }
  
  if (numericArea > 100000) {
    return { isValid: false, error: 'Area cannot exceed 100,000 sq ft' };
  }
  
  return { isValid: true };
};

/**
 * Validate bedrooms count - Must be between 0 and 20
 */
export const validateBedrooms = (bedrooms: string | number): FieldValidationResult => {
  if (bedrooms === '' || bedrooms === null || bedrooms === undefined) {
    return { isValid: true }; // Bedrooms is optional
  }
  
  const numericBedrooms = typeof bedrooms === 'string' ? parseInt(bedrooms) : bedrooms;
  
  if (isNaN(numericBedrooms)) {
    return { isValid: false, error: 'Bedrooms must be a valid number' };
  }
  
  if (numericBedrooms < 0) {
    return { isValid: false, error: 'Bedrooms cannot be negative' };
  }
  
  if (numericBedrooms > 20) {
    return { isValid: false, error: 'Bedrooms cannot exceed 20' };
  }
  
  return { isValid: true };
};

/**
 * Validate bathrooms count - Must be between 0 and 20
 */
export const validateBathrooms = (bathrooms: string | number): FieldValidationResult => {
  if (bathrooms === '' || bathrooms === null || bathrooms === undefined) {
    return { isValid: true }; // Bathrooms is optional
  }
  
  const numericBathrooms = typeof bathrooms === 'string' ? parseInt(bathrooms) : bathrooms;
  
  if (isNaN(numericBathrooms)) {
    return { isValid: false, error: 'Bathrooms must be a valid number' };
  }
  
  if (numericBathrooms < 0) {
    return { isValid: false, error: 'Bathrooms cannot be negative' };
  }
  
  if (numericBathrooms > 20) {
    return { isValid: false, error: 'Bathrooms cannot exceed 20' };
  }
  
  return { isValid: true };
};

/**
 * Validate address - Must be between 10 and 500 characters
 */
export const validateAddress = (address: string): FieldValidationResult => {
  if (!address || address.trim().length === 0) {
    return { isValid: false, error: 'Address is required' };
  }
  
  const trimmedAddress = address.trim();
  if (trimmedAddress.length < 10) {
    return { isValid: false, error: 'Address must be at least 10 characters long' };
  }
  
  if (trimmedAddress.length > 500) {
    return { isValid: false, error: 'Address must be no more than 500 characters long' };
  }
  
  return { isValid: true };
};

/**
 * Validate city - Must be between 2 and 100 characters
 */
export const validateCity = (city: string): FieldValidationResult => {
  if (!city || city.trim().length === 0) {
    return { isValid: false, error: 'City is required' };
  }
  
  const trimmedCity = city.trim();
  if (trimmedCity.length < 2) {
    return { isValid: false, error: 'City must be at least 2 characters long' };
  }
  
  if (trimmedCity.length > 100) {
    return { isValid: false, error: 'City must be no more than 100 characters long' };
  }
  
  return { isValid: true };
};

/**
 * Validate state - Must be between 2 and 100 characters
 */
export const validateState = (state: string): FieldValidationResult => {
  if (!state || state.trim().length === 0) {
    return { isValid: false, error: 'State is required' };
  }
  
  const trimmedState = state.trim();
  if (trimmedState.length < 2) {
    return { isValid: false, error: 'State must be at least 2 characters long' };
  }
  
  if (trimmedState.length > 100) {
    return { isValid: false, error: 'State must be no more than 100 characters long' };
  }
  
  return { isValid: true };
};

/**
 * Validate postal code - Optional, but if provided must be valid format
 */
export const validatePostalCode = (postalCode: string): FieldValidationResult => {
  if (!postalCode || postalCode.trim().length === 0) {
    return { isValid: true }; // Postal code is optional
  }
  
  const trimmedCode = postalCode.trim();
  if (trimmedCode.length > 20) {
    return { isValid: false, error: 'Postal code must be no more than 20 characters long' };
  }
  
  // Basic format validation for common postal code patterns
  const postalCodePattern = /^[A-Za-z0-9\s\-]{3,20}$/;
  if (!postalCodePattern.test(trimmedCode)) {
    return { isValid: false, error: 'Please enter a valid postal code' };
  }
  
  return { isValid: true };
};

/**
 * Validate amenities - Optional field, always valid
 */
export const validateAmenities = (_amenities: string[]): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate property images - Optional field, always valid
 */
export const validatePropertyImages = (_images: File[]): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate single image file - Optional field, always valid
 */
export const validateImageFile = (_file: File): FieldValidationResult => {
  return { isValid: true };
};

/**
 * Validate coordinates - Optional, but if provided must be valid lat/lng
 */
export const validateCoordinates = (
  latitude?: string | number, 
  longitude?: string | number
): FieldValidationResult => {
  if (!latitude && !longitude) {
    return { isValid: true }; // Coordinates are optional
  }
  
  if (latitude && !longitude) {
    return { isValid: false, error: 'Longitude is required when latitude is provided' };
  }
  
  if (!latitude && longitude) {
    return { isValid: false, error: 'Latitude is required when longitude is provided' };
  }
  
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude!;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude!;
  
  if (isNaN(lat) || isNaN(lng)) {
    return { isValid: false, error: 'Coordinates must be valid numbers' };
  }
  
  if (lat < -90 || lat > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  if (lng < -180 || lng > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  return { isValid: true };
};

/**
 * Validate complete property form data - Comprehensive validation
 */
export const validatePropertyForm = (formData: PropertyFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  
  // Validate all fields
  const titleResult = validateTitle(formData.title);
  if (!titleResult.isValid && titleResult.error) {
    errors.title = titleResult.error;
  }
  
  const descriptionResult = validateDescription(formData.description);
  if (!descriptionResult.isValid && descriptionResult.error) {
    errors.description = descriptionResult.error;
  }
  
  const propertyTypeResult = validatePropertyType(formData.property_type);
  if (!propertyTypeResult.isValid && propertyTypeResult.error) {
    errors.property_type = propertyTypeResult.error;
  }
  
  const listingTypeResult = validateListingType(formData.listing_type);
  if (!listingTypeResult.isValid && listingTypeResult.error) {
    errors.listing_type = listingTypeResult.error;
  }
  
  const statusResult = validatePropertyStatus(formData.status);
  if (!statusResult.isValid && statusResult.error) {
    errors.status = statusResult.error;
  }
  
  const priceResult = validatePrice(formData.price);
  if (!priceResult.isValid && priceResult.error) {
    errors.price = priceResult.error;
  }
  
  const areaResult = validateArea(formData.area);
  if (!areaResult.isValid && areaResult.error) {
    errors.area = areaResult.error;
  }
  
  const bedroomsResult = validateBedrooms(formData.bedrooms);
  if (!bedroomsResult.isValid && bedroomsResult.error) {
    errors.bedrooms = bedroomsResult.error;
  }
  
  const bathroomsResult = validateBathrooms(formData.bathrooms);
  if (!bathroomsResult.isValid && bathroomsResult.error) {
    errors.bathrooms = bathroomsResult.error;
  }
  
  const addressResult = validateAddress(formData.address);
  if (!addressResult.isValid && addressResult.error) {
    errors.address = addressResult.error;
  }
  
  const cityResult = validateCity(formData.city);
  if (!cityResult.isValid && cityResult.error) {
    errors.city = cityResult.error;
  }
  
  const stateResult = validateState(formData.state);
  if (!stateResult.isValid && stateResult.error) {
    errors.state = stateResult.error;
  }
  
  const postalCodeResult = validatePostalCode(formData.postal_code);
  if (!postalCodeResult.isValid && postalCodeResult.error) {
    errors.postal_code = postalCodeResult.error;
  }
  
  const coordinatesResult = validateCoordinates(formData.latitude, formData.longitude);
  if (!coordinatesResult.isValid && coordinatesResult.error) {
    errors.coordinates = coordinatesResult.error;
  }
  
  // Add warnings for missing optional but recommended fields
  if (!formData.description || formData.description.trim().length === 0) {
    warnings.description = 'Adding a description will help attract more buyers';
  }
  
  if (!formData.bedrooms || formData.bedrooms.toString().trim().length === 0) {
    warnings.bedrooms = 'Specifying bedrooms helps buyers find your property';
  }
  
  if (!formData.bathrooms || formData.bathrooms.toString().trim().length === 0) {
    warnings.bathrooms = 'Specifying bathrooms helps buyers find your property';
  }
  
  if (!formData.images || formData.images.length === 0) {
    warnings.images = 'Adding photos will significantly increase interest in your property';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

/**
 * Validate create property request - Uses form validation logic
 */
export const validateCreatePropertyRequest = (request: CreatePropertyRequest): ValidationResult => {
  // Convert CreatePropertyRequest to PropertyFormData format for validation
  const formData: PropertyFormData = {
    title: request.title,
    description: request.description || '',
    property_type: request.property_type,
    listing_type: request.listing_type,
    status: 'active',
    price: request.price.toString(),
    area: request.area_sqft?.toString() || '',
    bedrooms: request.bedrooms?.toString() || '',
    bathrooms: request.bathrooms?.toString() || '',
    address: request.address,
    city: request.city,
    state: request.state,
    postal_code: request.postal_code || '',
    amenities: Object.keys(request.amenities || {}).filter(key => request.amenities?.[key]),
    images: [],
    latitude: undefined,
    longitude: undefined,
    specifications: {}
  };
  
  return validatePropertyForm(formData);
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
 * Check if property data has required fields for listing
 */
export const hasRequiredFieldsForListing = (formData: PropertyFormData): boolean => {
  const validation = validatePropertyForm(formData);
  return validation.isValid;
};

/**
 * Get validation progress percentage based on completed required fields
 */
export const getValidationProgress = (formData: PropertyFormData): number => {
  const requiredFields = [
    'title', 'property_type', 'listing_type', 'status', 'price', 'area', 'address', 'city', 'state'
  ];
  
  let completedFields = 0;
  
  requiredFields.forEach(field => {
    const value = (formData as any)[field];
    if (value && value.toString().trim().length > 0) {
      // Validate the field to ensure it's not just filled but also valid
      let isValid = false;
      switch (field) {
        case 'title':
          isValid = validateTitle(value).isValid;
          break;
        case 'property_type':
          isValid = validatePropertyType(value).isValid;
          break;
        case 'listing_type':
          isValid = validateListingType(value).isValid;
          break;
        case 'status':
          isValid = validatePropertyStatus(value).isValid;
          break;
        case 'price':
          isValid = validatePrice(value).isValid;
          break;
        case 'area':
          isValid = validateArea(value).isValid;
          break;
        case 'address':
          isValid = validateAddress(value).isValid;
          break;
        case 'city':
          isValid = validateCity(value).isValid;
          break;
        case 'state':
          isValid = validateState(value).isValid;
          break;
        default:
          isValid = true;
      }
      
      if (isValid) {
        completedFields++;
      }
    }
  });
  
  return Math.round((completedFields / requiredFields.length) * 100);
};