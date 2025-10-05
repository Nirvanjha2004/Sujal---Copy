import { Router } from 'express';
import inquiryController, { InquiryController } from '../controllers/inquiryController';
import { authenticate, optionalAuth } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for inquiry creation
const inquiryRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 inquiry requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many inquiries submitted. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no authentication required)
router.post(
  '/',
  // inquiryRateLimit,
  optionalAuth, // Optional auth to capture user ID if logged in
  InquiryController.createInquiryValidation,
  inquiryController.createInquiry
);

// Protected routes (authentication required)
router.get(
  '/',
  authenticate,
  InquiryController.getInquiriesValidation,
  inquiryController.getInquiries
);

router.get(
  '/stats',
  authenticate,
  inquiryController.getInquiryStats
);

router.get(
  '/:id',
  authenticate,
  InquiryController.getInquiryValidation,
  inquiryController.getInquiryById
);

router.put(
  '/:id/status',
  authenticate,
  InquiryController.updateStatusValidation,
  inquiryController.updateInquiryStatus
);

router.delete(
  '/:id',
  authenticate,
  InquiryController.getInquiryValidation,
  inquiryController.deleteInquiry
);

export default router;