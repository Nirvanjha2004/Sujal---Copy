// Property helper functions
export * from './propertyHelpers';

// Property calculation utilities
export * from './propertyCalculations';

// Property formatting utilities
export * from './propertyFormatters';

// Property validation utilities
export * from './propertyValidation';

// Re-export commonly used functions for convenience
export {
  formatPrice,
  formatArea,
  getPropertyTypeLabel,
  getListingTypeLabel,
  generatePropertyTitle,
  calculatePricePerSqft,
  getPropertySummary,
  getPrimaryImage,
  getPropertyImageUrl,
  formatAmenities,
  getLocationString,
  isPropertyAvailable,
  normalizePropertyData
} from './propertyHelpers';

export {
  calculateEMI,
  calculateTotalInterest,
  calculateLoanEligibility,
  calculateAffordabilityScore,
  calculateRentalYield,
  calculateStampDuty,
  calculateTotalOwnershipCost
} from './propertyCalculations';

export {
  formatCurrency,
  formatIndianNumber,
  formatPropertyConfig,
  formatPropertyTitle,
  formatAddress,
  formatPropertyStatus,
  formatTimeAgo,
  formatDate
} from './propertyFormatters';

export {
  validateTitle,
  validateDescription,
  validatePrice,
  validateArea,
  validatePropertyForm,
  validateCreatePropertyRequest,
  validatePropertyImages,
  validateImageFile,
  sanitizePropertyFormData,
  hasRequiredFieldsForListing,
  getValidationProgress
} from './propertyValidation';