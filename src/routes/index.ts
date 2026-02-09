import { Router } from 'express';
import authRoutes from './auth.routes';
import casesRoutes from './cases.routes';
import workflowRoutes from './workflow.routes';
import billingRoutes from './billing.routes';
import inventoryRoutes from './inventory.routes';

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

// Placeholder routes for other modules (to be implemented)
router.use('/api/staff', (_req, res) => {
  res.status(501).json({
    success: false,
    message: 'Staff module not yet implemented',
  });
});

router.use('/api/departments', (_req, res) => {
  res.status(501).json({
    success: false,
    message: 'Departments module not yet implemented',
  });
});

router.use('/api/communications', (_req, res) => {
  res.status(501).json({
    success: false,
    message: 'Communications module not yet implemented',
  });
});

router.use('/api/dentists', (_req, res) => {
  res.status(501).json({
    success: false,
    message: 'Dentists module not yet implemented',
  });
});

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

router.use('/api/logistics', (_req, res) => {
  res.status(501).json({
    success: false,
    message: 'Logistics module not yet implemented',
  });
});

router.use('/api/settings', (_req, res) => {
  res.status(501).json({
    success: false,
    message: 'Settings module not yet implemented',
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
