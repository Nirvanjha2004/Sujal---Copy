import { Router } from 'express';
import favoritesController from '../controllers/favoritesController';
import { authenticate } from '../middleware/auth';
import { rateLimitConfig } from '../middleware/security';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply rate limiting
// router.use(rateLimitConfig);

/**
 * @route   POST /api/favorites
 * @desc    Add property to favorites
 * @access  Private
 * @body    { propertyId: number }
 */
router.post('/', favoritesController.addToFavorites);

/**
 * @route   DELETE /api/favorites/:propertyId
 * @desc    Remove property from favorites
 * @access  Private
 * @param   propertyId - Property ID to remove from favorites
 */
router.delete('/:propertyId', favoritesController.removeFromFavorites);

/**
 * @route   GET /api/favorites/check/:propertyId
 * @desc    Check if property is in user's favorites
 * @access  Private
 * @param   propertyId - Property ID to check
 */
router.get('/check/:propertyId', favoritesController.checkFavorite);

/**
 * @route   GET /api/favorites
 * @desc    Get user's favorite properties
 * @access  Private
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 50)
 * @query   include_inactive - Include inactive properties (default: false)
 */
router.get('/', favoritesController.getUserFavorites);

/**
 * @route   GET /api/favorites/count
 * @desc    Get user's favorites count
 * @access  Private
 */
router.get('/count', favoritesController.getFavoritesCount);

/**
 * @route   GET /api/favorites/ids
 * @desc    Get user's favorite property IDs
 * @access  Private
 */
router.get('/ids', favoritesController.getFavoriteIds);

/**
 * @route   DELETE /api/favorites
 * @desc    Clear all user favorites
 * @access  Private
 */
router.delete('/', favoritesController.clearFavorites);

export default router;