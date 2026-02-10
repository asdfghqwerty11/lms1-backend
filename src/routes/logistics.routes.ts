import { Router } from 'express';
import { logisticsController } from '../controllers/logistics.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware, requireAuth);

// Shipment CRUD
router.post('/shipments', logisticsController.createShipment);
router.get('/shipments', logisticsController.getShipments);
router.get('/shipments/:id', logisticsController.getShipmentById);
router.put('/shipments/:id', logisticsController.updateShipment);
router.delete('/shipments/:id', logisticsController.deleteShipment);

// Delivery Routes
router.get('/routes', logisticsController.getDeliveryRoutes);
router.post('/routes', logisticsController.createDeliveryRoute);

// Route Stops
router.put('/routes/stops/:id', logisticsController.updateRouteStop);

export default router;
