import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware, requireAuth);

// Stock alerts (must be before /items/:id to avoid matching "low-stock" as an id)
router.get('/items/low-stock', inventoryController.getLowStockItems);

// Item routes
router.post('/items', inventoryController.createItem);
router.get('/items', inventoryController.getItems);
router.get('/items/:id', inventoryController.getItemById);
router.put('/items/:id', inventoryController.updateItem);
router.delete('/items/:id', inventoryController.deleteItem);

// Transaction routes
router.post('/items/:id/transactions', inventoryController.recordTransaction);
router.get('/items/:id/transactions', inventoryController.getTransactions);

// Inventory statistics
router.get('/stats/inventory', inventoryController.getInventoryStats);

export default router;
