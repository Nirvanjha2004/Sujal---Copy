import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: any;
}

/**
 * Validation middleware factory
 * @param schema - Joi validation schema
 * @param source - Source of data to validate ('body', 'query', 'params')
 */
export const validate = (
  schema: Joi.ObjectSchema,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = req[source];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: validationErrors,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Replace the original data with validated and sanitized data
    req[source] = value;
    next();
  };
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Pagination schema
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // ID parameter schema
  id: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  // Search query schema
  search: Joi.object({
    q: Joi.string().min(1).max(100).optional(),
    propertyType: Joi.string().valid('apartment', 'house', 'commercial', 'land').optional(),
    listingType: Joi.string().valid('sale', 'rent').optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    bedrooms: Joi.number().integer().min(0).max(10).optional(),
    bathrooms: Joi.number().integer().min(0).max(10).optional(),
    minArea: Joi.number().min(0).optional(),
    maxArea: Joi.number().min(0).optional(),
    amenities: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    radius: Joi.number().min(0).max(100).optional(), // in km
  }).and('latitude', 'longitude'), // Both lat/lng required if one is provided
};

/**
 * User validation schemas
 */
export const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    role: Joi.string().valid('buyer', 'owner', 'agent', 'builder').required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    profileImage: Joi.string().uri().optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required(),
  }),
};

/**
 * Property validation schemas
 */
export const propertySchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().max(2000).optional(),
    propertyType: Joi.string().valid('apartment', 'house', 'commercial', 'land').required(),
    listingType: Joi.string().valid('sale', 'rent').required(),
    status: Joi.string().valid('new', 'resale', 'under_construction').required(),
    price: Joi.number().positive().required(),
    areaSqft: Joi.number().integer().positive().optional(),
    bedrooms: Joi.number().integer().min(0).max(20).optional(),
    bathrooms: Joi.number().integer().min(0).max(20).optional(),
    address: Joi.string().min(10).max(500).required(),
    city: Joi.string().min(2).max(100).required(),
    state: Joi.string().min(2).max(100).required(),
    postalCode: Joi.string().min(3).max(20).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    amenities: Joi.array().items(Joi.string().max(50)).max(20).optional(),
  }).and('latitude', 'longitude'),

  update: Joi.object({
    title: Joi.string().min(5).max(255).optional(),
    description: Joi.string().max(2000).optional(),
    propertyType: Joi.string().valid('apartment', 'house', 'commercial', 'land').optional(),
    listingType: Joi.string().valid('sale', 'rent').optional(),
    status: Joi.string().valid('new', 'resale', 'under_construction').optional(),
    price: Joi.number().positive().optional(),
    areaSqft: Joi.number().integer().positive().optional(),
    bedrooms: Joi.number().integer().min(0).max(20).optional(),
    bathrooms: Joi.number().integer().min(0).max(20).optional(),
    address: Joi.string().min(10).max(500).optional(),
    city: Joi.string().min(2).max(100).optional(),
    state: Joi.string().min(2).max(100).optional(),
    postalCode: Joi.string().min(3).max(20).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    amenities: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    isActive: Joi.boolean().optional(),
  }).and('latitude', 'longitude'),
};

/**
 * Inquiry validation schemas
 */
export const inquirySchemas = {
  create: Joi.object({
    propertyId: Joi.number().integer().positive().required(),
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    message: Joi.string().min(10).max(1000).required(),
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('new', 'contacted', 'closed').required(),
  }),
};

/**
 * File upload validation schemas
 */
export const uploadSchemas = {
  imageUpload: Joi.object({
    propertyId: Joi.number().integer().positive().optional(),
    altText: Joi.string().max(255).optional(),
    displayOrder: Joi.number().integer().min(0).optional(),
  }),
};

/**
 * Admin validation schemas
 */
export const adminSchemas = {
  userRoleUpdate: Joi.object({
    role: Joi.string().valid('buyer', 'owner', 'agent', 'builder', 'admin').required(),
  }),

  userStatusUpdate: Joi.object({
    isActive: Joi.boolean().required(),
  }),

  moderateProperty: Joi.object({
    action: Joi.string().valid('approve', 'reject', 'feature', 'unfeature').required(),
    reason: Joi.string().max(500).optional(),
  }),
};

/**
 * Saved search validation schemas
 */
export const savedSearchSchemas = {
  create: Joi.object({
    searchName: Joi.string().min(1).max(100).required(),
    searchCriteria: Joi.object({
      propertyType: Joi.string().valid('apartment', 'house', 'commercial', 'land').optional(),
      listingType: Joi.string().valid('sale', 'rent').optional(),
      minPrice: Joi.number().min(0).optional(),
      maxPrice: Joi.number().min(0).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      bedrooms: Joi.number().integer().min(0).max(10).optional(),
      bathrooms: Joi.number().integer().min(0).max(10).optional(),
      amenities: Joi.array().items(Joi.string()).optional(),
    }).required(),
  }),

  update: Joi.object({
    searchName: Joi.string().min(1).max(100).optional(),
    searchCriteria: Joi.object({
      propertyType: Joi.string().valid('apartment', 'house', 'commercial', 'land').optional(),
      listingType: Joi.string().valid('sale', 'rent').optional(),
      minPrice: Joi.number().min(0).optional(),
      maxPrice: Joi.number().min(0).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      bedrooms: Joi.number().integer().min(0).max(10).optional(),
      bathrooms: Joi.number().integer().min(0).max(10).optional(),
      amenities: Joi.array().items(Joi.string()).optional(),
    }).optional(),
  }),
};

export default {
  validate,
  commonSchemas,
  userSchemas,
  propertySchemas,
  inquirySchemas,
  uploadSchemas,
  adminSchemas,
  savedSearchSchemas,
};