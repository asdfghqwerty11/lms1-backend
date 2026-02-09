import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware, requireAuth);

// Item routes
router.post('/items', inventoryController.createItem);
router.get('/items', inventoryController.getItems);
router.get('/items/:id', inventoryController.getItemById);
router.put('/items/:id', inventoryController.updateItem);
router.delete('/items/:id', inventoryController.deleteItem);

// Stock alerts
router.get('/items/low-stock', inventoryController.getLowStockItems);

// Transaction routes
router.post('/items/:id/transactions', inventoryController.recordTransaction);
router.get('/items/:id/transactions', inventoryController.getTransactions);

// Inventory statistics
router.get('/stats/inventory', inventoryController.getInventoryStats);

export default router;
