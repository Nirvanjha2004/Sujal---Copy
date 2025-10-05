import { Router } from 'express';
import AdminController from '../controllers/adminController';
import SeoController from '../controllers/seoController';
import CmsController from '../controllers/cmsController';
import CacheController from '../controllers/cacheController';
import { ReviewModerationController } from '../controllers/reviewModerationController';
import { RedirectController } from '../controllers/redirectController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();
const adminController = new AdminController();
const seoController = new SeoController();
const cmsController = new CmsController();
const cacheController = new CacheController();
const reviewController = new ReviewModerationController();
const redirectController = new RedirectController();

// Apply authentication and admin role requirement to all admin routes
router.use(authenticateToken);
router.use(requireRole([UserRole.ADMIN]));

// Dashboard and Analytics Routes
router.get('/dashboard/analytics', adminController.getDashboardAnalytics);
router.get('/dashboard/stats', adminController.getSystemStats);

// Advanced Analytics Routes
router.get('/analytics/traffic', adminController.getTrafficAnalytics);
router.get('/analytics/leads', adminController.getLeadAnalytics);
router.get('/analytics/listings', adminController.getListingAnalytics);

// User Management Routes
router.get('/users', adminController.getUsersForModeration);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

// Property Management Routes
router.get('/properties', adminController.getPropertiesForModeration);
router.put('/properties/:propertyId/status', adminController.updatePropertyStatus);
router.delete('/properties/:propertyId', adminController.deleteProperty);

// SEO Management Routes
router.get('/seo/settings', seoController.getSeoSettings);
router.post('/seo/settings', seoController.upsertSeoSettings);
router.put('/seo/settings', seoController.upsertSeoSettings);
router.get('/seo/property/:propertyId/metadata', seoController.getPropertySeoMetadata);
router.get('/seo/page/:pageType/metadata', seoController.getPageSeoMetadata);
router.get('/seo/property/:propertyId/url', seoController.generatePropertyUrl);

// CMS Content Management Routes
router.get('/cms/content', cmsController.getAllContent);
router.get('/cms/content/stats', cmsController.getContentStats);
router.get('/cms/content/:id', cmsController.getContentById);
router.post('/cms/content', cmsController.createContent);
router.put('/cms/content/:id', cmsController.updateContent);
router.delete('/cms/content/:id', cmsController.deleteContent);
router.patch('/cms/content/:id/toggle', cmsController.toggleContentStatus);

// Cache Management Routes
router.get('/cache/stats', cacheController.getCacheStats);
router.get('/cache/health', cacheController.getCacheHealth);
router.get('/cache/performance', cacheController.getPerformanceMetrics);
router.post('/cache/warm', cacheController.warmCache);
router.delete('/cache/:type', cacheController.clearCache);
router.post('/cache/optimize', cacheController.optimizeCache);
router.put('/cache/warming/config', cacheController.configureCacheWarming);

// Review Moderation Routes
router.get('/reviews', reviewController.getReviews.bind(reviewController));
router.get('/reviews/stats', reviewController.getReviewStats.bind(reviewController));
router.get('/reviews/flagged', reviewController.getFlaggedReviews.bind(reviewController));
router.patch('/reviews/:id/moderate', reviewController.moderateReview.bind(reviewController));
router.patch('/reviews/:id/flag', reviewController.flagReview.bind(reviewController));
router.delete('/reviews/:id', reviewController.deleteReview.bind(reviewController));
router.patch('/reviews/bulk', reviewController.bulkModerate.bind(reviewController));

// URL Redirect Routes
router.get('/redirects', redirectController.getRedirects.bind(redirectController));
router.get('/redirects/stats', redirectController.getRedirectStats.bind(redirectController));
router.get('/redirects/top', redirectController.getTopRedirects.bind(redirectController));
router.post('/redirects', redirectController.createRedirect.bind(redirectController));
router.put('/redirects/:id', redirectController.updateRedirect.bind(redirectController));
router.delete('/redirects/:id', redirectController.deleteRedirect.bind(redirectController));
router.patch('/redirects/:id/toggle', redirectController.toggleRedirectStatus.bind(redirectController));
router.patch('/redirects/bulk', redirectController.bulkUpdateStatus.bind(redirectController));

export default router;