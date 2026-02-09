import { Router } from 'express';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

router.use(authMiddleware, requireAuth);

// TODO: Implement staff management routes
// GET /staff - List all staff
// POST /staff - Create new staff
// GET /staff/:id - Get staff by ID
// PUT /staff/:id - Update staff
// DELETE /staff/:id - Delete staff
// GET /staff/:id/schedule - Get staff schedule
// POST /staff/:id/schedule - Create schedule
// GET /staff/:id/reviews - Get performance reviews
// POST /staff/:id/reviews - Create performance review

export default router;
