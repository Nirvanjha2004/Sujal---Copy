import { Router } from 'express';
import siteVisitController from '../controllers/siteVisitController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Public routes - allow scheduling site visits without authentication
router.post('/', siteVisitController.createSiteVisit);

// Authenticated routes
router.get('/agent', authenticate, requireRole([UserRole.ADMIN, UserRole.AGENT, UserRole.OWNER]), siteVisitController.getAgentSiteVisits);
router.get('/stats', authenticate, requireRole([UserRole.ADMIN, UserRole.AGENT, UserRole.OWNER]), siteVisitController.getSiteVisitStats);

// Property-specific routes
router.get('/property/:propertyId', authenticate, siteVisitController.getPropertySiteVisits);

// Site visit management
router.put('/:visitId', authenticate, requireRole([UserRole.ADMIN, UserRole.AGENT, UserRole.OWNER]), siteVisitController.updateSiteVisit);

export default router;