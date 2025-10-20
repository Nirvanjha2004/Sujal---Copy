import { 
  PropertyFormData, 
  CreatePropertyRequest,
  PropertyType,
  ListingType,
  PropertyStatus
} from '../types';
import { VALIDATION_RULES, PROPERTY_TYPES, LISTING_TYPES, PROPERTY_STATUSES } from '../constants';

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
 * Validate property title
 */
export const validateTitle = (title: string): FieldValidationResult => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Title is required' };
  }
  
  const trimmedTitle = title.trim();
  
  if (trimmedTitle.length < VALIDATION_RULES.title.minLength) {
    return { 
      isValid: false, 
      error: `Title must be at least ${VALIDATION_RULES.title.minLength} characters long` 
    };
  }
  
  if (trimmedTitle.length > VALIDATION_RULES.title.maxLength) {
    return { 
      isValid: false, 
      error: `Title must not exceed ${VALIDATION_RULES.title.maxLength} characters` 
    };
  }
  
  // Check for inappropriate content (basic check)
  const inappropriateWords = ['spam', 'fake', 'scam'];
  const hasInappropriateContent = inappropriateWords.some(word => 
    trimmedTitle.toLowerCase().includes(word)
  );
  
  if (hasInappropriateContent) {
    return { isValid: false, error: 'Title contains inappropriate content' };
  }
  
  return { isValid: true };
};

/**
 * Validate property description
 */
