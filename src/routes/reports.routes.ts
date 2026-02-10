import { Router } from 'express';
import { authMiddleware, requireAuth } from '../middleware/auth';
import { reportsController } from '../controllers/reports.controller';

const router = Router();

router.use(authMiddleware, requireAuth);

// Dashboard and Analytics routes
router.get('/dashboard', reportsController.getDashboard);
router.get('/analytics', reportsController.getAnalytics);

export default router;
