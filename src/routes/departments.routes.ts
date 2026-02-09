import { Router } from 'express';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

router.use(authMiddleware, requireAuth);

// TODO: Implement department management routes
// GET /departments - List all departments
// POST /departments - Create new department
// GET /departments/:id - Get department by ID
// PUT /departments/:id - Update department
// DELETE /departments/:id - Delete department
// GET /departments/:id/equipment - List department equipment
// POST /departments/:id/equipment - Add equipment
// PUT /departments/:id/equipment/:equipmentId - Update equipment
// DELETE /departments/:id/equipment/:equipmentId - Delete equipment

export default router;
