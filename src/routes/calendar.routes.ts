import { Router } from 'express';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

router.use(authMiddleware, requireAuth);

// TODO: Implement calendar/appointment routes
// GET /appointments - List appointments
// POST /appointments - Create appointment
// GET /appointments/:id - Get appointment by ID
// PUT /appointments/:id - Update appointment
// DELETE /appointments/:id - Delete appointment
// GET /calendar/:date - Get calendar for date
// GET /calendar/week/:date - Get week view
// GET /calendar/month/:date - Get month view
// PUT /appointments/:id/confirm - Confirm appointment
// PUT /appointments/:id/cancel - Cancel appointment
// POST /appointments/:id/reminder - Send reminder

export default router;
