import { Router } from 'express';
import { ReviewModerationController } from '../controllers/reviewModerationController';
import { RedirectController } from '../controllers/redirectController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();
const reviewController = new ReviewModerationController();
const redirectController = new RedirectController();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

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