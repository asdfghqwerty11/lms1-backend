import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware, requireAuth);

// Settings management
router.post('/', settingsController.createSetting);
router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSetting);
router.put('/:key', settingsController.updateSetting);
router.put('/', settingsController.bulkUpdateSettings);
router.delete('/:key', settingsController.deleteSetting);

export default router;
