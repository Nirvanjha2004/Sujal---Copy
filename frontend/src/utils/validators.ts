/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indian mobile number
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Validate Indian pincode
 */
export const isValidPincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate file type
 */
export const isValidFileType = (file: File, acceptedTypes: string[]): boolean => {
  return acceptedTypes.includes(file.type);
};

/**
 * Validate file size
 */
export const isValidFileSize = (file: File, maxSizeInBytes: number): boolean => {
  return file.size <= maxSizeInBytes;
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate required fields in an object
 */
export const validateRequiredFields = <T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];

  requiredFields.forEach((field) => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missingFields.push(String(field));
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Validate price range
 */
export const isValidPriceRange = (minPrice?: number, maxPrice?: number): boolean => {
  if (minPrice && maxPrice) {
    return minPrice <= maxPrice;
  }
  return true;
};

/**
 * Validate coordinates
 */
export const isValidCoordinates = (lat?: number, lng?: number): boolean => {
  if (lat === undefined || lng === undefined) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};