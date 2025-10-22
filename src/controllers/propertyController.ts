import { Request, Response, NextFunction } from 'express';
import PropertyService, { PropertySearchFilters, PropertyCreateData, PropertyUpdateData } from '../services/propertyService';
import { AuthenticatedRequest } from '../middleware/auth';
import { PropertyType, ListingType, PropertyStatus } from '../models/Property';
import { body, query, param, validationResult } from 'express-validator';

class PropertyController {
  private propertyService: PropertyService;

  constructor() {
    this.propertyService = new PropertyService();
  }

  // Validation rules
  static createPropertyValidation = [
    body('title')
      .trim()
      .isLength({ min: 5, max: 255 })
      .withMessage('Title must be between 5 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must not exceed 2000 characters'),
    body('propertyType')
      .isIn(Object.values(PropertyType))
      .withMessage('Invalid property type'),
    body('listingType')
      .isIn(Object.values(ListingType))
      .withMessage('Invalid listing type'),
    body('status')
      .isIn(Object.values(PropertyStatus))
      .withMessage('Invalid property status'),
    body('price')
      .isFloat({ min: 1 })
      .withMessage('Price must be a positive number'),
    body('areaSqft')
      .optional()
      .isInt({ min: 1, max: 100000 })
      .withMessage('Area must be between 1 and 100000 sqft'),
    body('bedrooms')
      .optional()
      .isInt({ min: 0, max: 20 })
      .withMessage('Bedrooms must be between 0 and 20'),
    body('bathrooms')
      .optional()
      .isInt({ min: 0, max: 20 })
      .withMessage('Bathrooms must be between 0 and 20'),
    body('address')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Address must be between 10 and 500 characters'),
    body('city')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('City must be between 2 and 100 characters'),
    body('state')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('State must be between 2 and 100 characters'),
    body('postalCode')
      .optional()
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Postal code must be between 3 and 20 characters'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('amenities')
      .optional()
      .isObject()
      .withMessage('Amenities must be an object'),
    body('isFeatured')
      .optional()
      .isBoolean()
      .withMessage('isFeatured must be a boolean'),
    body('expiresAt')
      .optional()
      .isISO8601()
      .withMessage('expiresAt must be a valid ISO 8601 date'),
    body('autoRenew')
      .optional()
      .isBoolean()
      .withMessage('autoRenew must be a boolean'),
    body('renewalPeriodDays')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('renewalPeriodDays must be between 1 and 365'),
  ];

  static updatePropertyValidation = [
    param('id').isInt({ min: 1 }).withMessage('Invalid property ID'),
    ...PropertyController.createPropertyValidation.map(rule => rule.optional()),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ];

