import { Router } from 'express';
import savedSearchController from '../controllers/savedSearchController';
import { authenticate } from '../middleware/auth';
import { rateLimitConfig } from '../middleware/security';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply rate limiting
// router.use(rateLimitConfig);

/**
 * @route   POST /api/saved-searches
 * @desc    Create a new saved search
 * @access  Private
 * @body    { search_name: string, search_criteria: SearchCriteria }
 */
router.post('/', savedSearchController.createSavedSearch);

/**
 * @route   GET /api/saved-searches
 * @desc    Get user's saved searches
 * @access  Private
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 50)
 */
router.get('/', savedSearchController.getUserSavedSearches);

/**
 * @route   GET /api/saved-searches/count
 * @desc    Get user's saved searches count
 * @access  Private
 */
router.get('/count', savedSearchController.getSavedSearchesCount);

/**
 * @route   GET /api/saved-searches/:id
 * @desc    Get a specific saved search
 * @access  Private
 * @param   id - Saved search ID
 */
router.get('/:id', savedSearchController.getSavedSearchById);

/**
 * @route   PUT /api/saved-searches/:id
 * @desc    Update a saved search
 * @access  Private
 * @param   id - Saved search ID
 * @body    { search_name?: string, search_criteria?: SearchCriteria }
 */
router.put('/:id', savedSearchController.updateSavedSearch);

/**
 * @route   DELETE /api/saved-searches/:id
 * @desc    Delete a saved search
 * @access  Private
 * @param   id - Saved search ID
 */
router.delete('/:id', savedSearchController.deleteSavedSearch);

/**
 * @route   GET /api/saved-searches/:id/execute
 * @desc    Execute a saved search and get matching properties
 * @access  Private
 * @param   id - Saved search ID
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 50)
 */
router.get('/:id/execute', savedSearchController.executeSavedSearch);

export default router;