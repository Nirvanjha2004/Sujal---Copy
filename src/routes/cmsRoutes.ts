import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/index';
import CmsController from '../controllers/cmsController';

const router = Router();
const cmsController = new CmsController();

// Public routes (no authentication required)
router.get('/active', cmsController.getActiveContent);
router.get('/banners', cmsController.getBanners);
router.get('/announcements', cmsController.getAnnouncements);
router.get('/key/:key', cmsController.getContentByKey);

// Admin routes (authentication + admin role required)
router.get('/content', authenticateToken, requireRole([UserRole.ADMIN]), cmsController.getAllContent);
router.get('/content/:id', authenticateToken, requireRole([UserRole.ADMIN]), cmsController.getContentById);
router.post('/content', authenticateToken, requireRole([UserRole.ADMIN]), cmsController.createContent);
router.put('/content/:id', authenticateToken, requireRole([UserRole.ADMIN]), cmsController.updateContent);
router.delete('/content/:id', authenticateToken, requireRole([UserRole.ADMIN]), cmsController.deleteContent);
router.patch('/content/:id/toggle', authenticateToken, requireRole([UserRole.ADMIN]), cmsController.toggleContentStatus);

// Stats route (removed duplicate)
router.get('/stats', authenticateToken, requireRole([UserRole.ADMIN]), cmsController.getContentStats);

export default router;