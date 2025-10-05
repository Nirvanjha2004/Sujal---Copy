import { Router } from 'express';
import { SearchHistoryController } from '../controllers/searchHistoryController';
import { authenticate } from '../middleware/auth';

const router = Router();
const searchHistoryController = new SearchHistoryController();

// Apply authentication to all routes
router.use(authenticate);

// Search history routes
router.get('/', searchHistoryController.getSearchHistory.bind(searchHistoryController));
router.get('/count', searchHistoryController.getSearchHistoryCount.bind(searchHistoryController));
router.delete('/clear', searchHistoryController.clearSearchHistory.bind(searchHistoryController));
router.get('/popular', searchHistoryController.getPopularSearchTerms.bind(searchHistoryController));
router.post('/similar', searchHistoryController.getSimilarSearches.bind(searchHistoryController));

export default router;