import { Router } from 'express';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

router.use(authMiddleware, requireAuth);

// TODO: Implement logistics/shipping routes
// GET /shipments - List shipments
// POST /shipments - Create shipment
// GET /shipments/:id - Get shipment by ID
// PUT /shipments/:id - Update shipment
// DELETE /shipments/:id - Delete shipment
// GET /shipments/:id/tracking - Get tracking info
// POST /shipments/:id/track - Add tracking update
// GET /shipments/:id/routes - Get delivery routes
// POST /shipments/:id/routes - Create delivery route
// PUT /routes/:routeId/stops/:stopId - Update route stop
// GET /shipments/status/:status - Get shipments by status

export default router;
