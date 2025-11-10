// Property-specific error handler

export interface PropertyError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export function handlePropertyError(error: any): PropertyError {
  if (error.response?.data?.error) {
    const errorData = error.response.data.error;
    return {
      code: errorData.code || 'UNKNOWN_ERROR',
      message: errorData.message || 'An error occurred',
      field: errorData.field,
      details: errorData.details
    };
  }

  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Connection failed. Please check your internet connection'
    };
  }

  if (error.response?.status === 401) {
    return {
      code: 'UNAUTHORIZED',
      message: 'Please log in to manage properties'
    };
  }

  if (error.response?.status === 403) {
    return {
      code: 'FORBIDDEN',
      message: 'You can only manage your own properties'
    };
  }

  if (error.response?.status === 413) {
    return {
      code: 'FILE_TOO_LARGE',
      message: 'File is too large. Please select a smaller file'
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unexpected error occurred'
  };
}

export const PROPERTY_ERROR_MESSAGES: Record<string, string> = {
  // Validation
  VALIDATION_ERROR: 'Please check your input and try again',
  INVALID_PROPERTY_ID: 'Invalid property selected',
  INVALID_PRICE: 'Please enter a valid price',
  MISSING_REQUIRED_FIELDS: 'Please fill in all required fields',
  
  // Permissions
  FORBIDDEN: 'You can only manage your own properties',
  UNAUTHORIZED: 'Please log in to manage properties',
  
  // Not Found
  PROPERTY_NOT_FOUND: 'This property is no longer available',
  
  // Operations
  PROPERTY_CREATION_ERROR: 'Failed to create property. Please try again',
  PROPERTY_UPDATE_ERROR: 'Failed to update property. Please try again',
  PROPERTY_DELETION_ERROR: 'Failed to delete property. Please try again',
  
  // Duplicates
  DUPLICATE_UNIT_NUMBER: 'This unit number already exists in this project',
  
  // Images
  IMAGE_UPLOAD_ERROR: 'Failed to upload image. Please try again',
  IMAGE_DELETE_ERROR: 'Failed to delete image. Please try again',
  FILE_TOO_LARGE: 'Image file is too large. Maximum size is 5MB',
  INVALID_FILE_TYPE: 'Please select a valid image file (JPG, PNG, GIF)',
  
  // Analytics
  ANALYTICS_ERROR: 'Unable to load analytics data',
  
  // General
  NETWORK_ERROR: 'Connection failed. Please check your internet',
  SERVER_ERROR: 'Something went wrong. Please try again later',
  UNKNOWN_ERROR: 'An unexpected error occurred'
};

export function getPropertyErrorMessage(code: string): string {
  return PROPERTY_ERROR_MESSAGES[code] || PROPERTY_ERROR_MESSAGES.UNKNOWN_ERROR;
}

// File validation helpers
export function validateImageFile(file: File): PropertyError | null {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      code: 'INVALID_FILE_TYPE',
      message: PROPERTY_ERROR_MESSAGES.INVALID_FILE_TYPE
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      code: 'FILE_TOO_LARGE',
      message: PROPERTY_ERROR_MESSAGES.FILE_TOO_LARGE
    };
  }

  return null;
}
