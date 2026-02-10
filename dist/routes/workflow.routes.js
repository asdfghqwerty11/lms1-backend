"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workflow_controller_1 = require("../controllers/workflow.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware, auth_1.requireAuth);
// Get workflow for a case
router.get('/case/:caseId', workflow_controller_1.workflowController.getCaseWorkflow);
// Create workflow stage
router.post('/case/:caseId/stages', workflow_controller_1.workflowController.createWorkflowStage);
// Get stage by ID
router.get('/stages/:stageId', workflow_controller_1.workflowController.getStageById);
// Update stage
router.put('/stages/:stageId', workflow_controller_1.workflowController.updateStage);
// Complete stage
router.put('/stages/:stageId/complete', workflow_controller_1.workflowController.completeStage);
// Delete stage
router.delete('/stages/:stageId', workflow_controller_1.workflowController.deleteStage);
// Get workflow statistics
router.get('/case/:caseId/stats', workflow_controller_1.workflowController.getWorkflowStats);
exports.default = router;
//# sourceMappingURL=workflow.routes.js.map