import { Router } from 'express';
import conversationController from '../controllers/conversationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all conversations for authenticated user
router.get('/', conversationController.getConversations);

// Get specific conversation by ID
router.get('/:id', conversationController.getConversationById);

export default router;