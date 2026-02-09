import { Router } from 'express';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

router.use(authMiddleware, requireAuth);

// TODO: Implement dentist management routes
// GET /dentists - List dentists
// POST /dentists - Create dentist profile
// GET /dentists/:id - Get dentist by ID
// PUT /dentists/:id - Update dentist profile
// DELETE /dentists/:id - Delete dentist
// GET /dentists/:id/cases - Get dentist cases
// POST /dentists/:id/applications - Submit application
// GET /dentists/:id/applications - Get applications
// PUT /dentists/:id/applications/:appId - Update application
// PUT /dentists/:id/verify - Verify dentist (admin)

export default router;