  static searchValidation = [
    query('propertyType')
      .optional()
      .isIn(Object.values(PropertyType))
      .withMessage('Invalid property type'),
    query('listingType')
      .optional()
      .isIn(Object.values(ListingType))
      .withMessage('Invalid listing type'),
    query('status')
      .optional()
      .isIn(Object.values(PropertyStatus))
      .withMessage('Invalid property status'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number'),
    query('city')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('City must be between 2 and 100 characters'),
    query('state')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('State must be between 2 and 100 characters'),
    query('location')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Location must be between 1 and 100 characters'),
    query('bedrooms')
      .optional()
      .isInt({ min: 0, max: 20 })
      .withMessage('Bedrooms must be between 0 and 20'),
    query('bathrooms')
      .optional()
      .isInt({ min: 0, max: 20 })
      .withMessage('Bathrooms must be between 0 and 20'),
    query('minArea')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Minimum area must be a positive number'),
    query('maxArea')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Maximum area must be a positive number'),
    query('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    query('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    query('radius')
      .optional()
      .isFloat({ min: 0.1, max: 100 })
      .withMessage('Radius must be between 0.1 and 100 km'),
    query('sortBy')
      .optional()
      .isIn(['price', 'date', 'relevance', 'views'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('isFeatured')
      .optional()
      .isBoolean()
      .withMessage('isFeatured must be a boolean'),
  ];

  static propertyIdValidation = [
    param('id').isInt({ min: 1 }).withMessage('Invalid property ID'),
  ];

  static setFeaturedValidation = [
    param('id').isInt({ min: 1 }).withMessage('Invalid property ID'),
    body('featured').isBoolean().withMessage('Featured must be a boolean value'),
  ];

  static renewPropertyValidation = [
    param('id').isInt({ min: 1 }).withMessage('Invalid property ID'),
    body('extensionDays')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Extension days must be between 1 and 365'),
  ];

  // Create a new property
  createProperty = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      console.log("The data coming from the frontend is :", req.body)

      const userId = req.user!.userId;
      const body = req.body as any;
      const propertyData: PropertyCreateData = {
        title: body.title,
        description: body.description,
        propertyType: body.property_type,
        listingType: body.listing_type,
        status: body.status,
        price: parseFloat(body.price),
        areaSqft: body.area_sqft ? parseInt(body.area_sqft) : undefined,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms) : undefined,
        bathrooms: body.bathrooms ? parseInt(body.bathrooms) : undefined,
        address: body.address,
        city: body.city,
        state: body.state,
        postalCode: body.postalCode,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
        amenities: body.amenities,
        isFeatured: body.is_featured || false,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        autoRenew: body.autoRenew || false,
        renewalPeriodDays: body.renewalPeriodDays ? parseInt(body.renewalPeriodDays) : undefined,
      };

      const property = await this.propertyService.createProperty(userId, propertyData);

      res.status(201).json({
        success: true,
        data: property,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all properties with search and filtering
  getProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = Math.random().toString(36).substring(7);
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }


      console.log(`[${requestId}] Reached the search function`, (req.query.property_type as String))

      const authReq = req as AuthenticatedRequest;
      const filters: PropertySearchFilters = {
        propertyType: req.query.property_type as PropertyType,
        listingType: req.query.listing_type as ListingType,
        status: req.query.status as PropertyStatus,

        minPrice: req.query.min_price ? Number(req.query.min_price) : undefined,
        maxPrice: req.query.max_price ? Number(req.query.max_price) : undefined,

        city: req.query.city as string,
        state: req.query.state as string,
        location: req.query.location as string,

        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string, 10) : undefined,
        bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms as string, 10) : undefined,

        minArea: req.query.min_area ? parseInt(req.query.min_area as string, 10) : undefined,
        maxArea: req.query.max_area ? parseInt(req.query.max_area as string, 10) : undefined,

        latitude: req.query.latitude ? Number(req.query.latitude) : undefined,
        longitude: req.query.longitude ? Number(req.query.longitude) : undefined,
        radius: req.query.radius ? Number(req.query.radius) : undefined,

        amenities: req.query.amenities
          ? (req.query.amenities as string).split(',').map(a => a.trim())
          : undefined,

        sortBy: req.query.sort_by as 'price' | 'date' | 'relevance' | 'views',
        sortOrder: req.query.sort_order as 'asc' | 'desc',

        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,

        isFeatured: req.query.is_featured ? req.query.is_featured === 'true' : undefined,

        keywords: req.query.keywords as string,

        // userId: authReq.user?.userId, // REMOVE THIS LINE
      };

      const result = await this.propertyService.searchProperties(filters, requestId);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get a single property by ID
  getPropertyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid property ID',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const propertyId = parseInt(req.params.id);
      const incrementViews = req.query.incrementViews === 'true';

      const property = await this.propertyService.getPropertyById(propertyId, incrementViews);

      if (!property) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: property,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Update a property
  updateProperty = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const propertyId = parseInt(req.params.id);
      const userId = req.user!.userId;
      const body = req.body as any;

      const updateData: PropertyUpdateData = {};

      // Only include fields that are provided
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.propertyType !== undefined) updateData.propertyType = body.propertyType;
      if (body.listingType !== undefined) updateData.listingType = body.listingType;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.price !== undefined) updateData.price = parseFloat(body.price);
      if (body.areaSqft !== undefined) updateData.areaSqft = parseInt(body.areaSqft);
      if (body.bedrooms !== undefined) updateData.bedrooms = parseInt(body.bedrooms);
      if (body.bathrooms !== undefined) updateData.bathrooms = parseInt(body.bathrooms);
      if (body.address !== undefined) updateData.address = body.address;
      if (body.city !== undefined) updateData.city = body.city;
      if (body.state !== undefined) updateData.state = body.state;
      if (body.postalCode !== undefined) updateData.postalCode = body.postalCode;
      if (body.latitude !== undefined) updateData.latitude = parseFloat(body.latitude);
      if (body.longitude !== undefined) updateData.longitude = parseFloat(body.longitude);
      if (body.amenities !== undefined) updateData.amenities = body.amenities;
      if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
      if (body.isActive !== undefined) updateData.isActive = body.isActive;
      if (body.expiresAt !== undefined) updateData.expiresAt = new Date(body.expiresAt);
      if (body.autoRenew !== undefined) updateData.autoRenew = body.autoRenew;
      if (body.renewalPeriodDays !== undefined) updateData.renewalPeriodDays = parseInt(body.renewalPeriodDays);

      const property = await this.propertyService.updateProperty(propertyId, userId, updateData);

      if (!property) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found or you do not have permission to update it',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: property,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete a property
  deleteProperty = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid property ID',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const propertyId = parseInt(req.params.id);
      const userId = req.user!.userId;

