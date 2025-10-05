import { Router } from 'express';
import userController from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { uploadProfileImage, handleUploadError } from '../middleware/upload';

// Import the class for static validation methods
import { body } from 'express-validator';

// Define validation rules directly in routes
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]{10,}$/)
    .withMessage('Invalid phone number format'),
  body('profileImage')
    .optional()
    .isURL()
    .withMessage('Profile image must be a valid URL'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

const initiatePasswordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

const resetPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

const router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  userController.getProfile.bind(userController)
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  updateProfileValidation,
  userController.updateProfile.bind(userController)
);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/change-password',
  authenticate,
  changePasswordValidation,
  userController.changePassword.bind(userController)
);

/**
 * @route   POST /api/users/initiate-password-reset
 * @desc    Initiate password reset
 * @access  Public
 */
router.post(
  '/initiate-password-reset',
  initiatePasswordResetValidation,
  userController.initiatePasswordReset.bind(userController)
);

/**
 * @route   POST /api/users/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post(
  '/reset-password',
  resetPasswordValidation,
  userController.resetPassword.bind(userController)
);

/**
 * @route   POST /api/users/upload-profile-image
 * @desc    Upload profile image
 * @access  Private
 */
router.post(
  '/upload-profile-image',
  authenticate,
  uploadProfileImage,
  handleUploadError,
  userController.uploadProfileImage.bind(userController)
);

// Admin-only routes
/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  userController.getAllUsers.bind(userController)
);

/**
 * @route   PUT /api/users/:userId/activate
 * @desc    Activate user account (admin only)
 * @access  Private (Admin)
 */
router.put(
  '/:userId/activate',
  authenticate,
  requireAdmin,
  userController.activateAccount.bind(userController)
);

/**
 * @route   PUT /api/users/:userId/deactivate
 * @desc    Deactivate user account (admin only)
 * @access  Private (Admin)
 */
router.put(
  '/:userId/deactivate',
  authenticate,
  requireAdmin,
  userController.deactivateAccount.bind(userController)
);

/**
 * @route   PUT /api/users/:userId/role
 * @desc    Update user role (admin only)
 * @access  Private (Admin)
 */
router.put(
  '/:userId/role',
  authenticate,
  requireAdmin,
  userController.updateUserRole.bind(userController)
);

/**
 * @route   DELETE /api/users/:userId
 * @desc    Delete user (admin only)
 * @access  Private (Admin)
 */
router.delete(
  '/:userId',
  authenticate,
  requireAdmin,
  userController.deleteUser.bind(userController)
);

export default router;