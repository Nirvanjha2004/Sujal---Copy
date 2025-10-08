import { Router } from 'express';
import messageController from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get messages for a conversation
router.get('/conversation/:conversationId', messageController.getMessages);

// Send a message to a conversation
router.post('/conversation/:conversationId', messageController.sendMessage);

export default router;