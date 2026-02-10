"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware, auth_1.requireAuth);
// Stock alerts (must be before /items/:id to avoid matching "low-stock" as an id)
router.get('/items/low-stock', inventory_controller_1.inventoryController.getLowStockItems);
// Item routes
router.post('/items', inventory_controller_1.inventoryController.createItem);
router.get('/items', inventory_controller_1.inventoryController.getItems);
router.get('/items/:id', inventory_controller_1.inventoryController.getItemById);
router.put('/items/:id', inventory_controller_1.inventoryController.updateItem);
router.delete('/items/:id', inventory_controller_1.inventoryController.deleteItem);
// Transaction routes
router.post('/items/:id/transactions', inventory_controller_1.inventoryController.recordTransaction);
router.get('/items/:id/transactions', inventory_controller_1.inventoryController.getTransactions);
// Inventory statistics
router.get('/stats/inventory', inventory_controller_1.inventoryController.getInventoryStats);
exports.default = router;
//# sourceMappingURL=inventory.routes.js.map