import { Router } from 'express';
import { communicationsController } from '../controllers/communications.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware, requireAuth);

// Conversation CRUD
router.post('/conversations', communicationsController.createConversation);
router.get('/conversations', communicationsController.getConversations);
router.get('/conversations/:id', communicationsController.getConversationById);
router.put('/conversations/:id', communicationsController.updateConversation);
router.delete('/conversations/:id', communicationsController.deleteConversation);

// Participant management
router.post('/conversations/:id/participants', communicationsController.addParticipant);
router.delete('/conversations/:id/participants/:participantId', communicationsController.removeParticipant);

// Message management
router.post('/conversations/:id/messages', communicationsController.sendMessage);
router.get('/conversations/:id/messages', communicationsController.getMessages);
router.put('/messages/:messageId', communicationsController.updateMessage);

// Notification management
router.get('/notifications', communicationsController.getNotifications);
router.put('/notifications/:id', communicationsController.markNotificationAsRead);
router.delete('/notifications/:id', communicationsController.deleteNotification);

export default router;
