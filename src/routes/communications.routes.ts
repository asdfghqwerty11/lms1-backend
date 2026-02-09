import { Router } from 'express';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

router.use(authMiddleware, requireAuth);

// TODO: Implement communications routes
// GET /conversations - List conversations
// POST /conversations - Create conversation
// GET /conversations/:id - Get conversation by ID
// PUT /conversations/:id - Update conversation
// DELETE /conversations/:id - Delete conversation
// POST /conversations/:id/participants - Add participant
// DELETE /conversations/:id/participants/:participantId - Remove participant
// POST /conversations/:id/messages - Send message
// GET /conversations/:id/messages - Get messages
// GET /notifications - Get user notifications
// PUT /notifications/:id - Mark notification as read
// DELETE /notifications/:id - Delete notification

export default router;
