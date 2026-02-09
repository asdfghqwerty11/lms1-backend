import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.get('/me', authMiddleware, requireAuth, authController.getCurrentUser);
router.post('/logout', authMiddleware, requireAuth, authController.logout);
router.post('/update-password', authMiddleware, requireAuth, authController.updatePassword);
router.post('/reset-password', authController.resetPassword);

export default router;
