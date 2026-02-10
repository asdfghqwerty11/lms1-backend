import { Router } from 'express';
import authRoutes from './auth.routes';
import casesRoutes from './cases.routes';
import workflowRoutes from './workflow.routes';
import billingRoutes from './billing.routes';
import inventoryRoutes from './inventory.routes';
import staffRoutes from './staff.routes';
import departmentsRoutes from './departments.routes';
import communicationsRoutes from './communications.routes';
import settingsRoutes from './settings.routes';
import usersRoutes from './users.routes';
import dentistsRoutes from './dentists.routes';
import logisticsRoutes from './logistics.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/cases', casesRoutes);
router.use('/api/workflow', workflowRoutes);
router.use('/api/billing', billingRoutes);
router.use('/api/inventory', inventoryRoutes);
router.use('/api/staff', staffRoutes);
router.use('/api/departments', departmentsRoutes);
router.use('/api/communications', communicationsRoutes);
router.use('/api/settings', settingsRoutes);
router.use('/api/users', usersRoutes);
router.use('/api/dentists', dentistsRoutes);
router.use('/api/logistics', logisticsRoutes);

// Placeholder routes for modules not yet needed
router.use('/api/calendar', (_req, res) => {
  res.status(501).json({
    success: false,
    message: 'Calendar module not yet implemented',
  });
});

router.use('/api/reports', (_req, res) => {
  res.status(501).json({
    success: false,
    message: 'Reports module not yet implemented',
  });
});

// 404 handler
router.use((_req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: 'Endpoint not found',
  });
});

export default router;
