import { Router } from 'express';
import { workflowController } from '../controllers/workflow.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware, requireAuth);

// Get workflow for a case
router.get('/case/:caseId', workflowController.getCaseWorkflow);

// Create workflow stage
router.post('/case/:caseId/stages', workflowController.createWorkflowStage);

// Get stage by ID
router.get('/stages/:stageId', workflowController.getStageById);

// Update stage
router.put('/stages/:stageId', workflowController.updateStage);

// Complete stage
router.put('/stages/:stageId/complete', workflowController.completeStage);

// Delete stage
router.delete('/stages/:stageId', workflowController.deleteStage);

// Get workflow statistics
router.get('/case/:caseId/stats', workflowController.getWorkflowStats);

export default router;
