import { Router } from 'express';
import SeoController from '../controllers/seoController';
import CmsController from '../controllers/cmsController';

const router = Router();
const seoController = new SeoController();
const cmsController = new CmsController();

// Public SEO Routes (no authentication required)

// Sitemap generation
router.get('/sitemap.xml', seoController.generateSitemap);

// Property SEO metadata (for frontend rendering)
router.get('/property/:propertyId/metadata', seoController.getPropertySeoMetadata);

// Page SEO metadata (for frontend rendering)
router.get('/page/:pageType/metadata', seoController.getPageSeoMetadata);

// Public CMS content routes
router.get('/content/active', cmsController.getActiveContent);
router.get('/content/key/:key', cmsController.getContentByKey);
router.get('/banners', cmsController.getBanners);
router.get('/announcements', cmsController.getAnnouncements);

export default router;