export const validateDescription = (description: string): FieldValidationResult => {
  if (!description || description.trim().length === 0) {
    return { isValid: false, error: 'Description is required' };
  }
  
  const trimmedDescription = description.trim();
  
  if (trimmedDescription.length < VALIDATION_RULES.description.minLength) {
    return { 
      isValid: false, 
      error: `Description must be at least ${VALIDATION_RULES.description.minLength} characters long` 
    };
  }
  
  if (trimmedDescription.length > VALIDATION_RULES.description.maxLength) {
    return { 
      isValid: false, 
      error: `Description must not exceed ${VALIDATION_RULES.description.maxLength} characters` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate property type
 */
export const validatePropertyType = (propertyType: string): FieldValidationResult => {
  if (!propertyType) {
    return { isValid: false, error: 'Property type is required' };
  }
  
  const validTypes = PROPERTY_TYPES.map(type => type.value);
  if (!validTypes.includes(propertyType as PropertyType)) {
    return { isValid: false, error: 'Invalid property type selected' };
  }
  
  return { isValid: true };
};

/**
 * Validate listing type
 */
export const validateListingType = (listingType: string): FieldValidationResult => {
  if (!listingType) {
    return { isValid: false, error: 'Listing type is required' };
  }
  
  const validTypes = LISTING_TYPES.map(type => type.value);
  if (!validTypes.includes(listingType as ListingType)) {
    return { isValid: false, error: 'Invalid listing type selected' };
  }
  
  return { isValid: true };
};

/**
 * Validate property status
 */
export const validatePropertyStatus = (status: string): FieldValidationResult => {
  if (!status) {
    return { isValid: false, error: 'Property status is required' };
  }
  
  const validStatuses = PROPERTY_STATUSES.map(status => status.value);
  if (!validStatuses.includes(status as PropertyStatus)) {
    return { isValid: false, error: 'Invalid property status selected' };
  }
  
  return { isValid: true };
};

/**
 * Validate property price
 */
export const validatePrice = (price: string | number): FieldValidationResult => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice) || numPrice <= 0) {
    return { isValid: false, error: 'Price must be a valid positive number' };
  }
  
  if (numPrice < VALIDATION_RULES.price.min) {
    return { 
      isValid: false, 
      error: `Price must be at least ₹${VALIDATION_RULES.price.min.toLocaleString()}` 
    };
  }
  
  if (numPrice > VALIDATION_RULES.price.max) {
    return { 
      isValid: false, 
      error: `Price must not exceed ₹${VALIDATION_RULES.price.max.toLocaleString()}` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate property area
 */
export const validateArea = (area: string | number): FieldValidationResult => {
  const numArea = typeof area === 'string' ? parseFloat(area) : area;
  
  if (isNaN(numArea) || numArea <= 0) {
    return { isValid: false, error: 'Area must be a valid positive number' };
  }
  
  if (numArea < VALIDATION_RULES.area.min) {
    return { 
      isValid: false, 
      error: `Area must be at least ${VALIDATION_RULES.area.min} sq ft` 
    };
  }
  
  if (numArea > VALIDATION_RULES.area.max) {
    return { 
      isValid: false, 
      error: `Area must not exceed ${VALIDATION_RULES.area.max} sq ft` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate bedrooms count
 */
export const validateBedrooms = (bedrooms: string | number): FieldValidationResult => {
  const numBedrooms = typeof bedrooms === 'string' ? parseInt(bedrooms) : bedrooms;
  
  if (isNaN(numBedrooms) || numBedrooms < 0) {
    return { isValid: false, error: 'Bedrooms must be a valid non-negative number' };
  }
  
  if (numBedrooms < VALIDATION_RULES.bedrooms.min) {
    return { 
      isValid: false, 
      error: `Bedrooms must be at least ${VALIDATION_RULES.bedrooms.min}` 
    };
  }
  
  if (numBedrooms > VALIDATION_RULES.bedrooms.max) {
    return { 
      isValid: false, 
      error: `Bedrooms must not exceed ${VALIDATION_RULES.bedrooms.max}` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate bathrooms count
 */
export const validateBathrooms = (bathrooms: string | number): FieldValidationResult => {
  const numBathrooms = typeof bathrooms === 'string' ? parseInt(bathrooms) : bathrooms;
  
  if (isNaN(numBathrooms) || numBathrooms < 0) {
    return { isValid: false, error: 'Bathrooms must be a valid non-negative number' };
  }
  
  if (numBathrooms < VALIDATION_RULES.bathrooms.min) {
    return { 
      isValid: false, 
      error: `Bathrooms must be at least ${VALIDATION_RULES.bathrooms.min}` 
    };
  }
  
  if (numBathrooms > VALIDATION_RULES.bathrooms.max) {
    return { 
      isValid: false, 
      error: `Bathrooms must not exceed ${VALIDATION_RULES.bathrooms.max}` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate address
 */
export const validateAddress = (address: string): FieldValidationResult => {
  if (!address || address.trim().length === 0) {
    return { isValid: false, error: 'Address is required' };
  }
  
  const trimmedAddress = address.trim();
  
  if (trimmedAddress.length < 10) {
    return { isValid: false, error: 'Address must be at least 10 characters long' };
  }
  
  if (trimmedAddress.length > 200) {
    return { isValid: false, error: 'Address must not exceed 200 characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate city
 */
export const validateCity = (city: string): FieldValidationResult => {
  if (!city || city.trim().length === 0) {
    return { isValid: false, error: 'City is required' };
  }
  
  const trimmedCity = city.trim();
  
  if (trimmedCity.length < 2) {
    return { isValid: false, error: 'City name must be at least 2 characters long' };
  }
  
  if (trimmedCity.length > 50) {
    return { isValid: false, error: 'City name must not exceed 50 characters' };
  }
  
  // Check if city contains only letters, spaces, and common punctuation
  const cityRegex = /^[a-zA-Z\s\-'.]+$/;
  if (!cityRegex.test(trimmedCity)) {
    return { isValid: false, error: 'City name contains invalid characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate state
 */
export const validateState = (state: string): FieldValidationResult => {
  if (!state || state.trim().length === 0) {
    return { isValid: false, error: 'State is required' };
  }
  
  const trimmedState = state.trim();
  
  if (trimmedState.length < 2) {
    return { isValid: false, error: 'State name must be at least 2 characters long' };
  }
  
  if (trimmedState.length > 50) {
    return { isValid: false, error: 'State name must not exceed 50 characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate postal code
 */
export const validatePostalCode = (postalCode: string): FieldValidationResult => {
  if (!postalCode || postalCode.trim().length === 0) {
    return { isValid: true }; // Postal code is optional
  }
  
  const trimmedCode = postalCode.trim();
  
  // Indian postal code format: 6 digits
  const postalCodeRegex = /^\d{6}$/;
  if (!postalCodeRegex.test(trimmedCode)) {
    return { isValid: false, error: 'Postal code must be 6 digits' };
  }
  
  return { isValid: true };
};

/**
 * Validate amenities
 */
export const validateAmenities = (amenities: string[]): FieldValidationResult => {
  if (!amenities || !Array.isArray(amenities)) {
    return { isValid: true }; // Amenities are optional
  }
  
  if (amenities.length > 20) {
    return { isValid: false, error: 'Maximum 20 amenities can be selected' };
  }
  
  // Check for duplicate amenities
  const uniqueAmenities = new Set(amenities);
  if (uniqueAmenities.size !== amenities.length) {
    return { isValid: false, error: 'Duplicate amenities are not allowed' };
  }
  
  return { isValid: true };
};

/**
 * Validate property images
 */
export const validatePropertyImages = (images: File[]): FieldValidationResult => {
  if (!images || images.length === 0) {
    return { isValid: false, error: 'At least one property image is required' };
  }
  
  if (images.length > VALIDATION_RULES.images.maxCount) {
    return { 
      isValid: false, 
      error: `Maximum ${VALIDATION_RULES.images.maxCount} images are allowed` 
    };
  }
  
  // Validate each image
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    
    // Check file size
    if (image.size > VALIDATION_RULES.images.maxSize) {
      const maxSizeMB = VALIDATION_RULES.images.maxSize / (1024 * 1024);
      return { 
        isValid: false, 
        error: `Image ${i + 1} exceeds maximum size of ${maxSizeMB}MB` 
      };
    }
    
    // Check file type
    if (!VALIDATION_RULES.images.allowedTypes.includes(image.type)) {
      return { 
        isValid: false, 
        error: `Image ${i + 1} has invalid file type. Allowed types: JPG, PNG, WebP` 
      };
    }
  }
  
  return { isValid: true };
};

/**
 * Validate single image file
 */
export const validateImageFile = (file: File): FieldValidationResult => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  // Check file size
  if (file.size > VALIDATION_RULES.images.maxSize) {
    const maxSizeMB = VALIDATION_RULES.images.maxSize / (1024 * 1024);
    return { 
      isValid: false, 
      error: `File size exceeds maximum limit of ${maxSizeMB}MB` 
    };
  }
  
  // Check file type
  if (!VALIDATION_RULES.images.allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Invalid file type. Allowed types: JPG, PNG, WebP' 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate coordinates (latitude, longitude)
 */
export const validateCoordinates = (
  latitude?: string | number, 
  longitude?: string | number
): FieldValidationResult => {
  if (!latitude && !longitude) {
    return { isValid: true }; // Coordinates are optional
  }
  
  if (!latitude || !longitude) {
    return { isValid: false, error: 'Both latitude and longitude are required' };
  }
  
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
  
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
 * Validate complete property form data
 */
export const validatePropertyForm = (formData: PropertyFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  
  // Validate required fields
  const titleValidation = validateTitle(formData.title);
  if (!titleValidation.isValid) {
    errors.title = titleValidation.error!;
  }
  
  const descriptionValidation = validateDescription(formData.description);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.error!;
  }
  
  const propertyTypeValidation = validatePropertyType(formData.property_type);
  if (!propertyTypeValidation.isValid) {
    errors.property_type = propertyTypeValidation.error!;
  }
  
  const listingTypeValidation = validateListingType(formData.listing_type);
  if (!listingTypeValidation.isValid) {
    errors.listing_type = listingTypeValidation.error!;
  }
  
  const statusValidation = validatePropertyStatus(formData.status);
  if (!statusValidation.isValid) {
    errors.status = statusValidation.error!;
  }
  
  const priceValidation = validatePrice(formData.price);
  if (!priceValidation.isValid) {
    errors.price = priceValidation.error!;
  }
  
  const areaValidation = validateArea(formData.area);
  if (!areaValidation.isValid) {
    errors.area = areaValidation.error!;
  }
  
  const addressValidation = validateAddress(formData.address);
  if (!addressValidation.isValid) {
    errors.address = addressValidation.error!;
  }
  
  const cityValidation = validateCity(formData.city);
  if (!cityValidation.isValid) {
    errors.city = cityValidation.error!;
  }
  
  const stateValidation = validateState(formData.state);
  if (!stateValidation.isValid) {
    errors.state = stateValidation.error!;
  }
  
  // Validate optional fields
  if (formData.bedrooms) {
    const bedroomsValidation = validateBedrooms(formData.bedrooms);
    if (!bedroomsValidation.isValid) {
      errors.bedrooms = bedroomsValidation.error!;
    }
  }
  
  if (formData.bathrooms) {
    const bathroomsValidation = validateBathrooms(formData.bathrooms);
    if (!bathroomsValidation.isValid) {
      errors.bathrooms = bathroomsValidation.error!;
    }
  }
  
  if (formData.postal_code) {
    const postalCodeValidation = validatePostalCode(formData.postal_code);
    if (!postalCodeValidation.isValid) {
      errors.postal_code = postalCodeValidation.error!;
    }
  }
  
  const amenitiesValidation = validateAmenities(formData.amenities);
  if (!amenitiesValidation.isValid) {
    errors.amenities = amenitiesValidation.error!;
  }
  
  if (formData.images && formData.images.length > 0) {
    const imagesValidation = validatePropertyImages(formData.images);
    if (!imagesValidation.isValid) {
      errors.images = imagesValidation.error!;
    }
  }
  
  const coordinatesValidation = validateCoordinates(formData.latitude, formData.longitude);
  if (!coordinatesValidation.isValid) {
    errors.coordinates = coordinatesValidation.error!;
  }
  
  // Add warnings for better user experience
  if (formData.amenities.length === 0) {
    warnings.amenities = 'Adding amenities will make your property more attractive to buyers';
  }
  
  if (!formData.images || formData.images.length < 3) {
    warnings.images = 'Adding more images will increase property visibility';
  }
  
  const isValid = Object.keys(errors).length === 0;
  
  return {
    isValid,
    errors,
    warnings
  };
};

/**
 * Validate create property request
 */
export const validateCreatePropertyRequest = (request: CreatePropertyRequest): ValidationResult => {
  const errors: Record<string, string> = {};
  
  const titleValidation = validateTitle(request.title);
  if (!titleValidation.isValid) {
    errors.title = titleValidation.error!;
  }
  
  const descriptionValidation = validateDescription(request.description);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.error!;
  }
  
  const propertyTypeValidation = validatePropertyType(request.propertyType);
  if (!propertyTypeValidation.isValid) {
    errors.propertyType = propertyTypeValidation.error!;
  }
  
  const listingTypeValidation = validateListingType(request.listingType);
  if (!listingTypeValidation.isValid) {
    errors.listingType = listingTypeValidation.error!;
  }
  
  const statusValidation = validatePropertyStatus(request.status);
  if (!statusValidation.isValid) {
    errors.status = statusValidation.error!;
  }
  
  const priceValidation = validatePrice(request.price);
  if (!priceValidation.isValid) {
    errors.price = priceValidation.error!;
  }
  
  const areaValidation = validateArea(request.areaSqft);
  if (!areaValidation.isValid) {
    errors.areaSqft = areaValidation.error!;
  }
  
  const addressValidation = validateAddress(request.address);
  if (!addressValidation.isValid) {
    errors.address = addressValidation.error!;
  }
  
  const cityValidation = validateCity(request.city);
  if (!cityValidation.isValid) {
    errors.city = cityValidation.error!;
  }
  
  const stateValidation = validateState(request.state);
  if (!stateValidation.isValid) {
    errors.state = stateValidation.error!;
  }
  
  if (request.postalCode) {
    const postalCodeValidation = validatePostalCode(request.postalCode);
    if (!postalCodeValidation.isValid) {
      errors.postalCode = postalCodeValidation.error!;
    }
  }
  
  const bedroomsValidation = validateBedrooms(request.bedrooms);
  if (!bedroomsValidation.isValid) {
    errors.bedrooms = bedroomsValidation.error!;
  }
  
  const bathroomsValidation = validateBathrooms(request.bathrooms);
  if (!bathroomsValidation.isValid) {
    errors.bathrooms = bathroomsValidation.error!;
  }
  
  const isValid = Object.keys(errors).length === 0;
  
  return {
    isValid,
    errors
  };
};

/**
 * Sanitize property form data
 */
export const sanitizePropertyFormData = (formData: PropertyFormData): PropertyFormData => {
  return {
    title: formData.title?.trim() || '',
    description: formData.description?.trim() || '',
    property_type: formData.property_type?.trim() || '',
    listing_type: formData.listing_type?.trim() || '',
    status: formData.status?.trim() || '',
    price: formData.price?.toString().replace(/[^\d.]/g, '') || '0',
    area: formData.area?.toString().replace(/[^\d.]/g, '') || '0',
    bedrooms: formData.bedrooms?.toString().replace(/[^\d]/g, '') || '0',
    bathrooms: formData.bathrooms?.toString().replace(/[^\d]/g, '') || '0',
    address: formData.address?.trim() || '',
    city: formData.city?.trim() || '',
    state: formData.state?.trim() || '',
    postal_code: formData.postal_code?.toString().replace(/[^\d]/g, '') || '',
    amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
    images: Array.isArray(formData.images) ? formData.images : [],
    latitude: formData.latitude?.toString().replace(/[^\d.-]/g, '') || undefined,
    longitude: formData.longitude?.toString().replace(/[^\d.-]/g, '') || undefined,
    specifications: formData.specifications || {}
  };
};

/**
 * Check if property data has required fields for listing
 */
export const hasRequiredFieldsForListing = (formData: PropertyFormData): boolean => {
  const requiredFields = [
    'title',
    'description',
    'property_type',
    'listing_type',
    'price',
    'area',
    'address',
    'city',
    'state'
  ];
  
  return requiredFields.every(field => {
    const value = formData[field as keyof PropertyFormData];
    return value && value.toString().trim().length > 0;
  });
};

/**
 * Get validation progress percentage
 */
export const getValidationProgress = (formData: PropertyFormData): number => {
  const allFields = [
    'title',
    'description',
    'property_type',
    'listing_type',
    'status',
    'price',
    'area',
    'bedrooms',
    'bathrooms',
    'address',
    'city',
    'state',
    'postal_code',
    'amenities',
    'images'
  ];
  
  let completedFields = 0;
  
  allFields.forEach(field => {
    const value = formData[field as keyof PropertyFormData];
    if (field === 'amenities') {
      if (Array.isArray(value) && value.length > 0) completedFields++;
    } else if (field === 'images') {
      if (Array.isArray(value) && value.length > 0) completedFields++;
    } else if (value && value.toString().trim().length > 0) {
      completedFields++;
    }
  });
  
  return Math.round((completedFields / allFields.length) * 100);
};