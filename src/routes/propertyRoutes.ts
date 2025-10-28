import { Router, Request, Response } from 'express';
import PropertyController from '../controllers/propertyController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { uploadPropertyImages } from '../middleware/upload';
import CacheMiddleware from '../middleware/cache';
import { UserRole } from '../types';

const router = Router();
const propertyController = new PropertyController();
const cacheMiddleware = new CacheMiddleware();

// Public routes with optional authentication for tracking
// Get recommended properties
router.get(
  '/recommended',
  optionalAuthenticate,
  propertyController.getRecommendedProperties
);

// Base route to get all properties (with optional filters)
router.get(
  '/',
  optionalAuthenticate,
  // cacheMiddleware.cacheSearchResults(), // TEMPORARILY DISABLED FOR DEBUGGING
  PropertyController.searchValidation,
  propertyController.getProperties
);

router.get(
  '/search',
  optionalAuthenticate,
  // cacheMiddleware.cacheSearchResults(), // TEMPORARILY DISABLED FOR DEBUGGING
  PropertyController.searchValidation,
  propertyController.getProperties
);

router.get(
  '/featured',
  propertyController.getFeaturedProperties
);

router.get(
  '/compare',
  propertyController.compareProperties
);

router.get(
  '/search/near',
  propertyController.searchNearLocation
);

// Get user's properties (must be before /:id route to avoid conflict)
router.get(
  '/my-properties',
  authenticate,
  propertyController.getUserProperties
);

router.get(
  '/:id',
  cacheMiddleware.cacheProperty(),
  PropertyController.propertyIdValidation,
  propertyController.getPropertyById
);

router.get(
  '/:id/similar',
  PropertyController.propertyIdValidation,
  propertyController.getSimilarProperties
);

// Protected routes (authentication required)
router.use(authenticate);

// Create property (owners, agents, builders only)
router.post(
  '/',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  PropertyController.createPropertyValidation,
  propertyController.createProperty
);

// Update property (owners, agents, builders only)
router.put(
  '/:id',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  PropertyController.updatePropertyValidation,
  propertyController.updateProperty
);

// Delete property (owners, agents, builders only)
router.delete(
  '/:id',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  PropertyController.propertyIdValidation,
  propertyController.deleteProperty
);

// Toggle property status (owners, agents, builders only)
router.patch(
  '/:id/toggle-status',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  PropertyController.propertyIdValidation,
  propertyController.togglePropertyStatus
);

// Get user's property analytics dashboard
router.get(
  '/analytics/dashboard',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  propertyController.getUserPropertyAnalytics
);

// Get property analytics (owners, agents, builders only)
router.get(
  '/:id/analytics',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  PropertyController.propertyIdValidation,
  propertyController.getPropertyAnalytics
);

// Get property performance metrics
router.get(
  '/:id/performance',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  PropertyController.propertyIdValidation,
  propertyController.getPropertyPerformance
);

// Set property as featured/unfeatured
router.patch(
  '/:id/featured',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  PropertyController.setFeaturedValidation,
  propertyController.setFeaturedProperty
);

// Expiration and renewal endpoints
router.get(
  '/expiring',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  propertyController.getExpiringProperties
);

router.patch(
  '/:id/renew',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  PropertyController.renewPropertyValidation,
  propertyController.renewProperty
);

// Enhanced analytics endpoints
router.get(
  '/:id/view-analytics',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  PropertyController.propertyIdValidation,
  propertyController.getPropertyViewAnalytics
);

router.get(
  '/analytics/featured',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  propertyController.getFeaturedListingAnalytics
);

router.get(
  '/analytics/performance-report',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  propertyController.getListingPerformanceReport
);

// Property image routes are handled by uploadRoutes.ts
// These routes are just placeholders for consistency
router.post(
  '/:id/images',
  authorize(UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER),
  PropertyController.propertyIdValidation,
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Image upload routes are handled by /api/uploads/properties/:propertyId/images',
      redirectTo: '/api/uploads/properties/' + req.params.id + '/images'
    });
  }
);

export default router;