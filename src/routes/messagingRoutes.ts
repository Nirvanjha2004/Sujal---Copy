import { Router } from 'express';
import messagingController, { MessagingController } from '../controllers/messagingController';
import { authenticate } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for message sending
const messageRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each user to 10 messages per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many messages sent. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// All messaging routes require authentication
router.use(authenticate);

// Send a message
router.post(
  '/',
  messageRateLimit,
  MessagingController.sendMessageValidation,
  messagingController.sendMessage
);

// Get conversations for the authenticated user
router.get(
  '/conversations',
  MessagingController.getConversationsValidation,
  messagingController.getConversations
);

// Get unread message count
router.get(
  '/unread-count',
  messagingController.getUnreadCount
);

// Get messages in a specific conversation
router.get(
  '/conversations/:conversationId/messages',
  MessagingController.getMessagesValidation,
  messagingController.getMessages
);

// Mark messages in a conversation as read
router.put(
  '/conversations/:conversationId/read',
  MessagingController.markAsReadValidation,
  messagingController.markAsRead
);

// Get conversation statistics
router.get(
  '/conversations/:conversationId/stats',
  MessagingController.markAsReadValidation,
  messagingController.getConversationStats
);

// Delete a message
router.delete(
  '/:id',
  MessagingController.deleteMessageValidation,
  messagingController.deleteMessage
);

export default router;