      const deleted = await this.propertyService.deleteProperty(propertyId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found or you do not have permission to delete it',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Property deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Toggle property active status
  togglePropertyStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid property ID',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const propertyId = parseInt(req.params.id);
      const userId = req.user!.userId;

      const property = await this.propertyService.togglePropertyStatus(propertyId, userId);

      if (!property) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found or you do not have permission to modify it',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: property,
        message: `Property ${property.is_active ? 'activated' : 'deactivated'} successfully`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get featured properties
  getFeaturedProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 50) : 10;

      const properties = await this.propertyService.getFeaturedProperties(limit);

      res.status(200).json({
        success: true,
        data: properties,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get property analytics
  getPropertyAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid property ID',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const propertyId = parseInt(req.params.id);
      const userId = req.user!.userId;

      const analytics = await this.propertyService.getPropertyAnalytics(propertyId, userId);

      if (!analytics) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found or you do not have permission to view analytics',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Compare multiple properties
  compareProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyIds = req.query.ids as string;

      if (!propertyIds) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Property IDs are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const ids = propertyIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

      if (ids.length < 2 || ids.length > 3) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'You can compare between 2 and 3 properties',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const properties = await Promise.all(
        ids.map(id => this.propertyService.getPropertyById(id, false))
      );

      const validProperties = properties.filter(p => p !== null);

      if (validProperties.length !== ids.length) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'One or more properties not found',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: validProperties,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Search properties near a location
  searchNearLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { latitude, longitude, radius } = req.query;

      if (!latitude || !longitude || !radius) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Latitude, longitude, and radius are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusKm = parseFloat(radius as string);

      if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid latitude, longitude, or radius values',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const additionalFilters: Partial<PropertySearchFilters> = {};
      if (req.query.propertyType) additionalFilters.propertyType = req.query.propertyType as PropertyType;
      if (req.query.minPrice) additionalFilters.minPrice = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) additionalFilters.maxPrice = parseFloat(req.query.maxPrice as string);
      if (req.query.limit) additionalFilters.limit = parseInt(req.query.limit as string);

      const properties = await this.propertyService.searchPropertiesNearLocation(
        lat,
        lng,
        radiusKm,
        additionalFilters
      );

      res.status(200).json({
        success: true,
        data: properties,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get similar properties
  getSimilarProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid property ID',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const propertyId = parseInt(req.params.id);
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 20) : 5;

      const properties = await this.propertyService.getSimilarProperties(propertyId, limit);

      res.status(200).json({
        success: true,
        data: properties,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get user's property analytics dashboard
  getUserPropertyAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const analytics = await this.propertyService.getUserPropertyAnalytics(userId);

      res.status(200).json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Set property as featured/unfeatured
  setFeaturedProperty = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid property ID',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const propertyId = parseInt(req.params.id);
      const userId = req.user!.userId;
      const body = req.body as any;
      const featured = body.featured === true;

      const property = await this.propertyService.setFeaturedProperty(propertyId, userId, featured);

      if (!property) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found or you do not have permission to modify it',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: property,
        message: `Property ${featured ? 'featured' : 'unfeatured'} successfully`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get property performance metrics
  getPropertyPerformance = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid property ID',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const propertyId = parseInt(req.params.id);
      const userId = req.user!.userId;

      const metrics = await this.propertyService.getPropertyPerformanceMetrics(propertyId, userId);

      if (!metrics) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found or you do not have permission to view metrics',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get expiring properties for a user
  getExpiringProperties = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const daysAhead = req.query.days ? parseInt(req.query.days as string) : 7;

      if (daysAhead < 1 || daysAhead > 90) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Days ahead must be between 1 and 90',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const properties = await this.propertyService.getExpiringProperties(userId, daysAhead);

      res.status(200).json({
        success: true,
        data: properties,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Renew a property listing
  renewProperty = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const propertyId = parseInt(req.params.id);
      const userId = req.user!.userId;
      const extensionDays = req.body.extensionDays || 30;

      const property = await this.propertyService.renewProperty(propertyId, userId, extensionDays);

      if (!property) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found or you do not have permission to renew it',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: property,
        message: `Property renewed for ${extensionDays} days`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get property view analytics
  getPropertyViewAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid property ID',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const propertyId = parseInt(req.params.id);
      const userId = req.user!.userId;
      const days = req.query.days ? parseInt(req.query.days as string) : 30;

      const analytics = await this.propertyService.getPropertyViewAnalytics(propertyId, userId, days);

      if (!analytics) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found or you do not have permission to view analytics',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get featured listing analytics
  getFeaturedListingAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const analytics = await this.propertyService.getFeaturedListingAnalytics(userId);

      res.status(200).json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get user's properties
  getUserProperties = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await this.propertyService.getUserProperties(userId, { page, limit });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get listing performance report
  getListingPerformanceReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const report = await this.propertyService.getListingPerformanceReport(userId);

      res.status(200).json({
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };


}

export default PropertyController;