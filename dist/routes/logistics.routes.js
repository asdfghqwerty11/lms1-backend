"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logistics_controller_1 = require("../controllers/logistics.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware, auth_1.requireAuth);
// Shipment CRUD
router.post('/shipments', logistics_controller_1.logisticsController.createShipment);
router.get('/shipments', logistics_controller_1.logisticsController.getShipments);
router.get('/shipments/:id', logistics_controller_1.logisticsController.getShipmentById);
router.put('/shipments/:id', logistics_controller_1.logisticsController.updateShipment);
router.delete('/shipments/:id', logistics_controller_1.logisticsController.deleteShipment);
// Delivery Routes
router.get('/routes', logistics_controller_1.logisticsController.getDeliveryRoutes);
router.post('/routes', logistics_controller_1.logisticsController.createDeliveryRoute);
// Route Stops
router.put('/routes/stops/:id', logistics_controller_1.logisticsController.updateRouteStop);
exports.default = router;
//# sourceMappingURL=logistics.routes.js.map