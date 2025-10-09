import { Router } from 'express';
import { defaultVersioning } from '../middleware/versioning';
import docsRoutes from './docsRoutes';
import exampleRoutes from './exampleRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import propertyRoutes from './propertyRoutes';
import uploadRoutes from './uploadRoutes';
import inquiryRoutes from './inquiryRoutes';
import messagingRoutes from './messagingRoutes';
import favoritesRoutes from './favoritesRoutes';
import savedSearchRoutes from './savedSearchRoutes';
import searchHistoryRoutes from './searchHistoryRoutes';
import publicRoutes from './publicRoutes';
import adminRoutes from './adminRoutes';
import seoRoutes from './seoRoutes';
import cmsRoutes from './cmsRoutes';
import conversationRoutes from './conversationRoutes';
import messageRoutes from './messageRoutes';
import projectRoutes from './projectRoutes';

const router = Router();

// API Documentation (no versioning required)
router.use('/docs', docsRoutes);

// API versioning middleware
router.use('/v1', defaultVersioning.validateVersion());

// Mount versioned route modules
router.use('/v1/example', exampleRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/users', userRoutes);
router.use('/v1/properties', propertyRoutes);
router.use('/v1/uploads', uploadRoutes);
router.use('/v1/inquiries', inquiryRoutes);
router.use('/v1/messages', messagingRoutes);
router.use('/v1/favorites', favoritesRoutes);
router.use('/v1/saved-searches', savedSearchRoutes);
router.use('/v1/search-history', searchHistoryRoutes);
router.use('/v1/public', publicRoutes);
router.use('/v1/admin', adminRoutes);
router.use('/v1/seo', seoRoutes);
router.use('/v1/cms', cmsRoutes);  // MAKE SURE THIS IS REGISTERED
router.use('/v1/conversations', conversationRoutes);
router.use('/v1/messages', messageRoutes);
router.use('/v1/projects', projectRoutes);


// Legacy routes (redirect to v1 for backward compatibility)
router.use('/auth', (req, res) => res.redirect(301, `/api/v1/auth${req.url}`));
router.use('/users', (req, res) => res.redirect(301, `/api/v1/users${req.url}`));
router.use('/properties', (req, res) => res.redirect(301, `/api/v1/properties${req.url}`));

export default router;