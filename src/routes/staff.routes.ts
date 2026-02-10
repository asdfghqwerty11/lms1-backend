import { Router } from 'express';
import { staffController } from '../controllers/staff.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware, requireAuth);

// Staff CRUD
router.post('/', staffController.createStaff);
router.get('/', staffController.getStaff);
router.get('/:id', staffController.getStaffById);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

// Staff schedules
router.get('/:id/schedules', staffController.getStaffSchedules);
router.post('/:id/schedules', staffController.addStaffSchedule);

// Performance reviews
router.get('/:id/reviews', staffController.getPerformanceReviews);
router.post('/:id/reviews', staffController.addPerformanceReview);

export default router;
